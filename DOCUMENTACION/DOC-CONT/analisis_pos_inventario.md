# Análisis Contable: Módulo POS e Inventario (Híbrido)

## 1. CONTEXTO
El ecosistema Mindsoftia está desarrollando el módulo "NexoPOS Hybrid ERP", el cual será el primer núcleo operativo y contable para los inquilinos (tenants). Este módulo abarca la gestión de Punto de Venta (POS), control de inventarios, facturación, categorización de productos y administración de proveedores. El sistema operará bajo una arquitectura híbrida (Edge-Cloud) para garantizar la disponibilidad offline y la sincronización con la nube para auditoría y contabilidad.

## 2. ROL
Especialista en Sistemas Contables y Arquitecto Financiero Híbrido.

## 3. TAREA
Realizar un diagnóstico del estado actual del módulo POS e Inventario, definir las funcionalidades pendientes (proveedores, categorías, facturación avanzada) y establecer la proyección financiera y técnica del ecosistema para asegurar que se cumplan los estándares contables requeridos.

## 4. FLUJO (Pasos de Ejecución)

### Fase 1: Lo que está hecho (Estado Actual)
- **Interfaz POS (Frontend):** Se ha desarrollado el esquema principal del punto de venta (`POSLayout.jsx`, `CarritoPanel.jsx`, `ProductoGrid.jsx`), priorizando la velocidad de facturación sin clics innecesarios.
- **Inventario Básico:** Existe una vista inicial de administración de inventarios (`InventarioAdmin.jsx`).
- **Arquitectura Híbrida (Offline-First):** Se ha implementado el componente `SyncStatusBadge.jsx`, lo que evidencia la preparación técnica para que el sistema funcione localmente (Dexie/SQLite) y sincronice con la nube (Supabase/PostgreSQL).
- **Esquema de Suscripciones:** El módulo base de facturación del SaaS (Suscripciones, Planes, Cupones, Historial de Pagos) ya está estructurado, separando la facturación del software de la facturación comercial del inquilino.

### Fase 2: Lo que se estima hacer (Próximos Pasos)
- **Proveedores y Cuentas por Pagar:** Desarrollar el módulo para registrar compras, calcular el costo promedio de inventario y gestionar pagos parciales o totales a proveedores.
- **Categorías y Familias de Productos:** Implementar una estructura jerárquica para los productos que facilite la generación de reportes financieros por líneas de negocio y el control de inventario (Kardex detallado).
- **Motor Contable Invisible (NIIF):** Cada venta realizada en el POS o compra a proveedores deberá generar automáticamente el asiento de partida doble (Caja/Bancos, Cuentas por Cobrar/Pagar, Impuestos, Ingresos por Ventas, Costo de Ventas e Inventario).
- **Facturación Electrónica DIAN:** Integración con servicio de mensajería asíncrona para firma y envío de comprobantes electrónicos en segundo plano, sin bloquear la caja.

### Fase 3: Proyección del Módulo
- **ERP Omnicanal:** Evolucionar el POS local a un sistema capaz de sincronizar inventario en tiempo real con pasarelas e-commerce (WooCommerce/Shopify).
- **Auditoría Financiera Continua:** Reportes interactivos de Estados de Resultados y Balances Generales con capacidad de "drill-down", permitiendo al contador rastrear cualquier movimiento desde el saldo contable hasta el ticket del POS.
- **Gestión Multi-Bodega y Costeo Avanzado:** Manejo de lotes, fechas de vencimiento y costeo por métodos reconocidos (PEPS, Promedio Ponderado).

## 5. REGLAS (Restricciones y Criterios de Aceptación)
- **Precisión Numérica:** Todos los cálculos de impuestos, descuentos y costos deben ejecutarse sin errores de redondeo, aplicando tipos de datos financieros exactos en la base de datos (Ej. `NUMERIC/DECIMAL`).
- **Integridad Transaccional:** La sincronización entre la base local y la nube debe manejar resolución de conflictos sin pérdida de datos contables (las facturas y recibos de caja son inmutables).
- **Partida Doble Estricta:** Ninguna transacción comercial en el POS o inventario debe carecer de su contrapartida contable configurada.

## 6. RESULTADO
Este documento servirá como mapa de ruta (Roadmap) financiero. Las próximas implementaciones técnicas (creación de tablas, endpoints y vistas) para **Proveedores**, **Categorías** y **Kardex** deberán basarse estrictamente en estas directrices contables.

*(Documento generado bajo la directriz /master-cont)*
