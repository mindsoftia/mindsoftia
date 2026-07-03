import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';
import useAuthStore from '../../store/authStore';
import { v4 as uuidv4 } from 'uuid';

export default function FacturaCompraForm() {
  const navigate = useNavigate();
  const { tenantId } = useAuthStore();

  const proveedores = useLiveQuery(() => posDB.terceros_cache.filter(t => t.es_proveedor).toArray(), []);
  const productos = useLiveQuery(() => posDB.productos_cache.toArray(), []);

  const [formData, setFormData] = useState({
    proveedor_id: '',
    numero_factura: '',
    fecha_emision: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState([]);
  const [procesando, setProcesando] = useState(false);

  const handleHeaderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Autocompletar precio si selecciona producto
        if (field === 'producto_id') {
          const prod = productos.find(p => p.id === value);
          if (prod && !updatedItem.precio_unitario) {
            updatedItem.precio_unitario = prod.costo_promedio || 0;
          }
        }
        
        updatedItem.subtotal = parseFloat(updatedItem.cantidad || 0) * parseFloat(updatedItem.precio_unitario || 0);
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotalFactura = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const totalFactura = subtotalFactura; // Sin impuestos por simplicidad en esta versión

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.proveedor_id) { alert('Seleccione un proveedor'); return; }
    if (items.length === 0) { alert('Agregue al menos un producto a la factura'); return; }
    
    // Validar que todos los items tengan producto
    if (items.some(i => !i.producto_id)) { alert('Todos los items deben tener un producto seleccionado'); return; }

    setProcesando(true);
    try {
      const facturaId = uuidv4();
      
      const nuevaFactura = {
        id: facturaId,
        empresa_id: tenantId,
        proveedor_id: formData.proveedor_id,
        numero_factura: formData.numero_factura,
        fecha_emision: formData.fecha_emision,
        subtotal: subtotalFactura,
        impuestos: 0,
        total: totalFactura,
        sync_status: 'pending'
      };

      const detalles = items.map(item => ({
        id: item.id,
        factura_id: facturaId,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }));

      // Guardar en Dexie (Offline First)
      await posDB.transaction('rw', posDB.facturas_compra, posDB.facturas_compra_detalles, async () => {
        await posDB.facturas_compra.add(nuevaFactura);
        await posDB.facturas_compra_detalles.bulkAdd(detalles);
      });

      // Intentar sincronizar en background
      posSyncService.syncFacturasCompraPendientes().catch(console.error);

      navigate('/compras/facturas');
    } catch (error) {
      console.error("Error guardando factura:", error);
      alert("Error al guardar la factura de compra");
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
            Nueva Factura de Compra
          </h4>
          <p className="text-muted fs--1 mb-0">Registrar ingreso de mercancía y cuenta por pagar</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/compras/facturas')}>
          <span className="fas fa-arrow-left me-1"></span>Volver
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-light">
          <h6 className="mb-0">Datos Generales</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">Proveedor</label>
              <select className="form-select" name="proveedor_id" value={formData.proveedor_id} onChange={handleHeaderChange} required>
                <option value="">-- Seleccionar Proveedor --</option>
                {proveedores?.map(p => (
                  <option key={p.id} value={p.id}>{p.tipo_identificacion === 'NIT' ? p.razon_social : `${p.nombres} ${p.apellidos}`}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Número de Factura (Soporte)</label>
              <input type="text" className="form-control" name="numero_factura" value={formData.numero_factura} onChange={handleHeaderChange} placeholder="Ej: FV-9012" required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha de Emisión</label>
              <input type="date" className="form-control" name="fecha_emision" value={formData.fecha_emision} onChange={handleHeaderChange} required />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Detalle de Productos</h6>
          <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
            <span className="fas fa-plus me-1"></span>Agregar Línea
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-bordered mb-0">
              <thead className="bg-200">
                <tr>
                  <th>Producto</th>
                  <th width="15%">Cantidad</th>
                  <th width="20%">Costo Unit.</th>
                  <th width="20%">Subtotal</th>
                  <th width="5%" className="text-center"><i className="fas fa-trash"></i></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">Aún no hay productos en la factura.</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <select className="form-select form-select-sm" value={item.producto_id} onChange={(e) => handleItemChange(item.id, 'producto_id', e.target.value)} required>
                          <option value="">-- Seleccionar --</option>
                          {productos?.map(p => (
                            <option key={p.id} value={p.id}>{p.codigo_sku} - {p.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input type="number" step="0.01" className="form-control form-control-sm" value={item.cantidad} onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)} required />
                      </td>
                      <td>
                        <input type="number" step="0.01" className="form-control form-control-sm" value={item.precio_unitario} onChange={(e) => handleItemChange(item.id, 'precio_unitario', e.target.value)} required />
                      </td>
                      <td className="text-end fw-bold align-middle">
                        ${Number(item.subtotal || 0).toLocaleString()}
                      </td>
                      <td className="text-center align-middle">
                        <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeItem(item.id)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan="3" className="text-end fw-bold py-2">TOTAL FACTURA:</td>
                    <td className="text-end fw-bold text-success fs-1 py-2">${totalFactura.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
        <div className="card-footer text-end">
          <button type="button" className="btn btn-success" disabled={procesando || items.length === 0} onClick={handleSave}>
            {procesando ? <span className="spinner-border spinner-border-sm me-2"></span> : <span className="fas fa-check me-2"></span>}
            Guardar Factura (Offline First)
          </button>
        </div>
      </div>
    </div>
  );
}
