-- ==============================================================================
-- Módulo: Facturación Electrónica DIAN (UBL 2.1 / CUFE / RADIAN)
-- Autor: Mindsoftia (/master-db + /master-cont + /master-sec)
-- Descripción: Tablas fe_resoluciones, fe_documentos y fe_eventos_radian con RLS.
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: fe_resoluciones (Autorizaciones de numeración y clave técnica DIAN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fe_resoluciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    numero_resolucion VARCHAR(50) NOT NULL,
    prefijo VARCHAR(10),
    numero_inicial BIGINT NOT NULL,
    numero_final BIGINT NOT NULL,
    consecutivo_actual BIGINT DEFAULT 0,
    clave_tecnica VARCHAR(150) NOT NULL,
    ambiente SMALLINT DEFAULT 2, -- 1=Producción, 2=Pruebas
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_fe_resoluciones_empresa_prefijo UNIQUE(empresa_id, prefijo, numero_resolucion)
);

-- ==============================================================================
-- TABLA: fe_documentos (Historial y trazabilidad de facturas/notas XML UBL 2.1)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fe_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(5) DEFAULT '01', -- 01 Factura, 03 Nota Débito, 04 Nota Crédito, 05 POS Electrónico, 10 Nómina CUNE
    documento_origen_tipo VARCHAR(50),
    documento_origen_id UUID,
    prefijo VARCHAR(10),
    consecutivo BIGINT NOT NULL,
    numero_completo VARCHAR(60) NOT NULL,
    cufe_cune VARCHAR(96), -- Hash SHA-384
    qr_code_url TEXT,
    xml_generado TEXT,
    xml_firmado TEXT,
    track_id_dian VARCHAR(100),
    estado_dian VARCHAR(30) DEFAULT 'borrador', -- borrador, generado, enviado, aprobado, rechazado, anulado
    codigo_error_dian VARCHAR(100),
    mensaje_dian TEXT,
    fecha_emision DATE NOT NULL,
    hora_emision TIME NOT NULL,
    fecha_validacion_dian TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_fe_docs_empresa_numero_tipo UNIQUE(empresa_id, numero_completo, tipo_documento)
);

-- ==============================================================================
-- TABLA: fe_eventos_radian (Acuse de recibo, aceptación y título valor DIAN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fe_eventos_radian (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fe_documento_id UUID NOT NULL REFERENCES public.fe_documentos(id) ON DELETE CASCADE,
    empresa_id BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo_evento VARCHAR(10) NOT NULL, -- 030 Acuse, 032 Recibo, 033 Aceptación, 034 Reclamo
    descripcion_evento VARCHAR(200) NOT NULL,
    xml_evento TEXT,
    track_id_dian VARCHAR(100),
    estado VARCHAR(30) DEFAULT 'aprobado',
    fecha_evento TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security) - Aislamiento Zero Trust
-- ==============================================================================
ALTER TABLE public.fe_resoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fe_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fe_eventos_radian ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento Empresa Resoluciones FE" ON public.fe_resoluciones;
CREATE POLICY "Aislamiento Empresa Resoluciones FE" ON public.fe_resoluciones
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

DROP POLICY IF EXISTS "Aislamiento Empresa Documentos FE" ON public.fe_documentos;
CREATE POLICY "Aislamiento Empresa Documentos FE" ON public.fe_documentos
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

DROP POLICY IF EXISTS "Aislamiento Empresa Eventos RADIAN" ON public.fe_eventos_radian;
CREATE POLICY "Aislamiento Empresa Eventos RADIAN" ON public.fe_eventos_radian
    FOR ALL USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO Y BÚSQUEDA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_fe_resoluciones_empresa_activo ON public.fe_resoluciones(empresa_id, activo);
CREATE INDEX IF NOT EXISTS idx_fe_documentos_empresa_estado ON public.fe_documentos(empresa_id, estado_dian);
CREATE INDEX IF NOT EXISTS idx_fe_documentos_cufe ON public.fe_documentos(cufe_cune);
CREATE INDEX IF NOT EXISTS idx_fe_documentos_origen ON public.fe_documentos(documento_origen_tipo, documento_origen_id);
CREATE INDEX IF NOT EXISTS idx_fe_eventos_doc_codigo ON public.fe_eventos_radian(fe_documento_id, codigo_evento);

-- FIN DEL SCRIPT
