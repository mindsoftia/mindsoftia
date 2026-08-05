import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ReactECharts from 'echarts-for-react';

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
    transacciones: [],
    chartData: {
      fechas: [],
      valores: []
    }
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
        empresasActivas: 1,
        empresasCrecimiento: 12,
        revenueAnual: 0,
        revenueCrecimiento: 0,
        conversion: 0,
        conversionCrecimiento: 0,
        suscripciones: 154,
        facturacionDocs: 12540,
        nominaProcesado: 35000000,
        transacciones: [
          { id: 1, empresa: 'TechCorp SA', modulo: 'ERP Completo', estado: 'Completado', monto: 1500, fecha: 'Hoy, 10:30 AM' },
          { id: 2, empresa: 'Inversiones XYZ', modulo: 'Solo Facturación', estado: 'Completado', monto: 350, fecha: 'Ayer, 04:15 PM' },
          { id: 3, empresa: 'Distribuidora Global', modulo: 'Nómina', estado: 'Pendiente', monto: 800, fecha: 'Ayer, 09:00 AM' }
        ],
        chartData: {
          fechas: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          valores: [1200, 1800, 1500, 2200, 2500, 3100, 2800]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      backgroundColor: '#f9fafd',
      borderColor: '#d8e2ef',
      textStyle: { color: '#0b1727' },
      borderWidth: 1,
      transitionDuration: 0,
    },
    xAxis: {
      type: 'category',
      data: metrics.chartData?.fechas || [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.7)', margin: 15 },
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: metrics.chartData?.valores || [],
        type: 'line',
        itemStyle: { color: '#ffffff' },
        lineStyle: { color: '#ffffff', width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        smooth: 0.4,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 255, 255, 0.3)' },
              { offset: 1, color: 'rgba(255, 255, 255, 0)' }
            ]
          }
        }
      }
    ],
    grid: { right: '2%', left: '2%', bottom: '15%', top: '10%' }
  };

  return (
    <div className="pb-5">

      {/* ── TARJETA PRINCIPAL (CHART AZUL SAAS) ── */}
      <div className="card mb-3 rounded-3 overflow-hidden shadow-sm">
        <div className="card-body bg-line-chart-gradient d-flex flex-column justify-content-between p-4" style={{ background: 'linear-gradient(135deg, #2c7be5, #1a5cba)' }}>
          <div className="row align-items-center g-0 mb-4">
            <div className="col light">
              <h4 className="text-white mb-0 fw-bold">Hoy ${loading ? '...' : metrics.ingresosHoy.toLocaleString()}</h4>
              <p className="fs--1 fw-semi-bold text-white mb-0">Ayer <span className="opacity-50">${loading ? '...' : metrics.ingresosAyer.toLocaleString()}</span></p>
            </div>
            <div className="col-auto d-none d-sm-block">
              <select className="form-select form-select-sm shadow-none border-0 text-primary bg-white fw-semi-bold" id="dashboard-chart-select" style={{ cursor: 'pointer' }}>
                <option value="all">Todos los pagos</option>
                <option value="successful">Pagos Exitosos</option>
                <option value="failed">Pagos Rechazados</option>
              </select>
            </div>
          </div>
          <div className="echart-line-payment position-relative" style={{ height: '220px' }}>
            {loading ? (
               <div className="d-flex w-100 h-100 justify-content-center align-items-center">
                 <span className="spinner-border text-white opacity-50"></span>
               </div>
            ) : (
               <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </div>
      </div>
      
      {/* ── KPIs COMPACTOS (3 POR FILA) ── */}
      <div className="row g-3 mb-3">
        {/* KPI 1 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-500 fs--2 mb-1 text-uppercase">Empresas</h6>
              <h3 className="fw-bold mb-1 text-900 fs-1">{loading ? '...' : metrics.empresasActivas}</h3>
              <span className="badge badge-soft-success fs--2 rounded-pill px-2"><span className="fas fa-arrow-up me-1"></span>{loading ? '...' : `${metrics.empresasCrecimiento}%`}</span>
            </div>
          </div>
        </div>
        {/* KPI 2 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-500 fs--2 mb-1 text-uppercase">Ingresos SaaS</h6>
              <h3 className="fw-bold mb-1 text-900 fs-1">${loading ? '...' : (metrics.revenueAnual / 1000).toFixed(1)}k</h3>
              <span className="badge badge-soft-success fs--2 rounded-pill px-2"><span className="fas fa-arrow-up me-1"></span>{loading ? '...' : `${metrics.revenueCrecimiento}%`}</span>
            </div>
          </div>
        </div>
        {/* KPI 3 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-500 fs--2 mb-1 text-uppercase">Conversión</h6>
              <h3 className="fw-bold mb-1 text-primary fs-1">{loading ? '...' : metrics.conversion}%</h3>
              <span className="badge badge-soft-primary fs--2 rounded-pill px-2"><span className="fas fa-arrow-up me-1"></span>{loading ? '...' : `${metrics.conversionCrecimiento}%`}</span>
            </div>
          </div>
        </div>
        {/* KPI 4 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 bg-soft-warning h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-warning fs--2 mb-1 text-uppercase fw-bold">Suscrip. POS</h6>
              <h3 className="fw-bold mb-1 text-900 fs-1">{loading ? '...' : metrics.suscripciones}</h3>
              <a href="#!" className="fw-semi-bold fs--2 text-warning">Ver detalles</a>
            </div>
          </div>
        </div>
        {/* KPI 5 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 bg-soft-info h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-info fs--2 mb-1 text-uppercase fw-bold">DTEs Emitidos</h6>
              <h3 className="fw-bold mb-1 text-900 fs-1">{loading ? '...' : `${(metrics.facturacionDocs / 1000).toFixed(1)}k`}</h3>
              <a href="#!" className="fw-semi-bold fs--2 text-info">Doc. DIAN</a>
            </div>
          </div>
        </div>
        {/* KPI 6 */}
        <div className="col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 bg-soft-success h-100">
            <div className="card-body p-3 text-center d-flex flex-column justify-content-center">
              <h6 className="text-success fs--2 mb-1 text-uppercase fw-bold">Procesado ERP</h6>
              <h3 className="fw-bold mb-1 text-900 fs-1">${loading ? '...' : `${(metrics.nominaProcesado / 1000000).toFixed(1)}M`}</h3>
              <a href="#!" className="fw-semi-bold fs--2 text-success">Volumen</a>
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
