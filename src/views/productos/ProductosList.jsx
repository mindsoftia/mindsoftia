import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import ProductoCreate from './ProductoCreate';
import Swal from 'sweetalert2';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
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

// ── Badge tipo producto ───────────────────────────────────────────────────────
function TipoBadge({ tipo }) {
  const map = { fisico: 'primary', servicio: 'success', digital: 'info', combo: 'warning' };
  const color = map[tipo?.toLowerCase()] || 'secondary';
  return <span className={`badge badge-soft-${color} fs--2`}>{tipo || 'fisico'}</span>;
}

// ── Modal Ver Detalle ─────────────────────────────────────────────────────────
function VerModal({ producto, onClose }) {
  if (!producto) return null;
  const p = producto;
  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-200 border-bottom-0 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar avatar-xl bg-primary text-white rounded-3 d-flex align-items-center justify-content-center fs-1 fw-bold" style={{ width: 56, height: 56 }}>
                {p.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{p.nombre}</h5>
                <span className="fs--1 text-500">{p.categoria?.nombre || 'Sin Categoría'} · SKU: {p.codigo_sku || '—'}</span>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body pt-4">
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="fs--1 text-uppercase text-500 mb-2">Datos Generales</h6>
                <table className="table table-sm fs--1 mb-0">
                  <tbody>
                    <tr><td className="text-600 fw-medium">SKU</td><td>{p.codigo_sku || '—'}</td></tr>
                    <tr><td className="text-600 fw-medium">Código de barras</td><td>{p.codigo_barras || '—'}</td></tr>
                    <tr><td className="text-600 fw-medium">Tipo</td><td><TipoBadge tipo={p.tipo} /></td></tr>
                    <tr><td className="text-600 fw-medium">Estado</td><td>
                      {p.estado !== false ? <span className="badge badge-soft-success">Activo</span> : <span className="badge badge-soft-danger">Inactivo</span>}
                    </td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="fs--1 text-uppercase text-500 mb-2">Precios &amp; Costos</h6>
                <table className="table table-sm fs--1 mb-0">
                  <tbody>
                    <tr><td className="text-600 fw-medium">Precio de venta</td><td className="fw-bold text-primary">$ {fmt(p.precio_venta_1)}</td></tr>
                    <tr><td className="text-600 fw-medium">Costo promedio</td><td>$ {fmt(p.costo_promedio)}</td></tr>
                    <tr><td className="text-600 fw-medium">IVA / Impuesto</td><td>{p.tarifa_impuesto || 0}%</td></tr>
                    <tr><td className="text-600 fw-medium">Stock actual</td><td>{fmt(p.stock_actual)} uds.</td></tr>
                  </tbody>
                </table>
              </div>
              {p.descripcion && (
                <div className="col-12">
                  <h6 className="fs--1 text-uppercase text-500 mb-1">Descripción</h6>
                  <p className="fs--1 text-700 mb-0">{p.descripcion}</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer bg-200 border-top-0">
            <button className="btn btn-sm btn-falcon-default" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vista TABLA (Falcon Style) ────────────────────────────────────────────────
function TablaProductos({ productos, onView, onEdit, onToggle, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover fs--1 mb-0 align-middle">
        <thead className="bg-200 text-uppercase text-600" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          <tr>
            <th style={{ width: 36 }}><input type="checkbox" className="form-check-input" /></th>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Tipo</th>
            <th className="text-end">Precio</th>
            <th className="text-end">Costo</th>
            <th className="text-center">IVA</th>
            <th className="text-center">Stock</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center py-5">
                <span className="fas fa-box-open fs-3 text-300 d-block mb-2" />
                <p className="text-500 mb-0">No hay productos en esta lista.</p>
              </td>
            </tr>
          ) : (
            productos.map(p => (
            <tr key={p.id}>
              <td><input type="checkbox" className="form-check-input" /></td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-s bg-soft-primary text-primary rounded-2 d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
                    {p.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-semibold text-900">{p.nombre}</span>
                </div>
              </td>
              <td><code className="fs--2">{p.codigo_sku || '—'}</code></td>
              <td><span className="fs--2 text-600">{p.categoria?.nombre || 'Sin Cat.'}</span></td>
              <td><TipoBadge tipo={p.tipo} /></td>
              <td className="text-end fw-bold text-primary">$ {fmt(p.precio_venta_1)}</td>
              <td className="text-end text-600">$ {fmt(p.costo_promedio)}</td>
              <td className="text-center"><span className="badge badge-soft-secondary">{p.tarifa_impuesto || 0}%</span></td>
              <td className="text-center">
                <span className={`fw-bold ${parseFloat(p.stock_actual) > 0 ? 'text-success' : 'text-danger'}`}>
                  {fmt(p.stock_actual)}
                </span>
              </td>
              <td className="text-center">
                {p.estado !== false
                  ? <span className="badge badge-soft-success">Activo</span>
                  : <span className="badge badge-soft-danger">Inactivo</span>}
              </td>
              <td className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" title="Ver detalle" onClick={() => onView(p)}>
                    <span className="fas fa-eye text-info" />
                  </button>
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" title="Editar" onClick={() => onEdit(p)}>
                    <span className="fas fa-pen text-warning" />
                  </button>
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" title={p.estado !== false ? 'Desactivar' : 'Activar'} onClick={() => onToggle(p)}>
                    <span className={`fas ${p.estado !== false ? 'fa-toggle-on text-success' : 'fa-toggle-off text-secondary'}`} />
                  </button>
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" title="Eliminar" onClick={() => onDelete(p)}>
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
  );
}

// ── Vista GRID (Cards) ────────────────────────────────────────────────────────
function GridProductos({ productos, onView, onEdit }) {
  return (
    <div className="row g-3">
      {productos.length === 0 ? (
        <div className="col-12 text-center py-5">
          <span className="fas fa-box-open fs-3 text-300 d-block mb-2" />
          <p className="text-500 mb-0">No hay productos en esta lista.</p>
        </div>
      ) : (
        productos.map(p => (
        <div key={p.id} className="col-sm-6 col-md-4 col-xl-3">
          <div className="card h-100 shadow-none border hover-shadow" style={{ transition: 'box-shadow .15s' }}>
            <div className="card-body p-3">
              <div className="text-center bg-light rounded mb-3 py-3">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle fw-bold fs-1" style={{ width: 64, height: 64 }}>
                  {p.nombre?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h6 className="fw-bold mb-1 text-truncate" title={p.nombre}>{p.nombre}</h6>
              <p className="fs--2 text-500 mb-2">{p.categoria?.nombre || 'Sin Categoría'}</p>
              <ul className="list-unstyled fs--2 text-600 mb-3">
                <li><span className="fas fa-barcode me-1 text-400" />{p.codigo_sku || '—'}</li>
                <li><span className="fas fa-tag me-1 text-400" /><TipoBadge tipo={p.tipo} /></li>
              </ul>
              <div className="d-flex justify-content-between align-items-end border-top pt-2 mt-2">
                <div>
                  <div className="fw-bold text-primary fs--1">$ {fmt(p.precio_venta_1)}</div>
                  <div className="fs--2 text-500">IVA {p.tarifa_impuesto || 0}%</div>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" onClick={() => onView(p)} title="Ver">
                    <span className="fas fa-eye text-info" />
                  </button>
                  <button className="btn btn-sm btn-falcon-default p-1 px-2" onClick={() => onEdit(p)} title="Editar">
                    <span className="fas fa-pen text-warning" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
    )}
    </div>
  );
}

// ── Pestaña Inventario ────────────────────────────────────────────────────────
function TabInventario({ productos }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover fs--1 mb-0 align-middle">
        <thead className="bg-200 text-uppercase text-600" style={{ fontSize: '0.7rem' }}>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th className="text-center">Stock Actual</th>
            <th className="text-center">Stock Mín.</th>
            <th className="text-center">Stock Máx.</th>
            <th className="text-center">Alerta</th>
            <th className="text-end">Costo Prom.</th>
          </tr>
        </thead>
        <tbody>
          {productos.filter(p => p.estado !== false).map(p => {
            const stock = parseFloat(p.stock_actual || 0);
            const min = parseFloat(p.stock_minimo || 0);
            const alerta = min > 0 && stock <= min;
            return (
              <tr key={p.id}>
                <td className="fw-semibold text-900">{p.nombre}</td>
                <td><code className="fs--2">{p.codigo_sku || '—'}</code></td>
                <td className="text-center fw-bold">{fmt(p.stock_actual)}</td>
                <td className="text-center text-600">{fmt(p.stock_minimo)}</td>
                <td className="text-center text-600">{fmt(p.stock_maximo)}</td>
                <td className="text-center">
                  {alerta
                    ? <span className="badge badge-soft-danger"><span className="fas fa-exclamation-triangle me-1" />Bajo</span>
                    : <span className="badge badge-soft-success">OK</span>}
                </td>
                <td className="text-end">$ {fmt(p.costo_promedio)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function ProductosList() {
  const { tenantId } = useAuthStore();
  const [productos, setProductos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState('table');   // 'table' | 'grid'
  const [activeTab, setActiveTab]   = useState('activos'); // 'activos' | 'inactivos' | 'inventario'
  const [search, setSearch]         = useState('');

  // Modals
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [editItem,        setEditItem]        = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [verModal,        setVerModal]        = useState(null);
  const [importing, setImporting] = useState(false);
  const [file, setFile]           = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchProductos = async () => {
    setLoading(true);
    const tid = tenantId || getTenantId();
    try {
      const res = await api.get('/inventario/productos', {
        headers: { 'X-Tenant-ID': tid ?? '' }
      });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar productos:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  // ── Toggle Estado ────────────────────────────────────────────────────────────
  const handleToggle = async (p) => {
    if (!window.confirm(`¿Deseas ${p.estado !== false ? 'desactivar' : 'activar'} "${p.nombre}"?`)) return;
    try {
      await api.put(`/inventario/productos/${p.id}`, { activo: p.estado === false });
      setProductos(prev => prev.map(item => item.id === p.id ? { ...item, estado: p.estado === false } : item));
      Toast.fire({ icon: 'success', title: 'Estado actualizado' });
    } catch (err) {
      alert('Error al cambiar estado: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar permanentemente "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/inventario/productos/${p.id}`);
      setProductos(prev => prev.filter(item => item.id !== p.id));
      Toast.fire({ icon: 'success', title: 'Producto eliminado' });
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Import CSV ───────────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/inventario/productos/import', formData, {
        headers: { 'X-Tenant-ID': tenantId || getTenantId(), 'Content-Type': 'multipart/form-data' }
      });
      Toast.fire({ icon: 'success', title: res.data.message || 'Importación exitosa' });
      setShowImportModal(false);
      setFile(null);
      fetchProductos();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const filtered = productos
    .filter(p => activeTab === 'inactivos' ? p.estado === false : p.estado !== false)
    .filter(p => !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.codigo_sku?.toLowerCase().includes(search.toLowerCase()));

  const actCount   = productos.filter(p => p.estado !== false).length;
  const inactCount = productos.filter(p => p.estado === false).length;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F9FAFD', minHeight: '100vh' }}>

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold">Catálogo de Productos</h4>
          <p className="text-500 fs--1 mb-0">{actCount} activos · {inactCount} inactivos</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-falcon-default btn-sm" onClick={() => setShowImportModal(true)}>
            <span className="fas fa-file-import me-1 text-success" /> Importar CSV
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
                { key: 'activos',     label: 'Activos',    count: actCount },
                { key: 'inactivos',   label: 'Inactivos',  count: inactCount },
                { key: 'inventario',  label: 'Inventario', count: null },
              ].map(tab => (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link border-0 fw-semibold fs--1 pb-2 ${activeTab === tab.key ? 'active text-primary' : 'text-600'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`badge ms-1 rounded-pill ${activeTab === tab.key ? 'bg-primary' : 'bg-200 text-700'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Controles */}
            <div className="d-flex align-items-center gap-2 pb-2">
              <div className="input-group input-group-sm" style={{ width: 200 }}>
                <span className="input-group-text bg-white border-end-0"><span className="fas fa-search text-400" /></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {activeTab !== 'inventario' && (
                <div className="btn-group btn-group-sm">
                  <button className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-falcon-default'}`} onClick={() => setViewMode('table')} title="Vista tabla">
                    <span className="fas fa-table" />
                  </button>
                  <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-falcon-default'}`} onClick={() => setViewMode('grid')} title="Vista tarjetas">
                    <span className="fas fa-th" />
                  </button>
                </div>
              )}
              <button className="btn btn-sm btn-falcon-default" onClick={fetchProductos} title="Actualizar">
                <span className="fas fa-sync-alt" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-500 fs--1">Cargando catálogo...</p>
            </div>
          ) : activeTab === 'inventario' ? (
            <TabInventario productos={productos} />
          ) : viewMode === 'table' ? (
            <TablaProductos
              productos={filtered}
              onView={setVerModal}
              onEdit={(p) => setEditItem(p)}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-3">
              <GridProductos
                productos={filtered}
                onView={setVerModal}
                onEdit={(p) => setEditItem(p)}
              />
            </div>
          )}
        </div>

        {/* Footer paginación (preparado) */}
        {!loading && activeTab !== 'inventario' && (
          <div className="card-footer bg-light border-top py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="fs--1 text-500">Mostrando {filtered.length} de {productos.length} productos</span>
          </div>
        )}
      </div>

      {/* ── Modal Ver Detalle ───────────────────────────────────────── */}
      {verModal && <VerModal producto={verModal} onClose={() => setVerModal(null)} />}

      {/* ── Modal Importar CSV ─────────────────────────────────────── */}
      {showImportModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title"><span className="fas fa-file-csv me-2 text-primary" />Importar Productos</h5>
                <button className="btn-close" onClick={() => setShowImportModal(false)} />
              </div>
              <form onSubmit={handleImport}>
                <div className="modal-body">
                  <div className="alert alert-soft-info fs--1 mb-3 py-2">
                    <strong>Columnas requeridas:</strong> <code>nombre, codigo_sku, codigo_barras, precio_venta, costo_promedio, tarifa_impuesto, tipo</code>
                  </div>
                  <input className="form-control" type="file" accept=".csv,.txt" ref={fileInputRef}
                    onChange={e => setFile(e.target.files[0])} required />
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-falcon-default" onClick={() => setShowImportModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-sm btn-primary px-4" disabled={!file || importing}>
                    {importing ? <span className="spinner-border spinner-border-sm me-1" /> : <span className="fas fa-upload me-1" />}
                    Importar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear / Editar Producto ─────────────────────────────── */}
      {(showAddModal || editItem) && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)', zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0">
              <ProductoCreate
                initialData={editItem}
                onClose={() => { setShowAddModal(false); setEditItem(null); }}
                onSuccess={(savedProduct) => { 
                  setShowAddModal(false); 
                  setEditItem(null); 
                  if (editItem) {
                    setProductos(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                  } else {
                    setProductos(prev => [...prev, savedProduct]);
                  }
                  Toast.fire({ icon: 'success', title: editItem ? 'Producto actualizado' : 'Producto guardado exitosamente' }); 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────── */}
      <button
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
        style={{ position: 'fixed', bottom: 30, right: 30, width: 56, height: 56, zIndex: 1050 }}
        onClick={() => setShowAddModal(true)}
        title="Nuevo producto"
      >
        <span className="fas fa-plus fs-1" />
      </button>

    </div>
  );
}
