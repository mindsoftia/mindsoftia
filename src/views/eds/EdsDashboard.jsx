import React from 'react';

function EdsDashboard() {
  return (
    <div className="container-fluid py-4">
      <div className="card mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-danger">
            <span className="fas fa-gas-pump me-2"></span>
            Tablero Operativo EDS (Punto de Venta)
          </h5>
          <div>
            <span className="badge badge-subtle-success fs--1 me-2">
              <span className="fas fa-check me-1"></span>Turno Abierto
            </span>
            <button className="btn btn-outline-danger btn-sm">
              <span className="fas fa-lock me-1"></span>Cerrar Turno / Arqueo
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* Simulación de Isla y Surtidores */}
        <div className="col-12 col-xxl-8">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0 fs--1">Isla 1 - Surtidor 1</h6>
            </div>
            <div className="card-body bg-light">
              <div className="row g-3">
                {/* Manguera 1 */}
                <div className="col-md-4">
                  <div className="card h-100 border-danger shadow-none">
                    <div className="card-body text-center d-flex flex-column justify-content-center p-3">
                      <h4 className="text-danger fw-bold fs-2 mb-1">CORRIENTE</h4>
                      <p className="fs--1 text-600 mb-3">Manguera #1</p>
                      
                      <div className="bg-200 rounded p-2 mb-3">
                        <div className="fs-3 fw-bold text-900">$ 0.00</div>
                        <div className="fs-0 text-600">0.000 Gls</div>
                      </div>
                      
                      <button className="btn btn-danger btn-lg w-100 fw-bold fs-1 py-3" style={{ touchAction: 'manipulation' }}>
                        DESPACHAR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manguera 2 */}
                <div className="col-md-4">
                  <div className="card h-100 border-primary shadow-none">
                    <div className="card-body text-center d-flex flex-column justify-content-center p-3">
                      <h4 className="text-primary fw-bold fs-2 mb-1">EXTRA</h4>
                      <p className="fs--1 text-600 mb-3">Manguera #2</p>
                      
                      <div className="bg-200 rounded p-2 mb-3">
                        <div className="fs-3 fw-bold text-900">$ 0.00</div>
                        <div className="fs-0 text-600">0.000 Gls</div>
                      </div>
                      
                      <button className="btn btn-primary btn-lg w-100 fw-bold fs-1 py-3" style={{ touchAction: 'manipulation' }}>
                        DESPACHAR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manguera 3 */}
                <div className="col-md-4">
                  <div className="card h-100 border-success shadow-none">
                    <div className="card-body text-center d-flex flex-column justify-content-center p-3">
                      <h4 className="text-success fw-bold fs-2 mb-1">ACPM</h4>
                      <p className="fs--1 text-600 mb-3">Manguera #3</p>
                      
                      <div className="bg-200 rounded p-2 mb-3">
                        <div className="fs-3 fw-bold text-900">$ 0.00</div>
                        <div className="fs-0 text-600">0.000 Gls</div>
                      </div>
                      
                      <button className="btn btn-success btn-lg w-100 fw-bold fs-1 py-3" style={{ touchAction: 'manipulation' }}>
                        DESPACHAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Turno */}
        <div className="col-12 col-xxl-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0 fs--1">Resumen del Turno Actual</h6>
            </div>
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fs--1 text-600">Total Efectivo:</span>
                <span className="fs-0 fw-semi-bold">$0.00</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fs--1 text-600">Total Tarjetas:</span>
                <span className="fs-0 fw-semi-bold">$0.00</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fs--1 text-600">Total Crédito (Vales):</span>
                <span className="fs-0 fw-semi-bold">$0.00</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                <span className="fs-0 fw-bold text-800">Total Ventas:</span>
                <span className="fs-2 fw-bold text-900 text-success">$0.00</span>
              </div>
              
              <button className="btn btn-outline-secondary w-100 mt-4 py-3 fw-bold">
                <span className="fas fa-print me-2"></span>Imprimir Cierre Z
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdsDashboard;
