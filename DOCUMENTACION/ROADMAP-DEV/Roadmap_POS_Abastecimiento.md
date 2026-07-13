# Roadmap Estratégico: Abastecimiento y Operación POS

> **Propósito:** Definir la ruta crítica de desarrollo para lograr la operatividad total del módulo POS (Punto de Venta). Este documento prioriza las dependencias lógicas del negocio (ERP), estableciendo que no se puede vender sin antes abastecer y no se puede abastecer sin entidades a quienes comprar.

---

### 1. ROL
**Arquitecto de Software & Product Manager.**

### 2. CONTEXTO Y ALCANCE
Actualmente el sistema cuenta con el catálogo de productos estructurado y la base del POS en modo Offline (Dexie.js). Sin embargo, para que el ciclo financiero y de inventario (Kardex) tenga validez contable (NIIF) y operativa real, debe existir un flujo de entrada de mercancía. 
**Alcance de este análisis:** Ordenar cronológicamente el desarrollo de los módulos: Proveedores, Compras, Caja POS y Carrito de Compras.

### 3. AUDIENCIA OBJETIVO
Equipo de Desarrollo (Frontend/Backend) y Stakeholders para alinear los próximos sprints y evitar bloqueos por dependencias circulares.

### 4. ESTRUCTURA DEL DOCUMENTO (Flujo de Lectura)

#### Análisis de Dependencias (El Problema)
Si intentamos operar el **Caja POS** o el **Carrito de Compra** ahora mismo:
- ¿De dónde sale el stock? Del Kardex.
- ¿Quién alimenta el Kardex? Las **Compras**.
- ¿A quién se le compran los productos? A los **Proveedores**.

Por lo tanto, la jerarquía de desarrollo no se dicta por lo que el cliente final ve primero (el POS), sino por cómo fluye la contabilidad desde la raíz.

#### Ruta Crítica de Desarrollo (Prioridades)

| Fase | Módulo | Criticidad | Justificación Operativa |
| :--- | :--- | :--- | :--- |
| **Fase 1** | **Proveedores (Maestros)** | 🔴 **Alta (Bloqueante)** | Es imposible registrar una factura de compra (gasto) sin vincular el NIT de la entidad emisora. Requiere integración con CRM Terceros. |
| **Fase 2** | **Compras (Abastecimiento)** | 🔴 **Alta (Bloqueante)** | Inyecta las unidades físicas a las bodegas (Kardex) y calcula el Costo Promedio Ponderado. Sin compras, el inventario es cero y el POS no debería permitir facturar (o generaría stock negativo irreal). |
| **Fase 3** | **Caja POS (Operativa)** | 🟡 **Media (Core)** | Ya cuenta con cimientos. Ahora debe integrarse para "consumir" el stock real que fue inyectado por las Compras y asentar la partida doble contable. |
| **Fase 4** | **Carrito de Compra (B2C)** | 🟢 **Baja (Expansión)** | Es un canal de ventas adicional (Digital). Depende completamente de que las Fases 1, 2 y 3 funcionen a la perfección para descontar stock en tiempo real y no vender productos agotados. |

#### Guía Paso a Paso (Sprints Propuestos)

**Sprint 1: Cimientos de Abastecimiento (Proveedores)**
- Validar modelo `crm_terceros` para flag `es_proveedor`.
- Interfaz Falcon UI para CRUD de proveedores (RUT, Datos de contacto, Días de crédito).

**Sprint 2: Ingreso de Mercancía (Compras)**
- Modelo y migración de `inv_compras` e `inv_compras_detalles`.
- Interfaz de "Recepción de Mercancía" (Similar a la del POS pero inversa).
- Disparador (Observer) en Backend para afectar el `inv_kardex` sumando stock y recalculando costos.

**Sprint 3: Cierre Operativo (Caja POS)**
- Conectar el motor Dexie.js (Offline) con el stock real provisto por la nube.
- Validar reglas de negocio: ¿Permitir ventas en negativo o bloquear el checkout si el stock local < 1?
- Emitir el comprobante y descontar de `inv_kardex`.

**Sprint 4: Omnicanalidad (Carrito de Compras)**
- Landing Page transaccional (Storefront).
- Conexión al motor de pagos (Pasarela).
- Reserva temporal de stock en el Carrito para evitar colisiones con cajeros físicos en el POS.

### 5. REGLAS DE ORO APLICADAS
- **Claridad Absoluta:** Se evitan desarrollos aislados. Todo sigue el flujo lógico del ciclo del dinero: Comprar -> Almacenar -> Vender.
- **Riqueza Visual:** Se usan jerarquías claras (🔴🟡🟢) para comunicar urgencia al equipo.

### 6. ENTREGABLE
Documento de análisis estratégico guardado en el repositorio bajo la ruta `DOCUMENTACION/ROADMAP-DEV/Roadmap_POS_Abastecimiento.md`.
