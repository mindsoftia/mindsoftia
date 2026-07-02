/**
 * localPosDb.js — Base de datos local del POS (IndexedDB via Dexie.js)
 * Opera offline-first: guarda ventas localmente y el syncWorker las sube a la nube.
 */
import Dexie from 'dexie';

export const posDB = new Dexie('NexoPOS_LocalDB');

posDB.version(2).stores({
  // Tablas transaccionales (offline-first)
  ventas:          'id, caja_id, sync_status, fecha_emision_local',
  ventas_items:    'id, venta_id, producto_id',
  // Cachés locales (se sincronizan desde la nube al iniciar)
  productos_cache: 'id, codigo_barras, nombre, categoria_id, empresa_id',
  terceros_cache:  'id, numero_identificacion, razon_social, nombres, apellidos, es_cliente, es_proveedor',
  categorias_cache:'id, nombre, empresa_id, parent_id',
});

/**
 * Guarda una venta completa localmente de forma atómica.
 * Velocidad: < 5ms — sin depender de la red.
 */
export async function guardarVentaLocal(venta, items) {
  return await posDB.transaction('rw', posDB.ventas, posDB.ventas_items, async () => {
    await posDB.ventas.add({
      ...venta,
      sync_status:        'pending',
      fecha_emision_local: new Date().toISOString(),
    });
    await posDB.ventas_items.bulkAdd(items);
    return true;
  });
}
