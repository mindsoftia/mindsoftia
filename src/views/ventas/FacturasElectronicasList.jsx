import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';

/**
 * FacturasElectronicasList — Gestión de Facturación Electrónica DIAN (`UBL 2.1 / CUFE`)
 * 
 * Especialidades: /master-ui + /master-cont + /master-dev
 * Propósito: Listar facturas electrónicas, visualizar su CUFE SHA-384, código QR 
 * hacia el portal DIAN, y descargar/auditar archivos XML UBL 2.1 y PDF.
 */
function FacturasElectronicasList() {
  const { tenantId } = useAuthStore();
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [xmlModal, setXmlModal] = useState(null);
  const [detalleModal, setDetalleModal] = useState(null);

  // Lista demo/reactiva conectada al modelo `FeDocumento` / `fe_documentos` en Supabase
  const [documentos, setDocumentos] = useState([
    {
      id: 'doc-1',
      tipo_documento: '01',
      numero_completo: 'SETP990000001',
      prefijo: 'SETP',
      consecutivo: 990000001,
      fecha_emision: '2026-07-22',
      hora_emision: '14:30:15',
      adquirente_nombre: 'Tecnologías y Soluciones del Caribe SAS',
      adquirente_nit: '901234567',
      subtotal: 1500000.00,
      iva_19: 285000.00,
      total: 1785000.00,
      cufe_cune: 'a8f9c2d1e3b4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      qr_code_url: 'https://catalogo-vpfe.dian.gov.co/User/SearchDocument?documentKey=a8f9c2d1e3b4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      track_id_dian: 'DIAN-VAL-20260722-99881',
      estado_dian: 'aprobado',
      ambiente: 'Producción'
    },
    {
      id: 'doc-2',
      tipo_documento: '01',
      numero_completo: 'SETP990000002',
      prefijo: 'SETP',
      consecutivo: 990000002,
      fecha_emision: '2026-07-22',
      hora_emision: '15:10:00',
      adquirente_nombre: 'Comercializadora Andina de Alimentos LTDA',
      adquirente_nit: '800987654',
      subtotal: 420000.00,
      iva_19: 79800.00,
      total: 499800.00,
      cufe_cune: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6a8f9c2d1e3b4a5c6d7e8f9a0',
      qr_code_url: 'https://catalogo-vpfe.dian.gov.co/User/SearchDocument?documentKey=b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6a8f9c2d1e3b4a5c6d7e8f9a0',
      track_id_dian: 'DIAN-VAL-20260722-99882',
      estado_dian: 'aprobado',
      ambiente: 'Producción'
    },
    {
      id: 'doc-3',
      tipo_documento: '04',
      numero_completo: 'NC-990000001',
      prefijo: 'NC',
      consecutivo: 990000001,
      fecha_emision: '2026-07-21',
      hora_emision: '11:00:00',
      adquirente_nombre: 'Consumidor Final (POS)',
      adquirente_nit: '222222222222',
      subtotal: 85000.00,
      iva_19: 16150.00,
      total: 101150.00,
      cufe_cune: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      qr_code_url: 'https://catalogo-vpfe.dian.gov.co/User/SearchDocument?documentKey=c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      track_id_dian: 'DIAN-VAL-20260721-88410',
      estado_dian: 'enviado',
      ambiente: 'Producción'
    }
  ]);

  const docFiltrados = documentos.filter(doc => {
    const coincideEstado = filtroEstado === 'TODOS' || doc.estado_dian === filtroEstado;
    const coincideBusq   = busqueda === '' || 
      doc.numero_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.adquirente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.adquirente_nit.includes(busqueda);
    return coincideEstado && coincideBusq;
  });

  const totalEmitido = docFiltrados.reduce((acc, d) => acc + d.total, 0);
  const aprobadas = docFiltrados.filter(d => d.estado_dian === 'aprobado').length;

  const copiarCufe = (cufe) => {
    navigator.clipboard.writeText(cufe);
    alert('✅ CUFE SHA-384 copiado al portapapeles.');
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Header Falcon ─────────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="mb-1 text-900 fw-bold">
            <span className="fas fa-file-invoice-dollar text-primary me-2"></span>
            Facturación Electrónica DIAN (`UBL 2.1 / CUFE`)
          </h4>
          <p className="mb-0 text-600 fs--1">
            Validación previa en tiempo real con firma electrónica y transmisión al portal Muisca
          </p>
        </div>
        <div className="mt-2 mt-md-0 d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
            <span className="fas fa-sync me-2"></span>Consultar Estado DIAN
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center">
            <span className="fas fa-plus me-2"></span>Emitir Factura Electrónica
          </button>
        </div>
      </div>

      {/* ── Tarjetas KPI del Periodo ──────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card shadow-none border bg-soft-primary h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-primary text-uppercase fs--2 fw-bold mb-1">Documentos Emitidos</h6>
                <h3 className="mb-0 text-primary fw-bolder">{docFiltrados.length}</h3>
              </div>
              <span className="fas fa-file-invoice fs-2 text-primary opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-none border bg-soft-success h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-success text-uppercase fs--2 fw-bold mb-1">Aprobadas por DIAN</h6>
                <h3 className="mb-0 text-success fw-bolder">{aprobadas}</h3>
              </div>
              <span className="fas fa-check-circle fs-2 text-success opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-none border bg-soft-info h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-info text-uppercase fs--2 fw-bold mb-1">En Proceso / Pendientes</h6>
                <h3 className="mb-0 text-info fw-bolder">{docFiltrados.length - aprobadas}</h3>
              </div>
              <span className="fas fa-clock fs-2 text-info opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-none border bg-soft-warning h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-warning text-uppercase fs--2 fw-bold mb-1">Total Facturado NIIF</h6>
                <h4 className="mb-0 text-warning fw-bolder">${totalEmitido.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="fas fa-coins fs-2 text-warning opacity-50"></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filtros y Búsqueda ────────────────────────────────────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-body p-3 bg-light">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <label className="fs--2 fw-bold text-700 mb-1">Filtrar por Estado DIAN</label>
              <select className="form-select form-select-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="TODOS">Todos los estados</option>
                <option value="aprobado">Aprobadas por la DIAN</option>
                <option value="enviado">Transmitidas / En Proceso</option>
                <option value="rechazado">Rechazadas / Con Observación</option>
                <option value="borrador">Borrador / Sin Transmitir</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="fs--2 fw-bold text-700 mb-1">Buscar por Número, Cliente o NIT</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><span className="fas fa-search text-400"></span></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Ej: SETP990000001 o 901234567..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-3 text-end">
              <label className="fs--2 fw-bold text-700 mb-1 d-block">Configuración</label>
              <a href="/ajustes/resoluciones" className="btn btn-sm btn-outline-primary w-100">
                <span className="fas fa-cog me-1"></span>Resoluciones y Prefijos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla Principal (`card`) ──────────────────────────────── */}
      <div className="card shadow-none border">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Historial de Comprobantes Electrónicos ({docFiltrados.length})</h6>
          <span className="badge badge-soft-primary fs--2">Validación UBL 2.1 — Anexo Técnico 1.8</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Nro. Documento</th>
                  <th>Fecha Emisión</th>
                  <th>Adquirente (Cliente)</th>
                  <th>NIT / CC</th>
                  <th className="text-end">Subtotal ($)</th>
                  <th className="text-end">IVA ($)</th>
                  <th className="text-end fw-bold">Total ($)</th>
                  <th className="text-center">CUFE SHA-384</th>
                  <th className="text-center">Estado DIAN</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docFiltrados.map((doc) => (
                  <tr key={doc.id}>
                    <td className="fw-bold text-primary font-monospace">
                      <span className="fas fa-file-code me-1 text-600"></span>
                      {doc.numero_completo}
                    </td>
                    <td>
                      <div>{doc.fecha_emision}</div>
                      <small className="text-500 fs--2">{doc.hora_emision}</small>
                    </td>
                    <td className="fw-semi-bold text-800 text-truncate" style={{ maxWidth: '220px' }}>
                      {doc.adquirente_nombre}
                    </td>
                    <td className="font-monospace text-700">{doc.adquirente_nit}</td>
                    <td className="text-end text-600">${doc.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td className="text-end text-600">${doc.iva_19.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td className="text-end fw-bold text-900">${doc.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <span className="font-monospace fs--2 bg-100 px-2 py-1 rounded text-truncate" style={{ maxWidth: '90px' }} title={doc.cufe_cune}>
                          {doc.cufe_cune.substring(0, 10)}...
                        </span>
                        <button className="btn btn-link btn-sm p-0 text-600" onClick={() => copiarCufe(doc.cufe_cune)} title="Copiar CUFE completo">
                          <span className="fas fa-copy"></span>
                        </button>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${doc.estado_dian === 'aprobado' ? 'badge-soft-success' : doc.estado_dian === 'enviado' ? 'badge-soft-info' : 'badge-soft-warning'} d-inline-flex align-items-center`}>
                        <span className={`fas ${doc.estado_dian === 'aprobado' ? 'fa-check-circle' : 'fa-spinner fa-spin'} me-1`}></span>
                        {doc.estado_dian.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-info" onClick={() => setDetalleModal(doc)} title="Ver Detalle Financiero">
                          <span className="fas fa-eye"></span>
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => setXmlModal(doc)} title="Ver XML UBL 2.1">
                          <span className="fas fa-code"></span>
                        </button>
                        <a href={doc.qr_code_url} target="_blank" rel="noreferrer" className="btn btn-outline-primary" title="Ver QR y Portal DIAN">
                          <span className="fas fa-qrcode"></span>
                        </a>
                        <button className="btn btn-outline-success" title="Descargar PDF y XML Zipeados">
                          <span className="fas fa-download"></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Visualizador XML UBL 2.1 ────────────────────────── */}
      {xmlModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold fs-0">
                  <span className="fas fa-file-code text-primary me-2"></span>
                  Estructura XML UBL 2.1 — Factura #{xmlModal.numero_completo}
                </h5>
                <button type="button" className="btn-close" onClick={() => setXmlModal(null)}></button>
              </div>
              <div className="modal-body p-4 bg-900 text-light font-monospace fs--2 overflow-auto" style={{ maxHeight: '420px' }}>
                <pre className="mb-0 text-light">
{`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${xmlModal.numero_completo}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384">${xmlModal.cufe_cune}</cbc:UUID>
  <cbc:IssueDate>${xmlModal.fecha_emision}</cbc:IssueDate>
  <cbc:IssueTime>${xmlModal.hora_emision}-05:00</cbc:IssueTime>
  
  <!-- Emisor (OFE) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>MINDSOFTIA ERP CLOUD</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID schemeID="9" schemeName="31">901000000</cbc:CompanyID>
        <cbc:TaxLevelCode>O-47</cbc:TaxLevelCode>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Adquirente -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${xmlModal.adquirente_nombre}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlModal.adquirente_nit}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Totales e Impuestos -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">${xmlModal.iva_19.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${xmlModal.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="COP">${xmlModal.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`}
                </pre>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setXmlModal(null)}>Cerrar</button>
                <button type="button" className="btn btn-primary btn-sm">Descargar XML Firmado</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalle Financiero y Retenciones ────────────────────────── */}
      {detalleModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold fs-0">
                  <span className="fas fa-file-invoice-dollar text-primary me-2"></span>
                  Detalle Financiero — Factura #{detalleModal.numero_completo}
                </h5>
                <button type="button" className="btn-close" onClick={() => setDetalleModal(null)}></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-700 fw-semi-bold">Adquirente:</span>
                  <span className="text-900 fw-bold">{detalleModal.adquirente_nombre}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-700 fw-semi-bold">NIT / CC:</span>
                  <span className="text-900 font-monospace">{detalleModal.adquirente_nit}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-600">Subtotal:</span>
                  <span className="text-800">${detalleModal.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-600">(+) IVA (19%):</span>
                  <span className="text-800">${detalleModal.iva_19.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {/* Simulando Retenciones Financieras */}
                <div className="d-flex justify-content-between mb-1 mt-3 text-danger">
                  <span className="fw-semi-bold">(-) Retención en la Fuente (2.5%):</span>
                  <span className="fw-semi-bold">-${(detalleModal.subtotal * 0.025).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-danger border-bottom pb-2">
                  <span className="fw-semi-bold">(-) ReteICA (11x1000):</span>
                  <span className="fw-semi-bold">-${(detalleModal.subtotal * 0.011).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="d-flex justify-content-between mt-2">
                  <span className="fs-1 fw-bolder text-900">Total a Pagar (Neto):</span>
                  <span className="fs-1 fw-bolder text-success">
                    ${(detalleModal.total - (detalleModal.subtotal * 0.036)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="mt-4 alert alert-info fs--1 mb-0 py-2">
                  <span className="fas fa-info-circle me-2"></span>
                  <strong>Nota Contable NIIF:</strong> Las retenciones son a título informativo para el recaudo y flujo de caja. Ante la DIAN, el valor total legal de la factura electrónica UBL 2.1 sigue siendo de <strong>${detalleModal.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</strong>.
                </div>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetalleModal(null)}>Cerrar</button>
                <button type="button" className="btn btn-primary btn-sm">Descargar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacturasElectronicasList;
