import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DocumentosSoporteList = () => {
  // Datos mockeados temporalmente hasta que conectemos con Supabase/Laravel
  const [documentos] = useState([
    {
      id: 1,
      consecutivo: 'DS-001',
      fecha: '2026-07-23',
      proveedor: 'Juan Pérez (No Obligado)',
      identificacion: '1.098.765.432',
      total: '$450.000',
      retefuente: '$18.000',
      estado: 'aprobado',
      conceptos: [{ descripcion: 'Honorarios por asesoría', valor: '$450.000' }]
    },
    {
      id: 2,
      consecutivo: 'DS-002',
      fecha: '2026-07-22',
      proveedor: 'Transportes Rápidos',
      identificacion: '900.123.456',
      total: '$150.000',
      retefuente: '$1.500',
      estado: 'pendiente',
      conceptos: [{ descripcion: 'Servicio de flete', valor: '$150.000' }]
    }
  ]);

  // Estados para los modales
  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showDianModal, setShowDianModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleOpenDetalle = (doc) => {
    setSelectedDoc(doc);
    setShowDetalleModal(true);
  };

  const handleOpenDian = (doc) => {
    setSelectedDoc(doc);
    setShowDianModal(true);
  };

  const renderEstadoBadge = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <span className="badge badge-soft-success rounded-pill">Aprobado DIAN</span>;
      case 'pendiente':
        return <span className="badge badge-soft-warning rounded-pill">Borrador</span>;
      case 'rechazado':
        return <span className="badge badge-soft-danger rounded-pill">Rechazado DIAN</span>;
      default:
        return <span className="badge badge-soft-secondary rounded-pill">{estado}</span>;
    }
  };

  return (
    <>
      <div className="d-flex mb-4 mt-3">
        <span className="fa-stack me-2 ms-n1">
          <i className="fas fa-circle fa-stack-2x text-300"></i>
          <i className="fa-inverse fa-stack-1x text-primary fas fa-file-invoice-dollar"></i>
        </span>
        <div className="col">
          <h5 className="mb-0 text-primary position-relative">
            <span className="bg-200 dark__bg-1100 pe-3">Documentos Soporte DIAN</span>
            <span className="border position-absolute top-50 translate-middle-y w-100 start-0 z-index--1"></span>
          </h5>
          <p className="mb-0">Gestión de adquisiciones a sujetos no obligados a expedir factura de venta o documento equivalente.</p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Listado de Documentos</h5>
            </div>
            <div className="col-auto">
              <button 
                onClick={() => setShowNuevoModal(true)} 
                className="btn btn-falcon-primary btn-sm"
              >
                <i className="fas fa-plus me-1"></i> Nuevo Documento Soporte
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-hover table-sm mb-0 fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Consecutivo</th>
                  <th>Fecha</th>
                  <th>Tercero (No Obligado)</th>
                  <th>Identificación</th>
                  <th>Total Operación</th>
                  <th>Retefuente</th>
                  <th>Estado DIAN</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id}>
                    <td className="align-middle fw-semi-bold">{doc.consecutivo}</td>
                    <td className="align-middle">{doc.fecha}</td>
                    <td className="align-middle">{doc.proveedor}</td>
                    <td className="align-middle">{doc.identificacion}</td>
                    <td className="align-middle">{doc.total}</td>
                    <td className="align-middle text-danger">{doc.retefuente}</td>
                    <td className="align-middle">{renderEstadoBadge(doc.estado)}</td>
                    <td className="align-middle text-end">
                      <button 
                        onClick={() => handleOpenDetalle(doc)}
                        className="btn btn-link btn-sm p-0 text-primary me-2" 
                        title="Ver detalle"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => handleOpenDian(doc)}
                        className="btn btn-link btn-sm p-0 text-success" 
                        title="Enviar a DIAN"
                        disabled={doc.estado === 'aprobado'}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {documentos.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No hay documentos soporte registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL: NUEVO DOCUMENTO SOPORTE ── */}
      {showNuevoModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title"><i className="fas fa-file-signature text-primary me-2"></i>Crear Nuevo Documento Soporte</h5>
                <button type="button" className="btn-close" onClick={() => setShowNuevoModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tercero (Proveedor No Obligado)</label>
                    <select className="form-select form-select-sm">
                      <option value="">Seleccione o cree un tercero...</option>
                      <option value="1">Juan Pérez - 1.098.765.432</option>
                      <option value="2">Transportes Rápidos - 900.123.456</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha de Operación</label>
                    <input type="date" className="form-control form-control-sm" defaultValue="2026-07-23" />
                  </div>
                  <div className="col-12 mt-4">
                    <h6 className="fw-semi-bold">Detalle de la Adquisición</h6>
                    <table className="table table-sm table-bordered fs--1 mt-2">
                      <thead className="bg-200">
                        <tr>
                          <th>Concepto / Servicio</th>
                          <th style={{ width: '150px' }}>Valor</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><input type="text" className="form-control form-control-sm" placeholder="Ej: Honorarios por asesoría" /></td>
                          <td><input type="number" className="form-control form-control-sm" placeholder="$ 0" /></td>
                          <td className="text-center">
                            <button className="btn btn-link btn-sm text-danger p-0"><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button className="btn btn-sm btn-falcon-default mt-2"><i className="fas fa-plus me-1"></i>Añadir Línea</button>
                  </div>
                  <div className="col-md-6 mt-4">
                    <label className="form-label">Retención en la Fuente</label>
                    <div className="input-group input-group-sm">
                      <input type="number" className="form-control" placeholder="Porcentaje" />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-top-0">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowNuevoModal(false)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNuevoModal(false)}>Guardar Borrador</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VER DETALLE ── */}
      {showDetalleModal && selectedDoc && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Detalle Documento {selectedDoc.consecutivo}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetalleModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-semi-bold">Proveedor:</span>
                  <span>{selectedDoc.proveedor}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-semi-bold">Total Operación:</span>
                  <span className="fs-1 text-primary">{selectedDoc.total}</span>
                </div>
                <hr />
                <h6 className="fw-semi-bold">Conceptos:</h6>
                <ul className="list-unstyled mb-0">
                  {selectedDoc.conceptos.map((c, i) => (
                    <li key={i} className="d-flex justify-content-between fs--1 mb-1">
                      <span>{c.descripcion}</span>
                      <span>{c.valor}</span>
                    </li>
                  ))}
                </ul>
                <hr />
                <div className="d-flex justify-content-between text-danger mb-3">
                  <span className="fw-semi-bold">Retefuente:</span>
                  <span>- {selectedDoc.retefuente}</span>
                </div>
              </div>
              <div className="modal-footer bg-light border-top-0">
                <button className="btn btn-secondary btn-sm w-100" onClick={() => setShowDetalleModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ENVIAR A DIAN ── */}
      {showDianModal && selectedDoc && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Transmitir a la DIAN</h5>
                <button type="button" className="btn-close" onClick={() => setShowDianModal(false)}></button>
              </div>
              <div className="modal-body text-center p-4">
                <i className="fas fa-cloud-upload-alt text-success fs-3 mb-3"></i>
                <p className="mb-0">¿Estás seguro de enviar el documento <strong>{selectedDoc.consecutivo}</strong> a validación previa de la DIAN?</p>
                <p className="fs--2 text-muted mt-2">Esta acción firmará electrónicamente el UBL 2.1 y no se puede deshacer.</p>
              </div>
              <div className="modal-footer bg-light border-top-0 d-flex justify-content-between">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDianModal(false)}>Cancelar</button>
                <button className="btn btn-success btn-sm" onClick={() => setShowDianModal(false)}>Firmar y Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentosSoporteList;
