/**
 * POSLayout.jsx — Contenedor maestro del POS.
 * Estilos: Falcon / Bootstrap 5 nativo. Sin dark mode propio.
 */
import React, { useState } from 'react';
import ProductoGrid from './ProductoGrid';
import CarritoPanel from './CarritoPanel';
import SyncStatusBadge from './SyncStatusBadge';
import { guardarVentaLocal } from '../../database/localPosDb';
import { v4 as uuidv4 } from 'uuid';
import './pos.css';

export default function POSLayout() {
  const [carrito, setCarrito]           = useState([]);
  const [procesando, setProcesando]     = useState(false);
  const [ultimaVenta, setUltimaVenta]   = useState(null);
  const [cliente, setCliente]           = useState(null); // Paso 1: Vinculación de cliente

  // ── Agregar / acumular producto en el carrito ──────────────
  const agregarProducto = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      const precio = parseFloat(producto.precio_venta_1 || producto.precio_venta || 0);
      
      if (existe) {
        return prev.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * precio }
            : i
        );
      }
      return [...prev, { ...producto, cantidad: 1, subtotal: precio, isNew: true }];
    });
    setTimeout(() => setCarrito(p => p.map(i => ({ ...i, isNew: false }))), 400);
  };

  const cambiarCantidad = (id, qty) => {
    if (qty <= 0) { setCarrito(p => p.filter(i => i.id !== id)); return; }
    setCarrito(p => p.map(i => {
      if (i.id === id) {
        const precio = parseFloat(i.precio_venta_1 || i.precio_venta || 0);
        return { ...i, cantidad: qty, subtotal: qty * precio };
      }
      return i;
    }));
  };

  // Cálculos contables (Paso 2)
  const total = carrito.reduce((s, i) => s + i.subtotal, 0);
  const subtotalBase = total / 1.19; // Asumiendo 19% IVA temporalmente
  const impuestos = total - subtotalBase;

  const cobrar = async (metodoPago = 'efectivo') => {
    if (!carrito.length || procesando) return;
    setProcesando(true);
    const ventaId = uuidv4();
    
    // Identificar nombre del cliente
    let clienteNombre = 'Consumidor Final';
    if (cliente) {
      clienteNombre = cliente.tipo_identificacion === 'NIT' ? cliente.razon_social : `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
    }

    const venta = {
      id: ventaId,
      caja_id:             localStorage.getItem('pos_caja_id') || 'CAJA-01',
      sede_id:             localStorage.getItem('pos_sede_id') || 'SEDE-01',
      cajero_id:           localStorage.getItem('user_id')     || 'USER-01',
      cliente_id:          cliente ? cliente.id : null,
      cliente_nombre:      clienteNombre,
      total,
      metodo_pago:         metodoPago,
      sync_status:         'pending',
      dian_status:         'pending',
      fecha_emision_local: new Date().toISOString(),
    };
    const items = carrito.map(i => ({
      id: uuidv4(), venta_id: ventaId,
      producto_id: i.id, cantidad: i.cantidad,
      precio_unitario: i.precio_venta, subtotal: i.subtotal,
    }));
    try {
      await guardarVentaLocal(venta, items);
      setUltimaVenta({ ...venta, items });
      setCarrito([]);
      setCliente(null); // Resetear cliente post-venta
    } catch (err) { console.error('Error guardando venta:', err); }
    finally { setProcesando(false); }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">
            <span className="fas fa-cash-register me-2 text-primary"></span>
            Punto de Venta
          </h4>
          <p className="text-muted fs--1 mb-0">
            {localStorage.getItem('pos_sede_nombre') || 'Sede Principal'}
          </p>
        </div>
        <SyncStatusBadge />
      </div>

      {/* Cuerpo dual — productos (izq) | carrito (der) */}
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header bg-light py-2">
              <h6 className="mb-0 fs--1">
                <span className="fas fa-th me-2 text-primary"></span>Catálogo de Productos
              </h6>
            </div>
            <div className="card-body p-2">
              <ProductoGrid onAgregar={agregarProducto} />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-light py-2">
              <h6 className="mb-0 fs--1">
                <span className="fas fa-shopping-cart me-2 text-success"></span>
                Carrito
                {carrito.length > 0 && (
                  <span className="badge bg-primary ms-2">{carrito.length}</span>
                )}
              </h6>
            </div>
            <div className="card-body p-2 d-flex flex-column">
              <CarritoPanel
                items={carrito}
                subtotal={subtotalBase}
                impuestos={impuestos}
                total={total}
                procesando={procesando}
                onCambiarCantidad={cambiarCantidad}
                onCobrar={cobrar}
                ultimaVenta={ultimaVenta}
                cliente={cliente}
                setCliente={setCliente}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
