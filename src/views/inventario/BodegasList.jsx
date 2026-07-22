import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

export default function BodegasList() {
  const { tenantId } = useAuthStore();
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialForm = { nombre: '', codigo: '', direccion: '', es_principal: false, activa: true };
  const [formData, setFormData] = useState(initialForm);

  const fetchBodegas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inv_sedes')
        .select('*')
        .order('es_principal', { ascending: false });
        
      if (error) throw error;
      setBodegas(data || []);
    } catch (err) {
      console.error("Error cargando bodegas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBodegas();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Si la nueva es principal, quitamos principal a las demas de este tenant
      if (formData.es_principal) {
        await supabase
          .from('inv_sedes')
          .update({ es_principal: false })
          .eq('empresa_id', tenantId)
          .eq('es_principal', true);
      }

      const payload = {
        empresa_id: tenantId,
        nombre: formData.nombre,
        codigo: formData.codigo,
        direccion: formData.direccion,
        es_principal: formData.es_principal,
        activa: formData.activa
      };

      const { error } = await supabase.from('inv_sedes').insert([payload]);
      if (error) throw error;

      setShowModal(false);
      setFormData(initialForm);
      fetchBodegas();
    } catch (err) {
      console.error("Error guardando bodega:", err);
      alert("Hubo un error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Bodegas y Sucursales</h5>
          <div>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchBodegas} disabled={loading}>
              <span className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></span> Actualizar
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 ps-3">Código</th>
                  <th className="sort pe-1">Nombre / Sucursal</th>
                  <th className="sort pe-1">Dirección</th>
                  <th className="sort pe-1 text-center">Tipo</th>
                  <th className="sort pe-1 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="list">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></td></tr>
                ) : bodegas.length > 0 ? (
                  bodegas.map(bod => (
                    <tr key={bod.id}>
                      <td className="ps-3 fw-semi-bold">{bod.codigo || 'S/C'}</td>
                      <td className="fw-bold text-800">{bod.nombre}</td>
                      <td className="text-500">{bod.direccion || '-'}</td>
                      <td className="text-center">
                        {bod.es_principal ? <span className="badge badge-soft-primary"><i className="fas fa-star me-1"></i>Principal</span> : <span className="badge badge-soft-secondary">Sucursal</span>}
                      </td>
                      <td className="text-center">
                        {bod.activa ? <span className="badge badge-soft-success">Activa</span> : <span className="badge badge-soft-danger">Inactiva</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No hay bodegas registradas. Crea tu primera sede o bodega principal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nueva Bodega/Sucursal</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Código (Opcional)</label>
                      <input type="text" className="form-control" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: BOG-01" />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Nombre de la Bodega <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Centro de Distribución Norte" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">Dirección Física</label>
                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ubicación para logística" />
                  </div>

                  <div className="bg-light p-3 rounded border border-200">
                    <div className="form-check form-switch mb-2">
                      <input className="form-check-input" type="checkbox" id="es_principal" name="es_principal" checked={formData.es_principal} onChange={handleChange} />
                      <label className="form-check-label fw-semi-bold text-800" htmlFor="es_principal">Marcar como Sede Principal</label>
                      <div className="form-text fs--2 mt-0">La sede principal es la bodega por defecto para el Kardex. Al marcarla, reemplazará a la actual.</div>
                    </div>
                  </div>

                </div>
                <div className="modal-footer border-top-0 bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <span className="fas fa-spinner fa-spin me-1"></span> : <span className="fas fa-save me-1"></span>}
                    Guardar Sede
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        className="btn btn-primary rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center" 
        style={{ width: '60px', height: '60px', bottom: '30px', right: '30px', zIndex: 1050 }}
        onClick={() => setShowModal(true)}
        title="Crear Nueva Bodega"
      >
        <span className="fas fa-warehouse fs-2"></span>
      </button>
    </>
  );
}
