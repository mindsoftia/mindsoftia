import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import useAuthStore from '../../store/authStore';

export default function KardexList() {
  const { tenantId } = useAuthStore();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Diccionario local de productos para resolver nombres rápido
  const productos = useLiveQuery(() => posDB.productos_cache.toArray(), []);
  
  // Opcional: Diccionario de sedes si las tenemos guardadas, sino lo extraemos del query
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Obtener sedes
        const { data: dataSedes, error: errorSedes } = await supabase
          .from('inv_sedes')
          .select('id, nombre')
          .eq('empresa_id', tenantId);
          
        if (errorSedes) throw errorSedes;
        
        const fetchedSedes = dataSedes || [];
        setSedes(fetchedSedes);

        if (fetchedSedes.length === 0) {
          setMovimientos([]);
          return; // No hay sedes, no hay kardex. Fin del loading (en finally)
        }

        // 2. Obtener movimientos de esas sedes
        const sedesIds = fetchedSedes.map(s => s.id);
        const { data: dataKardex, error: errorKardex } = await supabase
          .from('inv_kardex')
          .select('*')
          .in('sede_id', sedesIds)
          .order('fecha_movimiento', { ascending: false })
          .limit(100);
          
        if (errorKardex) throw errorKardex;
        setMovimientos(dataKardex || []);
        
      } catch (err) {
        console.error("Error cargando Kardex:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenantId]);

  // Se expone un método para el botón de Actualizar manual
  const fetchKardexManual = async () => {
    if (sedes.length === 0) return;
    setLoading(true);
    try {
      const sedesIds = sedes.map(s => s.id);
      const { data, error } = await supabase
        .from('inv_kardex')
        .select('*')
        .in('sede_id', sedesIds)
        .order('fecha_movimiento', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      setMovimientos(data || []);
    } catch (err) {
      console.error("Error actualizando Kardex:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProductoNombre = (id) => {
    const prod = productos?.find(p => p.id === id);
    return prod ? `${prod.codigo_sku || ''} - ${prod.nombre}` : 'Producto Desconocido';
  };

  const getSedeNombre = (id) => {
    const sede = sedes?.find(s => s.id === id);
    return sede ? sede.nombre : 'Sede Desconocida';
  };

  const renderBadgeMovimiento = (tipo) => {
    if (tipo.includes('ENTRADA') || tipo.includes('POSITIVO')) {
      return <span className="badge badge-soft-success"><i className="fas fa-arrow-down me-1"></i>{tipo.replace('_', ' ')}</span>;
    }
    if (tipo.includes('SALIDA') || tipo.includes('NEGATIVO')) {
      return <span className="badge badge-soft-danger"><i className="fas fa-arrow-up me-1"></i>{tipo.replace('_', ' ')}</span>;
    }
    return <span className="badge badge-soft-warning">{tipo}</span>;
  };

  return (
    <div className="card shadow-none border mb-3">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            <span className="fas fa-history me-2 text-primary"></span>
            Movimientos de Inventario (Kardex)
          </h5>
          <p className="text-muted fs--2 mb-0 mt-1">Histórico inmutable de entradas, salidas y traslados.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchKardexManual} disabled={loading || sedes.length === 0}>
          <span className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></span> Actualizar
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm table-hover mb-0 align-middle fs--1">
            <thead className="bg-200 text-900">
              <tr>
                <th className="sort pe-1 ps-3">Fecha y Hora</th>
                <th className="sort pe-1">Sede / Bodega</th>
                <th className="sort pe-1">Producto</th>
                <th className="sort pe-1 text-center">Tipo Movimiento</th>
                <th className="sort pe-1 text-center">Soporte</th>
                <th className="sort pe-1 text-end">Cant.</th>
                <th className="sort pe-1 text-end">Costo Unit.</th>
                <th className="sort pe-1 text-end">Saldo Actual (Stock)</th>
              </tr>
            </thead>
            <tbody className="list">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
              ) : movimientos.length > 0 ? (
                movimientos.map(mov => (
                  <tr key={mov.id}>
                    <td className="ps-3 text-500">
                      {new Date(mov.fecha_movimiento).toLocaleDateString()} <br/>
                      <small>{new Date(mov.fecha_movimiento).toLocaleTimeString()}</small>
                    </td>
                    <td className="fw-semi-bold">{getSedeNombre(mov.sede_id)}</td>
                    <td className="fw-bold text-800" style={{ maxWidth: '200px' }}>
                      <div className="text-truncate" title={getProductoNombre(mov.producto_id)}>
                        {getProductoNombre(mov.producto_id)}
                      </div>
                    </td>
                    <td className="text-center">{renderBadgeMovimiento(mov.tipo_movimiento)}</td>
                    <td className="text-center">
                      {mov.documento_tipo ? (
                        <span className="badge badge-soft-info" title={mov.observacion}>{mov.documento_tipo}</span>
                      ) : (
                        <span className="text-400">-</span>
                      )}
                    </td>
                    <td className={`text-end fw-bold ${mov.tipo_movimiento.includes('ENTRADA') || mov.tipo_movimiento.includes('POSITIVO') ? 'text-success' : 'text-danger'}`}>
                      {mov.tipo_movimiento.includes('ENTRADA') || mov.tipo_movimiento.includes('POSITIVO') ? '+' : '-'}{Number(mov.cantidad).toLocaleString()}
                    </td>
                    <td className="text-end text-600">${Number(mov.costo_unitario).toLocaleString()}</td>
                    <td className="text-end fw-bold bg-light ps-3">
                      {Number(mov.stock_resultante).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <span className="fas fa-box-open fs-3 text-300 mb-3 d-block"></span>
                    No hay movimientos registrados en el Kardex de tus sedes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
