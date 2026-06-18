import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Tenants() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
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
      setFormData({ id: null, nombre: '', ruc_nit: '', email: '', telefono: '', is_active: true });
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
                  <th>RUC / NIT</th>
                  <th>CONTACTO</th>
                  <th className="text-center">MÓDULOS</th>
                  <th className="text-center">ESTADO</th>
                  <th className="text-end">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-3">Cargando...</td></tr>
                ) : empresas.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-3">No hay empresas registradas.</td></tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="align-middle fw-semi-bold">{empresa.nombre}</td>
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

      {/* Modal CRUD (Estilo Yuka-Do) */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">{formData.id ? 'Configurar Empresa' : 'Crear Nueva Empresa'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Columna Izquierda: Información de la Empresa */}
                    <div className="col-lg-7">
                      <h6 className="text-700 mb-3">Información General</h6>
                      
                      <div className="mb-3">
                        <label className="form-label">Razón Social o Nombre *</label>
                        <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                      </div>

                      <div className="row mb-3">
                        <div className="col-sm-6">
                          <label className="form-label">RUC / NIT</label>
                          <input type="text" className="form-control" name="ruc_nit" value={formData.ruc_nit} onChange={handleInputChange} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Teléfono</label>
                          <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Email Administrativo</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>

                      <div className="card shadow-none border">
                        <div className="card-body bg-light p-3">
                          <h6 className="text-700 mb-2"><span className="fas fa-user-tie me-2"></span>Administrador Principal</h6>
                          <div className="mb-2">
                            <label className="form-label fs--1">Nombre del Administrador (Próximamente)</label>
                            <input type="text" className="form-control form-control-sm" disabled placeholder="Se configurará en Supabase" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columna Derecha: Módulos (Estilo Yuka-Do) */}
                    <div className="col-lg-5">
                      <h6 className="text-700 mb-3">Configuración de Módulos</h6>
                      
                      <div className="mb-4">
                        <p className="fs--2 text-600 mb-2 fw-semi-bold text-uppercase">Módulos Base (Siempre Activos)</p>
                        <div className="d-flex align-items-center mb-1"><span className="fas fa-check-circle text-success me-2"></span><span className="fs--1">Dashboard Core</span></div>
                        <div className="d-flex align-items-center mb-1"><span className="fas fa-check-circle text-success me-2"></span><span className="fs--1">Contabilidad (Libro Diario)</span></div>
                        <div className="d-flex align-items-center mb-1"><span className="fas fa-check-circle text-success me-2"></span><span className="fs--1">Ajustes del Sistema</span></div>
                      </div>

                      <p className="fs--2 text-600 mb-2 fw-semi-bold text-uppercase">Complementos Premium</p>
                      
                      <div className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Facturación Electrónica</h6>
                          <span className="fs--2 text-500">Activar para esta empresa</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input className="form-check-input" type="checkbox" defaultChecked />
                        </div>
                      </div>

                      <div className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Inventarios y Compras</h6>
                          <span className="fs--2 text-500">Activar para esta empresa</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </div>
                      
                      <div className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Nómina / RRHH</h6>
                          <span className="fs--2 text-500">Activar para esta empresa</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </div>

                      <div className="mt-4 form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="isActive" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                        <label className="form-check-label fw-semi-bold" htmlFor="isActive">
                          Empresa Activa en el Sistema
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Empresa</button>
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
