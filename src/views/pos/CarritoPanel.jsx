/**
 * CarritoPanel.jsx — Panel de cobro del POS.
 * Estilos: Falcon / Bootstrap 5 nativo.
 */
import React, { useState } from 'react';

export default function CarritoPanel({ items, total, procesando, onCambiarCantidad, onCobrar, ultimaVenta }) {
  const [metodo, setMetodo] = useState('efectivo');

  // Vista de éxito post-venta
  if (ultimaVenta && items.length === 0) {
    return (
      <div className="text-center py-5 pos-exito my-auto">
        <div className="mb-3">
          <span className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></span>
        </div>
        <h4 className="text-800">¡Venta Registrada!</h4>
        <p className="text-600 mb-4">
          Total: <span className="fw-bold">${parseFloat(ultimaVenta.total).toLocaleString('es-CO')}</span><br/>
          Método: <span className="text-capitalize text-500">{ultimaVenta.metodo_pago}</span>
        </p>
        <button
          className="btn btn-outline-primary btn-sm px-4 me-2"
          onClick={() => window.print()}
        >
          <span className="fas fa-print me-2"></span>Imprimir Recibo
        </button>
        <button
          className="btn btn-primary btn-sm px-4"
          onClick={() => window.location.reload()}
        >
          <span className="fas fa-plus me-2"></span>Nueva Venta
        </button>
      </div>
    );
  }

  // Vista carrito vacío
  if (items.length === 0) {
    return (
      <div className="text-center py-5 text-muted my-auto">
        <span className="fas fa-shopping-basket fa-3x mb-3 text-300"></span>
        <h6 className="text-500 fw-normal">El carrito está vacío</h6>
        <p className="fs--1 mb-0">Selecciona productos del catálogo para comenzar</p>
      </div>
    );
  }

  return (
    <>
      {/* Lista de items */}
      <div className="pos-carrito-lista pe-2 mb-3 flex-grow-1">
        {items.map(item => (
          <div
            key={item.id}
            className={`d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-200 pos-carrito-item ${item.isNew ? 'new-item' : ''}`}
          >
            {/* Info producto */}
            <div className="flex-grow-1 pe-2" style={{ minWidth: 0 }}>
              <div className="fw-semi-bold text-800 text-truncate fs--1">{item.nombre}</div>
              <div className="text-success fw-bold fs--2">
                ${parseFloat(item.precio_venta).toLocaleString('es-CO')} c/u
              </div>
            </div>

            {/* Controles de cantidad */}
            <div className="d-flex align-items-center me-3 bg-100 rounded">
              <button
                className="btn btn-sm btn-link text-600 px-2 py-1"
                onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
              >
                <span className="fas fa-minus fs--2"></span>
              </button>
              <span className="fw-bold px-2 fs--1" style={{ minWidth: '24px', textAlign: 'center' }}>
                {item.cantidad}
              </span>
              <button
                className="btn btn-sm btn-link text-600 px-2 py-1"
                onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
              >
                <span className="fas fa-plus fs--2"></span>
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-end" style={{ minWidth: '70px' }}>
              <div className="fw-bold text-900 fs--1">
                ${item.subtotal.toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer del Carrito (Método de pago + Cobrar) */}
      <div className="mt-auto border-top pt-3">
        <div className="mb-2">
          <label className="form-label fs--2 text-uppercase text-600 mb-1">Método de Pago</label>
          <div className="d-flex gap-2">
            {[
              { id: 'efectivo', icon: 'money-bill-wave', label: 'Efectivo' },
              { id: 'tarjeta', icon: 'credit-card', label: 'Tarjeta' },
              { id: 'transferencia', icon: 'university', label: 'Transf.' }
            ].map(m => (
              <button
                key={m.id}
                className={`btn btn-sm flex-fill py-2 ${metodo === m.id ? 'btn-primary' : 'btn-outline-primary bg-white text-900'}`}
                onClick={() => setMetodo(m.id)}
              >
                <span className={`fas fa-${m.icon} d-block mb-1 fs--1 ${metodo === m.id ? 'text-white' : 'text-primary'}`}></span>
                <span className={`fs--2 d-block ${metodo === m.id ? 'text-white' : 'text-700'}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-end mb-3 bg-100 p-2 rounded">
          <span className="text-700 fw-semi-bold">TOTAL A PAGAR</span>
          <span className="pos-total-valor">
            ${total.toLocaleString('es-CO')}
          </span>
        </div>

        <button
          className="btn btn-success w-100 pos-btn-cobrar py-2"
          disabled={procesando}
          onClick={() => onCobrar(metodo)}
        >
          {procesando ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
          ) : (
            <><span className="fas fa-check-circle me-2"></span>Cobrar Venta</>
          )}
        </button>
      </div>
    </>
  );
}
