import React, { useState } from 'react';

function Certificados() {
  const [certificados] = useState([
    {
      id: 1,
      empresa: 'Acme Technologies',
      nit: '900.123.456-7',
      fechaEmision: '2025-08-01',
      fechaVencimiento: '2026-08-01',
      diasRestantes: 43,
      estado: 'warning', // < 60 dias
      pin: '****'
    },
    {
      id: 2,
      empresa: 'Globex Corporation',
      nit: '800.987.654-3',
      fechaEmision: '2026-01-15',
      fechaVencimiento: '2027-01-15',
      diasRestantes: 210,
      estado: 'success', // Optimo
      pin: '****'
    },
    {
      id: 3,
      empresa: 'Inversiones El Cóndor',
      nit: '901.444.555-1',
      fechaEmision: '2024-06-10',
      fechaVencimiento: '2025-06-10',
      diasRestantes: -9,
      estado: 'danger', // Vencido
      pin: '****'
    }
  ]);

  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-0 mb-0 text-nowrap py-2 py-xl-0">
                <span className="fas fa-file-signature me-2 text-primary"></span>Certificados Digitales DIAN (.p12)
              </h5>
            </div>
            <div className="col-8 col-sm-auto text-end ps-2">
              <button className="btn btn-falcon-default btn-sm me-2" type="button">
                <span className="fas fa-filter me-1"></span>Filtrar Vencidos
              </button>
              <button className="btn btn-primary btn-sm" type="button">
                <span className="fas fa-upload me-1"></span>Cargar Certificado
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Empresa</th>
                  <th>NIT</th>
                  <th>Emisión</th>
                  <th>Vencimiento</th>
                  <th className="text-center">Días Restantes</th>
                  <th className="text-center">Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody className="list">
                {certificados.map((cert) => (
                  <tr key={cert.id}>
                    <td className="align-middle fw-semi-bold">{cert.empresa}</td>
                    <td className="align-middle">{cert.nit}</td>
                    <td className="align-middle">{cert.fechaEmision}</td>
                    <td className="align-middle fw-bold">{cert.fechaVencimiento}</td>
                    <td className="align-middle text-center">
                      <span className={`badge badge-subtle-${cert.estado} rounded-pill fs--2`}>
                        {cert.diasRestantes < 0 ? 'Expiró hace ' + Math.abs(cert.diasRestantes) + ' días' : cert.diasRestantes + ' días'}
                      </span>
                    </td>
                    <td className="align-middle text-center">
                      {cert.estado === 'success' && <span className="fas fa-check-circle text-success fs-1" title="Vigente"></span>}
                      {cert.estado === 'warning' && <span className="fas fa-exclamation-triangle text-warning fs-1" title="Próximo a Vencer"></span>}
                      {cert.estado === 'danger' && <span className="fas fa-times-circle text-danger fs-1" title="Vencido"></span>}
                    </td>
                    <td className="align-middle text-end">
                      <button className="btn btn-sm btn-falcon-default me-2" type="button" title="Ver PIN">
                        <span className="fas fa-key text-500"></span>
                      </button>
                      <button className="btn btn-sm btn-falcon-default me-2" type="button" title="Probar Conexión DIAN">
                        <span className="fas fa-plug text-primary"></span>
                      </button>
                      <button className="btn btn-sm btn-falcon-danger" type="button" title="Eliminar">
                        <span className="fas fa-trash-alt"></span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <span className="fas fa-shield-check text-success fs-4 mb-2"></span>
              <h4 className="mb-0">156</h4>
              <p className="fs--1 text-500 mb-0">Certificados Vigentes</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <span className="fas fa-exclamation-triangle text-warning fs-4 mb-2"></span>
              <h4 className="mb-0">12</h4>
              <p className="fs--1 text-500 mb-0">Próximos a Vencer (30 días)</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <span className="fas fa-times-circle text-danger fs-4 mb-2"></span>
              <h4 className="mb-0">3</h4>
              <p className="fs--1 text-500 mb-0">Certificados Vencidos</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Certificados;
