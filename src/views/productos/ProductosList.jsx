import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import ProductoCreate from './ProductoCreate';

export default function ProductosList() {
  const navigate = useNavigate();
  const { tenantId } = useAuthStore();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventario/productos', {
        headers: { 'X-Tenant-ID': tenantId }
      });
      setProductos(response.data);
    } catch (err) {
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchProductos();
  }, [tenantId]);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/inventario/productos/import', formData, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(response.data.message || 'Importación exitosa');
      setShowImportModal(false);
      setFile(null);
      fetchProductos(); // Recargar lista
    } catch (err) {
      console.error('Error importing CSV:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Ocurrió un problema en la importación';
      alert('Error: ' + errorMsg);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F9FAFD', minHeight: '100vh' }}>
      
      {/* Header Actions */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body p-3">
          <div className="row flex-between-center">
            <div className="col-sm-auto mb-2 mb-sm-0">
              <h5 className="mb-0 fw-bold">Catálogo de Productos</h5>
            </div>
            <div className="col-sm-auto">
              <div className="d-flex align-items-center justify-content-sm-end gap-2">
                <button 
                  className="btn btn-falcon-default btn-sm px-3" 
                  onClick={() => setShowImportModal(true)}
                >
                  <span className="fas fa-file-import me-1 text-success"></span> Importar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body p-3">
          <div className="row flex-between-center g-3">
            <div className="col-auto">
              <div className="d-flex align-items-center">
                <select className="form-select form-select-sm me-2" style={{ width: '70px' }}>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="fs--1 text-600">Mostrando 1-{productos.length} de {productos.length} Productos</span>
              </div>
            </div>
            <div className="col-auto d-flex align-items-center">
              <span className="fs--1 text-600 me-2">Ordenar por:</span>
              <select className="form-select form-select-sm me-2" style={{ width: '120px' }}>
                <option>Precio</option>
                <option>Nombre</option>
                <option>Stock</option>
              </select>
              <button className="btn btn-sm btn-falcon-default me-2"><span className="fas fa-sort-amount-up"></span></button>
              
              <div className="btn-group" role="group">
                <button 
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-falcon-default'}`} 
                  onClick={() => setViewMode('list')}
                >
                  <span className="fas fa-list"></span>
                </button>
                <button 
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-falcon-default'}`} 
                  onClick={() => setViewMode('grid')}
                >
                  <span className="fas fa-th"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product List / Grid */}
      <div className={viewMode === 'list' ? '' : 'row g-3'}>
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-600">Cargando catálogo...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h5 className="text-600">No se encontraron productos</h5>
            <p className="text-500">Comienza creando un nuevo producto o importando un CSV.</p>
          </div>
        ) : (
          productos.map(p => (
            <div key={p.id} className={viewMode === 'list' ? 'card mb-3 shadow-none border' : 'col-md-6 col-lg-4'}>
              <div className={viewMode === 'list' ? 'card-body p-0' : 'card h-100 shadow-none border'}>
                <div className={viewMode === 'list' ? 'row g-0 align-items-center p-3' : 'p-3'}>
                  
                  {/* Image Area */}
                  <div className={viewMode === 'list' ? 'col-md-3 col-lg-2 text-center' : 'mb-3 text-center bg-light rounded'}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=random&size=150`} 
                      alt={p.nombre} 
                      className="img-fluid rounded" 
                      style={{ maxHeight: viewMode === 'list' ? '120px' : '200px', objectFit: 'contain' }}
                    />
                  </div>
                  
                  {/* Info Area */}
                  <div className={viewMode === 'list' ? 'col-md-6 col-lg-7 px-md-3 mt-3 mt-md-0' : ''}>
                    <h5 className="fs-0 fw-bold mb-1">
                      <a href="#!" className="text-dark text-decoration-none">{p.nombre}</a>
                    </h5>
                    <p className="fs--1 text-500 mb-2">{p.categoria ? p.categoria.nombre : 'Sin Categoría'}</p>
                    <ul className="list-unstyled fs--1 mb-0 text-600">
                      <li>• SKU: {p.codigo_sku || '-'}</li>
                      <li>• Barcode: {p.codigo_barras || '-'}</li>
                      <li>• Tipo: <span className="text-capitalize">{p.tipo}</span></li>
                    </ul>
                  </div>

                  {/* Price & Action Area */}
                  <div className={viewMode === 'list' ? 'col-md-3 col-lg-3 mt-3 mt-md-0 border-start-md ps-md-3' : 'mt-3 border-top pt-3'}>
                    <div className="d-flex flex-md-column flex-row justify-content-between align-items-md-start">
                      <div>
                        <h4 className="fw-bold text-primary mb-0">${parseFloat(p.precio_venta).toLocaleString('es-CO')}</h4>
                        {p.tarifa_impuesto > 0 && <span className="fs--2 text-500 text-decoration-line-through">${(parseFloat(p.precio_venta) * (1 + p.tarifa_impuesto/100)).toLocaleString('es-CO')} c/IVA</span>}
                        <div className="fs--1 mt-1">
                          Impuesto: <span className="text-900">{p.tarifa_impuesto}%</span>
                        </div>
                        <div className="fs--1 mt-1">
                          Stock: <span className={p.stock_minimo > 0 ? "text-success fw-semi-bold" : "text-danger fw-semi-bold"}>{p.stock_minimo > 0 ? 'Disponible' : 'Agotado'}</span>
                        </div>
                      </div>
                      <div className={viewMode === 'list' ? 'mt-md-3' : 'mt-3 w-100'}>
                        <button className="btn btn-sm btn-falcon-default w-100 mb-2">
                          <span className="far fa-edit me-2"></span>Editar
                        </button>
                        <button className="btn btn-sm btn-primary w-100">
                          <span className="fas fa-list-alt me-2"></span>Ver Detalle
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title"><span className="fas fa-file-csv me-2 text-primary"></span>Importar Productos</h5>
                <button type="button" className="btn-close" onClick={() => setShowImportModal(false)}></button>
              </div>
              <form onSubmit={handleImport}>
                <div className="modal-body">
                  <p className="fs--1 text-600">Sube un archivo CSV delimitado por comas. Asegúrate de incluir las cabeceras requeridas: <code>nombre, codigo_sku, codigo_barras, precio_venta, costo_promedio, tarifa_impuesto, tipo</code>.</p>
                  
                  <div className="mb-3">
                    <input 
                      className="form-control" 
                      type="file" 
                      accept=".csv, .txt" 
                      ref={fileInputRef}
                      onChange={(e) => setFile(e.target.files[0])}
                      required
                    />
                  </div>
                  
                  <a href="#!" className="fs--1">Descargar plantilla CSV de ejemplo</a>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={!file || importing}>
                    {importing ? <span className="spinner-border spinner-border-sm me-2"></span> : <span className="fas fa-upload me-2"></span>}
                    Importar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal (Replaces separate page route) */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)', zIndex: 1055, overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0">
               <ProductoCreate 
                 onClose={() => setShowAddModal(false)}
                 onSuccess={() => { setShowAddModal(false); fetchProductos(); }}
               />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center" 
        style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }}
        onClick={() => setShowAddModal(true)}
      >
        <span className="fas fa-plus fs-2"></span>
      </button>

    </div>
  );
}
