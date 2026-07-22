import React, { useState } from 'react';

/**
 * RadianBandeja — Recepción de Títulos Valores y Eventos Electrónicos DIAN
 * 
 * Especialidades: /master-ui + /master-cont
 * Propósito: Gestionar los 4 eventos obligatorios para facturas a crédito:
 * 030 (Acuse), 032 (Recibo del bien), 033 (Aceptación expresa) y 034 (Reclamo).
 */
function RadianBandeja() {
  const [eventos] = useState([
    {
      id: 'rad-101',
      factura_numero: 'FE-88421',
      emisor_nit: '800112233',
      emisor_nombre: 'Mayorista de Tecnología S.A.',
      fecha_emision: '2026-07-20',
      fecha_vencimiento: '2026-08-20',
      total_pagar: 12500000.00,
      cufe: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      eventos_activos: ['030', '032', '033'],
      estado_titulo: 'constituto_titulo_valor'
    },
    {
      id: 'rad-102',
      factura_numero: 'FC-99102',
      emisor_nit: '900445566',
      emisor_nombre: 'Suministros y Logística Express SAS',
      fecha_emision: '2026-07-22',
      fecha_vencimiento: '2026-09-22',
      total_pagar: 4800000.00,
      cufe: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
      eventos_activos: ['030'],
      estado_titulo: 'recibida_pendiente_aceptacion'
    }
  ]);

  return (
    <div className="container-fluid px-0">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="mb-1 text-900 fw-bold">
            <span className="fas fa-handshake text-success me-2"></span>
            Bandeja RADIAN & Títulos Valores Endosables
          </h4>
          <p className="mb-0 text-600 fs--1">
            Recepción de facturas de proveedores a crédito y gestión electrónica del mérito ejecutivo
          </p>
        </div>
        <div className="mt-2 mt-md-0 d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
            <span className="fas fa-sync-alt me-2"></span>Sincronizar Buzón DIAN
          </button>
          <button className="btn btn-success btn-sm d-flex align-items-center">
            <span className="fas fa-file-import me-2"></span>Cargar XML Proveedor
          </button>
        </div>
      </div>

      {/* ── Banner Informativo Falcon ─────────────────────────────── */}
      <div className="alert alert-subtle-success border-2 border-success d-flex align-items-center p-3 mb-4">
        <span className="fas fa-shield-alt fs-2 text-success me-3"></span>
        <div className="fs--1">
          <h6 className="mb-1 fw-bold text-success">¿Por qué registrar los Eventos RADIAN?</h6>
          Para que las facturas de compra a plazo sean deducibles de renta y otorguen derecho a IVA descontable, el comprador debe transmitir electrónicamente el <strong>Acuse de Recibo (030)</strong> y la <strong>Recepción de Bienes (032)</strong> al portal RADIAN de la DIAN.
        </div>
      </div>

      {/* ── Tabla RADIAN (`card`) ─────────────────────────────────── */}
      <div className="card shadow-none border">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="mb-0 fw-bold">Facturas Recibidas a Crédito — Seguimiento de Eventos</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Nro. Factura</th>
                  <th>Emisor (Proveedor)</th>
                  <th>Fecha Emisión</th>
                  <th>Vencimiento</th>
                  <th className="text-end">Total a Pagar</th>
                  <th className="text-center">Línea de Tiempo RADIAN</th>
                  <th className="text-center">Acción Siguiente</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((ev) => {
                  const tieneAcuse = ev.eventos_activos.includes('030');
                  const tieneRecibo = ev.eventos_activos.includes('032');
                  const tieneAceptacion = ev.eventos_activos.includes('033');

                  return (
                    <tr key={ev.id}>
                      <td className="fw-bold text-primary font-monospace">{ev.factura_numero}</td>
                      <td>
                        <div className="fw-semi-bold text-800">{ev.emisor_nombre}</div>
                        <small className="text-500 fs--2">NIT: {ev.emisor_nit}</small>
                      </td>
                      <td>{ev.fecha_emision}</td>
                      <td className="fw-bold text-danger">{ev.fecha_vencimiento}</td>
                      <td className="text-end fw-bold text-900">${ev.total_pagar.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <span className={`badge ${tieneAcuse ? 'bg-success' : 'bg-secondary'} fs--2`} title="Evento 030: Acuse de Recibo">
                            030 Acuse
                          </span>
                          <span className={`badge ${tieneRecibo ? 'bg-success' : 'bg-secondary'} fs--2`} title="Evento 032: Recibo de Bienes o Servicios">
                            032 Recibo
                          </span>
                          <span className={`badge ${tieneAceptacion ? 'bg-primary' : 'bg-secondary'} fs--2`} title="Evento 033: Aceptación Expresa (Título Valor)">
                            033 Aceptado
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        {tieneAceptacion ? (
                          <span className="badge badge-subtle-success fw-bold">
                            <span className="fas fa-check-double me-1"></span>Título Valor Constituido
                          </span>
                        ) : !tieneRecibo ? (
                          <button className="btn btn-sm btn-outline-success">
                            Emitir Recibo de Bienes (032)
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-primary">
                            Emitir Aceptación Expresa (033)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RadianBandeja;
