/**
 * InventarioAdmin.jsx — Panel administrativo del módulo Inventario.
 * Muestra el stock por sede, alertas y acceso al kardex.
 */
import React from 'react';
import { useInventario } from '../../hooks/useInventario';

export default function InventarioAdmin() {
  const { productos, alertas, cargando, error, cargarStock } = useInventario();

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">
            <span className="fas fa-boxes me-2 text-primary"></span>
            Inventario Multisede
          </h4>
          <p className="text-muted fs--1 mb-0">Stock en tiempo real · Kardex · Traslados</p>
        </div>
        <button className="btn btn-sm btn-outline-primary" onClick={cargarStock}>
          <span className="fas fa-sync-alt me-1"></span>Actualizar
        </button>
      </div>

      {/* Alertas de stock mínimo */}
      {alertas.length > 0 && (
        <div className="alert alert-warning py-2 mb-3">
          <span className="fas fa-exclamation-triangle me-2"></span>
          <strong>{alertas.length} producto{alertas.length > 1 ? 's' : ''}</strong> por debajo del stock mínimo.
          {alertas.slice(0, 3).map(p => (
            <span key={p.id} className="badge bg-warning text-dark ms-2">{p.nombre}</span>
          ))}
        </div>
      )}

      {/* Tabla de stock */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="bg-200">
                <tr>
                  <th>Producto</th>
                  <th>Referencia</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Mínimo</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="6" className="text-center py-4">
                    <span className="spinner-border spinner-border-sm me-2"></span>Cargando inventario...
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan="6" className="text-center py-4 text-danger">
                    <span className="fas fa-exclamation-circle me-2"></span>{error}
                  </td></tr>
                ) : productos.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">
                    <span className="fas fa-box-open fa-2x mb-2 d-block"></span>
                    No hay productos en inventario aún.
                    <div className="mt-2">
                      <button className="btn btn-sm btn-primary">
                        <span className="fas fa-plus me-1"></span>Agregar Producto
                      </button>
                    </div>
                  </td></tr>
                ) : (
                  productos.map(p => (
                    <tr key={p.id}>
                      <td className="align-middle fw-semi-bold">{p.nombre}</td>
                      <td className="align-middle text-muted fs--1">{p.referencia || p.codigo_barras || '-'}</td>
                      <td className="align-middle text-center">
                        <span className={`fw-bold ${p.alerta_stock ? 'text-danger' : 'text-success'}`}>
                          {p.stock_actual ?? 0}
                        </span>
                      </td>
                      <td className="align-middle text-center text-muted fs--1">{p.stock_minimo}</td>
                      <td className="align-middle text-end">
                        ${parseFloat(p.precio_venta || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="align-middle text-center">
                        {p.alerta_stock
                          ? <span className="badge badge-subtle-danger">⚠ Bajo</span>
                          : <span className="badge badge-subtle-success">OK</span>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
