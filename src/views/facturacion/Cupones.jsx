import React from 'react';

function Cupones() {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-0 mb-0 text-nowrap py-2 py-xl-0">
                <span className="fas fa-ticket-alt me-2"></span>Cupones y Descuentos
              </h5>
            </div>
            <div className="col-8 col-sm-auto text-end ps-2">
              <button className="btn btn-primary btn-sm" type="button">
                <span className="fas fa-plus me-1"></span>Generar Cupón
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Tipo</th>
                  <th>Límite de Uso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td className="align-middle"><span className="badge badge-subtle-primary">LANZAMIENTO50</span></td>
                  <td className="align-middle">50%</td>
                  <td className="align-middle text-500">Primer Mes</td>
                  <td className="align-middle">15 / 100 usados</td>
                  <td className="align-middle"><span className="badge badge-subtle-success rounded-pill">Activo</span></td>
                </tr>
                <tr>
                  <td className="align-middle"><span className="badge badge-subtle-secondary">EARLYBIRD</span></td>
                  <td className="align-middle">$10 USD</td>
                  <td className="align-middle text-500">Recurrente (Por Vida)</td>
                  <td className="align-middle">Ilimitado</td>
                  <td className="align-middle"><span className="badge badge-subtle-danger rounded-pill">Expirado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cupones;
