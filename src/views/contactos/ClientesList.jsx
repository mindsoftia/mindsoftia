import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

function ClientesList() {
  const { tenantId } = useAuthStore();
  
  // Filtramos la caché local para mostrar solo aquellos marcados como clientes
  const clientes = useLiveQuery(
    () => posDB.terceros_cache.filter(t => t.es_cliente === true).toArray(), 
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const initialForm = {
    tipo_identificacion: 'CC',
    numero_identificacion: '',
    razon_social: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    dias_credito: 0,
    limite_credito: 0
  };

  const [formData, setFormData] = useState(initialForm);

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
        dias_credito: formData.dias_credito,
        limite_credito: formData.limite_credito,
        es_cliente: true, // ¡Clave para que sea cliente!
        es_proveedor: false
      };
      
      const { error } = await supabase.from('crm_terceros').insert([payload]);
      if (error) throw error;
      
      await posSyncService.syncTerceros();
      setShowModal(false);
      setFormData(initialForm);
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert("Hubo un error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Directorio de Clientes</h5>
          <div>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleSync} disabled={loading}>
              <span className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></span> Sincronizar
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 align-middle white-space-nowrap">Identificación</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Nombre / Razón Social</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Contacto</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-end">Límite Crédito</th>
                </tr>
              </thead>
              <tbody className="list">
                {clientes?.length > 0 ? (
                  clientes.map(cli => (
                    <tr key={cli.id}>
                      <td className="align-middle fw-bold">{cli.tipo_identificacion} {cli.numero_identificacion}</td>
                      <td className="align-middle">{cli.tipo_identificacion === 'NIT' ? cli.razon_social : `${cli.nombres || ''} ${cli.apellidos || ''}`.trim()}</td>
                      <td className="align-middle">
                        <div>{cli.email || '-'}</div>
                        <div className="text-500 fs--2">{cli.telefono || '-'}</div>
                      </td>
                      <td className="align-middle text-end fw-semi-bold">${Number(cli.limite_credito || 0).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No hay clientes en caché. Presiona "Sincronizar" o crea uno nuevo.
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
                <h5 className="modal-title">Crear Nuevo Cliente</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  
                  <h6 className="mb-3 text-800"><span className="fas fa-user me-2"></span>Datos de Identificación</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Tipo ID</label>
                      <select className="form-select" name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange}>
                        <option value="CC">Cédula</option>
                        <option value="CE">Cédula Ext.</option>
                        <option value="NIT">NIT</option>
                        <option value="PAS">Pasaporte</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Número de Identificación</label>
                      <input type="text" className="form-control" name="numero_identificacion" value={formData.numero_identificacion} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  {formData.tipo_identificacion === 'NIT' ? (
                    <div className="mb-4">
                      <label className="form-label">Razón Social</label>
                      <input type="text" className="form-control" name="razon_social" value={formData.razon_social} onChange={handleChange} required={formData.tipo_identificacion === 'NIT'} />
                    </div>
                  ) : (
                    <div className="row g-3 mb-4">
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

                  <h6 className="mb-3 text-800"><span className="fas fa-address-book me-2"></span>Datos de Contacto</h6>
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
                  <div className="mb-4">
                    <label className="form-label">Dirección Completa</label>
                    <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} />
                  </div>

                  <h6 className="mb-3 text-800"><span className="fas fa-money-check-alt me-2"></span>Condiciones de Crédito (CxC)</h6>
                  <div className="row g-3 mb-2">
                    <div className="col-md-6">
                      <label className="form-label">Días de Crédito Autorizados</label>
                      <input type="number" className="form-control" name="dias_credito" value={formData.dias_credito} onChange={handleChange} min="0" />
                      <div className="form-text fs--2 text-500">0 = Solo ventas de contado</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Límite de Crédito Permitido ($)</label>
                      <input type="number" className="form-control" name="limite_credito" value={formData.limite_credito} onChange={handleChange} min="0" step="0.01" />
                    </div>
                  </div>

                </div>
                <div className="modal-footer border-top-0 bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? <span className="fas fa-spinner fa-spin me-1"></span> : <span className="fas fa-save me-1"></span>}
                    Guardar Cliente
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
        title="Crear Nuevo Cliente"
      >
        <span className="fas fa-user-plus fs-2"></span>
      </button>
    </>
  );
}

export default ClientesList;
