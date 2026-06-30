/**
 * useInventario.js
 * Hook React para consumir el módulo de inventario multisede NexoPOS.
 * Aplica: consulta de stock consolidado, filtro por sede, y traslados.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from '../services/api'; // Instancia Axios con baseURL y token

export function useInventario(sedeId = null) {
  const [productos, setProductos]     = useState([]);
  const [alertas, setAlertas]         = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);

  // ── 1. Cargar stock (se filtra por sede si se pasa sedeId) ──
  const cargarStock = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = sedeId ? { sede_id: sedeId } : {};
      const { data } = await axios.get('/api/inventario/stock', { params });

      setProductos(data.data);
      // Filtrar productos con alerta de stock mínimo
      setAlertas(data.data.filter(p => p.alerta_stock));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar inventario.');
    } finally {
      setCargando(false);
    }
  }, [sedeId]);

  useEffect(() => {
    cargarStock();
  }, [cargarStock]);

  // ── 2. Ejecutar traslado entre sedes ────────────────────────
  const ejecutarTraslado = async ({ productoId, sedeOrigen, sedeDestino, cantidad, observacion }) => {
    try {
      const { data } = await axios.post('/api/inventario/traslados', {
        producto_id:  productoId,
        sede_origen:  sedeOrigen,
        sede_destino: sedeDestino,
        cantidad,
        observacion,
      });

      // Refrescar el inventario tras el traslado
      await cargarStock();
      return { ok: true, ...data };
    } catch (err) {
      return {
        ok: false,
        error: err.response?.data?.error || 'Error en el traslado.',
        stock_disponible: err.response?.data?.stock_disponible ?? null,
      };
    }
  };

  // ── 3. Consultar kardex de un producto ──────────────────────
  const obtenerKardex = async (productoId, filtroSedeId = null) => {
    try {
      const params = filtroSedeId ? { sede_id: filtroSedeId } : {};
      const { data } = await axios.get(`/api/inventario/kardex/${productoId}`, { params });
      return data;
    } catch (err) {
      return null;
    }
  };

  return {
    productos,        // Lista de productos con stock
    alertas,          // Productos bajo stock mínimo
    cargando,
    error,
    cargarStock,      // Forzar recarga manual
    ejecutarTraslado, // fn para mover stock entre sedes
    obtenerKardex,    // fn para ver historial de movimientos
  };
}
