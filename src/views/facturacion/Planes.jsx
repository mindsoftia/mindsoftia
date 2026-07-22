import React from 'react';

function Planes() {
  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-0 mb-0 text-nowrap py-2 py-xl-0">
                <span className="fas fa-boxes me-2"></span>Planes y Precios (Paquetes SaaS)
              </h5>
            </div>
            <div className="col-8 col-sm-auto text-end ps-2">
              <button className="btn btn-primary btn-sm" type="button">
                <span className="fas fa-plus me-1"></span>Crear Nuevo Plan
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Tarjeta de Plan */}
            <div className="col-md-4">
              <div className="card h-100 border">
                <div className="card-body text-center">
                  <h4 className="mb-2">Plan Básico</h4>
                  <p className="fs--1 text-500">Ideal para empresas pequeñas</p>
                  <h1 className="display-4 font-weight-bold text-primary mb-0">$29<span className="fs-1 text-500">/mes</span></h1>
                  <ul className="list-unstyled mt-4 fs--1 text-start">
                    <li className="py-2 border-bottom"><span className="fas fa-check text-success me-2"></span>Facturación Electrónica DIAN</li>
                    <li className="py-2 border-bottom"><span className="fas fa-check text-success me-2"></span>1 Usuario</li>
                    <li className="py-2 border-bottom text-400"><span className="fas fa-times me-2"></span>Módulo Nómina</li>
                    <li className="py-2 text-400"><span className="fas fa-times me-2"></span>Marketing CRM</li>
                  </ul>
                </div>
                <div className="card-footer bg-light text-center">
                  <button className="btn btn-outline-primary btn-sm w-100">Editar Plan</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Planes;
