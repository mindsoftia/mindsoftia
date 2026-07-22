# Especificación Arquitectónica e Institucional — Impuestos, Retenciones y Cierres Contables NIIF

**Documento:** `DOC-CONT/03_Arquitectura_Impuestos_Retenciones_y_Cierres_NIIF.md`  
**Especialidades Activas:** `/master-cont` (Estrategia Tributaria y NIIF), `/master-db` (Esquemas y RLS), `/master-dev` (Lógica e Integración), `/master-ui` (Vistas Falcon).  
**Versión:** 1.0.0 — Julio 2026  

---

## 1. Marco Teórico y Tributario DIAN / NIIF Colombia

El pilar contable de **MindSoftia** no se limita a asentar comprobantes; debe garantizar la correcta determinación de las cargas tributarias frente a la **DIAN** y las autoridades municipales, así como ejecutar con rigor matemático el **Cierre Contable del Ejercicio** conforme a las **Normas Internacionales de Información Financiera (NIIF para PYMES y NIIF Plenas)**.

### 1.1. Estructura de Impuestos y Retenciones en el Plan Único de Cuentas (PUC)
Las obligaciones impositivas y retenciones tributarias se controlan a través de cuentas específicas jerarquizadas del grupo `24` y `23` para pasivos por impuestos, y del grupo `13` para anticipos de impuestos (activos):

| Código PUC | Nombre de la Cuenta | Naturaleza | Tipo de Movimiento | Normativa DIAN / Estatuto Tributario |
| :--- | :--- | :--- | :--- | :--- |
| **2408** | Impuesto sobre las Ventas por Pagar (IVA) | Crédito / Débito | `240801` IVA Generado (19%/5%) <br/> `240802` IVA Descontable en Compras | Art. 468, 477 y 481 del Estatuto Tributario. |
| **2365** | Retención en la Fuente a Título de Renta | Crédito | `236505` Salarios y Pagos Laborales <br/> `236515` Honorarios (10% / 11%) <br/> `236525` Servicios (4% / 6%) <br/> `236540` Compras Generales (2.5%) | Art. 383, 385 y 392 del E.T. Liquidación periódica (Formulario 350). |
| **2368** | Retención al Impuesto de Industria y Comercio (ReteICA) | Crédito | `236801` ReteICA Municipal por Actividad | Acuerdos Municipales (Bogotá, Medellín, Cali, Bucaramanga - Tarifas por mil: 4.14‰ a 11.04‰). |
| **2367** | Retención al Impuesto sobre las Ventas (ReteIVA) | Crédito | `236701` ReteIVA (15% del IVA) | Art. 437-2 del E.T. Aplicable a Grandes Contribuyentes y entidades públicas. |
| **1355** | Anticipos de Impuestos y Contribuciones | Débito | `135515` Retención en la Fuente que le practicaron <br/> `135517` ReteIVA que le practicaron <br/> `135518` ReteICA que le practicaron | Activo impositivo recuperable en declaración de renta y bimestral de IVA/ICA. |

---

## 2. Depuración Tributaria y Fórmulas Matemáticas

### 2.1. Conciliación y Liquidación del IVA (Formulario 300)
El saldo final de la cuenta `2408` en cada periodo bimestral o cuatrimestral obedece a la ecuación de compensación:

$$\text{Saldo Neto 2408} = \sum \text{IVA Generado (Crédito)} - \sum \text{IVA Descontable (Débito)} - \text{Retenciones de IVA sufridas (135517)}$$

- Si $\text{Saldo Neto 2408} > 0 \implies \text{Saldo a Pagar a la DIAN (Pasivo Corriente)}$.
- Si $\text{Saldo Neto 2408} < 0 \implies \text{Saldo a Favor (Susceptible de devolución, compensación o arrastre al periodo siguiente)}$.

### 2.2. Cálculo de Retención en la Fuente en Salarios (Procedimiento 1 - Art. 383 E.T.)
Para la liquidación en nómina electrónica o pagos a prestadores de servicios personales, el sistema aplica la depuración automática:
1. **Ingreso Total Bruto Laboral ($I_B$)**.
2. **Menos Ingresos No Constitutivos de Renta ($INCRGO$)**: Aportes obligatorios a Salud (4%), Pensión (4%) y Fondo de Solidaridad Pensional.
3. **Subtotal de Renta Neta ($R_N = I_B - INCRGO$)**.
4. **Menos Deducciones (hasta 16 UVT mensuales por dependientes + intereses de vivienda)**.
5. **Menos Rentas Exentas**: 25% del subtotal depurado (limitado a 790 UVT anuales según Ley 2277 de 2022).
6. **Base Gravable en UVT ($\text{Base}_{UVT} = \frac{\text{Base en Pesos}}{\text{Valor UVT del año}}$)**.
7. **Aplicación de la Tabla Marginal Art. 383 E.T.** para obtener la retención en pesos.

---

## 3. Cierre Contable del Ejercicio NIIF (Traslado de Resultados)

El **Cierre Contable Anual (Al 31 de Diciembre)** o mensual de corte gerencial tiene por objeto saldar en cero (`$0.00`) todas las cuentas nominales o de resultados (Clases 4, 5 y 6) y determinar la **Utilidad o Pérdida del Ejercicio**, transfiriendo dicho resultado al **Patrimonio (Clase 3)**.

### 3.1. Algoritmo y Asiento Automático de Cierre
Para cada empresa (`empresa_id`), al ejecutar el proceso de cierre, el motor genera un **Comprobante de Cierre de Ejercicio (`COMP-CIERRE-YYYY`)** con los siguientes pasos:

1. **Saldar las Cuentas de Ingresos (Clase 4 - Naturaleza Crédito):**
   - Se debita cada subcuenta de la Clase 4 por el total de su saldo acumulado en el año.
   - Se acredita la cuenta transitoria de resumen `5905 — Ganancias y Pérdidas`.

2. **Saldar las Cuentas de Gastos y Costos (Clases 5 y 6 - Naturaleza Débito):**
   - Se acredita cada subcuenta de las Clases 5 y 6 por el total de su saldo acumulado en el año.
   - Se debita la cuenta transitoria de resumen `5905 — Ganancias y Pérdidas`.

3. **Determinación de la Contrapartida Patrimonial (`5905` $\to$ `3605` / `3610`):**
   - Sea $\Delta = \sum \text{Créditos (Ingresos)} - \sum \text{Débitos (Gastos y Costos)}$.
   - **Caso A ($\Delta > 0$ — Utilidad del Ejercicio):**
     $$\text{Débito 5905 por } \Delta \quad \text{contra} \quad \text{Crédito 3605 (Utilidad del Ejercicio) por } \Delta$$
   - **Caso B ($\Delta < 0$ — Pérdida del Ejercicio):**
     $$\text{Débito 3610 (Pérdida del Ejercicio) por } |\Delta| \quad \text{contra} \quad \text{Crédito 5905 por } |\Delta|$$

4. **Verificación Estricta de Partida Doble:**
   $$\sum \text{Débitos del Asiento de Cierre} = \sum \text{Créditos del Asiento de Cierre}$$
   *Ningún cierre se consolida ni se marca como inmutable en la base de datos si la diferencia excede un microcentavo ($0.0001$).*

---

## 4. Arquitectura de Datos Multi-Tenant (`master-db` + `master-sec`)

Para respaldar este flujo sin saturar las tablas transaccionales en vivo, se definen dos nuevos esquemas documentados en `DOC-DB`:
1. `06_impuestos_y_retenciones_niif.sql`: Almacena la parametrización de tarifas tributarias por municipio/empresa (`contab_impuestos_parametros`) y el historial de certificados y liquidaciones tributarias (`contab_retenciones_liquidaciones`).
2. `07_cierres_contables_ejercicio.sql`: Almacena las actas electrónicas de cierre (`contab_cierres_ejercicio`) con bloqueo criptográfico (`is_locked = true`) para impedir modificaciones en saldos históricos de periodos ya declarados o dictaminados por la revisoría fiscal.

---

## 5. Criterios de Aceptación y Auditoría

- Todo certificado de retención generado por el frontend debe cumplir con el Artículo 381 del Estatuto Tributario (Identificación del retenedor, retenido, concepto, año gravable, base de retención, tarifa y valor retenido).
- La simulación y ejecución de cierre contable es 100% transaccional (`BEGIN TRANSACTION ... COMMIT`); ante cualquier error, aborta y revierte sin afectar el Kardex ni los libros diarios del inquilino.
