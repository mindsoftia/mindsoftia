import React from 'react';

function Tenants() {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0" id="tenants-title">Gestión de Empresas (Tenants)</h5>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary btn-sm">
                <span className="fas fa-plus me-1"></span>Nueva Empresa
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-0">
            Aquí podrás administrar las empresas suscritas a Mindsoftia. 
            Cada empresa tendrá su propia base de usuarios, plan de cuentas, y contabilidad completamente aislada.
          </p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 align-middle white-space-nowrap">Nombre de la Empresa</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">RUC / NIT</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Email de Contacto</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-center">Estado</th>
                  <th className="no-sort pe-1 align-middle data-table-row-action"></th>
                </tr>
              </thead>
              <tbody className="list" id="table-tenants-body">
                <tr>
                  <td className="align-middle fw-semi-bold">Mindsoftia Demo</td>
                  <td className="align-middle">123456789001</td>
                  <td className="align-middle">demo@mindsoftia.com</td>
                  <td className="align-middle text-center">
                    <span className="badge badge rounded-pill d-block p-1 fs--2 badge-subtle-success">
                      Activo<span className="ms-1 fas fa-check" data-fa-transform="shrink-2"></span>
                    </span>
                  </td>
                  <td className="align-middle white-space-nowrap text-end">
                    <div className="dropstart font-sans-serif position-static d-inline-block">
                      <button className="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal" type="button" id="btn-ten-1" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false">
                        <span className="fas fa-ellipsis-h fs--1"></span>
                      </button>
                      <div className="dropdown-menu dropdown-menu-end border py-0" aria-labelledby="btn-ten-1">
                        <div className="py-2">
                          <a className="dropdown-item" href="#!">Editar</a>
                          <div className="dropdown-divider"></div>
                          <a className="dropdown-item text-danger" href="#!">Suspender</a>
                        </div>
                      </div>
                    </div>
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

export default Tenants;
