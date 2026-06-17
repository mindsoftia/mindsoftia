import React from 'react';
import ReactECharts from 'echarts-for-react';

function Dashboard() {
  // Configuración del gráfico lineal principal (Fondo Azul)
  const mainChartOptions = {
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      backgroundColor: '#f9fafd',
      borderColor: '#d8e2ef',
      textStyle: { color: '#0b1727' }
    },
    xAxis: {
      type: 'category',
      data: ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00'],
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.7)', margin: 15 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        name: 'Hoy',
        type: 'line',
        data: [150, 110, 200, 100, 250, 450, 160, 300, 260, 180, 250, 380],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#fff', borderColor: '#00B7FF', borderWidth: 2 },
        lineStyle: { color: '#fff', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,255,255,0.2)' },
              { offset: 1, color: 'rgba(255,255,255,0)' }
            ]
          }
        }
      }
    ],
    grid: { left: '2%', right: '2%', bottom: '0', top: '10%', containLabel: true }
  };

  // Configuración del mini gráfico para "Active Users"
  const miniLineChartOptions = {
    tooltip: { show: false },
    xAxis: { type: 'category', show: false, data: ['1', '2', '3', '4', '5', '6', '7'] },
    yAxis: { show: false },
    series: [{
      type: 'line',
      data: [10, 30, 20, 50, 40, 70, 60],
      smooth: false,
      symbol: 'none',
      lineStyle: { color: '#00B7FF', width: 2 },
      areaStyle: { color: 'rgba(0,183,255,0.1)' }
    }],
    grid: { left: 0, right: 0, top: 0, bottom: 0 }
  };

  return (
    <>
      {/* 1. SECCIÓN SUPERIOR: Gráfico Azul Gigante */}
      <div className="card mb-3" style={{ backgroundImage: 'linear-gradient(to right, #004DCC, #0076FA)', border: 'none' }}>
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center border-0 pb-0">
          <div>
            <h3 className="text-white mb-0">Hoy $764.39</h3>
            <p className="text-white-50 fs--1 mb-0">Ayer $684.87</p>
          </div>
          <div>
            <select className="form-select form-select-sm" aria-label="Filtros">
              <option defaultValue="successful">Pagos Exitosos</option>
              <option value="failed">Pagos Fallidos</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0" style={{ height: '250px' }}>
          <ReactECharts option={mainChartOptions} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* 2. TRES TARJETAS PEQUEÑAS DE MÉTRICAS */}
      <div className="row g-3 mb-4">
        {/* Card 1: Active Users */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fs--1 text-700 mb-1">Usuarios Activos</h6>
                <h3 className="mb-0 text-700">765k</h3>
              </div>
              <div style={{ width: '80px', height: '40px' }}>
                <ReactECharts option={miniLineChartOptions} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        {/* Card 2: Revenue */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fs--1 text-700 mb-1">Ingresos</h6>
                <span className="badge badge-soft-success rounded-pill"><span className="fas fa-caret-up"></span> 61.8%</span>
              </div>
              <h3 className="mb-0 text-700">$82.18M</h3>
            </div>
          </div>
        </div>
        {/* Card 3: Conversion */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fs--1 text-700 mb-1">Conversión</h6>
                <span className="badge badge-soft-primary rounded-pill"><span className="fas fa-caret-up"></span> 29.4%</span>
              </div>
              <h3 className="mb-0 text-primary">28.50%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ALERTA DE DEPÓSITO (PAYOUT) */}
      <div className="alert alert-light border d-flex align-items-center mb-4 shadow-sm" role="alert">
        <span className="fas fa-exchange-alt text-primary fs-1 me-3"></span>
        <div className="fs--1">
          <span className="text-primary fw-semi-bold"><span className="fas fa-arrow-down me-1"></span> Un desembolso de $921.42 fue depositado hace 13 días.</span> Su próximo depósito está programado para el <strong>Martes, 13 de Marzo</strong>.
        </div>
      </div>

      {/* 4. TRES TARJETAS (Clientes, Pedidos, Ingresos) */}
      <div className="row g-3 mb-3">
        {/* Customers */}
        <div className="col-md-4">
          <div className="card h-100 overflow-hidden card-gradient-warning">
            <div className="card-body position-relative">
              <div className="d-flex align-items-center mb-2">
                <h6 className="fs--1 text-700 mb-0 me-2">Clientes</h6>
                <span className="badge badge-soft-warning rounded-pill">-0.23%</span>
              </div>
              <h3 className="mb-3 text-warning fw-normal" style={{ fontSize: '2.5rem' }}>58.39k</h3>
              <a href="#!" className="fw-semi-bold fs--1 text-primary">Ver todos <span className="fas fa-angle-right ms-1"></span></a>
            </div>
          </div>
        </div>
        {/* Orders */}
        <div className="col-md-4">
          <div className="card h-100 overflow-hidden card-gradient-info">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <h6 className="fs--1 text-700 mb-0 me-2">Pedidos</h6>
                <span className="badge badge-soft-info rounded-pill">0.0%</span>
              </div>
              <h3 className="mb-3 text-info fw-normal" style={{ fontSize: '2.5rem' }}>23.43k</h3>
              <a href="#!" className="fw-semi-bold fs--1 text-primary">Todos los pedidos <span className="fas fa-angle-right ms-1"></span></a>
            </div>
          </div>
        </div>
        {/* Revenue */}
        <div className="col-md-4">
          <div className="card h-100 overflow-hidden card-gradient-success">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <h6 className="fs--1 text-700 mb-0 me-2">Ingresos</h6>
                <span className="badge badge-soft-success rounded-pill">9.54%</span>
              </div>
              <h3 className="mb-3 text-700 fw-normal" style={{ fontSize: '2.5rem' }}>$43,594</h3>
              <a href="#!" className="fw-semi-bold fs--1 text-primary">Estadísticas <span className="fas fa-angle-right ms-1"></span></a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
