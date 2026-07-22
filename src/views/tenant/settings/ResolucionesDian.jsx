import React, { useState } from 'react';
import useAuthStore from '../../../store/authStore';

/**
 * ResolucionesDian — Gestión de Autorizaciones y Claves Técnicas (`fe_resoluciones`)
 * 
 * Especialidades: /master-ui + /master-db
 * Propósito: Permitir al usuario del tenant configurar sus resoluciones oficiales
 * de numeración (Prefijo, Rangos, Claves SHA-384 y Fechas de Vigencia).
 */
function ResolucionesDian() {
  const { tenantId } = useAuthStore();
  const [modalAbierto, setModalAbierto] = useState(false);

  const [resoluciones, setResoluciones] = useState([
    {
      id: 'res-1',
      numero_resolucion: '18764039882910',
      prefijo: 'SETP',
      numero_inicial: 990000001,
      numero_final: 990000500,
      consecutivo_actual: 990000002,
      clave_tecnica: 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
      ambiente: 1, // Producción
      vigencia_desde: '2026-01-15',
      vigencia_hasta: '2028-01-15',
      activo: true
    },
    {
      id: 'res-2',
      numero_resolucion: '18764039882911',
      prefijo: 'NC',
      numero_inicial: 990000001,
      numero_final: 990000100,
      consecutivo_actual: 990000001,
      clave_tecnica: 'bc3e12984a16e22ffd8c6f94b3f40a6e38162d',
      ambiente: 1, // Producción
      vigencia_desde: '2026-01-15',
      vigencia_hasta: '2028-01-15',
      activo: true
    }
  ]);

  const [nuevaRes, setNuevaRes] = useState({
    numero_resolucion: '',
    prefijo: 'FE',
    numero_inicial: '',
    numero_final: '',
    clave_tecnica: '',
    ambiente: 1,
    vigencia_desde: '2026-07-22',
    vigencia_hasta: '2028-07-22'
  });

  const handleGuardar = (e) => {
    e.preventDefault();
    if (!nuevaRes.numero_resolucion || !nuevaRes.clave_tecnica) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    const nueva = {
      id: `res-${Date.now()}`,
      ...nuevaRes,
      numero_inicial: Number(nuevaRes.numero_inicial),
      numero_final: Number(nuevaRes.numero_final),
      consecutivo_actual: Number(nuevaRes.numero_inicial),
      activo: true
    };
    setResoluciones([nueva, ...resoluciones]);
    setModalAbierto(false);
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="mb-1 text-900 fw-bold">
            <span className="fas fa-certificate text-primary me-2"></span>
            Resoluciones de Numeración DIAN (`fe_resoluciones`)
          </h4>
          <p className="mb-0 text-600 fs--1">
            Configuración de rangos autorizados, prefijos y claves técnicas SHA-384
          </p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={() => setModalAbierto(true)}>
            <span className="fas fa-plus me-2"></span>Nueva Resolución DIAN
          </button>
        </div>
      </div>

      {/* ── Alerta Informativa ────────────────────────────────────── */}
      <div className="alert alert-subtle-info border-2 border-info d-flex align-items-center p-3 mb-4">
        <span className="fas fa-info-circle fs-2 text-info me-3"></span>
        <div className="fs--1">
          <strong>Vigencia y Clave Técnica:</strong> La clave técnica entregada por la DIAN en el portal Muisca es indispensable para que el algoritmo calcule el CUFE oficial. El sistema notificará 30 días antes de que se agote la numeración o venza la resolución.
        </div>
      </div>

      {/* ── Tabla de Resoluciones (`card`) ────────────────────────── */}
      <div className="card shadow-none border">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="mb-0 fw-bold">Resoluciones Activas en la Empresa</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Nro. Resolución</th>
                  <th>Prefijo</th>
                  <th className="text-center">Rango Autorizado</th>
                  <th className="text-center">Consecutivo Actual</th>
                  <th>Vigencia Hasta</th>
                  <th className="text-center">Ambiente</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resoluciones.map((res) => {
                  const porcentajeUso = ((res.consecutivo_actual - res.numero_inicial) / (res.numero_final - res.numero_inicial)) * 100;
                  return (
                    <tr key={res.id}>
                      <td className="fw-bold text-primary font-monospace">{res.numero_resolucion}</td>
                      <td className="fw-bold text-900">
                        <span className="badge badge-subtle-secondary fs--1">{res.prefijo}</span>
                      </td>
                      <td className="text-center font-monospace text-700">
                        {res.numero_inicial} — {res.numero_final}
                      </td>
                      <td className="text-center fw-bolder text-success">
                        {res.consecutivo_actual}
                        <div className="progress mt-1" style={{ height: '4px', maxWidth: '80px', margin: '0 auto' }}>
                          <div className="progress-bar bg-success" style={{ width: `${porcentajeUso}%` }}></div>
                        </div>
                      </td>
                      <td>{res.vigencia_hasta}</td>
                      <td className="text-center">
                        <span className={`badge ${res.ambiente === 1 ? 'badge-subtle-primary' : 'badge-subtle-warning'}`}>
                          {res.ambiente === 1 ? 'Producción' : 'Pruebas / Habilitación'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-subtle-success">
                          <span className="fas fa-check me-1"></span>Activa
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-secondary" title="Editar resolución">
                          <span className="fas fa-edit"></span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Nueva Resolución ────────────────────────────────── */}
      {modalAbierto && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold fs-0">Registrar Nueva Resolución DIAN</h5>
                <button type="button" className="btn-close" onClick={() => setModalAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body p-4 fs--1">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Número de Resolución Muisca *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm font-monospace" 
                        placeholder="Ej: 18764039882910"
                        value={nuevaRes.numero_resolucion}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, numero_resolucion: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Prefijo *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm text-uppercase" 
                        placeholder="Ej: SETP, FE, NC"
                        value={nuevaRes.prefijo}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, prefijo: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Número Inicial *</label>
                      <input 
                        type="number" 
                        className="form-control form-control-sm" 
                        placeholder="1"
                        value={nuevaRes.numero_inicial}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, numero_inicial: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Número Final *</label>
                      <input 
                        type="number" 
                        className="form-control form-control-sm" 
                        placeholder="5000"
                        value={nuevaRes.numero_final}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, numero_final: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-12">
                      <label className="fw-bold text-700 mb-1">Clave Técnica Secreta (Para CUFE SHA-384) *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm font-monospace" 
                        placeholder="Cadena alfanumérica entregada por la DIAN"
                        value={nuevaRes.clave_tecnica}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, clave_tecnica: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Vigencia Desde</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={nuevaRes.vigencia_desde}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, vigencia_desde: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="fw-bold text-700 mb-1">Vigencia Hasta</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={nuevaRes.vigencia_hasta}
                        onChange={(e) => setNuevaRes({ ...nuevaRes, vigencia_hasta: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm">Guardar Resolución</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResolucionesDian;
