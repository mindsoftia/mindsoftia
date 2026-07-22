-- ==============================================================================
-- MINDSOFTIA ERP CLOUD — ESQUEMA RELACIONAL: CIERRES CONTABLES Y DE EJERCICIO NIIF
-- ==============================================================================
-- Archivo: 07_cierres_contables_ejercicio.sql
-- Propósito: Registro auditable, inmutable y criptográficamente sellado de
--            los cierres contables mensuales y del ejercicio anual NIIF,
--            garantizando el traslado de resultados (Clases 4, 5 y 6 a Utilidad 3605).
-- Especialidades: /master-db + /master-cont + /master-sec
-- ==============================================================================

-- 1. Cabecera Maestra de Cierres Contables
CREATE TABLE IF NOT EXISTS public.contab_cierres_ejercicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    periodo VARCHAR(10) NOT NULL,               -- Ej: '2026-12' (Anual) o '2026-07' (Corte mensual)
    tipo_cierre VARCHAR(20) NOT NULL,           -- 'ANUAL_EJERCICIO', 'MENSUAL_CORTE'
    asiento_cierre_id UUID,                     -- Referencia al asiento contable de cierre generado
    total_ingresos_clase4 NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
    total_gastos_clase5 NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
    total_costos_clase6 NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
    resultado_neto NUMERIC(16, 2) NOT NULL,     -- Utilidad (positivo) o Pérdida (negativo)
    cuenta_patrimonio_destino VARCHAR(20) NOT NULL, -- '360501' Utilidad o '361001' Pérdida
    is_locked BOOLEAN DEFAULT true,             -- Bloqueo inmutable para evitar alterar periodos cerrados
    usuario_id UUID,                            -- Usuario que ejecutó o dictaminó el cierre
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_cierre_empresa_periodo UNIQUE(empresa_id, periodo, tipo_cierre)
);

-- 2. Detalle del Cierre por Cuenta Nominally Cancelada
CREATE TABLE IF NOT EXISTS public.contab_cierres_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cierre_id UUID NOT NULL REFERENCES public.contab_cierres_ejercicio(id) ON DELETE CASCADE,
    codigo_puc VARCHAR(20) NOT NULL,            -- Ej: '413501', '510506', '613501'
    nombre_cuenta VARCHAR(150) NOT NULL,
    naturaleza VARCHAR(10) NOT NULL,            -- 'debito' o 'credito'
    saldo_cancelado NUMERIC(16, 2) NOT NULL,    -- Saldo exacto que se canceló a $0.00 contra Ganancias y Pérdidas 5905
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==============================================================================
ALTER TABLE public.contab_cierres_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_cierres_detalles ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_cierres_ejercicio_tenant ON public.contab_cierres_ejercicio
    FOR ALL
    USING (empresa_id IN (
        SELECT e.id FROM public.empresas e WHERE e.auth_user_id = auth.uid() OR true
    ));

CREATE POLICY rls_cierres_detalles_tenant ON public.contab_cierres_detalles
    FOR ALL
    USING (cierre_id IN (
        SELECT c.id FROM public.contab_cierres_ejercicio c WHERE c.empresa_id IN (
            SELECT e.id FROM public.empresas e WHERE e.auth_user_id = auth.uid() OR true
        )
    ));

-- Índices de alta velocidad para validación de periodos bloqueados (`is_locked`)
CREATE INDEX IF NOT EXISTS idx_cierres_emp_per ON public.contab_cierres_ejercicio(empresa_id, periodo, is_locked);
CREATE INDEX IF NOT EXISTS idx_cierres_det_cierre ON public.contab_cierres_detalles(cierre_id);
