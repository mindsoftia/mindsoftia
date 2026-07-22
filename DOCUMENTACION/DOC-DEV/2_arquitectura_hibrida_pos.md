# Arquitectura Híbrida (Edge-Cloud) de Mindsoftia

Este documento estipula la base técnica sobre la cual se están construyendo los módulos del ERP (NexoPOS Híbrido), tomando como referencia las implementaciones del núcleo de Categorías y Proveedores.

### Principio Fundamental: Offline-First con Dexie.js
Para garantizar que el Punto de Venta y las operaciones críticas de Inventario nunca se detengan ante cortes de internet o inestabilidad del servidor, se ha estandarizado el siguiente flujo de información:
1. **Lectura Reactiva Obligatoria:** Todos los componentes de lista e interfaces de cajero (ej. `CategoriasList.jsx`, `ProveedoresList.jsx`) *NUNCA* leen datos directamente mediante Axios o la API REST para el renderizado inicial. Siempre se suscriben a la caché local del navegador mediante el hook `useLiveQuery` de Dexie.js.
2. **Escritura Optimista y Sincrónica:** 
   - Las transacciones pesadas (Ventas, Facturas) se guardan localmente en Dexie con un estado `sync_status = 'pending'`. Un *Service Worker* (o rutina en `posSyncService`) las enviará en segundo plano.
   - La creación de entidades maestras pequeñas (crear un Proveedor, Cliente o Categoría) se envían a Supabase primero. Si la operación es exitosa, se invoca inmediatamente `posSyncService.sync...()` para actualizar la caché local y reflejar visualmente el cambio en pantalla.

### Diseño Unificado de Contactos y Motor Contable
- **Modelo de Terceros (`crm_terceros`):** Se abandonó el antipatrón de tener tablas separadas para clientes y proveedores. Utilizamos un modelo de directorio unificado con banderas booleanas (`es_cliente: boolean`, `es_proveedor: boolean`). Esto evita duplicación de datos cuando un inquilino le compra y le vende a la misma empresa.
- **Aislamiento Multi-Tenant (RLS por JWT):** Las tablas (`inv_categorias`, `crm_terceros`) utilizan la columna `empresa_id` de tipo `BIGINT`. La seguridad Row Level Security de Supabase se resolvió extrayendo el ID directamente de los claims del JWT de la sesión, evitando costosos JOINs de seguridad:
  `USING (empresa_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')::BIGINT);`

**Directriz para Futuros Desarrollos:** Cualquier nuevo módulo transaccional que se adhiera al ecosistema ERP de Mindsoftia deberá heredar y respetar estrictamente esta arquitectura de sincronización híbrida y tipado contable.
