import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export default function SaaSDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    ingresosHoy: 0,
    ingresosAyer: 0,
    empresasActivas: 0,
    empresasCrecimiento: 0,
    revenueAnual: 0,
    revenueCrecimiento: 0,
    conversion: 0,
    conversionCrecimiento: 0,
    suscripciones: 0,
    facturacionDocs: 0,
    nominaProcesado: 0,
    transacciones: []
  });

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/metrics');
      if (response.data && response.data.success) {
        setMetrics(response.data.data);
      } else {
        throw new Error("No data");
      }
    } catch (error) {
      console.warn('Usando datos simulados, endpoint /admin/dashboard/metrics no disponible:', error);
      setMetrics({
        ingresosHoy: 0,
        ingresosAyer: 0,
        empresasActivas: 0,
        empresasCrecimiento: 0,
        revenueAnual: 0,
        revenueCrecimiento: 0,
        conversion: 0,
        conversionCrecimiento: 0,
        suscripciones: 0,
        facturacionDocs: 0,
        nominaProcesado: 0,
        transacciones: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="pb-5">
      
      {/* ── TARJETA PRINCIPAL (CHART AZUL SAAS) ── */}
      <div className="card mb-3 rounded-3 overflow-hidden">
        <div className="card-body bg-line-chart-gradient d-flex flex-column justify-content-between">
          <div className="row align-items-center g-0">
            <div className="col light">
              <h4 className="text-white mb-0">Hoy ${loading ? '...' : metrics.ingresosHoy.toLocaleString()}</h4>
              <p className="fs--1 fw-semi-bold text-white">Ayer <span className="opacity-50">${loading ? '...' : metrics.ingresosAyer.toLocaleString()}</span></p>
            </div>
            <div className="col-auto d-none d-sm-block">
              <select className="form-select form-select-sm mb-3" id="dashboard-chart-select">
                <option value="all">Todos los pagos</option>
                <option value="successful">Pagos Exitosos</option>
                <option value="failed">Pagos Rechazados</option>
              </select>
            </div>
          </div>
          <div className="echart-line-payment position-relative" style={{ height: '200px' }} data-echart-responsive="true">
            {/* Aquí irá el gráfico ECharts en el futuro */}
            <div className="position-absolute w-100 h-100 d-flex align-items-end justify-content-center pb-4 opacity-50">
              <h1 className="text-white opacity-25" style={{ letterSpacing: '5px' }}>[ ESPACIO PARA GRÁFICO DINÁMICO ECHARTS ]</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs PRINCIPALES DEL SAAS ── */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-700 mb-1">Empresas Activas</h6>
                  <h3 className="fw-bold mb-0 text-900">{loading ? '...' : metrics.empresasActivas}</h3>
                </div>
                <div className="text-success mt-2">
                  <span className="fas fa-level-up-alt me-1"></span>{loading ? '...' : `${metrics.empresasCrecimiento}%`}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-700 mb-1">Ingresos Anuales (SaaS)</h6>
                  <div className="d-flex align-items-center">
                    <span className="badge badge-soft-success me-2"><span className="fas fa-caret-up me-1"></span>{loading ? '...' : `${metrics.revenueCrecimiento}%`}</span>
                  </div>
                </div>
                <h3 className="fw-bold mb-0 text-900">${loading ? '...' : (metrics.revenueAnual / 1000000).toFixed(2)}M</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-700 mb-1">Conversión de Demos</h6>
                  <div className="d-flex align-items-center">
                    <span className="badge badge-soft-primary me-2"><span className="fas fa-caret-up me-1"></span>{loading ? '...' : `${metrics.conversionCrecimiento}%`}</span>
                  </div>
                </div>
                <h3 className="fw-bold mb-0 text-primary">{loading ? '...' : metrics.conversion}%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs OPERATIVOS (MÓDULOS DEL SISTEMA) ── */}
      <div className="row g-3 mb-3">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 bg-soft-warning h-100">
            <div className="card-body">
              <h6 className="text-warning">Suscripciones POS Activas</h6>
              <h2 className="fw-bold text-900">{loading ? '...' : metrics.suscripciones}</h2>
              <a href="#!" className="fw-semi-bold fs--1 text-warning">Ver detalles <span className="fas fa-chevron-right ms-1 fs--2"></span></a>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 bg-soft-info h-100">
            <div className="card-body">
              <h6 className="text-info">Facturación Electrónica (DTEs)</h6>
              <h2 className="fw-bold text-900">{loading ? '...' : `${(metrics.facturacionDocs / 1000).toFixed(1)}k`}</h2>
              <a href="#!" className="fw-semi-bold fs--1 text-info">Docs Emitidos <span className="fas fa-chevron-right ms-1 fs--2"></span></a>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-lg-4">
          <div className="card shadow-sm border-0 bg-soft-success h-100">
            <div className="card-body">
              <h6 className="text-success">Nómina Electrónica</h6>
              <h2 className="fw-bold text-900">${loading ? '...' : `${(metrics.nominaProcesado / 1000000).toFixed(1)}M`}</h2>
              <a href="#!" className="fw-semi-bold fs--1 text-success">Procesado <span className="fas fa-chevron-right ms-1 fs--2"></span></a>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLA DE TRANSACCIONES (PAGOS DEL SAAS) ── */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Resumen de Transacciones (SaaS)</h5>
          <select className="form-select form-select-sm w-auto">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
          </select>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 fs--1 align-middle">
              <tbody className="list">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary"></span></td></tr>
                ) : (
                  metrics.transacciones.map(trx => (
                    <tr key={trx.id}>
                      <td className="ps-3 py-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-xl me-3">
                            <div className="avatar-name rounded-circle bg-soft-primary text-primary"><span>{trx.empresa.charAt(0)}</span></div>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{trx.empresa}</h6>
                            <span className="text-500 fs--2">{trx.modulo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {trx.estado === 'Completado' ? (
                          <span className="badge badge-soft-success">Completado</span>
                        ) : (
                          <span className="badge badge-soft-warning">Pendiente</span>
                        )}
                      </td>
                      <td className="text-end fw-bold text-700">
                        ${trx.monto.toLocaleString()} USD
                        <div className="text-500 fw-normal fs--2">{trx.fecha}</div>
                      </td>
                      <td className="text-end pe-3">
                        <button className="btn btn-light btn-sm shadow-none border">Acción <span className="fas fa-chevron-down ms-1 fs--2"></span></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-light text-end p-2">
          <a href="#!" className="fw-semi-bold fs--1">Ver todo <span className="fas fa-angle-right ms-1"></span></a>
        </div>
      </div>

    </div>
  );
}
