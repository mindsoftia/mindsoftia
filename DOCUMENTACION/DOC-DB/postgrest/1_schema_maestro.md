# Esquema Maestro de Base de Datos (PostgreSQL)

Este documento centraliza las estructuras de las tablas principales que componen el ecosistema de Mindsoftia. Todas las tablas (excepto la tabla raíz de `empresas`) implementan la filosofía **Multi-Tenant** aislada mediante la llave `empresa_id`.

## 1. Núcleo SaaS (Multi-Tenancy)

### `empresas`
Tabla raíz del ecosistema. Representa a los inquilinos (Tenants) del sistema SaaS.
- **id** (UUID, PK)
- **nombre** (String)
- **nit** (String, Unique)
- **subdominio** (String, Unique)
- **modulos_activos** (JSONB) - Control de toggles de módulos (POS, Contabilidad, etc.)
- **estado** (String) - Ej: 'activa', 'suspendida'
- *Timestamps*

### `users`
Tabla de usuarios (SuperAdmin, Administradores, Cajeros).
- **id** (UUID, PK)
- **empresa_id** (UUID, FK -> empresas.id) - Nulo para el SuperAdmin Global.
- **name**, **email**, **password**
- **role** (String)
- *Timestamps*

---

## 2. Módulo Comercial (CRM y Maestros)

### `crm_terceros`
Entidad unificada para Clientes, Proveedores y Empleados (cumpliendo norma DIAN para evitar duplicidad de NITs).
- **id** (UUID, PK)
- **empresa_id** (UUID, FK -> empresas.id)
- **tipo_identificacion** (String)
- **identificacion** (String)
- **nombres** / **apellidos** / **razon_social** (String)
- **es_cliente** (Boolean), **es_proveedor** (Boolean)
- *Timestamps* y *SoftDeletes*

---

## 3. Módulo de Inventario (Inteligente y Multisede)

### `inv_productos`
Catálogo maestro de bienes y servicios.
- **id** (UUID, PK)
- **empresa_id** (UUID, FK)
- **codigo_sku** (String, Unique per Tenant)
- **nombre** (String)
- **tipo** (Enum: fisico, servicio, ensamble)
- **precio_venta** (Decimal)
- **costo_promedio** (Decimal) - Actualizado por compras y promedios ponderados.
- **impuesto_id** (UUID, FK)

### `inv_stock_sedes`
Control de existencias físicas por sucursal.
- **id** (UUID, PK)
- **producto_id** (UUID, FK -> inv_productos.id)
- **sede_id** (UUID)
- **cantidad** (Decimal) - Refleja la existencia real actual.

### `inv_kardex`
Historial transaccional inmutable. Cada ajuste, venta o compra deja una huella aquí.
- **id** (UUID, PK)
- **producto_id**, **sede_id**
- **tipo_movimiento** (Enum: ENTRADA, SALIDA, TRASLADO, AJUSTE, VENTA, COMPRA)
- **cantidad** (Decimal)
- **costo_unitario**, **costo_total** (Decimal)
- **stock_resultante** (Decimal)
- **documento_tipo**, **documento_id** (Referencias polimórficas al POS o Factura)

---

## 4. Punto de Venta (POS Híbrido)

### `pos_ventas`
Cabecera de la factura o ticket emitido por la caja registradora.
- **id** (UUID, PK)
- **empresa_id**, **caja_id**, **sede_id**, **usuario_cajero_id**
- **tercero_id** (Cliente)
- **subtotal**, **total_descuento**, **total_impuestos**, **total_factura**
- **sync_status** (String: pending, synced) - Control para modo Offline.
- **dian_status** (String) - Para facturación electrónica futura.

### `pos_ventas_detalles`
Líneas de los artículos vendidos en el ticket.
- **id** (UUID, PK)
- **venta_id** (UUID, FK -> pos_ventas.id)
- **producto_id** (UUID, FK -> inv_productos.id)
- **cantidad** (Decimal)
- **precio_unitario**, **subtotal** (Decimal)

---

## 5. Módulo Contable (NIIF)

### `accounts` (PUC - Plan Único de Cuentas)
Árbol jerárquico de cuentas financieras.
- **id** (UUID, PK)
- **empresa_id**
- **code** (String) - Ej: '110505'
- **name** (String) - Ej: 'Caja General'
- **type** (Enum: activo, pasivo, patrimonio, ingresos, gastos, costos)
- **parent_id** (UUID, FK -> accounts.id) - Para estructurar el árbol jerárquico.

### `contab_asientos` y `contab_asientos_detalles` / `contab_asientos_items`
Libro Diario y registros contables por partida doble. Generados automáticamente por Observers (ej. `PosVentaObserver`).
- Conecta documentos (Facturas, Ventas POS) con los cargos (Débitos) y abonos (Créditos) en el PUC.

### `contab_saldos_periodo`
Tabla de sumarización y saldos acumulados por periodo fiscal (`YYYY-MM`) para cada cuenta PUC por empresa.
- **id** (UUID, PK), **empresa_id** (FK -> empresas.id)
- **periodo** (Char 7, YYYY-MM), **cuenta_puc**, **cuenta_nombre**
- **saldo_anterior**, **debito_periodo**, **credito_periodo**, **saldo_nuevo** (Decimal 15,2)
- Permite emitir Balances de Prueba instantáneos y cumplir los Libros Oficiales DIAN/NIIF. Protegida con Row Level Security (RLS).

---

## 6. Módulo de Facturación Electrónica DIAN (`UBL 2.1 / CUFE / RADIAN`)

### `fe_resoluciones`
Autorizaciones de numeración y claves técnicas otorgadas por la DIAN para cada prefijo de la empresa.
- **id** (UUID, PK), **empresa_id** (FK -> empresas.id)
- **numero_resolucion**, **prefijo**, **numero_inicial**, **numero_final**, **consecutivo_actual**
- **clave_tecnica** (VARCHAR 150), **ambiente** (1=Producción, 2=Pruebas), **vigencia_desde**, **vigencia_hasta**, **activo**

### `fe_documentos`
Repositorio e historial inmutable de documentos electrónicos (`01` Factura de Venta, `03` Nota Débito, `04` Nota Crédito, `05` POS Electrónico, `10` Nómina CUNE).
- **id** (UUID, PK), **empresa_id** (FK -> empresas.id), **tipo_documento** (Char 5)
- **documento_origen_tipo** (`pos_venta`, `com_factura`), **documento_origen_id** (UUID)
- **prefijo**, **consecutivo**, **numero_completo** (Ej: `SETP990000001`)
- **cufe_cune** (VARCHAR 96 SHA-384), **qr_code_url** (TEXT), **xml_generado**, **xml_firmado**, **track_id_dian**
- **estado_dian** (Enum: `borrador`, `generado`, `enviado`, `aprobado`, `rechazado`, `anulado`)

### `fe_eventos_radian`
Trazabilidad de títulos valores y recepción electrónica (RADIAN).
- **id** (UUID, PK), **fe_documento_id** (FK -> fe_documentos.id), **empresa_id** (FK -> empresas.id)
- **codigo_evento** (`030` Acuse, `032` Recibo, `033` Aceptación Expresa, `034` Reclamo)
- **descripcion_evento**, **xml_evento**, **track_id_dian**, **estado**, **fecha_evento**

---
> **Nota Arquitectónica:** En todas las consultas a nivel de Backend (Laravel), se utilizan *Global Scopes* o middlewares (mediante el header `X-Tenant-ID`) para inyectar un `where('empresa_id', tenant)` forzoso y garantizar la separación de datos. A nivel de Supabase, esto se replicará futuramente en las carpetas `/rls`.
