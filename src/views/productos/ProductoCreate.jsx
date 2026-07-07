import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

export default function ProductoCreate() {
  const navigate = useNavigate();
  const { tenantId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_sku: '',
    codigo_barras: '',
    descripcion: '',
    categoria_id: '',
    precio_venta: '',
    costo_promedio: '',
    tarifa_impuesto: '',
    stock_minimo: '',
    stock_maximo: '',
    etiquetas: '',
    tipo: 'fisico'
  });

  useEffect(() => {
    // Cargar categorías (simulado, pero debería venir de la API o Dexie si es offline first)
    const fetchCategorias = async () => {
      // Por ahora asumo que usamos la API para traelas si estamos online
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventario/categorias`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCategorias(data.categorias || []);
        }
      } catch (err) {
        console.error('Error cargando categorías', err);
      }
    };
    if (tenantId) fetchCategorias();
  }, [tenantId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        empresa_id: tenantId,
        nombre: formData.nombre,
        codigo_sku: formData.codigo_sku,
        codigo_barras: formData.codigo_barras,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria_id || null,
        precio_venta: parseFloat(formData.precio_venta || 0),
        costo_promedio: parseFloat(formData.costo_promedio || 0),
        tarifa_impuesto: parseFloat(formData.tarifa_impuesto || 0),
        stock_minimo: parseFloat(formData.stock_minimo || 0),
        stock_maximo: parseFloat(formData.stock_maximo || 0),
        etiquetas: formData.etiquetas ? formData.etiquetas.split(',').map(t => t.trim()) : [],
        tipo: formData.tipo
      };

      const { error } = await supabase.from('inv_productos').insert([payload]);
      if (error) throw error;
      
      navigate('/productos'); // Redirigir a la lista de productos
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F9FAFD', minHeight: '100vh' }}>
      
      {/* Top Header - Falcon Style */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body">
          <div className="row flex-between-center">
            <div className="col-md">
              <h5 className="mb-2 mb-md-0 fw-bold">Add a product</h5>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-link text-secondary fw-semi-bold me-2 text-decoration-none"
                onClick={() => navigate('/productos')}
              >
                Discard
              </button>
              <button 
                className="btn btn-primary btn-sm px-4" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Add product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column */}
        <div className="col-lg-8 pe-lg-2">
          
          {/* Basic Information Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Basic information</h6>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semi-bold fs--1">Product name:</label>
                  <input type="text" className="form-control form-control-sm" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Enter product name" />
                </div>
                <div className="row mb-3 g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semi-bold fs--1">Product Identification No. (SKU):</label>
                    <input type="text" className="form-control form-control-sm" name="codigo_sku" value={formData.codigo_sku} onChange={handleChange} placeholder="SKU-12345" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semi-bold fs--1">Barcode (EAN/UPC):</label>
                    <input type="text" className="form-control form-control-sm" name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} placeholder="770123456789" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semi-bold fs--1">Product Summary:</label>
                  <textarea className="form-control form-control-sm" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} placeholder="Brief summary of the product..."></textarea>
                </div>
              </form>
            </div>
          </div>

          {/* Add Images Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Add images</h6>
            </div>
            <div className="card-body text-center py-5">
              <div className="border-dashed border-2 border-300 rounded-2 py-4 bg-100" style={{ borderStyle: 'dashed' }}>
                <span className="fas fa-cloud-upload-alt text-400 fs-3 mb-2"></span>
                <p className="fs--1 text-600 mb-0">Drag your image here<br />or, <span className="text-primary cursor-pointer">Browse</span></p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Details</h6>
            </div>
            <div className="card-body">
              <label className="form-label fw-semi-bold fs--1">Product description:</label>
              {/* Fake WYSIWYG Editor Toolbar */}
              <div className="border rounded-top p-2 bg-light d-flex gap-2 text-500">
                <span className="fas fa-bold cursor-pointer"></span>
                <span className="fas fa-italic cursor-pointer"></span>
                <span className="fas fa-link cursor-pointer"></span>
                <span className="fas fa-list-ul cursor-pointer"></span>
                <span className="fas fa-image cursor-pointer"></span>
              </div>
              <textarea className="form-control border-top-0 rounded-bottom" rows="5" placeholder="Detailed product description..."></textarea>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4 ps-lg-2">
          
          {/* Type / Category Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Type</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semi-bold fs--1">Select category:</label>
                <select className="form-select form-select-sm" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                  <option value="">Select</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semi-bold fs--1">Product Type:</label>
                <select className="form-select form-select-sm" name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="fisico">Physical Product</option>
                  <option value="servicio">Service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Tags</h6>
            </div>
            <div className="card-body">
              <label className="form-label fw-semi-bold fs--1">Add a keyword:</label>
              <input type="text" className="form-control form-control-sm" name="etiquetas" value={formData.etiquetas} onChange={handleChange} placeholder="tag1, tag2, tag3" />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Pricing & Inventory</h6>
            </div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Base Price:</label>
                  <input type="number" className="form-control form-control-sm" name="precio_venta" value={formData.precio_venta} onChange={handleChange} placeholder="$0.00" />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Average Cost:</label>
                  <input type="number" className="form-control form-control-sm" name="costo_promedio" value={formData.costo_promedio} onChange={handleChange} placeholder="$0.00" />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-12">
                  <label className="form-label fw-semi-bold fs--1">Tax Rate (%):</label>
                  <input type="number" className="form-control form-control-sm" name="tarifa_impuesto" value={formData.tarifa_impuesto} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>
              <hr className="my-3 border-300" />
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Min Stock:</label>
                  <input type="number" className="form-control form-control-sm" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} placeholder="0" />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Max Stock:</label>
                  <input type="number" className="form-control form-control-sm" name="stock_maximo" value={formData.stock_maximo} onChange={handleChange} placeholder="0" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
