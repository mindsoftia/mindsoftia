import React, { useState } from 'react';

/**
 * CierresIndex.jsx — Módulo de Cierre Contable y Traslado de Resultados NIIF
 * 
 * Especialidades: /master-cont + /master-ui + /master-dev + /master-db
 * Propósito: Saldar cuentas nominales (Clases 4, 5 y 6) contra Ganancias y Pérdidas (5905)
 * y trasladar el resultado neto hacia Patrimonio (Utilidad 3605 o Pérdida 3610) bajo Partida Doble.
 */
export default function CierresIndex() {
  const [periodo, setPeriodo] = useState('2026-12'); // '2026-12' (Cierre Anual) o '2026-07' (Corte mensual)
  const [cierreEjecutado, setCierreEjecutado] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  // Saldos acumulados simulados del ejercicio a cancelar
  const datosClases = {
    ingresosClase4: 28540000.00,
    gastosClase5: 8450000.00,
    costosClase6: 4264013.05,
  };

  const utilidadEjercicio = datosClases.ingresosClase4 - datosClases.gastosClase5 - datosClases.costosClase6;
  const esUtilidad = utilidadEjercicio >= 0;

  // Asiento de Cierre NIIF generado por el algoritmo de partida doble
  const asientoCierreSimulado = [
    { cuenta: '413501', nombre: 'Comercio al por mayor y al por menor (Ventas POS)', naturaleza: 'Crédito', saldoActual: 28540000.00, debitoCierre: 28540000.00, creditoCierre: 0.00, tipo: 'CANCELACIÓN INGRESOS' },
    { cuenta: '510506', nombre: 'Sueldos y Salarios Personal Administrativo', naturaleza: 'Débito', saldoActual: 5200000.00, debitoCierre: 0.00, creditoCierre: 5200000.00, tipo: 'CANCELACIÓN GASTOS' },
    { cuenta: '511515', nombre: 'Impuestos y Contribuciones — ICA y Parafiscales', naturaleza: 'Débito', saldoActual: 3250000.00, debitoCierre: 0.00, creditoCierre: 3250000.00, tipo: 'CANCELACIÓN GASTOS' },
    { cuenta: '613501', nombre: 'Costo de Mercancías Vendidas POS', naturaleza: 'Débito', saldoActual: 4264013.05, debitoCierre: 0.00, creditoCierre: 4264013.05, tipo: 'CANCELACIÓN COSTOS' },
    { cuenta: '590501', nombre: 'Ganancias y Pérdidas del Ejercicio (Transitoria)', naturaleza: 'Crédito', saldoActual: 0.00, debitoCierre: 12714013.05, creditoCierre: 28540000.00, tipo: 'RESUMEN INTERMEDIO' },
    { cuenta: esUtilidad ? '360501' : '361001', nombre: esUtilidad ? 'Utilidad del Ejercicio (Patrimonio)' : 'Pérdida del Ejercicio (Patrimonio)', naturaleza: esUtilidad ? 'Crédito' : 'Débito', saldoActual: 0.00, debitoCierre: esUtilidad ? 0.00 : Math.abs(utilidadEjercicio), creditoCierre: esUtilidad ? utilidadEjercicio : 0.00, tipo: 'TRASLADO NETO PATRIMONIAL' },
  ];

  const totalDebitosAsiento = asientoCierreSimulado.reduce((s, item) => s + item.debitoCierre, 0);
  const totalCreditosAsiento = asientoCierreSimulado.reduce((s, item) => s + item.creditoCierre, 0);
  const cuadreExacto = Math.abs(totalDebitosAsiento - totalCreditosAsiento) < 0.01;

  const handleEjecutarCierre = () => {
    setCierreEjecutado(true);
    setModalConfirmacion(false);
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Encabezado Principal ──────────────────────────────────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <h5 className="mb-1 fw-bolder text-900 d-flex align-items-center">
              <span className="fas fa-lock text-primary me-2 fs-4"></span>
              Cierre Contable y Traslado de Resultados NIIF
            </h5>
            <p className="mb-0 fs--1 text-600">
              Cancelación de cuentas nominales (Clases 4, 5 y 6) e inyección automática en el Patrimonio (Cuenta 3605).
            </p>
          </div>
          <div className="mt-2 mt-md-0 d-flex align-items-center gap-2">
            <select className="form-select form-select-sm" style={{ width: '200px' }} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="2026-12">Cierre Anual — Ejercicio 2026</option>
              <option value="2026-07">Corte de Mes — Julio 2026</option>
            </select>
            <span className={`badge ${cierreEjecutado ? 'badge-soft-success text-success dark__text-success' : 'badge-soft-warning text-warning dark__text-warning'} px-3 py-2 fs--2`}>
              <span className={`fas ${cierreEjecutado ? 'fa-lock me-1' : 'fa-lock-open me-1'}`}></span>
              {cierreEjecutado ? 'EJERCICIO BLOQUEADO' : 'PERIODO ABIERTO'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tarjetas Resumen de Saldos Nominales a Cancelar ──────── */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3">
          <div className="card shadow-none border h-100 bg-soft-primary">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-primary text-uppercase fs--2 fw-bold mb-1">Total Ingresos (Clase 4)</h6>
                <h4 className="mb-0 text-primary fw-bolder">${datosClases.ingresosClase4.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
                <span className="fs--2 text-700">Se debitarán en su totalidad</span>
              </div>
              <span className="fas fa-chart-line fs-2 text-primary opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-none border h-100 bg-soft-danger">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-danger text-uppercase fs--2 fw-bold mb-1">Total Gastos (Clase 5)</h6>
                <h4 className="mb-0 text-danger fw-bolder">${datosClases.gastosClase5.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
                <span className="fs--2 text-700">Se acreditarán al 100%</span>
              </div>
              <span className="fas fa-file-invoice fs-2 text-danger opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-none border h-100 bg-soft-warning">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-warning dark__text-warning text-uppercase fs--2 fw-bold mb-1">Total Costos (Clase 6)</h6>
                <h4 className="mb-0 text-warning dark__text-warning fw-bolder">${datosClases.costosClase6.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
                <span className="fs--2 text-800 dark__text-200">Costo de mercancía POS</span>
              </div>
              <span className="fas fa-boxes fs-2 opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className={`card shadow-none border h-100 ${esUtilidad ? 'bg-soft-success' : 'bg-soft-danger'}`}>
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className={`text-uppercase fs--2 fw-bold mb-1 ${esUtilidad ? 'text-success dark__text-success' : 'text-danger'}`}>
                  {esUtilidad ? 'Utilidad del Ejercicio' : 'Pérdida Neta'}
                </h6>
                <h4 className={`mb-0 fw-bolder ${esUtilidad ? 'text-success dark__text-success' : 'text-danger'}`}>
                  ${Math.abs(utilidadEjercicio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </h4>
                <span className="fs--2 text-800 dark__text-200">
                  {esUtilidad ? 'Traslado a cuenta 360501' : 'Traslado a cuenta 361001'}
                </span>
              </div>
              <span className={`fas ${esUtilidad ? 'fa-trophy' : 'fa-exclamation-triangle'} fs-2 opacity-50`}></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Simulación y Verificación del Asiento de Cierre ───────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold">Comprobante Automático de Cierre de Ejercicio (`COMP-CIERRE-2026`)</h6>
            <span className="fs--2 text-600">Verificación algebraica NIIF antes de la inmutabilidad de la base de datos</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${cuadreExacto ? 'badge-soft-success text-success dark__text-success' : 'badge-soft-danger text-danger'} px-3 py-1 fs--2`}>
              <span className={`fas ${cuadreExacto ? 'fa-check me-1' : 'fa-times me-1'}`}></span>
              Partida Doble: {cuadreExacto ? 'CUADRADA ($0.00 dif)' : 'DESCUADRE DETECTADO'}
            </span>
            {!cierreEjecutado && (
              <button
                type="button"
                className="btn btn-sm btn-primary px-3 shadow-none"
                onClick={() => setModalConfirmacion(true)}
              >
                <span className="fas fa-lock me-1"></span>Ejecutar y Bloquear Cierre
              </button>
            )}
            {cierreEjecutado && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3 shadow-none"
                onClick={() => setCierreEjecutado(false)}
              >
                <span className="fas fa-unlock me-1"></span>Reabrir (Modo Auditor)
              </button>
            )}
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="ps-3">Cuenta PUC</th>
                  <th>Nombre de la Cuenta</th>
                  <th className="text-center">Operación en el Cierre</th>
                  <th className="text-end">Saldo Actual Antes Cierre ($)</th>
                  <th className="text-end text-success">Débitos Cierre ($)</th>
                  <th className="text-end text-info pe-3">Créditos Cierre ($)</th>
                </tr>
              </thead>
              <tbody>
                {asientoCierreSimulado.map((item) => (
                  <tr key={item.cuenta} className={item.cuenta.startsWith('36') ? 'bg-50 fw-bold' : item.cuenta.startsWith('59') ? 'bg-soft-secondary' : ''}>
                    <td className="ps-3 font-monospace fw-bold text-primary">{item.cuenta}</td>
                    <td className="text-900">{item.nombre}</td>
                    <td className="text-center">
                      <span className="badge badge-soft-secondary text-800 dark__text-200 px-2 py-1">{item.tipo}</span>
                    </td>
                    <td className="text-end text-600">${item.saldoActual.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td className="text-end text-success fw-semi-bold">
                      {item.debitoCierre > 0 ? `$${item.debitoCierre.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="text-end text-info fw-semi-bold pe-3">
                      {item.creditoCierre > 0 ? `$${item.creditoCierre.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-100 fw-bold">
                <tr>
                  <td colSpan="4" className="text-end pe-3 py-3 fs-0 text-900">TOTALES VERIFICADOS PARTIDA DOBLE:</td>
                  <td className="text-end py-3 fs-0 text-success">${totalDebitosAsiento.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                  <td className="text-end pe-3 py-3 fs-0 text-info">${totalCreditosAsiento.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal de Confirmación para Cierre Inmutable ───────────── */}
      {modalConfirmacion && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white py-3">
                <h6 className="modal-title text-white fw-bold d-flex align-items-center">
                  <span className="fas fa-exclamation-triangle me-2 fs-5"></span>
                  Confirmar Cierre Contable del Ejercicio
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalConfirmacion(false)}></button>
              </div>
              <div className="modal-body p-4 text-900">
                <p className="fw-semi-bold mb-2">Estás a punto de saldar en $0.00 todas las cuentas nominales (Clases 4, 5 y 6) y generar el asiento inmutable hacia Patrimonio:</p>
                <div className="alert alert-warning py-2 mb-3 fs--1">
                  <strong>Cuenta Destino:</strong> {esUtilidad ? '360501 — Utilidad del Ejercicio' : '361001 — Pérdida del Ejercicio'} <br />
                  <strong>Valor Trasladado:</strong> ${Math.abs(utilidadEjercicio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </div>
                <p className="fs--2 text-600 mb-0">
                  Una vez confirmado, el periodo <strong>{periodo}</strong> quedará protegido con criptografía (`is_locked = true`) contra modificaciones o ingresos posteriores de facturas según normativa DIAN y NIIF.
                </p>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setModalConfirmacion(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-sm btn-danger px-4 fw-bold" onClick={handleEjecutarCierre}>
                  <span className="fas fa-lock me-1"></span>Confirmar y Bloquear Período
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
