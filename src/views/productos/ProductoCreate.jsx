import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { StorageService } from '../../services/storage.service';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function ProductoCreate({ onClose, onSuccess, initialData }) {
  const navigate = useNavigate();
  const { tenantId } = useAuthStore();
  const [categorias, setCategorias] = useState([]);
  const [moneda, setMoneda] = useState('$');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imagen_url || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState(initialData ? {
    nombre: initialData.nombre || '',
    codigo_sku: initialData.codigo_sku || '',
    codigo_barras: initialData.codigo_barras || '',
    descripcion: initialData.descripcion || '',
    categoria_id: initialData.categoria_id || '',
    precio_venta_1: initialData.precio_venta_1 || '',
    costo_promedio: initialData.costo_promedio || '',
    tarifa_impuesto: initialData.tarifa_impuesto || '',
    stock_actual: initialData.stock_actual || '',
    stock_maximo: initialData.stock_maximo || '',
    etiquetas: initialData.etiquetas ? (Array.isArray(initialData.etiquetas) ? initialData.etiquetas.join(', ') : initialData.etiquetas) : '',
    tipo: initialData.tipo || 'fisico'
  } : {
    nombre: '',
    codigo_sku: '',
    codigo_barras: '',
    descripcion: '',
    categoria_id: '',
    precio_venta_1: '',
    costo_promedio: '',
    tarifa_impuesto: '',
    stock_actual: '',
    stock_maximo: '',
    etiquetas: '',
    tipo: 'fisico'
  });

  useEffect(() => {
    // Cargar categorías y configuración de empresa
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().getToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        };

        // 1. Fetch Categorias
        const catRes = await fetch(`${import.meta.env.VITE_API_URL}/inventario/categorias`, { headers });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategorias(catData.categorias || []);
        }

        // 2. Fetch Empresa Settings para default IVA
        const setRes = await fetch(`${import.meta.env.VITE_API_URL}/empresa/settings`, { headers });
        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData.impuesto_defecto !== undefined) {
            setFormData(prev => ({ ...prev, tarifa_impuesto: setData.impuesto_defecto }));
          }
          if (setData.moneda_defecto) {
            let symbol = '$';
            if (setData.moneda_defecto === 'EUR') symbol = '€';
            else if (setData.moneda_defecto !== 'USD' && setData.moneda_defecto !== 'COP' && setData.moneda_defecto !== 'MXN') symbol = setData.moneda_defecto;
            setMoneda(symbol);
          }
        }
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
    if (tenantId) fetchData();
  }, [tenantId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async (e) => {
    if(e) e.preventDefault();
    
    try {
      let imageUrl = initialData?.imagen_url || null;
      const tid = tenantId || (useAuthStore.getState().user?.app_metadata?.empresa_id);

      // 1. Upload image to Supabase Storage via StorageService (tenant_id/productos/filename)
      if (imageFile) {
        setUploadProgress(30);
        const uploadRes = await StorageService.uploadTenantFile(imageFile, tid, 'productos');

        if (uploadRes.error) {
          console.error('Error subiendo imagen a Supabase:', uploadRes.error);
          Toast.fire({ icon: 'warning', title: 'No se pudo subir la imagen al storage, guardando sin ella.' });
        } else if (uploadRes.data?.path) {
          setUploadProgress(70);
          imageUrl = StorageService.getPublicUrl(uploadRes.data.path);
        }
      }

      // 2. Prepare payload
      const payload = {
        nombre: formData.nombre,
        codigo_sku: formData.codigo_sku,
        codigo_barras: formData.codigo_barras,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria_id || null,
        precio_venta_1: parseFloat(formData.precio_venta_1 || 0),
        costo_promedio: parseFloat(formData.costo_promedio || 0),
        tarifa_impuesto: parseFloat(formData.tarifa_impuesto || 0),
        stock_actual: parseFloat(formData.stock_actual || 0),
        stock_maximo: parseFloat(formData.stock_maximo || 0),
        etiquetas: formData.etiquetas ? (typeof formData.etiquetas === 'string' ? formData.etiquetas.split(',').map(t => t.trim()) : formData.etiquetas) : [],
        tipo: formData.tipo,
        imagen_url: imageUrl,
      };

      // 3. Save via Laravel API
      let savedProduct;
      if (initialData?.id) {
        const res = await api.put(`/inventario/productos/${initialData.id}`, payload, { headers: { 'X-Tenant-ID': tid } });
        savedProduct = res.data;
      } else {
        const res = await api.post('/inventario/productos', payload, { headers: { 'X-Tenant-ID': tid } });
        savedProduct = res.data;
      }

      setUploadProgress(0);

      // 4. Call parent callback
      if (onSuccess) {
        onSuccess(savedProduct);
      } else {
        Toast.fire({ icon: 'success', title: 'Producto guardado exitosamente' });
        navigate('/productos');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setUploadProgress(0);
      Toast.fire({
        icon: 'error',
        title: 'Error: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  const isModal = !!onClose;

  return (
    <div className={isModal ? "" : "container-fluid py-4"} style={isModal ? {} : { backgroundColor: '#F9FAFD', minHeight: '100vh' }}>
      
      {/* Top Header - Falcon Style */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body">
          <div className="row flex-between-center">
            <div className="col-md">
              <h5 className="mb-2 mb-md-0 fw-bold">{initialData ? 'Editar Producto' : 'Crear Producto'}</h5>
            </div>
            <div className="col-auto d-flex align-items-center">
              <button 
                className="btn btn-primary btn-sm me-2" 
                onClick={handleSave}
                title="Guardar Producto"
              >
                <span className="fas fa-save me-1"></span> Guardar
              </button>
              <button 
                className="btn btn-falcon-default btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onClose) onClose();
                  else navigate('/productos');
                }}
                title="Cerrar"
              >
                <span className="fas fa-times text-danger"></span>
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
              <h6 className="mb-0 fw-semi-bold">Información Básica</h6>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semi-bold fs--1">Nombre del producto:</label>
                  <input type="text" className="form-control form-control-sm" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Camiseta de Algodón" />
                </div>
                <div className="row mb-3 g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semi-bold fs--1">Referencia (SKU):</label>
                    <input type="text" className="form-control form-control-sm" name="codigo_sku" value={formData.codigo_sku} onChange={handleChange} placeholder="SKU-12345" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semi-bold fs--1">Código de Barras (EAN/UPC):</label>
                    <input type="text" className="form-control form-control-sm" name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} placeholder="770123456789" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semi-bold fs--1">Resumen del producto:</label>
                  <textarea className="form-control form-control-sm" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} placeholder="Breve descripción del producto..."></textarea>
                </div>
              </form>
            </div>
          </div>

          {/* Add Images Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Imagen del Producto</h6>
            </div>
            <div className="card-body text-center py-4">
              {imagePreview ? (
                <div className="position-relative d-inline-block mb-2">
                  <img src={imagePreview} alt="Preview" className="img-fluid rounded border" style={{ maxHeight: '200px' }} />
                  <button 
                    type="button" 
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{ width: '28px', height: '28px' }}
                  >
                    <span className="fas fa-times"></span>
                  </button>
                </div>
              ) : (
                <div className="border-dashed border-2 border-300 rounded-2 py-4 bg-100 position-relative" style={{ borderStyle: 'dashed' }}>
                  <input 
                    type="file" 
                    className="position-absolute w-100 h-100 opacity-0"
                    style={{ top: 0, left: 0, cursor: 'pointer' }} 
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <span className="fas fa-cloud-upload-alt text-400 fs-3 d-block mb-2"></span>
                  <p className="fs--1 text-600 mb-0">Arrastra tu imagen aquí<br />o, <span className="text-primary">Explorar</span></p>
                </div>
              )}
              {uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-500 fs--2 mt-1 mb-0">Subiendo imagen ({uploadProgress}%)...</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Detalles</h6>
            </div>
            <div className="card-body">
              <label className="form-label fw-semi-bold fs--1">Descripción detallada:</label>
              {/* Fake WYSIWYG Editor Toolbar */}
              <div className="border rounded-top p-2 bg-light d-flex gap-2 text-500">
                <span className="fas fa-bold cursor-pointer"></span>
                <span className="fas fa-italic cursor-pointer"></span>
                <span className="fas fa-link cursor-pointer"></span>
                <span className="fas fa-list-ul cursor-pointer"></span>
                <span className="fas fa-image cursor-pointer"></span>
              </div>
              <textarea className="form-control border-top-0 rounded-bottom" rows="5" placeholder="Escribe todos los detalles técnicos y descripciones del producto aquí..."></textarea>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4 ps-lg-2">
          
          {/* Type / Category Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Clasificación</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semi-bold fs--1">Seleccionar categoría:</label>
                <select className="form-select form-select-sm" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semi-bold fs--1">Tipo de Producto:</label>
                <select className="form-select form-select-sm" name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="fisico">Producto Físico</option>
                  <option value="servicio">Servicio Intangible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Etiquetas</h6>
            </div>
            <div className="card-body">
              <label className="form-label fw-semi-bold fs--1">Añade palabras clave (separadas por coma):</label>
              <input type="text" className="form-control form-control-sm" name="etiquetas" value={formData.etiquetas} onChange={handleChange} placeholder="ej: novedad, promoción, invierno" />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="card mb-3 shadow-none border">
            <div className="card-header bg-light border-bottom">
              <h6 className="mb-0 fw-semi-bold">Precios e Inventario</h6>
            </div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Precio de Venta:</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text text-500">{moneda}</span>
                    <input type="number" className="form-control" name="precio_venta_1" value={formData.precio_venta_1} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Costo Promedio:</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text text-500">{moneda}</span>
                    <input type="number" className="form-control" name="costo_promedio" value={formData.costo_promedio} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-12">
                  <label className="form-label fw-semi-bold fs--1">Tarifa de Impuesto (IVA %):</label>
                  <input type="number" className="form-control form-control-sm" name="tarifa_impuesto" value={formData.tarifa_impuesto} onChange={handleChange} placeholder="19.00" />
                </div>
              </div>
              <hr className="my-3 border-300" />
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Stock Actual:</label>
                  <input type="number" className="form-control form-control-sm" name="stock_actual" value={formData.stock_actual} onChange={handleChange} placeholder="0" />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semi-bold fs--1">Stock Máximo:</label>
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
