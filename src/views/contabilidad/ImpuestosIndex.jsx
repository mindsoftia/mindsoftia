import React, { useState } from 'react';

/**
 * ImpuestosIndex.jsx — Módulo de Liquidación e Impuestos DIAN / Retenciones NIIF
 * 
 * Especialidades: /master-cont + /master-ui + /master-dev + /master-db
 * Propósito: Gestionar IVA (2408), Retenciones en la Fuente (2365), ICA (2368) y
 * emitir Certificados Tributarios oficiales conforme al Art. 381 del Estatuto Tributario.
 */
export default function ImpuestosIndex() {
  const [tabActiva, setTabActiva] = useState('IVA'); // 'IVA', 'RETENCIONES', 'CERTIFICADOS'
  const [periodo, setPeriodo] = useState('2026-07');
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null);

  // Datos simulados en vivo y cálculo de saldos tributarios
  const datosIva = {
    generado19: 135714.29,
    generado5: 0.00,
    descontableCompras: 26901.35,
    retencionesIvaSufridas: 0.00,
  };
  const saldoNetoIva = (datosIva.generado19 + datosIva.generado5) - datosIva.descontableCompras - datosIva.retencionesIvaSufridas;

  const retencionesPracticadas = [
    { id: 'ret-1', tercero: 'Consultoría y Sistemas SAS (NIT: 900.812.441-3)', concepto: 'Servicios de Ingeniería y Soporte Art. 392 E.T.', base: 1500000.00, tarifa: 4.0, monto: 60000.00, cuenta: '236525', fecha: '2026-07-15', certificado: 'CERT-2026-001' },
    { id: 'ret-2', tercero: 'Suministros y Mercaderías del Oriente (NIT: 890.201.112-9)', concepto: 'Compras Generales Declarantes Art. 401 E.T.', base: 3500000.00, tarifa: 2.5, monto: 87500.00, cuenta: '236540', fecha: '2026-07-18', certificado: 'CERT-2026-002' },
    { id: 'ret-3', tercero: 'Inmobiliaria Santander Plaza (NIT: 804.011.233-1)', concepto: 'Retención de Industria y Comercio (ReteICA Bucaramanga 11.04‰)', base: 2200000.00, tarifa: 1.104, monto: 24288.00, cuenta: '236801', fecha: '2026-07-20', certificado: 'CERT-2026-003' },
  ];

  const totalRetenido = retencionesPracticadas.reduce((sum, item) => sum + item.monto, 0);

  return (
    <div className="container-fluid px-0">
      {/* ── Encabezado Principal ──────────────────────────────────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <h5 className="mb-1 fw-bolder text-900 d-flex align-items-center">
              <span className="fas fa-file-invoice-dollar text-primary me-2 fs-4"></span>
              Gestión e Impuestos DIAN / Retenciones NIIF
            </h5>
            <p className="mb-0 fs--1 text-600">
              Control de IVA (Cuenta 2408), depuración de Retención en la Fuente (2365/2368) y emisión de Certificados oficiales.
            </p>
          </div>
          <div className="mt-2 mt-md-0 d-flex align-items-center gap-2">
            <select className="form-select form-select-sm" style={{ width: '170px' }} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="2026-07">Julio 2026 (Bimestre 4)</option>
              <option value="2026-06">Junio 2026 (Bimestre 3)</option>
            </select>
            <span className="badge badge-soft-success text-success dark__text-success px-3 py-2 fs--2">
              <span className="fas fa-check-circle me-1"></span>Norma DIAN / E.T.
            </span>
          </div>
        </div>

        {/* ── Tabs de Navegación ────────────────────────────────────── */}
        <div className="card-body p-0 border-top">
          <ul className="nav nav-tabs nav-tabs-falcon border-bottom-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link fw-semi-bold ${tabActiva === 'IVA' ? 'active text-primary' : 'text-600'}`}
                onClick={() => setTabActiva('IVA')}
              >
                <span className="fas fa-percentage me-2"></span>Liquidación de IVA (2408)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semi-bold ${tabActiva === 'RETENCIONES' ? 'active text-primary' : 'text-600'}`}
                onClick={() => setTabActiva('RETENCIONES')}
              >
                <span className="fas fa-hand-holding-usd me-2"></span>Retenciones Practicadas ({retencionesPracticadas.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semi-bold ${tabActiva === 'CERTIFICADOS' ? 'active text-primary' : 'text-600'}`}
                onClick={() => setTabActiva('CERTIFICADOS')}
              >
                <span className="fas fa-certificate me-2"></span>Certificados Tributarios (Art. 381 E.T.)
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── TAB 1: LIQUIDACIÓN DE IVA (2408) ────────────────────── */}
      {tabActiva === 'IVA' && (
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card shadow-none border h-100 bg-soft-primary">
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-primary text-uppercase fs--2 fw-bold mb-1">IVA Generado en Ventas (Crédito)</h6>
                  <h4 className="mb-0 text-primary fw-bolder">${(datosIva.generado19 + datosIva.generado5).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
                  <span className="fs--2 text-700">Subcuenta 240801 (Tarifa general 19%)</span>
                </div>
                <span className="fas fa-arrow-up fs-2 text-primary opacity-50"></span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-none border h-100 bg-soft-info">
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-info text-uppercase fs--2 fw-bold mb-1">IVA Descontable Compras (Débito)</h6>
                  <h4 className="mb-0 text-info fw-bolder">${datosIva.descontableCompras.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
                  <span className="fs--2 text-700">Subcuenta 240802 (Adquisiciones gravadas)</span>
                </div>
                <span className="fas fa-arrow-down fs-2 text-info opacity-50"></span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className={`card shadow-none border h-100 ${saldoNetoIva >= 0 ? 'bg-soft-warning' : 'bg-soft-success'}`}>
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className={`text-uppercase fs--2 fw-bold mb-1 ${saldoNetoIva >= 0 ? 'text-warning dark__text-warning' : 'text-success dark__text-success'}`}>
                    {saldoNetoIva >= 0 ? 'Saldo a Pagar DIAN (Formulario 300)' : 'Saldo a Favor Tributario'}
                  </h6>
                  <h4 className={`mb-0 fw-bolder ${saldoNetoIva >= 0 ? 'text-warning dark__text-warning' : 'text-success dark__text-success'}`}>
                    ${Math.abs(saldoNetoIva).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </h4>
                  <span className="fs--2 text-800 dark__text-200">
                    {saldoNetoIva >= 0 ? 'Pasivo Impositivo Corriente' : 'Activo susceptible de arrastre bimestral'}
                  </span>
                </div>
                <span className="fas fa-balance-scale fs-2 opacity-50"></span>
              </div>
            </div>
          </div>

          {/* Tabla de Desglose de IVA */}
          <div className="col-12">
            <div className="card shadow-none border">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Depuración y Conciliación Bimestral Cuenta 2408</h6>
                <span className="badge badge-soft-primary text-primary dark__text-info px-2 py-1 fs--2">Corte: {periodo}</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-hover mb-0 fs--1 align-middle">
                    <thead className="bg-200 text-900">
                      <tr>
                        <th className="ps-3">Código PUC</th>
                        <th>Concepto Tributario</th>
                        <th className="text-center">Naturaleza</th>
                        <th className="text-end">Base Gravable ($)</th>
                        <th className="text-end">Tarifa</th>
                        <th className="text-end pe-3 fw-bold">Saldo Causado ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="ps-3 font-monospace fw-bold text-primary">240801</td>
                        <td className="fw-semi-bold">IVA Generado en Ventas POS y Electrónica</td>
                        <td className="text-center"><span className="badge badge-soft-warning text-warning dark__text-warning px-2 py-1">Crédito (Pasivo)</span></td>
                        <td className="text-end text-600">$714,285.71</td>
                        <td className="text-end">19.0%</td>
                        <td className="text-end pe-3 fw-bold text-primary">${datosIva.generado19.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="ps-3 font-monospace text-700">240802</td>
                        <td className="fw-semi-bold">IVA Descontable por Adquisición de Bienes y Servicios</td>
                        <td className="text-center"><span className="badge badge-soft-primary text-primary dark__text-info px-2 py-1">Débito (Menor Pasivo)</span></td>
                        <td className="text-end text-600">$141,586.05</td>
                        <td className="text-end">19.0%</td>
                        <td className="text-end pe-3 fw-bold text-info">-${datosIva.descontableCompras.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-50 fw-bold">
                      <tr>
                        <td colSpan="5" className="text-end pe-3 py-3 fs-0 text-900">SALDO NETO POR PAGAR A LA DIAN:</td>
                        <td className="text-end pe-3 py-3 fs-0 text-warning dark__text-warning">${saldoNetoIva.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RETENCIONES PRACTICADAS (2365 / 2368) ────────────── */}
      {tabActiva === 'RETENCIONES' && (
        <div className="card shadow-none border">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Libro de Auxiliar de Retenciones Practicadas en el Periodo ({retencionesPracticadas.length})</h6>
            <div className="d-flex gap-2">
              <span className="badge badge-soft-secondary text-800 dark__text-200 px-3 py-1 fs--2">Total Retenido: ${totalRetenido.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0 fs--1 align-middle">
                <thead className="bg-200 text-900">
                  <tr>
                    <th className="ps-3">Cuenta PUC</th>
                    <th>Tercero / Retenido</th>
                    <th>Concepto Tributario</th>
                    <th className="text-end">Base Gravable ($)</th>
                    <th className="text-center">Tarifa</th>
                    <th className="text-end">Valor Retenido ($)</th>
                    <th className="text-center pe-3">Certificado</th>
                  </tr>
                </thead>
                <tbody>
                  {retencionesPracticadas.map((ret) => (
                    <tr key={ret.id}>
                      <td className="ps-3 font-monospace fw-bold text-primary">{ret.cuenta}</td>
                      <td className="fw-semi-bold text-900">{ret.tercero}</td>
                      <td className="text-600">{ret.concepto}</td>
                      <td className="text-end text-700">${ret.base.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <span className="badge badge-soft-secondary text-800 dark__text-200 px-2 py-1">{ret.tarifa}%</span>
                      </td>
                      <td className="text-end fw-bold text-success dark__text-success">${ret.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center pe-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary py-1 px-2 fs--2"
                          onClick={() => { setCertificadoSeleccionado(ret); setTabActiva('CERTIFICADOS'); }}
                        >
                          <span className="fas fa-print me-1"></span>Ver {ret.certificado}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CERTIFICADOS TRIBUTARIOS (ART. 381 E.T.) ───────── */}
      {tabActiva === 'CERTIFICADOS' && (
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">
            <div className="card shadow-none border">
              <div className="card-header bg-light py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Certificado Oficial de Retención en la Fuente — Año Gravable 2026</h6>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => window.print()}>
                    <span className="fas fa-file-pdf me-1"></span>Imprimir / PDF
                  </button>
                </div>
              </div>
              <div className="card-body p-4 bg-white text-900">
                {/* Membrete Oficial */}
                <div className="text-center border-bottom pb-3 mb-4">
                  <h5 className="fw-bolder text-uppercase mb-1">MINDSOFTIA ERP CLOUD S.A.S.</h5>
                  <p className="mb-1 fs--1 fw-semi-bold">NIT: 901.458.112-8 — Régimen Común / Responsable de IVA</p>
                  <p className="mb-0 fs--2 text-600">Bucaramanga, Santander — Colombia | Certificado conforme al Artículo 381 del Estatuto Tributario</p>
                </div>

                {/* Datos del Retenedor y Retenido */}
                {certificadoSeleccionado ? (
                  <div className="row g-3 mb-4 fs--1">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-50 rounded border">
                        <h6 className="text-uppercase text-600 fs--2 fw-bold mb-2">AGENTE RETENEDOR (QUIEN CERTIFICA)</h6>
                        <p className="mb-1 fw-bold">MINDSOFTIA ERP CLOUD S.A.S.</p>
                        <p className="mb-1 text-700">NIT: 901.458.112-8</p>
                        <p className="mb-0 text-700">Dirección: Calle 35 # 19-41 Of. 502, Bucaramanga</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-soft-primary rounded border border-primary">
                        <h6 className="text-uppercase text-primary fs--2 fw-bold mb-2">SUJETO RETENIDO (BENEFICIARIO DEL PAGO)</h6>
                        <p className="mb-1 fw-bold text-900">{certificadoSeleccionado.tercero}</p>
                        <p className="mb-1 text-700">Certificado Nro: <span className="font-monospace fw-bold">{certificadoSeleccionado.certificado}</span></p>
                        <p className="mb-0 text-700">Fecha de Expedición: {certificadoSeleccionado.fecha}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info py-3 mb-4 fs--1">
                    <span className="fas fa-info-circle me-2"></span>
                    Has seleccionado la vista general. Mostrando modelo representativo del Certificado Oficial. Selecciona una retención en la pestaña <strong>Retenciones Practicadas</strong> para cargar sus datos exactos.
                  </div>
                )}

                {/* Tabla de Valores Certificados */}
                <h6 className="fw-bold mb-2 fs--1">Detalle de Pagos Sujetos a Retención y Valores Retenidos (Año Gravable 2026)</h6>
                <div className="table-responsive border rounded mb-4">
                  <table className="table table-sm mb-0 fs--1">
                    <thead className="bg-100 text-900">
                      <tr>
                        <th className="py-2 ps-3">Concepto de la Retención (Cuenta PUC)</th>
                        <th className="py-2 text-end">Base Gravable Acumulada ($)</th>
                        <th className="py-2 text-center">Tarifa Aplicada</th>
                        <th className="py-2 text-end pe-3 fw-bold">Valor Retenido ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificadoSeleccionado ? (
                        <tr>
                          <td className="py-3 ps-3 fw-semi-bold">{certificadoSeleccionado.concepto} ({certificadoSeleccionado.cuenta})</td>
                          <td className="py-3 text-end">${certificadoSeleccionado.base.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-center">{certificadoSeleccionado.tarifa}%</td>
                          <td className="py-3 text-end pe-3 fw-bold text-success dark__text-success">${certificadoSeleccionado.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ) : (
                        retencionesPracticadas.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 ps-3">{item.concepto} ({item.cuenta})</td>
                            <td className="py-2 text-end">${item.base.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 text-center">{item.tarifa}%</td>
                            <td className="py-2 text-end pe-3 fw-bold">${item.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-50 fw-bold">
                      <tr>
                        <td colSpan="3" className="py-2 ps-3 text-end">TOTAL RETENIDO E INGRESADO A LA DIAN:</td>
                        <td className="py-2 text-end pe-3 fs-0 text-primary">
                          ${(certificadoSeleccionado ? certificadoSeleccionado.monto : totalRetenido).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Firma y Declaración Juramentada */}
                <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-end fs--2 text-600">
                  <div>
                    <p className="mb-0">El presente certificado se expide con firma electrónica en virtud del Artículo 381 del E.T.</p>
                    <p className="mb-0">y no requiere firma autógrafa física por tratarse de un documento electrónico original.</p>
                  </div>
                  <div className="text-center" style={{ width: '220px' }}>
                    <div className="border-bottom border-dark pb-2 mb-1 fw-bold text-900">FIRMA ELECTRÓNICA DIAN</div>
                    <span>Representante Legal / Contador</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
