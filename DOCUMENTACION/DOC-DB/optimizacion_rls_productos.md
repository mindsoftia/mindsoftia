# Optimización de Consultas y RLS en Catálogo de Productos

## 1. CONTEXTO
Actualmente, la tabla `inv_productos` presenta lentitud en la extracción de datos ("Sequential Scan" masivo) y bloqueos al insertar nuevos productos. Esto se debe a la ausencia de índices compuestos para los filtrados más comunes (como `empresa_id` y `estado`) y a una política RLS (Row Level Security) que o bien llama a funciones costosas o directamente restringe inserciones válidas al no mapear correctamente el contexto del inquilino (tenant).

## 2. ROL
DBA PostgreSQL Experto & Arquitecto de Datos.

## 3. TAREA
- Añadir índices B-Tree en las columnas `empresa_id`, `estado` y `categoria_id` de la tabla `inv_productos` para acelerar los queries.
- Reescribir la función `current_tenant_id()` y las políticas RLS de `inv_productos` para que sean ultrarrápidas, garantizando el aislamiento sin penalizar el rendimiento del CRUD.

## 4. FLUJO (Pasos de Ejecución DB)
- **Paso 1:** Generación de la migración de Laravel para agregar índices.
- **Paso 2:** Refactorización de la función de base de datos `current_tenant_id()` para leer directamente el claim del JWT u originar el fallback del header inyectado por Laravel.
- **Paso 3:** Recreación de las políticas RLS (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) vinculadas a este ID, forzando la utilización de los nuevos índices.
- **Paso 4:** Análisis y comprobación (los tiempos de respuesta en `ProductosList.jsx` deberían disminuir drásticamente al milisegundo).

## 5. REGLAS (Criterios de Aceptación)
- **Aislamiento Multi-Tenant:** `empresa_id` debe coincidir estrictamente con el contexto actual.
- **Eficiencia en las consultas:** `CREATE INDEX` en columnas de alta cardinalidad/búsqueda.
- **Integridad:** Las migraciones deben usar esquemas "RAW SQL" para las políticas de Supabase, ya que los métodos estándar de Laravel Schema no cubren RLS.

## 6. RESULTADO
- Este documento de arquitectura (guardado en `DOC-DB`).
- Un script de migración SQL puro (que puedes correr en el panel de Supabase) para aplicar todos los cambios en segundos.

---

### SCRIPT SQL DE OPTIMIZACIÓN Y RLS (Ejecutar en Supabase SQL Editor)

```sql
-- ==========================================
-- 1. CREACIÓN DE ÍNDICES PARA ACELERAR LECTURAS
-- ==========================================
-- Índice compuesto muy eficiente para la consulta principal de "ProductosList.jsx"
CREATE INDEX IF NOT EXISTS idx_inv_productos_empresa_estado 
ON public.inv_productos (empresa_id, estado);

-- Índice secundario para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_inv_productos_empresa_categoria 
ON public.inv_productos (empresa_id, categoria_id);

-- Índice para el SKU (búsquedas por texto)
CREATE INDEX IF NOT EXISTS idx_inv_productos_sku 
ON public.inv_productos (codigo_sku);

-- ==========================================
-- 2. REFACTORIZACIÓN FUNCIÓN TENANT
-- ==========================================
-- Esta función lee el tenant_id (empresa_id) de forma extremadamente rápida.
DROP FUNCTION IF EXISTS public.current_tenant_id() CASCADE;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS bigint AS $$
DECLARE
  tenant_claim text;
  tenant_id bigint;
BEGIN
  -- Opción 1: Extraer del JWT (Supabase Auth directo en el cliente)
  tenant_claim := current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id';
  
  -- Opción 2: Extraer variable local inyectada por el Backend (Laravel / middleware)
  IF tenant_claim IS NULL THEN
    tenant_claim := current_setting('app.current_tenant_id', true);
  END IF;

  -- Retornar casteado a bigint o null
  IF tenant_claim IS NOT NULL AND tenant_claim != '' THEN
    RETURN tenant_claim::bigint;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Nota de rendimiento: Se usa "STABLE" para que PostgreSQL cachee 
-- el resultado dentro de un mismo statement/transacción, 
-- evitando múltiples llamadas durante un escaneo de tabla.

-- ==========================================
-- 3. RECONSTRUCCIÓN DE POLÍTICAS RLS
-- ==========================================
ALTER TABLE public.inv_productos ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas defectuosas
DROP POLICY IF EXISTS "tenant_isolation_select" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_update" ON public.inv_productos;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.inv_productos;

-- POLÍTICA SELECT (Ultrarrápida, cruza el índice creado en el Paso 1)
CREATE POLICY "tenant_isolation_select" 
ON public.inv_productos FOR SELECT 
USING (empresa_id = public.current_tenant_id());

-- POLÍTICA INSERT (El usuario sólo puede insertar bajo su propia empresa)
CREATE POLICY "tenant_isolation_insert" 
ON public.inv_productos FOR INSERT 
WITH CHECK (empresa_id = public.current_tenant_id());

-- POLÍTICA UPDATE 
CREATE POLICY "tenant_isolation_update" 
ON public.inv_productos FOR UPDATE 
USING (empresa_id = public.current_tenant_id())
WITH CHECK (empresa_id = public.current_tenant_id());

-- POLÍTICA DELETE
CREATE POLICY "tenant_isolation_delete" 
ON public.inv_productos FOR DELETE 
USING (empresa_id = public.current_tenant_id());
```
