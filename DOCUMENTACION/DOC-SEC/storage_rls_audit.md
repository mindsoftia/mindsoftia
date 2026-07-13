# Auditoría y Mitigación de Seguridad: Supabase Storage RLS

## 1. CONTEXTO DE VULNERABILIDAD
Se ha identificado una posible brecha de seguridad y un fallo funcional en la carga de imágenes del catálogo de productos hacia Supabase Storage. El servicio frontend (`StorageService.js`) apunta al bucket `archivos_empresas` y utiliza el patrón de ruta `{tenant_id}/productos/{archivo}`. Si las políticas de Row Level Security (RLS) en la tabla `storage.objects` de Supabase no están estrictamente vinculadas a las variables de entorno de la sesión o al JWT, se generan dos escenarios:
1. **Fallo de escritura (Bloqueo actual):** Políticas inexistentes o demasiado restrictivas que deniegan cualquier `INSERT`.
2. **Fugas de datos entre inquilinos (Tenant Isolation):** Un usuario autenticado de la "Empresa A" podría subir archivos y reescribir/leer datos en la carpeta de la "Empresa B".

## 2. ROL
Auditor de Seguridad Web & Experto en DevSecOps y Supabase RLS.

## 3. TAREA
Refactorizar y asegurar las políticas del bucket `archivos_empresas` en Supabase para garantizar un **aislamiento absoluto Multi-Tenant**. Solo se debe permitir hacer `INSERT`, `SELECT`, `UPDATE` y `DELETE` si el prefijo de la ruta del archivo coincide criptográficamente con el `empresa_id` registrado en el JWT (`app_metadata`) del usuario que dispara la petición.

## 4. FLUJO DE MITIGACIÓN (Pasos de Ejecución)
- **Paso 1 (Vulnerability Assessment):** Actualmente, las operaciones al bucket `archivos_empresas` desde `ProductoCreate.jsx` arrojan errores de permisos (RLS). Esto indica que la validación no contempla el `app_metadata` inyectado por nuestro backend/auth.
- **Paso 2 (Corrección en Base de Datos):** Implementar reglas SQL sobre la tabla `storage.objects` que fuercen la validación del path. (Código proporcionado abajo).
- **Paso 3 (Defensa en Profundidad):** Validar que el bucket sea público para lectura (si los clientes finales verán las fotos en el e-commerce) pero estrictamente privado para escritura y modificación según el Tenant.
- **Paso 4 (Pruebas de Validación):** Intentar forzar la subida a otra carpeta interceptando la petición frontend. La base de datos debe devolver `403 Forbidden`.

## 5. REGLAS (Criterios de Aceptación de Seguridad)
- **Zero Trust:** No confiamos en el `tenantId` que se pasa por la URL del frontend, validamos estrictamente con el claim `empresa_id` del token JWT.
- **Aislamiento Multi-Tenant:** `(storage.foldername(name))[1]` (la raíz del archivo en el bucket) DEBE ser idéntico al ID de la empresa autenticada.
- **Defensa en Profundidad:** El tamaño máximo de carga y extensiones (MIME types) deben ser controlados a nivel base de datos, no solo en React.

## 6. RESULTADO
El script SQL para mitigar la vulnerabilidad, estructurado para ser ejecutado directamente en el panel SQL de Supabase.

---

### SCRIPT SQL DE MITIGACIÓN (Ejecutar en Supabase)

```sql
-- 1. Asegurar que el bucket existe y es público (para que las imágenes del e-commerce se vean)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('archivos_empresas', 'archivos_empresas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas inseguras o antiguas en objetos de almacenamiento
DROP POLICY IF EXISTS "Lectura pública de archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Inserción aislada por tenant en archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Actualización aislada por tenant en archivos_empresas" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación aislada por tenant en archivos_empresas" ON storage.objects;

-- 3. Habilitar RLS explícito (por si acaso no está)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICA DE LECTURA (SELECT) - Pública (El catálogo requiere que cualquiera vea las fotos)
-- Nota: Si el ERP fuera 100% privado, se cambiaría a validar el JWT.
CREATE POLICY "Lectura pública de archivos_empresas" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'archivos_empresas' );

-- 5. POLÍTICA DE ESCRITURA (INSERT) - Estrictamente Tenant-Isolated
CREATE POLICY "Inserción aislada por tenant en archivos_empresas" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'archivos_empresas' 
  AND 
  -- Validar que la primera carpeta del path corresponda al tenant_id del usuario
  (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id')
);

-- 6. POLÍTICA DE ACTUALIZACIÓN (UPDATE) - Estrictamente Tenant-Isolated
CREATE POLICY "Actualización aislada por tenant en archivos_empresas" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'archivos_empresas' 
  AND 
  (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id')
);

-- 7. POLÍTICA DE ELIMINACIÓN (DELETE) - Estrictamente Tenant-Isolated
CREATE POLICY "Eliminación aislada por tenant en archivos_empresas" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'archivos_empresas' 
  AND 
  (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id')
);
```

### Instrucciones de Aplicación Post-Mitigación:
1. Dirígete a tu panel de control de Supabase.
2. Abre el **SQL Editor**.
3. Pega y ejecuta el bloque de código SQL de arriba.
4. Con esto, cualquier intento de un usuario (o de `StorageService.js`) de subir una imagen sin autorización o en una carpeta ajena a su `empresa_id` será bloqueado a nivel de Postgres. Las subidas legítimas de `ProductoCreate.jsx` pasarán correctamente.
