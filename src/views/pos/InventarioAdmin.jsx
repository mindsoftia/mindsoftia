/**
 * InventarioAdmin.jsx — Panel administrativo del módulo Inventario.
 * Muestra el stock por sede, alertas y acceso al kardex. Permite creación de productos.
 */
import React, { useState } from 'react';
import { useInventario } from '../../hooks/useInventario';
import { posSyncService } from '../../services/posSyncService';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

export default function InventarioAdmin() {
  const { productos, alertas, cargando, error, cargarStock } = useInventario();
  const [isSyncing, setIsSyncing] = useState(false);
  const { tenantId } = useAuthStore();

  const categorias = useLiveQuery(() => posDB.categorias_cache.toArray(), []);

  const [showModal, setShowModal] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [formData, setFormData] = useState({
    codigo_sku: '',
    nombre: '',
    tipo: 'fisico',
    precio_venta: '',
    costo_promedio: '',
    categoria_id: ''
  });

  const handleOfflineSync = async () => {
    setIsSyncing(true);
    const success = await posSyncService.syncMasterData();
    setIsSyncing(false);
    if (success) {
      alert('Sincronización a la caja local completada.');
    } else {
      alert('Error en la sincronización local.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      const payload = {
        empresa_id: tenantId,
        codigo_sku: formData.codigo_sku,
        nombre: formData.nombre,
        tipo: formData.tipo,
        precio_venta: parseFloat(formData.precio_venta || 0),
        costo_promedio: parseFloat(formData.costo_promedio || 0),
        categoria_id: formData.categoria_id || null
      };

      const { error: err } = await supabase.from('inv_productos').insert([payload]);
      if (err) throw err;

      await posSyncService.syncMasterData(); // Actualiza Dexie
      await cargarStock(); // Actualiza el UI desde Laravel/Supabase
      
      setShowModal(false);
      setFormData({ codigo_sku: '', nombre: '', tipo: 'fisico', precio_venta: '', costo_promedio: '', categoria_id: '' });
    } catch (err) {
      console.error("Error al crear producto:", err);
      alert("Hubo un error al guardar: " + err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      <div className="p-3">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="mb-0">
              <span className="fas fa-boxes me-2 text-primary"></span>
              Inventario Multisede
            </h4>
            <p className="text-muted fs--1 mb-0">Stock en tiempo real · Kardex · Traslados</p>
          </div>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleOfflineSync} disabled={isSyncing}>
              {isSyncing ? <span className="spinner-border spinner-border-sm me-1"></span> : <span className="fas fa-cloud-download-alt me-1"></span>}
              Sync Offline
            </button>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={cargarStock}>
              <span className="fas fa-sync-alt me-1"></span>Actualizar Nube
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
              <span className="fas fa-plus me-1"></span>Nuevo Producto
            </button>
          </div>
        </div>

        {/* Alertas de stock mínimo */}
        {alertas.length > 0 && (
          <div className="alert alert-warning py-2 mb-3">
            <span className="fas fa-exclamation-triangle me-2"></span>
            <strong>{alertas.length} producto{alertas.length > 1 ? 's' : ''}</strong> por debajo del stock mínimo.
            {alertas.slice(0, 3).map(p => (
              <span key={p.id} className="badge bg-warning text-dark ms-2">{p.nombre}</span>
            ))}
          </div>
        )}

        {/* Tabla de stock */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="bg-200">
                  <tr>
                    <th>Producto</th>
                    <th>Referencia (SKU)</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Mínimo</th>
                    <th className="text-end">Precio</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="6" className="text-center py-4">
                      <span className="spinner-border spinner-border-sm me-2"></span>Cargando inventario...
                    </td></tr>
                  ) : error ? (
                    <tr><td colSpan="6" className="text-center py-4 text-danger">
                      <span className="fas fa-exclamation-circle me-2"></span>{error}
                    </td></tr>
                  ) : productos.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">
                      <span className="fas fa-box-open fa-2x mb-2 d-block"></span>
                      No hay productos en inventario aún.
                      <div className="mt-2">
                        <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
                          <span className="fas fa-plus me-1"></span>Agregar Producto
                        </button>
                      </div>
                    </td></tr>
                  ) : (
                    productos.map(p => (
                      <tr key={p.id}>
                        <td className="align-middle fw-semi-bold">{p.nombre}</td>
                        <td className="align-middle text-muted fs--1">{p.referencia || p.codigo_sku || p.codigo_barras || '-'}</td>
                        <td className="align-middle text-center">
                          <span className={`fw-bold ${p.alerta_stock ? 'text-danger' : 'text-success'}`}>
                            {p.stock_actual ?? 0}
                          </span>
                        </td>
                        <td className="align-middle text-center text-muted fs--1">{p.stock_minimo || 0}</td>
                        <td className="align-middle text-end">
                          ${parseFloat(p.precio_venta || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="align-middle text-center">
                          {p.alerta_stock
                            ? <span className="badge badge-subtle-danger">⚠ Bajo</span>
                            : <span className="badge badge-subtle-success">OK</span>
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Producto</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Nombre del Producto / Servicio</label>
                      <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Código SKU</label>
                      <input type="text" className="form-control" name="codigo_sku" value={formData.codigo_sku} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Tipo de Producto</label>
                      <select className="form-select" name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="fisico">Bien Físico</option>
                        <option value="servicio">Servicio Intangible</option>
                        <option value="ensamble">Ensamble / Receta</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Categoría (Familia)</label>
                      <select className="form-select" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                        <option value="">-- Sin categoría --</option>
                        {categorias?.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Precio de Venta</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" step="0.01" className="form-control" name="precio_venta" value={formData.precio_venta} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Costo Promedio (Inicial)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" step="0.01" className="form-control" name="costo_promedio" value={formData.costo_promedio} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loadingSave}>
                    {loadingSave ? <span className="fas fa-spinner fa-spin me-1"></span> : <span className="fas fa-save me-1"></span>}
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
