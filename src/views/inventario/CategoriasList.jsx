import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Swal from 'sweetalert2';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getTenantId = () => {
  const s = useAuthStore.getState();
  if (s.tenantId) return s.tenantId;
  const m = s.user?.app_metadata;
  return m?.empresa_id ?? m?.tenant_id ?? '';
};

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// ── Componente Principal ──────────────────────────────────────────────────────
export default function CategoriasList() {
  const { tenantId } = useAuthStore();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('activas'); // 'activas' | 'inactivas'
  const [search, setSearch]         = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving]       = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cuenta_contable_ingreso: '',
    cuenta_contable_costo: '',
    cuenta_contable_inventario: ''
  });

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchCategorias = async () => {
    setLoading(true);
    const tid = tenantId || getTenantId();
    try {
      const res = await api.get('/inventario/categorias', {
        headers: { 'X-Tenant-ID': tid ?? '' }
      });
      setCategorias(Array.isArray(res.data?.categorias) ? res.data.categorias : []);
    } catch (err) {
      console.error('Error al cargar categorias:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleToggle = async (c) => {
    if (!window.confirm(`¿Deseas ${c.estado !== false ? 'desactivar' : 'activar'} la categoría "${c.nombre}"?`)) return;
    try {
      await api.put(`/inventario/categorias/${c.id}`, { estado: c.estado === false });
      setCategorias(prev => prev.map(item => item.id === c.id ? { ...item, estado: c.estado === false } : item));
      Toast.fire({ icon: 'success', title: 'Estado actualizado' });
    } catch (err) {
      alert('Error al cambiar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Eliminar permanentemente "${c.nombre}"? No se puede deshacer.`)) return;
    try {
      await api.delete(`/inventario/categorias/${c.id}`);
      setCategorias(prev => prev.filter(item => item.id !== c.id));
      Toast.fire({ icon: 'success', title: 'Categoría eliminada' });
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    }
  };

  const openNewModal = () => {
    setFormData({ nombre: '', descripcion: '', cuenta_contable_ingreso: '', cuenta_contable_costo: '', cuenta_contable_inventario: '' });
    setCurrentId(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (c) => {
    setFormData({
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      cuenta_contable_ingreso: c.cuenta_contable_ingreso || '',
      cuenta_contable_costo: c.cuenta_contable_costo || '',
      cuenta_contable_inventario: c.cuenta_contable_inventario || ''
    });
    setCurrentId(c.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const tid = tenantId || getTenantId();
    try {
      if (isEditing) {
        const res = await api.put(`/inventario/categorias/${currentId}`, formData, { headers: { 'X-Tenant-ID': tid }});
        setCategorias(prev => prev.map(item => item.id === currentId ? res.data.categoria : item));
        Toast.fire({ icon: 'success', title: 'Categoría actualizada' });
      } else {
        const res = await api.post('/inventario/categorias', formData, { headers: { 'X-Tenant-ID': tid }});
        setCategorias(prev => [...prev, res.data.categoria]);
        Toast.fire({ icon: 'success', title: 'Categoría creada' });
      }
      setShowModal(false);
    } catch (err) {
      alert('Error al guardar: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const filtered = categorias
    .filter(c => activeTab === 'inactivas' ? c.estado === false : c.estado !== false)
    .filter(c => !search || c.nombre?.toLowerCase().includes(search.toLowerCase()));

  const actCount   = categorias.filter(c => c.estado !== false).length;
  const inactCount = categorias.filter(c => c.estado === false).length;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F9FAFD', minHeight: '100vh' }}>

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold">Catálogo de Familias y Categorías</h4>
          <p className="text-500 fs--1 mb-0">{actCount} activas · {inactCount} inactivas</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary btn-sm" onClick={openNewModal}>
            <span className="fas fa-plus me-1" /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* ── Card principal ────────────────────────────────────────── */}
      <div className="card shadow-none border">

        {/* Tabs + controles */}
        <div className="card-header bg-light border-bottom p-0">
          <div className="d-flex align-items-center justify-content-between flex-wrap px-3 pt-2 gap-2">
            {/* Tabs */}
            <ul className="nav nav-tabs border-0 mb-0 gap-1">
              {[
                { key: 'activas',     label: 'Activas',    count: actCount },
                { key: 'inactivas',   label: 'Inactivas',  count: inactCount },
              ].map(tab => (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link border-0 fw-semibold fs--1 pb-2 ${activeTab === tab.key ? 'active text-primary' : 'text-600'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    <span className={`badge ms-1 rounded-pill ${activeTab === tab.key ? 'bg-primary' : 'bg-200 text-700'}`}>
                      {tab.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Controles */}
            <div className="d-flex align-items-center gap-2 pb-2">
              <div className="input-group input-group-sm" style={{ width: 250 }}>
                <span className="input-group-text bg-white border-end-0"><span className="fas fa-search text-400" /></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar categoría..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-sm btn-falcon-default" onClick={fetchCategorias} title="Actualizar">
                <span className="fas fa-sync-alt" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover fs--1 mb-0 align-middle">
              <thead className="bg-200 text-uppercase text-600" style={{ fontSize: '0.7rem' }}>
                <tr>
                  <th>Nombre de Familia</th>
                  <th>Descripción</th>
                  <th>Cta. Ingreso</th>
                  <th>Cta. Costo</th>
                  <th>Cta. Inventario</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="mt-2 text-500 fs--1 mb-0">Cargando categorías...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <span className="fas fa-layer-group fs-3 text-300 d-block mb-2" />
                      <p className="text-500 mb-0">No se encontraron categorías en esta lista.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <tr key={c.id}>
                      <td className="fw-semibold text-900">{c.nombre}</td>
                      <td>{c.descripcion || <span className="text-400">—</span>}</td>
                      <td>
                        {c.cuenta_contable_ingreso 
                          ? <span className="badge badge-soft-success">{c.cuenta_contable_ingreso}</span>
                          : <span className="text-400">—</span>}
                      </td>
                      <td>
                        {c.cuenta_contable_costo 
                          ? <span className="badge badge-soft-danger">{c.cuenta_contable_costo}</span>
                          : <span className="text-400">—</span>}
                      </td>
                      <td>
                        {c.cuenta_contable_inventario 
                          ? <span className="badge badge-soft-info">{c.cuenta_contable_inventario}</span>
                          : <span className="text-400">—</span>}
                      </td>
                      <td className="text-center">
                        {c.estado !== false
                          ? <span className="badge badge-soft-success">Activa</span>
                          : <span className="badge badge-soft-danger">Inactiva</span>}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-falcon-default p-1 px-2" title="Editar" onClick={() => handleEdit(c)}>
                            <span className="fas fa-pen text-warning" />
                          </button>
                          <button className="btn btn-sm btn-falcon-default p-1 px-2" title={c.estado !== false ? 'Desactivar' : 'Activar'} onClick={() => handleToggle(c)}>
                            <span className={`fas ${c.estado !== false ? 'fa-toggle-on text-success' : 'fa-toggle-off text-secondary'}`} />
                          </button>
                          <button className="btn btn-sm btn-falcon-default p-1 px-2" title="Eliminar" onClick={() => handleDelete(c)}>
                            <span className="fas fa-trash-alt text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="card-footer bg-light border-top py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="fs--1 text-500">Mostrando {filtered.length} de {categorias.length} categorías</span>
          </div>
        )}
      </div>

      {/* ── Modal Form ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title"><span className={`fas ${isEditing ? 'fa-pen text-warning' : 'fa-plus text-primary'} me-2`} />{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre de la Familia / Categoría</label>
                    <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej. Lácteos, Electrodomésticos" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" name="descripcion" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows="2" />
                  </div>
                  <hr className="my-3" />
                  <h6 className="fs--1 text-600 mb-2">Integración Contable (Opcional)</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label fs--1">Cta. Ingreso (PUC)</label>
                      <input type="text" className="form-control form-control-sm" name="cuenta_contable_ingreso" value={formData.cuenta_contable_ingreso} onChange={e => setFormData({...formData, cuenta_contable_ingreso: e.target.value})} placeholder="Ej. 4135" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs--1">Cta. Costo (PUC)</label>
                      <input type="text" className="form-control form-control-sm" name="cuenta_contable_costo" value={formData.cuenta_contable_costo} onChange={e => setFormData({...formData, cuenta_contable_costo: e.target.value})} placeholder="Ej. 6135" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs--1">Cta. Inventario (PUC)</label>
                      <input type="text" className="form-control form-control-sm" name="cuenta_contable_inventario" value={formData.cuenta_contable_inventario} onChange={e => setFormData({...formData, cuenta_contable_inventario: e.target.value})} placeholder="Ej. 1435" />
                    </div>
                  </div>
                  <div className="mt-2 text-muted fs--2">
                    <span className="fas fa-info-circle me-1" />
                    Asignar el PUC permitirá que el Motor Contable Invisible genere los comprobantes diarios automáticamente por cada venta.
                  </div>
                </div>
                <div className="modal-footer bg-light border-top-0">
                  <button type="button" className="btn btn-sm btn-falcon-default" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-sm btn-primary px-4" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <span className="fas fa-save me-1" />}
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────── */}
      <button
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
        style={{ position: 'fixed', bottom: 30, right: 30, width: 56, height: 56, zIndex: 1050 }}
        onClick={openNewModal}
        title="Nueva Categoría"
      >
        <span className="fas fa-plus fs-1" />
      </button>

    </div>
  );
}
