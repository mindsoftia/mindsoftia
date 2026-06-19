import React from 'react';

function Suscripciones() {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-0 mb-0 text-nowrap py-2 py-xl-0">
                <span className="fas fa-users-cog me-2"></span>Suscripciones Activas
              </h5>
            </div>
            <div className="col-8 col-sm-auto text-end ps-2">
              <div id="table-customers-replace-element">
                <button className="btn btn-falcon-default btn-sm" type="button">
                  <span className="fas fa-filter" data-fa-transform="shrink-3 down-2"></span>
                  <span className="d-none d-sm-inline-block ms-1">Filtrar</span>
                </button>
                <button className="btn btn-falcon-default btn-sm ms-2" type="button">
                  <span className="fas fa-external-link-alt" data-fa-transform="shrink-3 down-2"></span>
                  <span className="d-none d-sm-inline-block ms-1">Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Empresa</th>
                  <th>Plan Actual</th>
                  <th>Estado</th>
                  <th>Próximo Cobro</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody className="list">
                <tr>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl me-2">
                        <div className="avatar-name rounded-circle"><span>AT</span></div>
                      </div>
                      <h6 className="mb-0">Acme Technologies</h6>
                    </div>
                  </td>
                  <td className="align-middle">Plan ERP Total</td>
                  <td className="align-middle">
                    <span className="badge badge-subtle-success rounded-pill">Al día</span>
                  </td>
                  <td className="align-middle">15 Jul 2026</td>
                  <td className="align-middle text-end">
                    <button className="btn btn-link text-600 btn-sm dropdown-toggle dropdown-caret-none btn-reveal" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <span className="fas fa-ellipsis-h fs--1"></span>
                    </button>
                    <div className="dropdown-menu dropdown-menu-end border py-2">
                      <a className="dropdown-item" href="#!">Ver detalles</a>
                      <a className="dropdown-item" href="#!">Cambiar Plan</a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item text-danger" href="#!">Suspender</a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer d-flex align-items-center justify-content-center">
          <button className="btn btn-sm btn-falcon-default me-1" type="button" title="Previous" disabled>
            <span className="fas fa-chevron-left"></span>
          </button>
          <ul className="pagination mb-0">
            <li className="active"><button className="page" type="button" data-i="1" data-page="5">1</button></li>
          </ul>
          <button className="btn btn-sm btn-falcon-default ms-1" type="button" title="Next" disabled>
            <span className="fas fa-chevron-right"></span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Suscripciones;
