# Plantilla Maestra de Prompts para Desarrollo (Mindsoftia)

> **Propósito:** Esta plantilla define la estructura estándar que la IA debe utilizar al generar especificaciones o planificar nuevas tareas de desarrollo dentro de este proyecto. Su objetivo es asegurar respuestas estructuradas, profesionales y orientadas a resultados, eliminando la ambigüedad.

## Estructura Maestra (El Molde)

Cada vez que el desarrollador (usuario) solicite la creación, refactorización o planificación de un módulo/componente complejo, la IA deberá estructurar su análisis inicial utilizando los siguientes 6 bloques:

### 1. CONTEXTO
Breve resumen del propósito general de la funcionalidad y cómo encaja dentro del proyecto Mindsoftia.

### 2. ROL
El rol técnico y actitudinal que la IA debe asumir para esta tarea (ej. Desarrollador Senior de React, Arquitecto de Base de Datos enfocado en rendimiento, etc.).

### 3. TAREA
El objetivo técnico principal, descrito de forma clara y concisa. Responde al "Qué se va a construir y por qué".

### 4. FLUJO (Pasos de Ejecución)
El desglose secuencial de cómo se implementará la tarea.
- Paso 1...
- Paso 2...
- etc.

### 5. REGLAS (Restricciones y Criterios de Aceptación)
Las condiciones no negociables para el desarrollo:
- Rendimiento (ej. sin tiempos de carga bloqueantes).
- Experiencia de Usuario (UI/UX).
- Arquitectura (ej. uso de Supabase, hooks personalizados).
- Cualquier otra restricción técnica aplicable.

### 6. RESULTADO
El formato exacto en el que se entregará la solución (ej. Código completo del componente -> Actualización de la base de datos -> Pruebas).

---
**Instrucción para la IA:** Cuando el usuario indique "Aplica la plantilla maestra" o pida desarrollar una funcionalidad compleja desde cero, lee este documento y formula tu respuesta estructurando tu plan de ataque basándote exactamente en estos 6 puntos antes de escribir código.
