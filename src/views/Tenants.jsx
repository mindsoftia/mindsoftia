import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Tenants() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    subdominio: '',
    ruc_nit: '',
    email: '',
    telefono: '',
    is_active: true
  });

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://mindsoftia.com'}/api/empresas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      setEmpresas(response.data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOpenModal = (empresa = null) => {
    if (empresa) {
      setFormData(empresa);
    } else {
      setFormData({ id: null, nombre: '', subdominio: '', ruc_nit: '', email: '', telefono: '', is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = formData.id 
        ? `${import.meta.env.VITE_API_URL || 'https://mindsoftia.com'}/api/empresas/${formData.id}`
        : `${import.meta.env.VITE_API_URL || 'https://mindsoftia.com'}/api/empresas`;
      
      const method = formData.id ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      
      setShowModal(false);
      fetchEmpresas();
    } catch (error) {
      console.error("Error guardando empresa:", error);
      alert("Error al guardar la empresa. Revisa la consola.");
    }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Gestión de Empresas (Tenants)</h5>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
                <span className="fas fa-plus me-1"></span>Nueva Empresa
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>NOMBRE DE LA EMPRESA</th>
                  <th>SUBDOMINIO</th>
                  <th>RUC / NIT</th>
                  <th>CONTACTO</th>
                  <th className="text-center">MÓDULOS</th>
                  <th className="text-center">ESTADO</th>
                  <th className="text-end">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-3">Cargando...</td></tr>
                ) : empresas.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-3">No hay empresas registradas.</td></tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="align-middle fw-semi-bold">{empresa.nombre}</td>
                      <td className="align-middle text-primary fw-semi-bold">
                        <span className="fas fa-link me-1" style={{fontSize: '0.7rem'}}></span>
                        {empresa.subdominio ? `${empresa.subdominio}.mindsoftia.com` : '-'}
                      </td>
                      <td className="align-middle">{empresa.ruc_nit || '-'}</td>
                      <td className="align-middle">
                        <div>{empresa.email || '-'}</div>
                        <div className="text-500 fs--2">{empresa.telefono || ''}</div>
                      </td>
                      <td className="align-middle text-center">
                        <span className="badge badge-subtle-success me-1">Contabilidad</span>
                        <span className="badge badge-subtle-primary">Facturación</span>
                      </td>
                      <td className="align-middle text-center">
                        <div className="form-check form-switch d-flex justify-content-center mb-0">
                          <input className="form-check-input" type="checkbox" checked={empresa.is_active} readOnly />
                        </div>
                      </td>
                      <td className="align-middle text-end">
                        <button className="btn btn-sm btn-link text-primary p-0 me-2" onClick={() => handleOpenModal(empresa)}>
                          <span className="fas fa-edit fs--1"></span>
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-0">
                          <span className="fas fa-trash fs--1"></span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal CRUD (Estilo Yuka-Do Compacto) */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light py-2">
                <h6 className="modal-title mb-0">{formData.id ? 'Configurar Empresa' : 'Crear Nueva Empresa'}</h6>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-3">
                  <div className="row g-3">
                    {/* Columna Izquierda: Información de la Empresa */}
                    <div className="col-md-7">
                      <h6 className="text-700 mb-2 fs--1 text-uppercase">Información General</h6>
                      
                      <div className="mb-2">
                        <label className="form-label fs--2 mb-1">Razón Social o Nombre *</label>
                        <input type="text" className="form-control form-control-sm" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                      </div>

                      <div className="card shadow-none border mb-2">
                        <div className="card-body bg-light p-2">
                          <h6 className="text-700 mb-1 fs--2"><span className="fas fa-sitemap me-2"></span>Acceso y Dominios</h6>
                          <div className="mb-0">
                            <label className="form-label fs--2 mb-1">Subdominio (SaaS) *</label>
                            <div className="input-group input-group-sm">
                              <input type="text" className="form-control" name="subdominio" value={formData.subdominio} onChange={handleInputChange} required placeholder="ej: miempresa" />
                              <span className="input-group-text py-0 text-500 bg-200">.mindsoftia.com</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-2 g-2">
                        <div className="col-sm-6">
                          <label className="form-label fs--2 mb-1">RUC / NIT</label>
                          <input type="text" className="form-control form-control-sm" name="ruc_nit" value={formData.ruc_nit} onChange={handleInputChange} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label fs--2 mb-1">Teléfono</label>
                          <input type="text" className="form-control form-control-sm" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="form-label fs--2 mb-1">Email Administrativo</label>
                        <input type="email" className="form-control form-control-sm" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>

                      <div className="card shadow-none border">
                        <div className="card-body bg-light p-2">
                          <h6 className="text-700 mb-1 fs--2"><span className="fas fa-user-tie me-2"></span>Administrador Principal</h6>
                          <input type="text" className="form-control form-control-sm bg-white" disabled placeholder="Se configurará en Supabase" />
                        </div>
                      </div>
                    </div>

                    {/* Columna Derecha: Módulos (Compacto) */}
                    <div className="col-md-5">
                      <h6 className="text-700 mb-2 fs--1 text-uppercase">Módulos</h6>
                      
                      <div className="mb-3 bg-100 p-2 rounded">
                        <p className="fs--2 text-600 mb-1 fw-semi-bold">Base (Siempre Activos)</p>
                        <div className="d-flex align-items-center"><span className="fas fa-check text-success me-2 fs--2"></span><span className="fs--2">Dashboard Core</span></div>
                        <div className="d-flex align-items-center"><span className="fas fa-check text-success me-2 fs--2"></span><span className="fs--2">Contabilidad</span></div>
                        <div className="d-flex align-items-center"><span className="fas fa-check text-success me-2 fs--2"></span><span className="fs--2">Ajustes</span></div>
                      </div>

                      <p className="fs--2 text-600 mb-1 fw-semi-bold text-uppercase">Complementos</p>
                      
                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">Facturación Elect.</div>
                        <div className="form-check form-switch mb-0"><input className="form-check-input mt-0" type="checkbox" defaultChecked /></div>
                      </div>

                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">Inventarios</div>
                        <div className="form-check form-switch mb-0"><input className="form-check-input mt-0" type="checkbox" /></div>
                      </div>
                      
                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">Nómina / RRHH</div>
                        <div className="form-check form-switch mb-0"><input className="form-check-input mt-0" type="checkbox" /></div>
                      </div>

                      <div className="mt-3 form-check form-switch bg-primary-subtle p-2 rounded d-flex align-items-center justify-content-between px-3">
                        <label className="form-check-label fw-bold text-primary fs--1 mb-0" htmlFor="isActive">
                          Empresa Activa
                        </label>
                        <input className="form-check-input mt-0" type="checkbox" id="isActive" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                      </div>

                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm">Guardar Empresa</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Tenants;
