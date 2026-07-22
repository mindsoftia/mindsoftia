-- ==============================================================================
-- Módulo: Contabilidad Electrónica NIIF & Libros Oficiales DIAN
-- Autor: Mindsoftia (/master-db + /master-cont + /master-sec)
-- Descripción: Tabla contab_saldos_periodo con Row Level Security (RLS) e índices.
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUID (Asegurarnos que exista)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: contab_saldos_periodo (Saldos mensualizados del Balance de Prueba)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contab_saldos_periodo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    periodo CHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
    cuenta_puc VARCHAR(20) NOT NULL,
    cuenta_nombre VARCHAR(150),
    saldo_anterior DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    debito_periodo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    credito_periodo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    saldo_nuevo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_contab_saldos_empresa_periodo_puc UNIQUE(empresa_id, periodo, cuenta_puc)
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security) - Aislamiento Multi-Tenant
-- ==============================================================================
ALTER TABLE public.contab_saldos_periodo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento Empresa Saldos Contables" ON public.contab_saldos_periodo;
CREATE POLICY "Aislamiento Empresa Saldos Contables" ON public.contab_saldos_periodo
    FOR ALL USING (
        empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT
    );

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO PARA BALANCES DE PRUEBA Y REPORTES DIAN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_contab_saldos_periodo_empresa_periodo 
    ON public.contab_saldos_periodo(empresa_id, periodo);

CREATE INDEX IF NOT EXISTS idx_contab_saldos_periodo_empresa_cuenta 
    ON public.contab_saldos_periodo(empresa_id, cuenta_puc);

-- FIN DEL SCRIPT
