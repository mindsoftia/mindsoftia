# Análisis de Arquitectura Modular Contable y Operativa - MindSoftia

**Fecha de Análisis:** 2026-08-03
**Elaborado por:** Agente `master-cont` (Analista Financiero Senior, Auditor NIIF & Experto DIAN)
**Aprobado para:** Arquitectura General MindSoftia

---

## 1. Módulo Base (Core Contable y Administrativo)
**Estado:** Siempre Activo (Independiente / Cimiento)
**Componentes:** Dashboard Core, Directorio (Terceros), Libro Diario, Reportes Financieros, Plan de Cuentas (PUC), Configuración.

**Análisis Contable:**
El módulo Base es el **único módulo estrictamente independiente**. Funciona como el Gran Libro Mayor donde desembocan todas las transacciones del ecosistema. Sin el Base, no existe partida doble ($\sum \text{Débitos} = \sum \text{Créditos}$). 
- **Terceros (Directorio):** Requisito ineludible tributario (NIT/RUT) para cualquier complemento (Facturación o Nómina).
- **PUC y Libro Diario:** El motor NIIF. Los complementos premium NO generan datos aislados; generan "hechos económicos" que se traducen en asientos contables automatizados hacia este módulo.

## 2. Facturación Electrónica DIAN (UBL 2.1)
**Estado:** Complemento Premium (Dependiente del Base)
**Combinación Obligatoria:** `Base` + `Facturación Electrónica`.
**Combinación Opcional pero Recomendada:** `POS e Inventarios`.

**Análisis Contable:**
- **Independencia relativa:** Puede operar solo con el Módulo Base para empresas de servicios (honorarios, consultorías, arriendos) que solo facturan periódicamente y no manejan stock.
- **Dependencia Técnica:** Requiere el Directorio de Terceros para el adquirente (Receptor XML) y el PUC para afectar las cuentas de Ingresos (41xx), IVA Generado (2408xx), Retenciones (1355xx) y Cuentas por Cobrar (1305xx).

## 3. Nómina Electrónica (Auto / CUNE)
**Estado:** Complemento Premium (Dependiente del Base)
**Combinación Obligatoria:** `Base` + `Nómina Electrónica`.

**Análisis Contable:**
- **Independiente de Facturación y POS:** Una empresa puede tener su facturación en otro software, pero adquirir MindSoftia únicamente para gestionar su nómina y los asientos contables derivados.
- **Dependencia Técnica:** Requiere Terceros (Empleados) y PUC. Al emitir el Documento Soporte y el XML/CUNE, genera la causación de nómina automática (Gastos operacionales 5105 contra Pasivos 2505 y 2370).

## 4. POS e Inventarios (Punto de Venta Multisede)
**Estado:** Complemento Premium (Dependiente del Base)
**Combinaciones:**
- `Base` + `POS`: Para negocios que emiten "Documento Equivalente POS" no electrónico (independiente de Facturación Electrónica, si la DIAN lo permite por montos).
- `Base` + `POS` + `Facturación Electrónica`: **Obligatorio y Sinergético**. La normatividad exige que si una venta POS supera cierto tope (ej. 5 UVT) o si el cliente lo exige, el ticket POS debe transformarse fluidamente en una Factura Electrónica UBL 2.1.

**Análisis Contable:**
- **Inventarios:** Controla el Kardex (Método Promedio Ponderado para NIIF). Exige el Libro Diario para asentar Costo de Venta (61xx) contra Inventarios (14xx).
- **POS:** Afecta directamente Caja/Bancos (1105/1110) y Ventas (41xx).

## 5. Estación de Servicio (EDS) - Surtidores y Turnos
**Estado:** Complemento Premium Hiper-Especializado
**Combinación Obligatoria:** `Base` + `POS e Inventarios` + `EDS`.
**Combinación Opcional:** `Facturación Electrónica`.

**Análisis Contable:**
- Este módulo **no puede ser independiente**. Un surtidor dispensa combustible (Inventario físico), por lo tanto requiere el módulo de `POS e Inventarios` para descargar stock y valorizar el costo.
- El cierre de turno de un islero genera una liquidación que requiere el motor del POS para cuadrar el efectivo/tarjetas.
- **Impuestos Específicos:** Contablemente maneja sobretasas (Sobretasa a la gasolina) e impuestos nacionales específicos del sector hidrocarburos, que deben mapearse al PUC del `Base`.

## 6. IA: Copiloto Financiero
**Estado:** Complemento Transversal
**Dependencia:** Transversal a los módulos activos.
- Analiza liquidez y solvencia usando el Módulo Base.
- Detecta fugas de inventario y proyecta ventas si `POS` está activo.
- Analiza carga tributaria si `Facturación` o `Nómina` están activos.

## 7. Casos de Uso de Modularidad Pura (El "Motor Silencioso")
Cuando una empresa ingresa vía link de Supabase (`subdominio.mindsoftia.com`), el Módulo Base se activa automáticamente, pero su comportamiento visual se adapta a lo que el negocio realmente contrató:

- **Caso A: El cliente SOLO compró Nómina Electrónica.** 
  El Módulo Base actúa en modo "silencioso". El cliente verá su Dashboard enfocado en empleados, devengos y transmisión a la DIAN. Sin embargo, por debajo, el Base está registrando los empleados en el *Directorio de Terceros* y creando los asientos contables de gasto/pasivo en el *Libro Diario*. Si luego el cliente quiere exportar su contabilidad, el Base ya hizo todo el trabajo.
- **Caso B: El cliente SOLO compró Facturación Electrónica.** (Ej. Un consultor).
  El cliente no verá módulos de inventario ni POS complejos. Verá una interfaz limpia para emitir su XML UBL 2.1. El Módulo Base, en la sombra, administra sus clientes (Terceros), calcula sus impuestos y asienta sus ingresos en el *PUC*.
- **Caso C: El cliente SOLO requiere Contabilidad (Estudio Contable).**
  El usuario tendrá acceso puro al Módulo Base. Hará comprobantes, notas contables y reportes financieros NIIF, sin ver opciones de POS, surtidores EDS ni emisión de facturas electrónicas DIAN. 

El Módulo Base es el "enrutador lógico" y motor de persistencia. Garantiza que, sin importar qué pieza del lego adquiera el cliente, la estructura de datos mantenga la integridad referencial (NIIF) y esté lista para escalar si se activan nuevos complementos en el futuro.

---
## Resumen Matriz de Orquestación

| Módulo/Complemento | ¿Puede operar solo? | ¿De quién depende siempre? | ¿Con quién hace sinergia? |
| :--- | :---: | :--- | :--- |
| **Base (Core)** | **SÍ** | Ninguno (Es la raíz) | Todos |
| **Facturación Electr. (DIAN)** | NO | Base | POS e Inventarios, IA Copiloto |
| **Nómina Electr. (DIAN)** | NO | Base | IA Copiloto |
| **POS e Inventarios** | NO | Base | Facturación Electrónica, EDS |
| **Estación de Servicio (EDS)** | NO | Base + POS e Inventarios | Facturación Electrónica |
| **IA: Copiloto Financiero** | NO | Base | Todo el ecosistema activo |
