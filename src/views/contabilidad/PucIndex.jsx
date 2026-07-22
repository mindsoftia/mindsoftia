import React, { useState } from 'react';
import usePuc from '../../hooks/usePuc';

/**
 * PucIndex — Plan Único de Cuentas & Balance de Prueba Mensual (`contab_saldos_periodo`)
 * 
 * Especialidades: /master-ui + /master-cont + /master-dev + /master-db
 * Propósito: Listar el catálogo NIIF de cuentas con sus saldos de prueba en vivo
 * y permitir la creación inteligente y asistida de nuevas cuentas jerárquicas.
 */
function PucIndex() {
  const [periodo, setPeriodo] = useState('2026-07');
  const [claseFiltro, setClaseFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Hook especializado para análisis automático de jerarquía y naturaleza
  const { analyzeCode, createAccount, loading } = usePuc();

  // Cuentas locales con saldos de prueba
  const [cuentas, setCuentas] = useState([
    { id: '1', codigo: '1', nombre: 'ACTIVO', nivel: 1, naturaleza: 'debito', saldo_anterior: 15000000, debito: 911747.90, credito: 22752.10, saldo_nuevo: 15889000.00 },
    { id: '2', codigo: '11', nombre: 'DISPONIBLE (EFECTIVO Y EQUIVALENTES)', nivel: 2, naturaleza: 'debito', saldo_anterior: 12000000, debito: 168487.40, credito: 0, saldo_nuevo: 12168487.40 },
    { id: '3', codigo: '1105', nombre: 'Caja General', nivel: 4, naturaleza: 'debito', saldo_anterior: 4500000, debito: 48739.50, credito: 0, saldo_nuevo: 4548739.50 },
    { id: '4', codigo: '1110', nombre: 'Bancos — Moneda Nacional', nivel: 4, naturaleza: 'debito', saldo_anterior: 7500000, debito: 119747.90, credito: 0, saldo_nuevo: 7619747.90 },
    { id: '5', codigo: '14', nombre: 'INVENTARIOS', nivel: 2, naturaleza: 'debito', saldo_anterior: 3000000, debito: 714285.71, credito: 32012.60, saldo_nuevo: 3682273.11 },
    { id: '6', codigo: '1435', nombre: 'Mercancías no fabricadas por la empresa', nivel: 4, naturaleza: 'debito', saldo_anterior: 3000000, debito: 714285.71, credito: 32012.60, saldo_nuevo: 3682273.11 },
    
    { id: '7', codigo: '2', nombre: 'PASIVO', nivel: 1, naturaleza: 'credito', saldo_anterior: 5000000, debito: 0, credito: 876901.35, saldo_nuevo: 5876901.35 },
    { id: '8', codigo: '22', nombre: 'PROVEEDORES', nivel: 2, naturaleza: 'credito', saldo_anterior: 4000000, debito: 0, credito: 850000.00, saldo_nuevo: 4850000.00 },
    { id: '9', codigo: '2205', nombre: 'Proveedores Nacionales', nivel: 4, naturaleza: 'credito', saldo_anterior: 4000000, debito: 0, credito: 850000.00, saldo_nuevo: 4850000.00 },
    { id: '10', codigo: '24', nombre: 'CUENTAS POR PAGAR — IMPUESTOS', nivel: 2, naturaleza: 'credito', saldo_anterior: 1000000, debito: 135714.29, credito: 26901.35, saldo_nuevo: 891187.06 },
    { id: '11', codigo: '2408', nombre: 'Impuesto sobre las ventas por pagar (IVA)', nivel: 4, naturaleza: 'credito', saldo_anterior: 1000000, debito: 135714.29, credito: 26901.35, saldo_nuevo: 891187.06 },
    
    { id: '12', codigo: '3', nombre: 'PATRIMONIO', nivel: 1, naturaleza: 'credito', saldo_anterior: 10000000, debito: 0, credito: 0, saldo_nuevo: 10000000.00 },
    { id: '13', codigo: '31', nombre: 'CAPITAL SOCIAL', nivel: 2, naturaleza: 'credito', saldo_anterior: 10000000, debito: 0, credito: 0, saldo_nuevo: 10000000.00 },
    
    { id: '14', codigo: '4', nombre: 'INGRESOS', nivel: 1, naturaleza: 'credito', saldo_anterior: 0, debito: 0, credito: 141586.05, saldo_nuevo: 141586.05 },
    { id: '15', codigo: '41', nombre: 'OPERACIONALES', nivel: 2, naturaleza: 'credito', saldo_anterior: 0, debito: 0, credito: 141586.05, saldo_nuevo: 141586.05 },
    { id: '16', codigo: '4135', nombre: 'Comercio al por mayor y al por menor', nivel: 4, naturaleza: 'credito', saldo_anterior: 0, debito: 0, credito: 141586.05, saldo_nuevo: 141586.05 },
    
    { id: '17', codigo: '6', nombre: 'COSTO DE VENTAS', nivel: 1, naturaleza: 'debito', saldo_anterior: 0, debito: 32012.60, credito: 0, saldo_nuevo: 32012.60 },
    { id: '18', codigo: '61', nombre: 'COSTO DE VENTAS OPERACIONAL', nivel: 2, naturaleza: 'debito', saldo_anterior: 0, debito: 32012.60, credito: 0, saldo_nuevo: 32012.60 },
    { id: '19', codigo: '6135', nombre: 'Comercio al por mayor y al por menor', nivel: 4, naturaleza: 'debito', saldo_anterior: 0, debito: 32012.60, credito: 0, saldo_nuevo: 32012.60 },
  ]);

  // Estado del formulario para Nueva Cuenta
  const [nuevaCuenta, setNuevaCuenta] = useState({
    codigo: '',
    nombre: '',
    is_transactional: true,
    description: ''
  });

  // Diagnóstico contable instantáneo que reacciona a lo que el usuario escribe en 'codigo'
  const analisis = analyzeCode(nuevaCuenta.codigo, cuentas);

  const cuentasFiltradas = cuentas.filter(cta => {
    const coincideClase = claseFiltro === 'TODAS' || cta.codigo.startsWith(claseFiltro);
    const coincideBusq  = busqueda === '' || 
      cta.codigo.includes(busqueda) || 
      cta.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideClase && coincideBusq;
  });

  // Calculamos sumas de saldos para las clases 1, 2 y 3
  const sumasNivel1 = cuentas.filter(c => c.nivel === 1);
  const totalActivos = sumasNivel1.find(c => c.codigo === '1')?.saldo_nuevo || 0;
  const totalPasivos = sumasNivel1.find(c => c.codigo === '2')?.saldo_nuevo || 0;
  const totalPatrimonio = sumasNivel1.find(c => c.codigo === '3')?.saldo_nuevo || 0;

  const handleGuardarCuenta = async (e) => {
    e.preventDefault();
    if (!nuevaCuenta.codigo || !nuevaCuenta.nombre) {
      alert('Por favor completa el código y el nombre de la cuenta.');
      return;
    }

    // Comprobamos si el código ya existe
    if (cuentas.some(c => c.codigo === nuevaCuenta.codigo.trim())) {
      alert(`La cuenta ${nuevaCuenta.codigo} ya se encuentra registrada en el PUC.`);
      return;
    }

    const nueva = {
      id: `puc-${Date.now()}`,
      codigo: nuevaCuenta.codigo.trim(),
      nombre: nuevaCuenta.nombre.trim(),
      nivel: analisis.nivel || 4,
      naturaleza: analisis.naturaleza,
      saldo_anterior: 0,
      debito: 0,
      credito: 0,
      saldo_nuevo: 0
    };

    // Intentar sincronizar con backend AccountController (si está activo)
    await createAccount({
      code: nueva.codigo,
      name: nueva.nombre,
      type: analisis.tipo,
      nature: analisis.naturaleza,
      is_transactional: nuevaCuenta.is_transactional,
      description: nuevaCuenta.description
    });

    // Actualizamos el estado de la UI manteniendo orden jerárquico NIIF
    const listaActualizada = [...cuentas, nueva].sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));
    setCuentas(listaActualizada);
    setModalAbierto(false);
    setNuevaCuenta({ codigo: '', nombre: '', is_transactional: true, description: '' });
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="mb-1 text-900 fw-bold">
            <span className="fas fa-sitemap text-primary me-2"></span>
            Plan Único de Cuentas (PUC) & Balance de Prueba
          </h4>
          <p className="mb-0 text-600 fs--1">
            Catálogo NIIF en vivo con balance jerárquico (`contab_saldos_periodo`) y alta asistida por IA contable
          </p>
        </div>
        <div className="mt-2 mt-md-0 d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm">
            <span className="fas fa-file-excel me-1"></span>Exportar Balance
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={() => setModalAbierto(true)}>
            <span className="fas fa-plus me-1"></span>Nueva Cuenta PUC
          </button>
        </div>
      </div>

      {/* ── KPIs Situación NIIF Rápida ────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-none border bg-soft-primary h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-primary text-uppercase fs--2 fw-bold mb-1">Total Activos (Clase 1)</h6>
                <h4 className="mb-0 text-primary fw-bolder">${totalActivos.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="fas fa-wallet fs-2 text-primary opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-none border bg-soft-danger h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-danger text-uppercase fs--2 fw-bold mb-1">Total Pasivos (Clase 2)</h6>
                <h4 className="mb-0 text-danger fw-bolder">${totalPasivos.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="fas fa-hand-holding-usd fs-2 text-danger opacity-50"></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-none border bg-soft-success h-100">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-success text-uppercase fs--2 fw-bold mb-1">Total Patrimonio (Clase 3)</h6>
                <h4 className="mb-0 text-success fw-bolder">${totalPatrimonio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <span className="fas fa-balance-scale fs-2 text-success opacity-50"></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra de Filtros ──────────────────────────────────────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-body p-3 bg-light">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <label className="fs--2 fw-bold text-700 mb-1">Periodo de Balanza</label>
              <select className="form-select form-select-sm" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="2026-07">Julio 2026 (Corte en vivo)</option>
                <option value="2026-06">Junio 2026</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="fs--2 fw-bold text-700 mb-1">Clase o Grupo de Cuenta</label>
              <div className="btn-group w-100 btn-group-sm" role="group">
                {['TODAS', '1', '2', '3', '4', '6'].map((clase) => (
                  <button
                    key={clase}
                    type="button"
                    className={`btn ${claseFiltro === clase ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setClaseFiltro(clase)}
                  >
                    {clase === 'TODAS' ? 'Todas' : `Clase ${clase}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-5">
              <label className="fs--2 fw-bold text-700 mb-1">Buscar por Código o Nombre</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><span className="fas fa-search text-400"></span></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Ej: 1105 Caja o 4135 Comercio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla Balance de Prueba (`card`) ──────────────────────── */}
      <div className="card shadow-none border">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Catálogo PUC & Saldos del Periodo ({cuentasFiltradas.length} cuentas)</h6>
          <span className="fs--2 text-600">Ecuación: Saldo Nuevo = Saldo Anterior + Débitos - Créditos</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th style={{ width: '120px' }}>Código PUC</th>
                  <th>Nombre de la Cuenta</th>
                  <th className="text-center">Nivel</th>
                  <th className="text-center">Naturaleza</th>
                  <th className="text-end">Saldo Anterior ($)</th>
                  <th className="text-end text-success">Débitos Periodo ($)</th>
                  <th className="text-end text-info">Créditos Periodo ($)</th>
                  <th className="text-end fw-bold">Saldo Nuevo ($)</th>
                </tr>
              </thead>
              <tbody>
                {cuentasFiltradas.map((cta) => {
                  const esClaseOGrupo = cta.nivel <= 2;
                  return (
                    <tr key={cta.id || cta.codigo} className={cta.nivel === 1 ? 'bg-100 fw-bold' : cta.nivel === 2 ? 'fw-semi-bold bg-50' : ''}>
                      <td className="font-monospace text-900">
                        <span style={{ paddingLeft: `${(cta.nivel - 1) * 12}px` }}>
                          {cta.codigo}
                        </span>
                      </td>
                      <td>
                        {cta.nivel === 1 ? (
                          <span className="text-uppercase text-primary">{cta.nombre}</span>
                        ) : (
                          cta.nombre
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-subtle-secondary">{cta.nivel}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${cta.naturaleza === 'debito' ? 'badge-subtle-primary' : 'badge-subtle-warning'}`}>
                          {cta.naturaleza === 'debito' ? 'Débito' : 'Crédito'}
                        </span>
                      </td>
                      <td className="text-end text-600">${cta.saldo_anterior.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end text-success fw-semi-bold">${cta.debito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end text-info fw-semi-bold">${cta.credito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                      <td className={`text-end fw-bold ${esClaseOGrupo ? 'text-900' : 'text-primary'}`}>
                        ${cta.saldo_nuevo.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Inteligente: Creación de Cuenta PUC (`Falcon`) ────── */}
      {modalAbierto && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold fs-0">
                  <span className="fas fa-plus-circle text-primary me-2"></span>
                  Crear Nueva Cuenta Contable NIIF (`PUC`)
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardarCuenta}>
                <div className="modal-body p-4 fs--1">
                  <div className="mb-3">
                    <label className="fw-bold text-700 mb-1">Código PUC *</label>
                    <input 
                      type="text" 
                      className="form-control font-monospace fw-bold text-primary" 
                      placeholder="Ej: 110505, 1120, 220501"
                      value={nuevaCuenta.codigo}
                      onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, codigo: e.target.value })}
                      required 
                      autoFocus
                    />
                    <small className="text-500">Ingresa solo los dígitos. El sistema autocompletará la jerarquía y naturaleza.</small>
                  </div>

                  {/* ── Caja de Asistencia Inteligente NIIF ── */}
                  {nuevaCuenta.codigo.trim().length > 0 && (
                    <div className="alert alert-subtle-info border border-info p-3 mb-3">
                      <h6 className="fs--2 fw-bold text-info mb-2 text-uppercase">
                        <span className="fas fa-magic me-1"></span>Diagnóstico Automático NIIF
                      </h6>
                      <div className="row g-2 fs--2">
                        <div className="col-6">
                          <strong>Nivel detectado:</strong>{' '}
                          <span className="badge badge-subtle-primary ms-1">
                            {analisis.tipo ? analisis.tipo.toUpperCase() : 'AUXILIAR'} ({analisis.nivel} dígitos)
                          </span>
                        </div>
                        <div className="col-6">
                          <strong>Naturaleza NIIF:</strong>{' '}
                          <span className={`badge ${analisis.naturaleza === 'debito' ? 'badge-subtle-success' : 'badge-subtle-warning'} ms-1`}>
                            {analisis.naturaleza.toUpperCase()}
                          </span>
                        </div>
                        <div className="col-12 mt-2">
                          <strong>Cuenta Padre (Jerarquía):</strong>{' '}
                          {analisis.padreDetectado ? (
                            <span className="text-800 fw-semi-bold">
                              {analisis.padreDetectado.codigo || analisis.padreDetectado.code} — {analisis.padreDetectado.nombre || analisis.padreDetectado.name}
                            </span>
                          ) : (
                            <span className="text-600">Cuenta raíz de nueva clase o grupo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="fw-bold text-700 mb-1">Nombre o Denominación NIIF *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: Caja General Sede Centro o Bancolombia Cta Cte"
                      value={nuevaCuenta.nombre}
                      onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, nombre: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="switchTransactional"
                        checked={nuevaCuenta.is_transactional}
                        onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, is_transactional: e.target.checked })}
                      />
                      <label className="form-check-label fw-bold text-800" htmlFor="switchTransactional">
                        Cuenta de Movimiento (Permite Asientos Contables)
                      </label>
                    </div>
                    <small className="text-500 d-block ms-4">
                      Si está desactivado, se tratará únicamente como una cuenta agrupadora o carpeta de totalización.
                    </small>
                  </div>

                  <div className="mb-0">
                    <label className="fw-bold text-700 mb-1">Descripción o Notas (Opcional)</label>
                    <textarea 
                      className="form-control form-control-sm" 
                      rows="2"
                      placeholder="Uso exclusivo, retenciones aplicables, centro de costos..."
                      value={nuevaCuenta.description}
                      onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center" disabled={loading}>
                    <span className="fas fa-save me-1"></span>Guardar en Plan de Cuentas
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PucIndex;
