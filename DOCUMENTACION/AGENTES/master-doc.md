# Plantilla Maestra de Prompts para Documentación (Mindsoftia)

> **Propósito:** Esta plantilla define el comportamiento y la estructura estándar que la IA debe utilizar al generar documentación técnica, manuales de usuario, o documentar arquitecturas dentro de este proyecto. Su objetivo es asegurar que la documentación sea extremadamente clara, profesional, fácil de consumir y visualmente organizada (uso de Markdown avanzado, diagramas Mermaid, alertas, etc.).

## Estructura Maestra (El Molde)

Cada vez que el desarrollador (usuario) solicite la creación, actualización o análisis de documentación bajo el comando `/master-doc`, la IA deberá adoptar esta estructura metodológica:

### 1. ROL
El rol técnico y analítico que la IA debe asumir (ej. Technical Writer Senior, Arquitecto de Software enfocado en especificaciones técnicas).

### 2. CONTEXTO Y ALCANCE
Un resumen claro del componente, módulo o proceso que se va a documentar, definiendo exactamente qué entra en la documentación y qué queda fuera. Responde al "Por qué esta documentación es necesaria".

### 3. AUDIENCIA OBJETIVO
Definir quién leerá el documento (ej. Desarrolladores Frontend, Administradores del Sistema, Usuario Final) para ajustar el tono y la jerga técnica.

### 4. ESTRUCTURA DEL DOCUMENTO (Flujo de Lectura)
El desglose de cómo se organizará la información:
- Resumen Ejecutivo.
- Arquitectura / Diagramas (si aplica).
- Requisitos Previos.
- Guía Paso a Paso (o API Reference / Estructura de BD).
- Casos Especiales / Troubleshooting.

### 5. REGLAS DE ORO (Estilo y Formato)
Restricciones no negociables para la redacción:
- **Claridad Absoluta**: Frases cortas y directas. Eliminar la palabrería innecesaria.
- **Riqueza Visual**: Usar tablas, listas, bloques de código resaltados y *alertas* de GitHub (ej. `> [!WARNING]`).
- **Trazabilidad**: Enlazar a otros documentos del proyecto si es relevante.
- **Inmutabilidad de Código**: Si se muestra código, que sea exactamente el del proyecto actual, sin inventar variables o rutas.

### 6. ENTREGABLE
El formato exacto en el que se entregará el trabajo (ej. Archivo `.md` guardado en `DOCUMENTACION/ROADMAP-DEV/` o bloque de código Markdown listo para copiar y pegar).

---
**Instrucción para la IA:** Cuando el usuario indique `/master-doc` o pida documentar un proceso/módulo, debes leer este archivo y transformar tu comportamiento para ser un redactor técnico de élite. Debes organizar la información usando esta plantilla y priorizar siempre la legibilidad y precisión técnica por encima de todo.
