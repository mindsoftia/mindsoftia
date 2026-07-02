# Diseño de Base de Datos Edge-Cloud (Fase 1: NexoPOS)

Para lograr la tolerancia a fallos offline, implementamos una arquitectura donde la base de datos local (IndexedDB) es la fuente de verdad inmediata, y PostgreSQL es el almacenamiento central y contable.

## 1. Esquema Nube (PostgreSQL / Laravel Migrations)

Las tablas transaccionales usarán `UUID` para evitar colisiones cuando múltiples cajas sincronicen datos al mismo tiempo.

```sql
-- Tabla: sedes (Sucursales físicas)
CREATE TABLE sedes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL, -- Para el modelo SaaS
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: cajas (Terminales POS por sede)
CREATE TABLE cajas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID REFERENCES sedes(id),
    nombre VARCHAR(100) NOT NULL,
    estado_conexion VARCHAR(50) DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: pos_ventas (Cabecera de la factura offline-first)
CREATE TABLE pos_ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caja_id UUID REFERENCES cajas(id),
    sede_id UUID REFERENCES sedes(id),
    cajero_id UUID NOT NULL,
    cliente_id UUID NULL,
    total DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    
    -- Campos cruciales para el esquema Híbrido
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'pending', 'synced', 'error'
    dian_status VARCHAR(20) DEFAULT 'pending', 
    fecha_emision_local TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: pos_ventas_items (Detalle de la factura)
CREATE TABLE pos_ventas_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID REFERENCES pos_ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 2. Esquema Local (Frontend React con Dexie.js)

En el lado del cliente (Cajero POS), configuramos una base de datos local usando Dexie.js (IndexedDB). Esto permite guardar facturas a la velocidad de la luz sin depender de la red.

```javascript
// Archivo: src/database/localPosDb.js
import Dexie from 'dexie';

// 1. Inicializamos la base de datos local
export const posDB = new Dexie('NexoPOS_LocalDB');

// 2. Definimos las tablas locales gemelas a la nube
// Nota: el primer valor de cada string es el Primary Key.
posDB.version(1).stores({
  ventas: 'id, caja_id, sync_status, fecha_emision_local',
  ventas_items: 'id, venta_id, producto_id',
  
  // Tablas de solo lectura (Caché local sincronizado desde la nube)
  productos_cache: 'id, codigo_barras, nombre',
  clientes_cache: 'id, numero_documento, nombre'
});

// Función de ejemplo para guardar una venta en 0.01 segundos (Offline)
export async function guardarVentaLocal(venta, items) {
  return await posDB.transaction('rw', posDB.ventas, posDB.ventas_items, async () => {
    
    // 1. Guardar cabecera con estado 'pending' (pendiente de subir a la nube)
    await posDB.ventas.add({
      ...venta,
      sync_status: 'pending', 
      fecha_emision_local: new Date().toISOString()
    });

    // 2. Guardar detalles
    await posDB.ventas_items.bulkAdd(items);
    
    return true; // Venta registrada con éxito localmente.
  });
}
```
