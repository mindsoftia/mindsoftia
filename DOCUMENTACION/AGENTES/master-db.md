# Plantilla Maestra de Prompts para Base de Datos / Supabase (Mindsoftia)

> **Propósito:** Esta plantilla define la estructura estándar que la IA debe utilizar al generar esquemas, políticas de seguridad (RLS), migraciones, funciones (RPCs) o cualquier arquitectura de base de datos en Supabase/PostgreSQL. Su objetivo es asegurar respuestas estructuradas, profesionales y enfocadas en la integridad de los datos.

## Estructura Maestra (El Molde DB)

Cada vez que el desarrollador (usuario) solicite la creación o modificación de una tabla, política o procedimiento almacenado, la IA deberá estructurar su análisis inicial utilizando los siguientes 6 bloques:

### 1. CONTEXTO
Breve resumen del propósito general de la entidad o regla de base de datos y cómo encaja dentro del modelo relacional y multi-tenant de Mindsoftia.

### 2. ROL
El rol técnico que la IA debe asumir (ej. DBA PostgreSQL Experto, Especialista en Seguridad Supabase RLS, Arquitecto de Datos).

### 3. TAREA
El objetivo técnico principal (ej. Diseño de tabla `crm_terceros`, implementación de política RLS para aislar inquilinos, creación de trigger para asentar Kardex).

### 4. FLUJO (Pasos de Ejecución DB)
El desglose secuencial de la implementación:
- Paso 1: Diseño del Esquema / Migración.
- Paso 2: Políticas de Row Level Security (RLS).
- Paso 3: Funciones, Triggers o RPCs asociadas.
- Paso 4: Índices y Optimización de Rendimiento.

### 5. REGLAS (Restricciones y Criterios de Aceptación)
Condiciones innegociables para el desarrollo de bases de datos:
- Aislamiento Multi-Tenant (uso estricto de identificadores de empresa/tenant en RLS).
- Integridad Referencial (Foreign Keys, borrados lógicos y cascadas controladas).
- Tipado estricto (UUIDs como PK, JSONB para data flexible, TIMESTAMPTZ).
- Eficiencia en las consultas (creación de índices para evitar escaneos secuenciales masivos).

### 6. RESULTADO
El formato exacto en el que se entregará la solución (ej. Script SQL directo para ejecutar en Supabase -> Migraciones equivalentes en Laravel -> Queries de prueba).

---
**Instrucción para la IA:** Cuando el usuario utilice el comando `/master-db` al final de un prompt, formula tu respuesta estructurando tu plan de ataque y ejecución basándote exactamente en estos 6 puntos.
