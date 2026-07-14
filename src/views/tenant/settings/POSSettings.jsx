import React, { useState } from 'react';

const POSSettings = () => {
  const [showForm, setShowForm] = useState(false);
  
  const defaultMethods = [
    { id: 1, name: 'Efectivo Principal', type: 'CASH', requiresReference: false, active: true, deletable: false },
    { id: 2, name: 'Nequi Empresa', type: 'QR_WALLET', requiresReference: true, active: true, deletable: true },
    { id: 3, name: 'Datafono Redeban', type: 'CARD', requiresReference: true, active: true, deletable: true },
    { id: 4, name: 'Zelle', type: 'TRANSFER', requiresReference: true, active: false, deletable: true }
  ];

  const [methods, setMethods] = useState(() => {
    const saved = localStorage.getItem('pos_payment_methods');
    return saved ? JSON.parse(saved) : defaultMethods;
  });

  const getBadgeClass = (type) => {
    switch(type) {
      case 'CASH': return 'badge bg-success';
      case 'QR_WALLET': return 'badge bg-info text-dark';
      case 'CARD': return 'badge bg-primary';
      case 'TRANSFER': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  };

  const toggleStatus = (id) => {
    const updated = methods.map(m => {
      if (m.id === id && m.deletable) {
        return { ...m, active: !m.active };
      }
      return m;
    });
    setMethods(updated);
    localStorage.setItem('pos_payment_methods', JSON.stringify(updated));
  };

  return (
    <div className="container-fluid py-4">
      {/* Modal Overlay Personalizado (Si no se usa Bootstrap JS puro) */}
      {showForm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-light border-bottom-0 rounded-top-4">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="fas fa-money-check-alt me-2"></i> Configuración de Método de Pago
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted mb-4">Complete detalladamente la información del método de pago. Esto afectará directamente el flujo de caja y la conciliación contable.</p>
                
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Nombre Comercial *</label>
                    <input type="text" className="form-control form-control-lg" placeholder="Ej. Daviplata, Terminal BBVA, Zelle..." />
                    <div className="form-text">Este nombre será visible para los cajeros en el Punto de Venta.</div>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Clasificación Contable Base *</label>
                    <select className="form-select form-select-lg">
                      <option value="">Seleccione el comportamiento base...</option>
                      <option value="QR_WALLET">📱 Billetera Digital / QR (Pagos Inmediatos)</option>
                      <option value="TRANSFER">🏦 Transferencia Bancaria (Validación Manual)</option>
                      <option value="CARD">💳 Tarjeta Débito/Crédito (Datáfono)</option>
                      <option value="CASH">💵 Efectivo Físico</option>
                    </select>
                    <div className="form-text">Define cómo el sistema calculará los totales en el Cierre de Caja.</div>
                  </div>

                  <div className="col-12 mt-4">
                    <div className="card border-primary bg-primary bg-opacity-10">
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="fw-bold text-primary mb-1">Exigir Número de Aprobación (Comprobante)</h6>
                          <p className="text-muted small mb-0">Obliga al cajero a ingresar el código de la transferencia o voucher del datáfono antes de cerrar la venta.</p>
                        </div>
                        <div className="form-check form-switch fs-4">
                          <input className="form-check-input cursor-pointer" type="checkbox" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold">Cuenta Contable Destino (Opcional)</label>
                    <select className="form-select">
                      <option value="">Caja General (Predeterminado)</option>
                      <option value="1">Cuenta Ahorros Bancolombia - 1234</option>
                      <option value="2">Caja Menor</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0 p-4">
                <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary px-4 fw-bold">Guardar Método de Pago</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Configuración POS</h2>
          <p className="text-muted mb-0">Gestiona los métodos de pago aceptados en tu sucursal.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-4">

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small">
              <tr>
                <th className="text-uppercase ps-4">Nombre Comercial</th>
                <th className="text-uppercase">Clasificación</th>
                <th className="text-uppercase text-center">Exige Aprobación</th>
                <th className="text-uppercase text-center pe-4">Estado (Activo)</th>
                <th className="text-uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr key={method.id}>
                  <td className="ps-4 fw-bold">{method.name}</td>
                  <td>
                    <span className={getBadgeClass(method.type)}>
                      {method.type}
                    </span>
                  </td>
                  <td className="text-center">
                    {method.requiresReference ? (
                      <span className="text-success fw-bold small">Sí, Requerido</span>
                    ) : (
                      <span className="text-muted small">No</span>
                    )}
                  </td>
                  <td className="text-center pe-4">
                    <div className="form-check form-switch d-flex justify-content-center m-0">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={method.active}
                        disabled={!method.deletable}
                        onChange={() => toggleStatus(method.id)}
                        title={!method.deletable ? "El efectivo base no puede desactivarse" : "Alternar estado"}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-light text-primary me-2" title="Editar Método">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-light text-danger" 
                      title={method.deletable ? "Eliminar Método" : "No se puede eliminar"}
                      disabled={!method.deletable}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Botón Flotante (FAB) */}
      <button 
        className={`btn ${showForm ? 'btn-danger' : 'btn-primary'} shadow`}
        onClick={() => setShowForm(!showForm)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 1000
        }}
        title={showForm ? 'Cancelar' : 'Agregar Método'}
      >
        <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
      </button>
    </div>
  );
};

export default POSSettings;
