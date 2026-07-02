-- ==============================================================================
-- Módulo: Inventario y Contactos (Proveedores)
-- Autor: Mindsoftia (/master-db)
-- Descripción: Esquema corregido usando "empresa_id" para Categorías y Terceros.
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUID (Si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: crm_terceros (Directorio Unificado de Clientes, Proveedores y Empleados)
-- ==============================================================================

-- Si la tabla ya existe, nos aseguramos de añadir la columna empresa_id
-- (Esto previene el error 42703 si la tabla fue creada previamente sin esta columna)
CREATE TABLE IF NOT EXISTS public.crm_terceros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

ALTER TABLE public.crm_terceros 
    ADD COLUMN IF NOT EXISTS empresa_id BIGINT NOT NULL,
    ADD COLUMN IF NOT EXISTS numero_identificacion VARCHAR(50) NOT NULL,
    ADD COLUMN IF NOT EXISTS tipo_identificacion VARCHAR(10) DEFAULT 'CC',
    ADD COLUMN IF NOT EXISTS nombres VARCHAR(100),
    ADD COLUMN IF NOT EXISTS apellidos VARCHAR(100),
    ADD COLUMN IF NOT EXISTS razon_social VARCHAR(200),
    ADD COLUMN IF NOT EXISTS es_cliente BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS es_proveedor BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS es_empleado BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
    ADD COLUMN IF NOT EXISTS direccion TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Intentar crear la restricción única (puede fallar si ya existe, lo cual es normal)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_terceros_identificacion_empresa') THEN
        ALTER TABLE public.crm_terceros ADD CONSTRAINT uk_terceros_identificacion_empresa UNIQUE(empresa_id, numero_identificacion);
    END IF;
END $$;


-- ==============================================================================
-- TABLA: inv_categorias (Familias de Productos para Kardex y Contabilidad)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.inv_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

ALTER TABLE public.inv_categorias
    ADD COLUMN IF NOT EXISTS empresa_id BIGINT NOT NULL,
    ADD COLUMN IF NOT EXISTS nombre VARCHAR(100) NOT NULL,
    ADD COLUMN IF NOT EXISTS descripcion TEXT,
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.inv_categorias(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS cuenta_contable_ingreso VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cuenta_contable_costo VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cuenta_contable_inventario VARCHAR(50),
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_categorias_nombre_empresa') THEN
        ALTER TABLE public.inv_categorias ADD CONSTRAINT uk_categorias_nombre_empresa UNIQUE(empresa_id, nombre);
    END IF;
END $$;


-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security) - Aislamiento Multi-Tenant
-- ==============================================================================
ALTER TABLE public.crm_terceros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inv_categorias ENABLE ROW LEVEL SECURITY;

-- Política: Las empresas solo pueden ver y modificar SUS TERCEROS.
-- Nota: Si la política ya existe, DROP primero para recrearla sin error.
DROP POLICY IF EXISTS "Aislamiento Empresa Terceros" ON public.crm_terceros;
CREATE POLICY "Aislamiento Empresa Terceros" ON public.crm_terceros
    FOR ALL
    USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- Política: Las empresas solo pueden ver y modificar SUS CATEGORÍAS.
DROP POLICY IF EXISTS "Aislamiento Empresa Categorias" ON public.inv_categorias;
CREATE POLICY "Aislamiento Empresa Categorias" ON public.inv_categorias
    FOR ALL
    USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- ==============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_terceros_empresa ON public.crm_terceros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_terceros_busqueda ON public.crm_terceros(numero_identificacion, razon_social, apellidos);
CREATE INDEX IF NOT EXISTS idx_categorias_empresa ON public.inv_categorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_categorias_parent ON public.inv_categorias(parent_id);

-- FIN DEL SCRIPT
