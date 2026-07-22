-- 1. CREACIÓN DE ÍNDICES PARA ACELERAR LECTURAS
CREATE INDEX IF NOT EXISTS idx_inv_productos_empresa_estado 
ON public.inv_productos (empresa_id, estado);

CREATE INDEX IF NOT EXISTS idx_inv_productos_empresa_categoria 
ON public.inv_productos (empresa_id, categoria_id);

CREATE INDEX IF NOT EXISTS idx_inv_productos_sku 
ON public.inv_productos (codigo_sku);

-- 2. REFACTORIZACIÓN FUNCIÓN TENANT
DROP FUNCTION IF EXISTS public.current_tenant_id() CASCADE;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS bigint AS $$
DECLARE
  tenant_claim text;
BEGIN
  tenant_claim := current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id';
  
  IF tenant_claim IS NULL THEN
    tenant_claim := current_setting('app.current_tenant_id', true);
  END IF;

  IF tenant_claim IS NOT NULL AND tenant_claim != '' THEN
    RETURN tenant_claim::bigint;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. RECONSTRUCCIÓN DE POLÍTICAS RLS EN PRODUCTOS
ALTER TABLE public.inv_productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_select" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_update" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.inv_productos;

CREATE POLICY "tenant_isolation_select" 
ON public.inv_productos FOR SELECT 
USING (empresa_id = public.current_tenant_id());

CREATE POLICY "tenant_isolation_insert" 
ON public.inv_productos FOR INSERT 
WITH CHECK (empresa_id = public.current_tenant_id());

CREATE POLICY "tenant_isolation_update" 
ON public.inv_productos FOR UPDATE 
USING (empresa_id = public.current_tenant_id())
WITH CHECK (empresa_id = public.current_tenant_id());

CREATE POLICY "tenant_isolation_delete" 
ON public.inv_productos FOR DELETE 
USING (empresa_id = public.current_tenant_id());

-- 4. RECONSTRUCCIÓN DE POLÍTICAS RLS EN STORAGE (Para las imágenes)
-- Esto previene el error que vimos al subir imágenes al Storage

INSERT INTO storage.buckets (id, name, public) 
VALUES ('archivos_empresas', 'archivos_empresas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Lectura pública de archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Inserción aislada por tenant en archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Actualización aislada por tenant en archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación aislada por tenant en archivos_empresas" ON storage.objects;

-- Función SECURITY DEFINER para verificar acceso evadiendo restricciones RLS de las tablas
CREATE OR REPLACE FUNCTION public.check_user_tenant_access(p_user_id uuid, p_tenant_id text, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_access boolean;
BEGIN
  -- 1. Check superadmin
  IF p_email = 'amadomora@gmail.com' THEN
    RETURN true;
  END IF;

  -- 2. Check saas_usuarios_empresas
  SELECT EXISTS (
    SELECT 1 FROM saas_usuarios_empresas 
    WHERE id_usuario::text = p_user_id::text 
      AND id_empresa::text = p_tenant_id
      AND estado_acceso = true
  ) INTO has_access;
  
  IF has_access THEN
    RETURN true;
  END IF;

  -- 3. Check users table
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE email = p_email
      AND empresa_id::text = p_tenant_id
  ) INTO has_access;

  RETURN has_access;
END;
$$;

CREATE POLICY "Lectura pública de archivos_empresas" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'archivos_empresas' );

CREATE POLICY "Inserción aislada por tenant en archivos_empresas" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'archivos_empresas' 
  AND (
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id',
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id'
    ) = (storage.foldername(name))[1]
    OR public.check_user_tenant_access(
        auth.uid(), 
        (storage.foldername(name))[1], 
        current_setting('request.jwt.claims', true)::jsonb ->> 'email'
    )
  )
);

CREATE POLICY "Actualización aislada por tenant en archivos_empresas" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'archivos_empresas' 
  AND (
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id',
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id'
    ) = (storage.foldername(name))[1]
    OR public.check_user_tenant_access(
        auth.uid(), 
        (storage.foldername(name))[1], 
        current_setting('request.jwt.claims', true)::jsonb ->> 'email'
    )
  )
);

CREATE POLICY "Eliminación aislada por tenant en archivos_empresas" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'archivos_empresas' 
  AND (
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id',
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id'
    ) = (storage.foldername(name))[1]
    OR public.check_user_tenant_access(
        auth.uid(), 
        (storage.foldername(name))[1], 
        current_setting('request.jwt.claims', true)::jsonb ->> 'email'
    )
  )
);


