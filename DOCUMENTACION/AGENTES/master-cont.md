# Plantilla Maestra de Prompts para Solicitudes Contables (Mindsoftia)

> **Propósito:** Esta plantilla define la estructura estándar que la IA debe utilizar al gestionar, analizar o implementar solicitudes, reportes o lógicas contables dentro del proyecto. Su objetivo es asegurar respuestas financieras precisas, organizadas y que generen la documentación correspondiente en el directorio `DOC-CONT`.

## Estructura Maestra (El Molde)

Cada vez que se solicite abordar un requerimiento contable, la IA deberá estructurar su análisis inicial utilizando los siguientes 6 bloques:

### 1. CONTEXTO
Breve resumen del propósito contable o financiero de la solicitud y su impacto en el módulo administrativo de Mindsoftia.

### 2. ROL
El rol que la IA debe asumir (ej. Analista Financiero Senior, Especialista en Sistemas Contables, Auditor de Datos Financieros, etc.).

### 3. TAREA
El objetivo financiero o lógico principal, descrito de forma clara y concisa (ej. "Conciliación de pagos", "Generación de estado de cuenta", "Lógica de cálculo de impuestos").

### 4. FLUJO (Pasos de Ejecución)
El desglose secuencial de cómo se procesará la solicitud contable.
- Paso 1: Análisis de los datos financieros...
- Paso 2: Cálculo y aplicación de reglas contables...
- Paso 3: Documentación en DOC-CONT...
- etc.

### 5. REGLAS (Restricciones y Criterios de Aceptación)
Las condiciones no negociables para el desarrollo contable:
- Precisión numérica (uso correcto de decimales y redondeos).
- Cumplimiento estricto de la lógica contable (partida doble, integridad transaccional).
- Documentación obligatoria: Todo reporte, análisis o decisión contable debe quedar documentado en un archivo Markdown dentro de `DOCUMENTACION/DOC-CONT/`.

### 6. RESULTADO
El formato exacto en el que se entregará la solución (ej. Reporte financiero en Markdown guardado en `DOC-CONT`, lógica SQL/Supabase, componente o script de actualización).

---
**Instrucción para la IA:** Cuando el usuario utilice el comando `/master-cont` o solicite abordar una tarea financiera/contable compleja, lee este documento, formula tu respuesta estructurando tu plan de ataque basándote exactamente en estos 6 puntos, y asegúrate de registrar cualquier documentación generada en la carpeta `DOCUMENTACION/DOC-CONT`.
