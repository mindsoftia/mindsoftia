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
  
  const initialForm = {
    tipo_identificacion: 'NIT',
    numero_identificacion: '',
    razon_social: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    dias_credito: 0,
    limite_credito: 0,
    documento_rut_url: '',
    camara_comercio_url: '',
    certificacion_bancaria_url: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Estados para los archivos
  const [rutFile, setRutFile] = useState(null);
  const [camaraFile, setCamaraFile] = useState(null);
  const [bancoFile, setBancoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ rut: 0, camara: 0, banco: 0 });

  const handleSync = async () => {
    setLoading(true);
    await posSyncService.syncTerceros();
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'rut') setRutFile(file);
      if (type === 'camara') setCamaraFile(file);
      if (type === 'banco') setBancoFile(file);
    }
  };

  const uploadFileToSupabase = async (file, type) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${type}.${fileExt}`;
    const filePath = `terceros/${tenantId}/${fileName}`;

    // Simulate progress (Supabase SDK JS doesn't have native progress easily exposed yet without custom XHR)
    setUploadProgress(prev => ({ ...prev, [type]: 50 }));

    const { data, error } = await supabase.storage
      .from('archivos_empresas')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;
    
    setUploadProgress(prev => ({ ...prev, [type]: 100 }));

    const { data: publicUrlData } = supabase.storage
      .from('archivos_empresas')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload files if they exist
      const rutUrl = await uploadFileToSupabase(rutFile, 'rut');
      const camaraUrl = await uploadFileToSupabase(camaraFile, 'camara');
      const bancoUrl = await uploadFileToSupabase(bancoFile, 'banco');

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
        documento_rut_url: rutUrl || formData.documento_rut_url,
        camara_comercio_url: camaraUrl || formData.camara_comercio_url,
        certificacion_bancaria_url: bancoUrl || formData.certificacion_bancaria_url,
        es_proveedor: true, // ¡Clave para que sea proveedor!
        es_cliente: false
      };
      
      const { error } = await supabase.from('crm_terceros').insert([payload]);
      if (error) throw error;
      
      await posSyncService.syncTerceros();
      setShowModal(false);
      setFormData(initialForm);
      setRutFile(null);
      setCamaraFile(null);
      setBancoFile(null);
      setUploadProgress({ rut: 0, camara: 0, banco: 0 });
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
                  <th className="sort pe-1 align-middle white-space-nowrap">Razón Social / Nombre</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Email / Teléfono</th>
                  <th className="sort pe-1 align-middle text-center white-space-nowrap">Docs</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-end">Límite Crédito</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-end">Días Plazo</th>
                </tr>
              </thead>
              <tbody className="list">
                {proveedores?.length > 0 ? (
                  proveedores.map(prov => (
                    <tr key={prov.id}>
                      <td className="align-middle fw-bold">{prov.tipo_identificacion} {prov.numero_identificacion}</td>
                      <td className="align-middle">{prov.tipo_identificacion === 'NIT' ? prov.razon_social : `${prov.nombres || ''} ${prov.apellidos || ''}`.trim()}</td>
                      <td className="align-middle">
                        <div>{prov.email || '-'}</div>
                        <div className="text-500 fs--2">{prov.telefono || '-'}</div>
                      </td>
                      <td className="align-middle text-center">
                        {prov.documento_rut_url && <a href={prov.documento_rut_url} target="_blank" rel="noreferrer" title="RUT" className="me-1 text-primary"><span className="fas fa-file-pdf"></span></a>}
                        {prov.camara_comercio_url && <a href={prov.camara_comercio_url} target="_blank" rel="noreferrer" title="Cámara de Comercio" className="me-1 text-info"><span className="fas fa-file-contract"></span></a>}
                        {prov.certificacion_bancaria_url && <a href={prov.certificacion_bancaria_url} target="_blank" rel="noreferrer" title="Certificación Bancaria" className="text-success"><span className="fas fa-university"></span></a>}
                        {(!prov.documento_rut_url && !prov.camara_comercio_url && !prov.certificacion_bancaria_url) && <span className="text-300 fs--2">Sin docs</span>}
                      </td>
                      <td className="align-middle text-end fw-semi-bold">${Number(prov.limite_credito || 0).toLocaleString()}</td>
                      <td className="align-middle text-end">
                        {prov.dias_credito > 0 ? <span className="badge badge-soft-warning">{prov.dias_credito} días</span> : <span className="badge badge-soft-success">Contado</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No hay proveedores en caché. Presiona "Sincronizar" o crea uno nuevo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Flotante (FAB) para crear Proveedor */}
      <button 
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          zIndex: 1050,
          fontSize: '1.5rem',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Crear Nuevo Proveedor"
      >
        <span className="fas fa-plus"></span>
      </button>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Proveedor</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  
                  <h6 className="mb-3 text-800"><span className="fas fa-building me-2"></span>Datos de Identificación</h6>
                  <div className="row g-3 mb-4">
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

                  <h6 className="mb-3 text-800"><span className="fas fa-money-check-alt me-2"></span>Condiciones Financieras</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Días de Crédito (Plazo)</label>
                      <input type="number" className="form-control" name="dias_credito" value={formData.dias_credito} onChange={handleChange} min="0" />
                      <div className="form-text fs--2 text-500">0 = Pago de contado</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Límite de Crédito Permitido ($)</label>
                      <input type="number" className="form-control" name="limite_credito" value={formData.limite_credito} onChange={handleChange} min="0" step="0.01" />
                    </div>
                  </div>

                  <h6 className="mb-3 text-800"><span className="fas fa-folder-open me-2"></span>Documentación Legal (Opcional)</h6>
                  <div className="bg-light p-3 rounded border border-200">
                    <div className="mb-3">
                      <label className="form-label fs--1 fw-semi-bold">RUT Actualizado (PDF)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'rut')} />
                      {uploadProgress.rut > 0 && <div className="progress mt-1" style={{height: '3px'}}><div className="progress-bar bg-primary" style={{width: `${uploadProgress.rut}%`}}></div></div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fs--1 fw-semi-bold">Cámara de Comercio (PDF)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'camara')} />
                      {uploadProgress.camara > 0 && <div className="progress mt-1" style={{height: '3px'}}><div className="progress-bar bg-info" style={{width: `${uploadProgress.camara}%`}}></div></div>}
                    </div>
                    <div className="mb-0">
                      <label className="form-label fs--1 fw-semi-bold">Certificación Bancaria (PDF)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'banco')} />
                      {uploadProgress.banco > 0 && <div className="progress mt-1" style={{height: '3px'}}><div className="progress-bar bg-success" style={{width: `${uploadProgress.banco}%`}}></div></div>}
                    </div>
                  </div>

                </div>
                <div className="modal-footer border-top-0 bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? <span className="fas fa-spinner fa-spin me-1"></span> : <span className="fas fa-save me-1"></span>}
                    {loading ? 'Subiendo Documentos y Guardando...' : 'Guardar Proveedor'}
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
