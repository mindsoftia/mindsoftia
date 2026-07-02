import axios from './api';
import { posDB } from '../database/localPosDb';

/**
 * Servicio para sincronizar datos maestros (Catálogo, Terceros) desde Laravel hacia Dexie.js
 * Esto permite el funcionamiento Offline-First del POS y el módulo de Inventario.
 */
export const posSyncService = {
  
  /**
   * Descarga todos los productos del Tenant y los guarda en Dexie.
   */
  async syncProductos() {
    try {
      const response = await axios.get('/api/inventario/productos');
      const productos = response.data;
      
      if (Array.isArray(productos) && productos.length > 0) {
        // Usamos una transacción para borrar el caché viejo e insertar el nuevo
        await posDB.transaction('rw', posDB.productos_cache, async () => {
          await posDB.productos_cache.clear();
          await posDB.productos_cache.bulkAdd(productos);
        });
        console.log(`[Sync] ${productos.length} productos sincronizados localmente.`);
      }
      return true;
    } catch (error) {
      console.error('[Sync] Error al sincronizar productos:', error);
      return false;
    }
  },

  /**
   * Descarga todos los terceros (Clientes y Proveedores) del Tenant y los guarda en Dexie.
   */
  async syncTerceros() {
    try {
      const { supabase } = await import('./supabase');
      const { data: terceros, error } = await supabase.from('crm_terceros').select('*');
      
      if (error) throw error;
      
      if (Array.isArray(terceros)) {
        await posDB.transaction('rw', posDB.terceros_cache, async () => {
          await posDB.terceros_cache.clear();
          await posDB.terceros_cache.bulkAdd(terceros);
        });
        console.log(`[Sync] ${terceros.length} terceros sincronizados localmente.`);
      }
      return true;
    } catch (error) {
      console.error('[Sync] Error al sincronizar terceros:', error);
      return false;
    }
  },

  /**
   * Descarga todas las categorías del Tenant y las guarda en Dexie (vía Supabase).
   */
  async syncCategorias() {
    try {
      // Intentamos usar Supabase directamente ya que la tabla inv_categorias tiene RLS
      const { supabase } = await import('./supabase');
      const { data: categorias, error } = await supabase.from('inv_categorias').select('*');
      
      if (error) throw error;

      if (Array.isArray(categorias)) {
        await posDB.transaction('rw', posDB.categorias_cache, async () => {
          await posDB.categorias_cache.clear();
          await posDB.categorias_cache.bulkAdd(categorias);
        });
        console.log(`[Sync] ${categorias.length} categorías sincronizadas localmente.`);
      }
      return true;
    } catch (error) {
      console.error('[Sync] Error al sincronizar categorías:', error);
      return false;
    }
  },

  /**
   * Ejecuta ambas sincronizaciones de datos maestros.
   */
  async syncMasterData() {
    const pSuccess = await this.syncProductos();
    const tSuccess = await this.syncTerceros();
    const cSuccess = await this.syncCategorias();
    return pSuccess && tSuccess && cSuccess;
  },

  /**
   * Busca las ventas offline y las envía al backend
   */
  async syncVentasPendientes() {
    try {
      const ventas = await posDB.ventas.where('sync_status').equals('pending').toArray();
      if (ventas.length === 0) return 0;

      // Cargar los items de cada venta
      const payload = [];
      for (const v of ventas) {
        const items = await posDB.ventas_items.where('venta_id').equals(v.id).toArray();
        payload.push({ ...v, items });
      }

      // Enviar a Laravel
      const response = await axios.post('/api/pos/sync', { ventas: payload });
      const procesadas = response.data.procesadas || [];

      // Marcar como sincronizadas en Dexie
      if (procesadas.length > 0) {
        await posDB.transaction('rw', posDB.ventas, async () => {
          await Promise.all(procesadas.map(id => 
            posDB.ventas.update(id, { sync_status: 'synced' })
          ));
        });
        console.log(`[Sync] ${procesadas.length} ventas subidas a la nube.`);
      }

      return procesadas.length;
    } catch (error) {
      console.error('[Sync] Error subiendo ventas pendientes:', error);
      return 0;
    }
  }
};
