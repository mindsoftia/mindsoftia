# Reglas y Protocolo de Orquestación Multi-Agente de MindSoftia

Este documento establece la **Constitución y Protocolo Obligatorio de Interacción y Delegación entre Agentes (Skills)** en el espacio de trabajo del proyecto **MindSoftia** (*"Todo el poder contable de Helisa, la facilidad de Dataico y la escalabilidad de Siigo, potenciados con Inteligencia Artificial"*). Cuando la IA ejecuta cualquier tarea dentro de este repositorio, DEBE acatar estas directrices para que los agentes operen como un equipo sincronizado y de élite.

---

## 1. Regla de Delegación Activa e Invocación Cruzada (`Cross-Skill Routing`)

Ningún agente o rol debe actuar de forma aislada en un área que no sea su especialidad principal. Siempre que el flujo de ejecución toque un dominio especializado (backend/frontend, contabilidad/DIAN, UI/UX Falcon, base de datos/Supabase, ciberseguridad o documentación), el agente en curso **DEBE invocar y cargar el `SKILL.md` de ese especialista** usando la herramienta `view_file` antes de planificar y ejecutar los cambios.

### Mecanismo de Invocación Inter-Agente:
Para llamar y delegar en otro agente durante la resolución de una tarea, ejecuta `view_file` sobre el archivo `SKILL.md` correspondiente:

- **Desarrollo y Arquitectura (`master-dev`)**: [SKILL.md](file:///.agents/skills/master-dev/SKILL.md)
  - *Dominio:* Lógica de aplicación, backend Laravel, integración Frontend-Backend, hooks de React, rendimiento y estructura general.
- **Contabilidad, Finanzas y DIAN (`master-cont`)**: [SKILL.md](file:///.agents/skills/master-cont/SKILL.md)
  - *Dominio:* Los **3 Pilares Electrónicos DIAN** (Contabilidad Electrónica, Nómina Electrónica CUNE y Facturación Electrónica UBL 2.1/CUFE/RADIAN), NIIF, PUC, partida doble e impuestos, registrando en `DOC-CONT`.
- **Frontend & UI/UX Falcon (`master-ui`)**: [SKILL.md](file:///.agents/skills/master-ui/SKILL.md)
  - *Dominio:* Interfaces React + Vite con plantilla Falcon, jerarquía tipográfica, utilidades Bootstrap (`fs--1`, `card`, `d-flex`), sin CSS custom innecesario.
- **Base de Datos & Supabase (`master-db`)**: [SKILL.md](file:///.agents/skills/master-db/SKILL.md)
  - *Dominio:* PostgreSQL, Supabase, migraciones, aislamiento multi-tenant (`empresa_id`), Row Level Security (RLS), UUIDs, RPCs e índices.
- **Ciberseguridad & DevSecOps (`master-sec`)**: [SKILL.md](file:///.agents/skills/master-sec/SKILL.md)
  - *Dominio:* Postura Zero Trust, prevención IDOR/XSS/SQLi, aislamiento entre inquilinos y auditoría de endpoints/tokens.
- **Redacción Técnica & Documentación (`master-doc`)**: [SKILL.md](file:///.agents/skills/master-doc/SKILL.md)
  - *Dominio:* Manuales, guías arquitectónicas, diagramas Mermaid, alertas Markdown y registros en `DOCUMENTACION/`.

---

## 2. Matriz Obligatoria de Interacciones (`Cross-Delegation Matrix`)

La siguiente tabla rige los saltos obligatorios de enrutamiento entre agentes en función del tipo de modificación requerida:

| Si el trabajo o tarea implica... | Agente Principal | Agente(s) Secundario(s) a Invocar Obligatoriamente |
| :--- | :--- | :--- |
| **Crear o modificar tablas, migraciones, políticas RLS o procedimientos SQL** | `master-db` | `master-sec` (para validar aislamiento `empresa_id` y RLS) + `master-dev` (si impacta modelos Laravel/React) |
| **Implementar los 3 Pilares Electrónicos (Facturación UBL 2.1, Nómina, Contabilidad DIAN), impuestos o NIIF** | `master-cont` | `master-db` (para esquemas, XML y Kardex) + `master-doc` (para documentar en `DOC-CONT`) |
| **Construir, refactorizar o estilizar componentes de interfaz de usuario en React** | `master-ui` | `master-dev` (para integración con estado y hooks) |
| **Desarrollar lógica de negocio en Laravel/Backend o arquitectura de integraciones** | `master-dev` | `master-db` (si toca esquemas) + `master-sec` (para verificar autorización e IDOR) |
| **Crear endpoints de API, autenticación, gestión de permisos, roles o tokens** | `master-sec` | `master-dev` (para implementación en controladores) |
| **Documentar arquitectura, flujos técnicos o actualizar manuales del sistema** | `master-doc` | El especialista del módulo (ej. `master-cont`, `master-db` o `master-dev`) |

---

## 3. Protocolo de los 6 Bloques (`El Molde de Salida`)

Toda salida generada por la IA cuando opera bajo cualquiera de los skills de MindSoftia debe estructurarse rigurosamente utilizando los **6 Bloques Maestros**:

1. **CONTEXTO:** Breve resumen del propósito general de la funcionalidad y cómo encaja dentro de la visión de MindSoftia.
2. **ROL:** El rol técnico y actitudinal asumido para la tarea.
3. **TAREA:** El objetivo técnico o financiero principal, descrito con total precisión.
4. **FLUJO (Pasos de Ejecución):** Desglose secuencial de la implementación (`ReAct Loop`).
5. **REGLAS (Restricciones y Criterios de Aceptación):** Restricciones innegociables del dominio.
6. **RESULTADO & REPORT DE ORQUESTACIÓN:** Entregable exacto (código, SQL, markdown) junto con la especificación explícita de qué agentes interactuaron o fueron delegados en la solución.
