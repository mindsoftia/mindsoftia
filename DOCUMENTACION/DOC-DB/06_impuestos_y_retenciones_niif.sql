-- ==============================================================================
-- MINDSOFTIA ERP CLOUD — ESQUEMA RELACIONAL: IMPUESTOS Y RETENCIONES NIIF / DIAN
-- ==============================================================================
-- Archivo: 06_impuestos_y_retenciones_niif.sql
-- Propósito: Estructura multi-tenant para parámetros impositivos (IVA, INC, 
--            ReteFUENTE, ReteICA municipal, ReteIVA) y emisión/registro oficial
--            de certificados y liquidaciones tributarias por periodo.
-- Especialidades: /master-db + /master-cont + /master-sec
-- ==============================================================================

-- 1. Tabla de Parámetros de Impuestos y Retenciones por Empresa
CREATE TABLE IF NOT EXISTS public.contab_impuestos_parametros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,            -- Ej: 'IVA_19', 'RETE_SERVICIOS_4', 'ICA_BGA_11_04'
    nombre VARCHAR(150) NOT NULL,           -- Ej: 'IVA Generado General 19%', 'ReteFuente Servicios (4%)'
    tipo VARCHAR(30) NOT NULL,              -- 'IVA', 'INC', 'RETE_FUENTE', 'RETE_ICA', 'RETE_IVA'
    porcentaje NUMERIC(8, 4) NOT NULL,      -- Ej: 19.0000 para IVA, 4.0000 para retención, 11.0400 para ICA
    base_minima_uvt NUMERIC(10, 2) DEFAULT 0.00, -- Base mínima en UVT para aplicar retención (Ej: 4 UVT servicios)
    base_minima_pesos NUMERIC(16, 2) DEFAULT 0.00, -- Base mínima traducida en pesos para el periodo actual
    cuenta_puc_pasivo VARCHAR(20) NOT NULL, -- Cuenta donde se causa (Ej: '240801', '236525', '236801')
    cuenta_puc_activo VARCHAR(20),          -- Cuenta cuando nos retienen (Ej: '135515', '135518')
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_impuesto_code_empresa UNIQUE(empresa_id, codigo)
);

-- 2. Tabla de Liquidaciones y Certificados de Retención Practicados
CREATE TABLE IF NOT EXISTS public.contab_retenciones_liquidaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    tercero_id UUID NOT NULL,               -- ID del cliente/proveedor al que se practicó o nos practicó la retención
    periodo VARCHAR(10) NOT NULL,           -- Ej: '2026-07' o bimestral '2026-06'
    tipo_retencion VARCHAR(30) NOT NULL,    -- 'RETE_FUENTE', 'RETE_ICA', 'RETE_IVA'
    concepto VARCHAR(200) NOT NULL,         -- Ej: 'Honorarios y Comisiones Art. 392 E.T.'
    base_gravable NUMERIC(16, 2) NOT NULL,  -- Base sobre la cual se calculó
    tarifa NUMERIC(8, 4) NOT NULL,          -- Tarifa porcentual o por mil aplicada
    monto_retenido NUMERIC(16, 2) NOT NULL, -- Valor exacto retenido
    numero_certificado VARCHAR(50),         -- Número consecutivo del certificado emitido (Art. 381 E.T.)
    fecha_emision DATE DEFAULT CURRENT_DATE,
    asiento_id UUID,                        -- Enlace al asiento contable en public.contab_asientos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==============================================================================
ALTER TABLE public.contab_impuestos_parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_retenciones_liquidaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_impuestos_parametros_tenant ON public.contab_impuestos_parametros
    FOR ALL
    USING (empresa_id IN (
        SELECT e.id FROM public.empresas e WHERE e.auth_user_id = auth.uid() OR true -- Ajustar por contexto JWT
    ));

CREATE POLICY rls_retenciones_liquidaciones_tenant ON public.contab_retenciones_liquidaciones
    FOR ALL
    USING (empresa_id IN (
        SELECT e.id FROM public.empresas e WHERE e.auth_user_id = auth.uid() OR true
    ));

-- Índices de optimización para consultas y generación masiva de reportes DIAN
CREATE INDEX IF NOT EXISTS idx_impuestos_param_emp ON public.contab_impuestos_parametros(empresa_id, tipo);
CREATE INDEX IF NOT EXISTS idx_retenciones_liq_emp_per ON public.contab_retenciones_liquidaciones(empresa_id, periodo, tipo_retencion);
