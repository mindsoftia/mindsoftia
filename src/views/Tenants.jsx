import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Instancia Axios centralizada con token
import { supabase } from '../services/supabase';

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
  has_eds_module: false,
};

function Tenants() {
  const [empresas, setEmpresas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [formData, setFormData]     = useState(FORM_INICIAL);
  
  // ── Estados para filtros y vista ──────────────────────────────────
  const [viewMode, setViewMode]     = useState('table'); // 'table' o 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Cargar empresas desde la API con fallback a Supabase ──────────
  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      let lista = [];
      try {
        const { data } = await api.get('/empresas');
        lista = Array.isArray(data) ? data : data.data ?? [];
      } catch (errApi) {
        console.warn('Fallback a Supabase directo tras error en API Laravel:', errApi);
      }
      
      if (!lista || lista.length === 0) {
        const { data: supaData, error: supaErr } = await supabase.from('empresas').select('*').order('id', { ascending: false });
        if (!supaErr && supaData) {
          lista = supaData;
        }
      }
      setEmpresas(lista || []);
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
    if (empresa.has_eds_module)                 activos.push({ label: 'EDS', color: 'badge-subtle-danger' });
    if (activos.length === 0) return <span className="text-400 fs--2">Base</span>;
    return activos.map(m => (
      <span key={m.label} className={`badge ${m.color} me-1`}>{m.label}</span>
    ));
  };

  // ── Filtrado de empresas ──────────────────────────────────────────
  const filteredEmpresas = empresas.filter(emp => {
    const matchesSearch = emp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.subdominio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.ruc_nit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' 
                          ? true 
                          : filterStatus === 'active' 
                            ? !!emp.is_active 
                            : !emp.is_active;
                            
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* ── Encabezado y Filtros ────────────────────────────────────── */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body p-3">
          <div className="row flex-between-center g-3">
            <div className="col-12 col-md-auto">
              <h5 className="mb-0 d-flex align-items-center">
                Gestión de Empresas <span className="badge badge-soft-primary ms-2">{filteredEmpresas.length}</span>
              </h5>
            </div>
            <div className="col-12 col-md-auto d-flex flex-wrap align-items-center gap-2">
              <div className="search-box position-relative" style={{ width: '220px' }}>
                <input 
                  className="form-control form-control-sm search-input ps-4" 
                  type="search" 
                  placeholder="Buscar nombre o NIT..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="fas fa-search search-box-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-400 fs--2"></span>
              </div>
              <select 
                className="form-select form-select-sm w-auto cursor-pointer" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
              
              <div className="btn-group btn-group-sm ms-1" role="group">
                <button 
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setViewMode('table')}
                  title="Vista Tabla"
                >
                  <span className="fas fa-list"></span>
                </button>
                <button 
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setViewMode('grid')}
                  title="Vista Tarjetas (Compacta)"
                >
                  <span className="fas fa-th"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Vista Condicional (Tabla o Grid) ────────────────────────── */}
      {viewMode === 'table' ? (
        <div className="card shadow-sm border-0">
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
                      Cargando empresas...
                    </td>
                  </tr>
                ) : filteredEmpresas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-400">
                      <span className="fas fa-building fa-2x mb-3 d-block text-300"></span>
                      No se encontraron empresas con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="align-middle fw-semi-bold">{empresa.nombre}</td>
                      <td className="align-middle text-primary fw-semi-bold">
                        <span className="fas fa-link me-1 text-400" style={{ fontSize: '0.7rem' }}></span>
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
                        <span className={`badge ${empresa.is_active ? 'badge-soft-success' : 'badge-soft-secondary'} rounded-pill`}>
                          {empresa.is_active ? 'Activa' : 'Inactiva'}
                        </span>
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
      ) : (
        <div className="row g-2">
          {loading ? (
            <div className="col-12 text-center py-5">
              <span className="spinner-border text-primary"></span>
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="col-12 text-center py-5 text-400 bg-white rounded border">
              <span className="fas fa-building fa-2x mb-3 d-block text-300"></span>
              No se encontraron empresas con los filtros actuales.
            </div>
          ) : (
            filteredEmpresas.map((empresa) => (
              <div key={empresa.id} className="col-6 col-sm-4 col-md-3 col-xl-2">
                <div className="card shadow-sm border-0 h-100 hover-shadow transition-base">
                  <div className="card-body p-3 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="avatar avatar-l bg-soft-primary text-primary rounded-circle fw-bold d-flex justify-content-center align-items-center">
                        {empresa.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-link btn-sm text-500 p-0 shadow-none" type="button" data-bs-toggle="dropdown">
                          <span className="fas fa-ellipsis-h fs--1"></span>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end py-2">
                          <button className="dropdown-item text-primary" onClick={() => abrirModal(empresa)}>Editar</button>
                          <div className="dropdown-divider"></div>
                          <button className="dropdown-item text-danger">Eliminar</button>
                        </div>
                      </div>
                    </div>
                    
                    <h6 className="mb-1 text-800 text-truncate" title={empresa.nombre}>{empresa.nombre}</h6>
                    <div className="fs--2 text-primary mb-2 text-truncate">
                      <span className="fas fa-link me-1 text-400"></span>
                      {empresa.subdominio || '-'}
                    </div>
                    
                    <div className="mt-auto pt-2 border-top border-200">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${empresa.is_active ? 'badge-soft-success' : 'badge-soft-secondary'} rounded-pill fs--2`}>
                          {empresa.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <div className="d-flex flex-wrap gap-1 justify-content-end">
                          {empresa.modulo_facturacion_electronica && <span className="fas fa-file-invoice-dollar text-success fs--2" title="DIAN"></span>}
                          {empresa.modulo_pos_inventario && <span className="fas fa-cash-register text-primary fs--2" title="POS"></span>}
                          {empresa.modulo_nomina && <span className="fas fa-users text-warning fs--2" title="Nómina"></span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── BOTÓN FLOTANTE (FAB) PARA NUEVA EMPRESA ── */}
      <button 
        id="btn-nueva-empresa-fab"
        className="btn btn-primary rounded-circle shadow-lg position-fixed d-flex justify-content-center align-items-center hover-shadow transition-base"
        style={{ bottom: '2rem', right: '2rem', width: '64px', height: '64px', zIndex: 1040 }}
        onClick={() => abrirModal()}
        title="Crear Nueva Empresa"
      >
        <span className="fas fa-plus fs-2"></span>
      </button>

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

                      {/* ★ Toggle: Módulo EDS ★ */}
                      <div className={`border rounded p-2 mb-1 d-flex justify-content-between align-items-center ${formData.has_eds_module ? 'border-danger bg-danger-subtle' : ''}`}>
                        <div className="fs--1">
                          <span className="fas fa-gas-pump me-2 text-danger fs--2"></span>
                          Estación de Servicio (EDS)
                          <div className="text-500 fs--2">Surtidores y Turnos Volumétricos</div>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            id="toggle-eds-module"
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={!!formData.has_eds_module}
                            onChange={() => handleToggleModulo('has_eds_module')}
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
