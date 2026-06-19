import React from 'react';

function HistorialPagos() {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-0 mb-0 text-nowrap py-2 py-xl-0">
                <span className="fas fa-file-invoice-dollar me-2"></span>Historial de Pagos y Facturación
              </h5>
            </div>
            <div className="col-8 col-sm-auto text-end ps-2">
              <button className="btn btn-falcon-default btn-sm" type="button">
                <span className="fas fa-download me-1"></span>Reporte Mensual
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Factura #</th>
                  <th>Empresa</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td className="align-middle fw-semi-bold">INV-2026-001</td>
                  <td className="align-middle">Acme Technologies</td>
                  <td className="align-middle">15 Jun 2026</td>
                  <td className="align-middle">$89.00 USD</td>
                  <td className="align-middle">
                    <span className="badge badge-subtle-success rounded-pill">Pagado</span>
                  </td>
                  <td className="align-middle text-end">
                    <button className="btn btn-sm btn-falcon-default" type="button" title="Descargar PDF">
                      <span className="fas fa-file-pdf text-danger"></span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="align-middle fw-semi-bold">INV-2026-002</td>
                  <td className="align-middle">Globex Corp</td>
                  <td className="align-middle">14 Jun 2026</td>
                  <td className="align-middle">$29.00 USD</td>
                  <td className="align-middle">
                    <span className="badge badge-subtle-danger rounded-pill">Rebotado</span>
                  </td>
                  <td className="align-middle text-end">
                    <button className="btn btn-sm btn-falcon-default" type="button" title="Forzar Cobro">
                      <span className="fas fa-redo text-warning"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default HistorialPagos;
