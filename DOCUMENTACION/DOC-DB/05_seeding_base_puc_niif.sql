-- ==============================================================================
-- MINDSOFTIA ERP CLOUD — SEEDING MAESTRO PLAN ÚNICO DE CUENTAS (`PUC NIIF`)
-- ==============================================================================
-- Archivo: 05_seeding_base_puc_niif.sql
-- Propósito: Poblar la tabla relacional `accounts` con las 19 cuentas raíz
--            (Clases 1 a 6, Grupos, Cuentas y Subcuentas de movimiento) obligatorias
--            para todas las empresas (`empresas`) existentes bajo norma NIIF Colombia.
-- Ejecución: SQL Editor en Supabase o migración post-seeding.
-- ==============================================================================

INSERT INTO public.accounts (
    empresa_id, 
    code, 
    name, 
    type, 
    nature, 
    is_transactional, 
    is_active, 
    created_at, 
    updated_at
)
SELECT 
    e.id AS empresa_id,
    p.code, 
    p.name, 
    p.type::varchar, 
    p.nature::varchar, 
    p.is_transactional, 
    true AS is_active, 
    NOW() AS created_at, 
    NOW() AS updated_at
FROM public.empresas e
CROSS JOIN (
    VALUES 
    -- CLASE 1: ACTIVO (Naturaleza Débito)
    ('1', 'ACTIVO', 'clase', 'debito', false),
    ('11', 'DISPONIBLE (EFECTIVO Y EQUIVALENTES)', 'grupo', 'debito', false),
    ('1105', 'Caja General', 'cuenta', 'debito', false),
    ('110505', 'Caja Registradora Principal', 'subcuenta', 'debito', true),
    ('1110', 'Bancos — Moneda Nacional', 'cuenta', 'debito', false),
    ('111005', 'Bancolombia Cuenta Corriente', 'subcuenta', 'debito', true),
    ('14', 'INVENTARIOS', 'grupo', 'debito', false),
    ('1435', 'Mercancías no fabricadas por la empresa', 'cuenta', 'debito', false),
    ('143501', 'Inventario de Mercancía General', 'subcuenta', 'debito', true),
    
    -- CLASE 2: PASIVO (Naturaleza Crédito)
    ('2', 'PASIVO', 'clase', 'credito', false),
    ('22', 'PROVEEDORES', 'grupo', 'credito', false),
    ('2205', 'Proveedores Nacionales', 'cuenta', 'credito', false),
    ('220501', 'Proveedores de Mercancía y Suministros', 'subcuenta', 'credito', true),
    ('24', 'CUENTAS POR PAGAR — IMPUESTOS', 'grupo', 'credito', false),
    ('2408', 'Impuesto sobre las ventas por pagar (IVA)', 'cuenta', 'credito', false),
    ('240801', 'IVA Generado en Ventas (19%)', 'subcuenta', 'credito', true),
    
    -- CLASE 3: PATRIMONIO (Naturaleza Crédito)
    ('3', 'PATRIMONIO', 'clase', 'credito', false),
    ('31', 'CAPITAL SOCIAL', 'grupo', 'credito', false),
    ('3105', 'Capital Suscrito y Pagado', 'cuenta', 'credito', true),
    
    -- CLASE 4: INGRESOS (Naturaleza Crédito)
    ('4', 'INGRESOS', 'clase', 'credito', false),
    ('41', 'OPERACIONALES', 'grupo', 'credito', false),
    ('4135', 'Comercio al por mayor y al por menor', 'cuenta', 'credito', false),
    ('413501', 'Ventas POS de Mercancía General', 'subcuenta', 'credito', true),
    
    -- CLASE 6: COSTO DE VENTAS (Naturaleza Débito)
    ('6', 'COSTO DE VENTAS', 'clase', 'debito', false),
    ('61', 'COSTO DE VENTAS Y DE PRESTACIÓN DE SERVICIOS', 'grupo', 'debito', false),
    ('6135', 'Comercio al por mayor y al por menor', 'cuenta', 'debito', false),
    ('613501', 'Costo de Mercancía Vendida POS', 'subcuenta', 'debito', true)
) AS p(code, name, type, nature, is_transactional)
ON CONFLICT (empresa_id, code) DO NOTHING;

-- Verificación en consola SQL de Supabase:
-- SELECT id, empresa_id, code, name, type, nature, is_transactional FROM public.accounts ORDER BY empresa_id, code ASC;
