import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import api from '../../services/api'; // Axios instance para backend Laravel
import useAuthStore from '../../store/authStore';
import { v4 as uuidv4 } from 'uuid';

export default function FacturaCompraForm() {
  const navigate = useNavigate();
  const { tenantId } = useAuthStore();

  // Consultamos catálogos locales en caché para fluidez
  const proveedores = useLiveQuery(() => posDB.terceros_cache.filter(t => t.es_proveedor).toArray(), []);
  const productos = useLiveQuery(() => posDB.productos_cache.toArray(), []);
  
  // En un sistema real la sede vendría de otra tabla, para este MVP forzamos una o la permitimos por defecto
  const sedes = [{ id: '90a3a9df-6d7b-4eb8-b98a-xxxxxxx', nombre: 'Bodega Principal' }]; 

  const [formData, setFormData] = useState({
    tercero_id: '',
    sede_id: sedes[0].id,
    numero_factura: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    condicion_pago: 'CONTADO',
    notas: ''
  });

  const [items, setItems] = useState([]);
  const [procesando, setProcesando] = useState(false);

  const handleHeaderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setItems([...items, { 
      id: uuidv4(), 
      producto_id: '', 
      cantidad: 1, 
      costo_unitario: 0, 
      porcentaje_impuesto: 0, 
      subtotal: 0, 
      valor_impuesto: 0, 
      total: 0 
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Autocompletar costo e impuesto si selecciona producto
        if (field === 'producto_id') {
          const prod = productos?.find(p => p.id === value);
          if (prod) {
            if (!updatedItem.costo_unitario) updatedItem.costo_unitario = prod.costo_promedio || 0;
            // Si el producto tiene impuesto configurado, se asume el mismo para la compra
            updatedItem.porcentaje_impuesto = prod.iva_porcentaje || 0; 
          }
        }
        
        const cant = parseFloat(updatedItem.cantidad || 0);
        const costo = parseFloat(updatedItem.costo_unitario || 0);
        const porcImp = parseFloat(updatedItem.porcentaje_impuesto || 0);

        updatedItem.subtotal = cant * costo;
        updatedItem.valor_impuesto = updatedItem.subtotal * (porcImp / 100);
        updatedItem.total = updatedItem.subtotal + updatedItem.valor_impuesto;
        
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotalGlobal = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const impuestosGlobal = items.reduce((acc, item) => acc + (item.valor_impuesto || 0), 0);
  const totalFactura = subtotalGlobal + impuestosGlobal;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.tercero_id) { alert('Seleccione un proveedor'); return; }
    if (items.length === 0) { alert('Agregue al menos un producto a la factura'); return; }
    if (items.some(i => !i.producto_id)) { alert('Todos los items deben tener un producto seleccionado'); return; }

    setProcesando(true);
    try {
      const payload = {
        tercero_id: formData.tercero_id,
        sede_id: formData.sede_id,
        numero_factura: formData.numero_factura,
        fecha_compra: formData.fecha_compra,
        condicion_pago: formData.condicion_pago,
        notas: formData.notas,
        detalles: items.map(i => ({
          producto_id: i.producto_id,
          cantidad: parseFloat(i.cantidad),
          costo_unitario: parseFloat(i.costo_unitario),
          porcentaje_impuesto: parseFloat(i.porcentaje_impuesto)
        }))
      };

      // Inyección transaccional directa al backend de Laravel
      await api.post('/inventario/compras', payload);

      // Aquí podrías forzar un posSyncService.syncInventario() para bajar el nuevo Kardex
      
      alert('¡Factura de compra registrada con éxito!');
      navigate('/compras/facturas');
    } catch (error) {
      console.error("Error guardando factura:", error);
      alert("Error al registrar la compra. Verifica los datos o conexión.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0">
            <span className="fas fa-file-invoice-dollar me-2 text-primary"></span>
            Recepción de Mercancía (Compras)
          </h4>
          <p className="text-muted fs--1 mb-0">Esta acción afectará directamente el inventario (Kardex) y las cuentas por pagar.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          <span className="fas fa-arrow-left me-1"></span>Volver
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* ENCABEZADO */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light border-bottom border-200">
            <h6 className="mb-0"><span className="fas fa-info-circle me-2"></span>Datos de la Factura (Soporte)</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semi-bold">Proveedor <span className="text-danger">*</span></label>
                <select className="form-select" name="tercero_id" value={formData.tercero_id} onChange={handleHeaderChange} required>
                  <option value="">-- Seleccionar Proveedor --</option>
                  {proveedores?.map(p => (
                    <option key={p.id} value={p.id}>{p.tipo_identificacion === 'NIT' ? p.razon_social : `${p.nombres} ${p.apellidos}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semi-bold">N° Factura <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="numero_factura" value={formData.numero_factura} onChange={handleHeaderChange} placeholder="Ej: FV-9012" required />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semi-bold">Fecha Compra</label>
                <input type="date" className="form-control" name="fecha_compra" value={formData.fecha_compra} onChange={handleHeaderChange} required />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semi-bold">Condición</label>
                <select className="form-select bg-light" name="condicion_pago" value={formData.condicion_pago} onChange={handleHeaderChange}>
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DETALLE (GRID) */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light border-bottom border-200 d-flex justify-content-between align-items-center">
            <h6 className="mb-0"><span className="fas fa-boxes me-2"></span>Detalle de Productos a Ingresar</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
              <span className="fas fa-plus me-1"></span>Agregar Línea
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-bordered fs--1 mb-0 align-middle">
                <thead className="bg-200 text-900">
                  <tr>
                    <th className="p-2">Producto</th>
                    <th className="p-2 text-center" width="10%">Cant.</th>
                    <th className="p-2 text-end" width="15%">Costo Unitario ($)</th>
                    <th className="p-2 text-end" width="12%">IVA (%)</th>
                    <th className="p-2 text-end" width="15%">Valor IVA ($)</th>
                    <th className="p-2 text-end" width="15%">Subtotal ($)</th>
                    <th className="p-2 text-end" width="15%">Total ($)</th>
                    <th className="p-2 text-center" width="5%"><i className="fas fa-trash"></i></th>
                  </tr>
                </thead>
                <tbody className="list">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-400 fw-semi-bold">
                        <span className="fas fa-box-open fs-2 mb-2 d-block text-300"></span>
                        No has agregado productos a esta compra.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2">
                          <select className="form-select form-select-sm" value={item.producto_id} onChange={(e) => handleItemChange(item.id, 'producto_id', e.target.value)} required>
                            <option value="">-- Seleccionar --</option>
                            {productos?.map(p => (
                              <option key={p.id} value={p.id}>{p.codigo_sku} - {p.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="number" step="1" min="1" className="form-control form-control-sm text-center" value={item.cantidad} onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)} required />
                        </td>
                        <td className="p-2">
                          <input type="number" step="0.01" min="0" className="form-control form-control-sm text-end" value={item.costo_unitario} onChange={(e) => handleItemChange(item.id, 'costo_unitario', e.target.value)} required />
                        </td>
                        <td className="p-2">
                          <select className="form-select form-select-sm text-end" value={item.porcentaje_impuesto} onChange={(e) => handleItemChange(item.id, 'porcentaje_impuesto', e.target.value)}>
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="19">19%</option>
                          </select>
                        </td>
                        <td className="p-2 text-end text-500">
                          ${Number(item.valor_impuesto || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-end fw-semi-bold">
                          ${Number(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-end fw-bold text-primary">
                          ${Number(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeItem(item.id)}>
                            <i className="fas fa-times-circle fs-0"></i>
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

        {/* TOTALES */}
        <div className="row justify-content-end mb-4">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-600 fw-semi-bold">Subtotal:</span>
                  <span className="text-800 fw-semi-bold">${Number(subtotalGlobal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-600 fw-semi-bold">Impuestos (IVA):</span>
                  <span className="text-800 fw-semi-bold">${Number(impuestosGlobal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-900 fw-bold fs-1">TOTAL:</span>
                  <span className="text-success fw-bold fs-2">${Number(totalFactura).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="card-footer p-3 border-0 bg-transparent">
                <button type="submit" className="btn btn-primary w-100 fs-0" disabled={procesando || items.length === 0}>
                  {procesando ? <span className="spinner-border spinner-border-sm me-2"></span> : <span className="fas fa-check-circle me-2"></span>}
                  Ingresar al Kardex
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
