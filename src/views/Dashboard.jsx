import React from 'react';
import ReactECharts from 'echarts-for-react';

function Dashboard() {
  // Gráfico Principal de MRR (8 columnas)
  const mrrChartOptions = {
    tooltip: { trigger: 'axis', backgroundColor: '#f9fafd', borderColor: '#d8e2ef', textStyle: { color: '#0b1727' } },
    xAxis: {
      type: 'category',
      data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.7)', margin: 15 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    yAxis: { type: 'value', show: false },
    series: [
      {
        name: 'MRR ($ USD)',
        type: 'line',
        data: [1500, 2100, 3200, 3900, 4500, 5800, 6200, 7500, 8100, 9500, 11000, 13500],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#fff', borderColor: '#00B7FF', borderWidth: 2 },
        lineStyle: { color: '#fff', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(255,255,255,0.2)' }, { offset: 1, color: 'rgba(255,255,255,0)' }]
          }
        }
      }
    ],
    grid: { left: '2%', right: '2%', bottom: '0', top: '10%', containLabel: true }
  };

  // Gráfico Doughnut para uso de Módulos (4 columnas)
  const modulesUsageOptions = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center', textStyle: { fontSize: 10 } },
    series: [
      {
        name: 'Uso de Módulos',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 1048, name: 'Facturación E.', itemStyle: { color: '#2c7be5' } },
          { value: 735, name: 'Nómina', itemStyle: { color: '#00d27a' } },
          { value: 580, name: 'Contabilidad', itemStyle: { color: '#f5803e' } },
          { value: 484, name: 'POS', itemStyle: { color: '#e63757' } },
          { value: 300, name: 'Inventario', itemStyle: { color: '#27bcfd' } }
        ]
      }
    ]
  };

  // Mini gráficos para KPIs
  const miniLineChartOptions = (data, color) => ({
    tooltip: { show: false },
    xAxis: { type: 'category', show: false, data: ['1', '2', '3', '4', '5', '6', '7'] },
    yAxis: { show: false },
    series: [{ type: 'line', data: data, smooth: true, symbol: 'none', lineStyle: { color: color, width: 2 }, areaStyle: { color: `${color}33` } }],
    grid: { left: 0, right: 0, top: 0, bottom: 0 }
  });

  return (
    <div className="pb-5">
      <div className="d-flex align-items-center justify-content-between mb-4 mt-3">
        <div className="d-flex align-items-center">
          <span className="fas fa-satellite-dish fs-3 me-3 text-primary"></span>
          <div>
            <h2 className="mb-0">Centro de Control SaaS</h2>
            <p className="text-500 mb-0">Visión global de telemetría y negocio</p>
          </div>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2"><span className="fas fa-download me-1"></span>Exportar Reporte</button>
          <button className="btn btn-sm btn-primary"><span className="fas fa-sync me-1"></span>Actualizar Datos</button>
        </div>
      </div>

      {/* 1. FILA DE KPIs (4 Tarjetas) */}
      <div className="row g-3 mb-4">
        {/* MRR */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="fs--1 text-700 mb-1">MRR Mensual</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="mb-0 text-primary">$13,500</h3>
                <span className="badge badge-soft-success rounded-pill">+12%</span>
              </div>
              <div className="mt-3" style={{ height: '30px' }}>
                <ReactECharts option={miniLineChartOptions([10, 12, 11, 15, 14, 18, 20], '#2c7be5')} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        {/* Tenants */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="fs--1 text-700 mb-1">Empresas Activas</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="mb-0 text-700">1,245</h3>
                <span className="badge badge-soft-success rounded-pill">+45</span>
              </div>
              <div className="mt-3" style={{ height: '30px' }}>
                <ReactECharts option={miniLineChartOptions([1000, 1050, 1100, 1180, 1200, 1220, 1245], '#00d27a')} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        {/* Churn */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="fs--1 text-700 mb-1">Tasa de Churn</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="mb-0 text-success">1.2%</h3>
                <span className="badge badge-soft-success rounded-pill">-0.3%</span>
              </div>
              <div className="mt-3" style={{ height: '30px' }}>
                <ReactECharts option={miniLineChartOptions([3.5, 3.0, 2.5, 2.0, 1.8, 1.5, 1.2], '#00d27a')} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        {/* ARPU */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="fs--1 text-700 mb-1">ARPU (Ingreso x Empresa)</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="mb-0 text-warning">$10.84</h3>
                <span className="badge badge-soft-warning rounded-pill">Estable</span>
              </div>
              <div className="mt-3" style={{ height: '30px' }}>
                <ReactECharts option={miniLineChartOptions([10.5, 10.6, 10.4, 10.7, 10.8, 10.84, 10.84], '#f5803e')} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILA GRÁFICOS (MRR + Módulos) */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm" style={{ backgroundImage: 'linear-gradient(to right, #004DCC, #0076FA)', border: 'none' }}>
            <div className="card-header bg-transparent border-0 pb-0 d-flex justify-content-between">
              <h5 className="text-white mb-0">Crecimiento de Ingresos (MRR)</h5>
              <select className="form-select form-select-sm w-auto" aria-label="Filtros" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                <option value="2026" className="text-dark">Año 2026</option>
              </select>
            </div>
            <div className="card-body p-0" style={{ height: '280px' }}>
              <ReactECharts option={mrrChartOptions} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header border-bottom">
              <h5 className="mb-0">Uso de Módulos (Carga de Servidor)</h5>
            </div>
            <div className="card-body p-3">
              <ReactECharts option={modulesUsageOptions} style={{ height: '240px', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ALERTA Y MÉTRICAS DE INFRAESTRUCTURA */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="alert alert-success border-0 d-flex align-items-center shadow-sm mb-0" role="alert">
            <span className="fas fa-server text-success fs-2 me-3"></span>
            <div className="fs--1 flex-grow-1">
              <span className="text-success fw-semi-bold">Infraestructura Óptima.</span> Supabase DB (98% libre), API DIAN (Latencia 45ms), Edge Functions (0 Errores).
            </div>
            <button className="btn btn-sm btn-outline-success">Ver Logs de Sistema</button>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-top border-3 border-info">
            <div className="card-body py-3">
              <h6 className="text-500 mb-2">Conexiones a Base de Datos</h6>
              <h4 className="mb-0 text-info">142 / 500</h4>
              <p className="fs--2 text-500 mb-0">Pool de PostgreSQL activo</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-top border-3 border-warning">
            <div className="card-body py-3">
              <h6 className="text-500 mb-2">Almacenamiento (Storage)</h6>
              <h4 className="mb-0 text-warning">1.2 TB</h4>
              <div className="progress mt-2 mb-1" style={{ height: '4px' }}>
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: '74%' }}></div>
              </div>
              <p className="fs--2 text-500 mb-0">74% de la cuota actual</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-top border-3 border-danger">
            <div className="card-body py-3">
              <h6 className="text-500 mb-2">Tickets de Soporte Abiertos</h6>
              <h4 className="mb-0 text-danger">12</h4>
              <p className="fs--2 text-500 mb-0">4 críticos de facturación</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLA ONBOARDING Y FEED DE ACTIVIDAD */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Últimas Empresas (Onboarding)</h5>
              <button className="btn btn-sm btn-link">Ver todo</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover mb-0 fs--1">
                  <thead className="bg-200 text-900">
                    <tr>
                      <th className="py-2 ps-3">Empresa (Tenant)</th>
                      <th className="py-2">NIT / RUT</th>
                      <th className="py-2">Plan</th>
                      <th className="py-2">Ingreso Mensual</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-middle ps-3 fw-semi-bold">TechSolutions S.A.S</td>
                      <td className="align-middle text-500">901.234.567-8</td>
                      <td className="align-middle"><span className="badge bg-primary">Premium</span></td>
                      <td className="align-middle">$149.00</td>
                      <td className="align-middle"><span className="badge badge-soft-success">Activo</span></td>
                    </tr>
                    <tr>
                      <td className="align-middle ps-3 fw-semi-bold">Restaurante El Buen Sabor</td>
                      <td className="align-middle text-500">900.876.543-2</td>
                      <td className="align-middle"><span className="badge bg-info">Básico POS</span></td>
                      <td className="align-middle">$49.00</td>
                      <td className="align-middle"><span className="badge badge-soft-success">Activo</span></td>
                    </tr>
                    <tr>
                      <td className="align-middle ps-3 fw-semi-bold">Consultores Asociados</td>
                      <td className="align-middle text-500">890.111.222-3</td>
                      <td className="align-middle"><span className="badge bg-secondary text-dark">Trial (14 Días)</span></td>
                      <td className="align-middle text-500">$0.00</td>
                      <td className="align-middle"><span className="badge badge-soft-warning">En Onboarding</span></td>
                    </tr>
                    <tr>
                      <td className="align-middle ps-3 fw-semi-bold">Distribuidora Andina</td>
                      <td className="align-middle text-500">800.555.444-1</td>
                      <td className="align-middle"><span className="badge bg-primary">Premium</span></td>
                      <td className="align-middle">$149.00</td>
                      <td className="align-middle"><span className="badge badge-soft-success">Activo</span></td>
                    </tr>
                    <tr>
                      <td className="align-middle ps-3 fw-semi-bold">Clínica San Juan</td>
                      <td className="align-middle text-500">902.333.111-9</td>
                      <td className="align-middle"><span className="badge bg-danger">Enterprise</span></td>
                      <td className="align-middle">$299.00</td>
                      <td className="align-middle"><span className="badge badge-soft-success">Activo</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Auditoría en Vivo</h5>
            </div>
            <div className="card-body fs--1 p-3">
              <div className="d-flex mb-3">
                <span className="fas fa-arrow-up text-success mt-1 me-2"></span>
                <div>
                  <p className="mb-0 fw-semi-bold">Upgrade de Plan</p>
                  <p className="mb-0 text-500">TechSolutions pasó de Básico a Premium.</p>
                  <span className="text-400">Hace 5 min</span>
                </div>
              </div>
              <div className="d-flex mb-3">
                <span className="fas fa-file-invoice text-primary mt-1 me-2"></span>
                <div>
                  <p className="mb-0 fw-semi-bold">Lote DIAN Procesado</p>
                  <p className="mb-0 text-500">500 facturas enviadas exitosamente (Nodo 3).</p>
                  <span className="text-400">Hace 12 min</span>
                </div>
              </div>
              <div className="d-flex mb-3">
                <span className="fas fa-exclamation-triangle text-danger mt-1 me-2"></span>
                <div>
                  <p className="mb-0 fw-semi-bold">Error de Pago</p>
                  <p className="mb-0 text-500">Tarjeta rechazada para Restaurante El Buen Sabor.</p>
                  <span className="text-400">Hace 1 hora</span>
                </div>
              </div>
              <div className="d-flex">
                <span className="fas fa-user-plus text-info mt-1 me-2"></span>
                <div>
                  <p className="mb-0 fw-semi-bold">Nuevo Registro</p>
                  <p className="mb-0 text-500">Consultores Asociados inició el Trial.</p>
                  <span className="text-400">Hace 2 horas</span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-light p-0">
              <button className="btn btn-link d-block w-100 py-2 fs--1">Ver todo el registro</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
