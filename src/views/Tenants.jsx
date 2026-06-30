import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Instancia Axios centralizada con token

// ── Estado inicial del formulario ──────────────────────────────────
const FORM_INICIAL = {
  id: null,
  nombre: '',
  subdominio: '',
  ruc_nit: '',
  email: '',
  telefono: '',
  is_active: true,
  // Módulos premium
  modulo_facturacion_electronica: true,
  modulo_nomina: false,
  modulo_pos_inventario: false,
  modulo_ia_copiloto: false,
};

function Tenants() {
  const [empresas, setEmpresas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [formData, setFormData]     = useState(FORM_INICIAL);

  // ── Cargar empresas desde la API ──────────────────────────────────
  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/empresas');
      // La API devuelve array directamente
      setEmpresas(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error('Error cargando empresas:', err);
      setError('No se pudo cargar el listado de empresas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmpresas(); }, []);

  // ── Manejo de inputs (text, checkbox, toggle) ─────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador especial para toggles de módulos (recibe el nombre directamente)
  const handleToggleModulo = (campo) => {
    setFormData(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  // ── Abrir modal: crear (sin empresa) o editar (con empresa) ───────
  const abrirModal = (empresa = null) => {
    setError(null);
    setFormData(empresa
      ? {
          ...FORM_INICIAL,       // Asegura que todos los campos existan
          ...empresa,            // Pisa con datos reales de la BD
        }
      : FORM_INICIAL
    );
    setShowModal(true);
  };

  // ── Guardar (crear o editar) ──────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (formData.id) {
        await api.put(`/empresas/${formData.id}`, formData);
      } else {
        await api.post('/empresas', formData);
      }
      setShowModal(false);
      fetchEmpresas();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat().join(', ')
        || 'Error al guardar la empresa.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Renderizar badges de módulos activos en la tabla ──────────────
  const badgesModulos = (empresa) => {
    const activos = [];
    if (empresa.modulo_facturacion_electronica) activos.push({ label: 'DIAN', color: 'badge-subtle-success' });
    if (empresa.modulo_pos_inventario)          activos.push({ label: 'POS', color: 'badge-subtle-primary' });
    if (empresa.modulo_nomina)                  activos.push({ label: 'Nómina', color: 'badge-subtle-warning' });
    if (empresa.modulo_ia_copiloto)             activos.push({ label: 'IA', color: 'badge-subtle-info' });
    if (activos.length === 0) return <span className="text-400 fs--2">Base</span>;
    return activos.map(m => (
      <span key={m.label} className={`badge ${m.color} me-1`}>{m.label}</span>
    ));
  };

  return (
    <>
      {/* ── Encabezado ──────────────────────────────────────────────── */}
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Gestión de Empresas (Tenants)</h5>
            </div>
            <div className="col-auto">
              <button id="btn-nueva-empresa" className="btn btn-primary btn-sm" onClick={() => abrirModal()}>
                <span className="fas fa-plus me-1"></span>Nueva Empresa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla de empresas ────────────────────────────────────────── */}
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
                  <th className="text-center">MÓDULOS ACTIVOS</th>
                  <th className="text-center">ESTADO</th>
                  <th className="text-end">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Cargando empresas desde Supabase...
                    </td>
                  </tr>
                ) : empresas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-400">
                      <span className="fas fa-building fa-2x mb-2 d-block"></span>
                      No hay empresas registradas.
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="align-middle fw-semi-bold">{empresa.nombre}</td>
                      <td className="align-middle text-primary fw-semi-bold">
                        <span className="fas fa-link me-1" style={{ fontSize: '0.7rem' }}></span>
                        {empresa.subdominio ? `${empresa.subdominio}.mindsoftia.com` : '-'}
                      </td>
                      <td className="align-middle">{empresa.ruc_nit || '-'}</td>
                      <td className="align-middle">
                        <div>{empresa.email || '-'}</div>
                        <div className="text-500 fs--2">{empresa.telefono || ''}</div>
                      </td>
                      <td className="align-middle text-center">
                        {badgesModulos(empresa)}
                      </td>
                      <td className="align-middle text-center">
                        <div className="form-check form-switch d-flex justify-content-center mb-0">
                          <input className="form-check-input" type="checkbox" checked={!!empresa.is_active} readOnly />
                        </div>
                      </td>
                      <td className="align-middle text-end">
                        <button
                          id={`btn-editar-empresa-${empresa.id}`}
                          className="btn btn-sm btn-link text-primary p-0 me-2"
                          title="Editar empresa y módulos"
                          onClick={() => abrirModal(empresa)}
                        >
                          <span className="fas fa-edit fs--1"></span>
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-0" title="Eliminar empresa">
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

      {/* ── Modal Crear / Editar ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light py-2">
                <h6 className="modal-title mb-0">
                  {formData.id
                    ? <><span className="fas fa-edit me-2 text-primary"></span>Editar Empresa</>
                    : <><span className="fas fa-plus-circle me-2 text-success"></span>Crear Nueva Empresa</>
                  }
                </h6>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSave}>
                <div className="modal-body p-3">
                  {/* Error global */}
                  {error && (
                    <div className="alert alert-danger py-2 fs--1 mb-3">
                      <span className="fas fa-exclamation-triangle me-2"></span>{error}
                    </div>
                  )}

                  <div className="row g-3">
                    {/* ── Columna izquierda: Información ───────────────── */}
                    <div className="col-md-7">
                      <h6 className="text-700 mb-2 fs--1 text-uppercase">Información General</h6>

                      <div className="mb-2">
                        <label className="form-label fs--2 mb-1">Razón Social o Nombre *</label>
                        <input
                          id="empresa-nombre"
                          type="text"
                          className="form-control form-control-sm"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="card shadow-none border mb-2">
                        <div className="card-body bg-light p-2">
                          <h6 className="text-700 mb-1 fs--2">
                            <span className="fas fa-sitemap me-2"></span>Acceso y Dominios
                          </h6>
                          <div className="mb-0">
                            <label className="form-label fs--2 mb-1">Subdominio (SaaS) *</label>
                            <div className="input-group input-group-sm">
                              <input
                                id="empresa-subdominio"
                                type="text"
                                className="form-control"
                                name="subdominio"
                                value={formData.subdominio}
                                onChange={handleChange}
                                required
                                placeholder="ej: miempresa"
                              />
                              <span className="input-group-text py-0 text-500 bg-200">.mindsoftia.com</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-2 g-2">
                        <div className="col-sm-6">
                          <label className="form-label fs--2 mb-1">RUC / NIT</label>
                          <input
                            id="empresa-ruc-nit"
                            type="text"
                            className="form-control form-control-sm"
                            name="ruc_nit"
                            value={formData.ruc_nit}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label fs--2 mb-1">Teléfono</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="form-label fs--2 mb-1">Email Administrativo</label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="card shadow-none border">
                        <div className="card-body bg-light p-2">
                          <h6 className="text-700 mb-1 fs--2">
                            <span className="fas fa-user-tie me-2"></span>Administrador Principal
                          </h6>
                          <input type="text" className="form-control form-control-sm bg-white" disabled placeholder="Se configurará en Supabase" />
                        </div>
                      </div>
                    </div>

                    {/* ── Columna derecha: Módulos ──────────────────────── */}
                    <div className="col-md-5">
                      <h6 className="text-700 mb-2 fs--1 text-uppercase">Módulos</h6>

                      {/* Base — siempre activos */}
                      <div className="mb-3 bg-100 p-2 rounded">
                        <p className="fs--2 text-600 mb-1 fw-semi-bold">Base (Siempre Activos)</p>
                        <div className="row g-0">
                          <div className="col-6">
                            {['Dashboard Core', 'Libro Diario', 'Plan de Cuentas'].map(m => (
                              <div key={m} className="d-flex align-items-center mb-1">
                                <span className="fas fa-check text-success me-2 fs--2"></span>
                                <span className="fs--2">{m}</span>
                              </div>
                            ))}
                          </div>
                          <div className="col-6">
                            {['Directorio (Terceros)', 'Reportes Financieros', 'Configuración'].map(m => (
                              <div key={m} className="d-flex align-items-center mb-1">
                                <span className="fas fa-check text-success me-2 fs--2"></span>
                                <span className="fs--2">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="fs--2 text-600 mb-1 fw-semi-bold text-uppercase">Complementos Premium</p>

                      {/* Toggle: Facturación Electrónica */}
                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">
                          Facturación Electrónica <span className="text-500 fs--2">(DIAN)</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            id="toggle-facturacion"
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={!!formData.modulo_facturacion_electronica}
                            onChange={() => handleToggleModulo('modulo_facturacion_electronica')}
                          />
                        </div>
                      </div>

                      {/* Toggle: Nómina */}
                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">
                          Nómina Electrónica <span className="text-500 fs--2">(Auto)</span>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            id="toggle-nomina"
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={!!formData.modulo_nomina}
                            onChange={() => handleToggleModulo('modulo_nomina')}
                          />
                        </div>
                      </div>

                      {/* ★ Toggle: POS e Inventarios — NUEVO ★ */}
                      <div className={`border rounded p-2 mb-1 d-flex justify-content-between align-items-center ${formData.modulo_pos_inventario ? 'border-primary bg-primary-subtle' : ''}`}>
                        <div className="fs--1">
                          <span className="fas fa-cash-register me-2 text-primary fs--2"></span>
                          POS e Inventarios
                          <div className="text-500 fs--2">Punto de venta multisede</div>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            id="toggle-pos-inventario"
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={!!formData.modulo_pos_inventario}
                            onChange={() => handleToggleModulo('modulo_pos_inventario')}
                          />
                        </div>
                      </div>

                      {/* Toggle: IA Copiloto */}
                      <div className="border rounded p-2 mb-1 d-flex justify-content-between align-items-center">
                        <div className="fs--1">
                          IA: Copiloto Financiero
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            id="toggle-ia-copiloto"
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={!!formData.modulo_ia_copiloto}
                            onChange={() => handleToggleModulo('modulo_ia_copiloto')}
                          />
                        </div>
                      </div>

                      {/* Toggle: Empresa Activa */}
                      <div className="mt-3 form-check form-switch bg-primary-subtle p-2 rounded d-flex align-items-center justify-content-between px-3">
                        <label className="form-check-label fw-bold text-primary fs--1 mb-0" htmlFor="isActive">
                          Empresa Activa
                        </label>
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          id="isActive"
                          name="is_active"
                          checked={!!formData.is_active}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button
                    id="btn-guardar-empresa"
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>
                      : <><span className="fas fa-save me-1"></span>{formData.id ? 'Actualizar Empresa' : 'Guardar Empresa'}</>
                    }
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

export default Tenants;
