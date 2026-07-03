-- ==============================================================================
-- Módulo: Compras e Inventario
-- Autor: Mindsoftia (/master-db)
-- Descripción: Esquema para Productos, Facturas de Compra y Detalles con RLS.
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUID (Asegurarnos que exista)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: inv_productos (Catálogo maestro de bienes y servicios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inv_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id BIGINT NOT NULL,
    categoria_id UUID REFERENCES public.inv_categorias(id) ON DELETE RESTRICT,
    codigo_sku VARCHAR(50),
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'fisico', -- fisico, servicio, ensamble
    precio_venta DECIMAL(12,2) DEFAULT 0.00,
    costo_promedio DECIMAL(12,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_productos_sku_empresa') THEN
        ALTER TABLE public.inv_productos ADD CONSTRAINT uk_productos_sku_empresa UNIQUE(empresa_id, codigo_sku);
    END IF;
END $$;


-- ==============================================================================
-- TABLA: com_facturas (Cabecera de Facturas de Compra)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.com_facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id BIGINT NOT NULL,
    proveedor_id UUID REFERENCES public.crm_terceros(id) ON DELETE RESTRICT,
    numero_factura VARCHAR(100),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    impuestos DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) DEFAULT 0.00,
    estado VARCHAR(50) DEFAULT 'borrador', -- borrador, aprobada, pagada, anulada
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLA: com_facturas_detalles (Líneas de la factura de compra)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.com_facturas_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factura_id UUID REFERENCES public.com_facturas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.inv_productos(id) ON DELETE RESTRICT,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security) - Aislamiento Multi-Tenant
-- ==============================================================================
ALTER TABLE public.inv_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_facturas_detalles ENABLE ROW LEVEL SECURITY;

-- Política: Productos
DROP POLICY IF EXISTS "Aislamiento Empresa Productos" ON public.inv_productos;
CREATE POLICY "Aislamiento Empresa Productos" ON public.inv_productos
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- Política: Facturas de Compra
DROP POLICY IF EXISTS "Aislamiento Empresa Facturas Compra" ON public.com_facturas;
CREATE POLICY "Aislamiento Empresa Facturas Compra" ON public.com_facturas
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- Política: Detalles de Facturas de Compra (Hereda la seguridad indirectamente a través del join pero la aplicamos directo si le ponemos empresa_id al detalle. 
-- Dado que no pusimos empresa_id, se la podemos agregar o basarnos en la cabecera. Es mejor añadir empresa_id al detalle para simplificar el RLS)
ALTER TABLE public.com_facturas_detalles ADD COLUMN IF NOT EXISTS empresa_id BIGINT NOT NULL;

DROP POLICY IF EXISTS "Aislamiento Empresa Detalles Factura Compra" ON public.com_facturas_detalles;
CREATE POLICY "Aislamiento Empresa Detalles Factura Compra" ON public.com_facturas_detalles
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- ==============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON public.inv_productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.inv_productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_facturas_empresa ON public.com_facturas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_proveedor ON public.com_facturas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_detalles_factura ON public.com_facturas_detalles(factura_id);
CREATE INDEX IF NOT EXISTS idx_detalles_producto ON public.com_facturas_detalles(producto_id);

-- FIN DEL SCRIPT
