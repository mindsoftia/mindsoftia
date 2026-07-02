import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

function ProveedoresList() {
  const { tenantId } = useAuthStore();
  
  // Filtramos la caché local para mostrar solo aquellos marcados como proveedores
  const proveedores = useLiveQuery(
    () => posDB.terceros_cache.filter(t => t.es_proveedor === true).toArray(), 
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_identificacion: 'NIT',
    numero_identificacion: '',
    razon_social: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const handleSync = async () => {
    setLoading(true);
    await posSyncService.syncTerceros();
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        empresa_id: tenantId,
        tipo_identificacion: formData.tipo_identificacion,
        numero_identificacion: formData.numero_identificacion,
        razon_social: formData.tipo_identificacion === 'NIT' ? formData.razon_social : null,
        nombres: formData.tipo_identificacion !== 'NIT' ? formData.nombres : null,
        apellidos: formData.tipo_identificacion !== 'NIT' ? formData.apellidos : null,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        es_proveedor: true, // ¡Clave para que sea proveedor!
        es_cliente: false
      };
      
      const { error } = await supabase.from('crm_terceros').insert([payload]);
      if (error) throw error;
      
      await posSyncService.syncTerceros();
      setShowModal(false);
      setFormData({ tipo_identificacion: 'NIT', numero_identificacion: '', razon_social: '', nombres: '', apellidos: '', email: '', telefono: '', direccion: '' });
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
      alert("Hubo un error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Directorio de Proveedores</h5>
          <div>
            <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleSync} disabled={loading}>
              <span className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></span> Sincronizar
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <span className="fas fa-plus me-1"></span>Nuevo Proveedor
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 align-middle white-space-nowrap">Identificación</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Razón Social / Nombre</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Email</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Teléfono</th>
                </tr>
              </thead>
              <tbody className="list">
                {proveedores?.length > 0 ? (
                  proveedores.map(prov => (
                    <tr key={prov.id}>
                      <td className="align-middle fw-bold">{prov.tipo_identificacion} {prov.numero_identificacion}</td>
                      <td className="align-middle">{prov.tipo_identificacion === 'NIT' ? prov.razon_social : `${prov.nombres} ${prov.apellidos}`}</td>
                      <td className="align-middle">{prov.email || '-'}</td>
                      <td className="align-middle">{prov.telefono || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No hay proveedores en caché. Presiona "Sincronizar" o crea uno nuevo.
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Proveedor</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Tipo ID</label>
                      <select className="form-select" name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange}>
                        <option value="NIT">NIT</option>
                        <option value="CC">Cédula</option>
                        <option value="CE">Cédula Ext.</option>
                        <option value="RUT">RUT</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Número de Identificación</label>
                      <input type="text" className="form-control" name="numero_identificacion" value={formData.numero_identificacion} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  {formData.tipo_identificacion === 'NIT' ? (
                    <div className="mb-3">
                      <label className="form-label">Razón Social</label>
                      <input type="text" className="form-control" name="razon_social" value={formData.razon_social} onChange={handleChange} required={formData.tipo_identificacion === 'NIT'} />
                    </div>
                  ) : (
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Nombres</label>
                        <input type="text" className="form-control" name="nombres" value={formData.nombres} onChange={handleChange} required={formData.tipo_identificacion !== 'NIT'} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Apellidos</label>
                        <input type="text" className="form-control" name="apellidos" value={formData.apellidos} onChange={handleChange} required={formData.tipo_identificacion !== 'NIT'} />
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dirección Completa</label>
                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} />
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? <span className="fas fa-spinner fa-spin me-1"></span> : <span className="fas fa-save me-1"></span>}
                    Guardar Proveedor
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

export default ProveedoresList;
