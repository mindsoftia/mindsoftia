import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import RoadmapCalendar from '../components/widgets/RoadmapCalendar';

function RoadmapDev() {
  const [activeTab, setActiveTab] = useState(1);
  const [activeTabReportes, setActiveTabReportes] = useState(1);
  const [tasks, setTasks] = useState([
    // MES 1: Núcleo SaaS & Fase 1
    { id: 'todo-1', month: 1, text: 'Núcleo SaaS (Multi-Tenancy y Seguridad)', checked: true, detail: 'Autenticación Supabase, protección de rutas, RBAC y aislamiento RLS.' },
    { id: 'todo-2', month: 1, text: 'Maestros CRM y Proveedores (Fase 1)', checked: true, detail: 'CRUD completo para la creación de Clientes y Proveedores.' },
    { id: 'todo-3', month: 1, text: 'Inventario Inteligente (Fase 1)', checked: true, detail: 'Catálogo de productos, control de stock multibodega, costeo e impuestos.' },
    { id: 'todo-pos', month: 1, text: 'Punto de Venta POS (Fase 1)', checked: true, badge: 'Core', badgeColor: 'primary', detail: 'Interfaz Offline-first orientada a la venta rápida, conexión con lectores y generación de tickets.' },
    { id: 'todo-sec1', month: 1, text: 'Blindaje de Backend y Servidor', checked: true, badge: 'Seguridad', badgeColor: 'danger', detail: 'Implementación de Global Scopes para aislamiento de inquilinos y configuración de SSL Wildcard (Hardening).' },
    { id: 'todo-sec2', month: 1, text: 'Aislamiento de Hardware (Offline)', checked: true, badge: 'Auditoría', badgeColor: 'warning', detail: 'Reglas de inmutabilidad en la DB y destrucción criptográfica del caché en IndexedDB al cerrar sesión.' },
    
    // MES 2: Fase 2
    { id: 'todo-4', month: 2, text: 'Plan Único de Cuentas PUC (Fase 2)', checked: false, badge: 'Finanzas', badgeColor: 'success', detail: 'Árbol dinámico de cuentas bajo normativas NIIF para Colombia.' },
    { id: 'todo-5', month: 2, text: 'Asientos Contables Automáticos', checked: false, detail: 'Lógicas de backend que generan asientos automáticos por cada ticket del POS y comprobantes manuales.' },
    { id: 'todo-6', month: 2, text: 'Reportes Financieros (Fase 2)', checked: false, detail: 'Generación en tiempo real del Libro Diario, Balance de Prueba y Estado de Resultados.' },

    // MES 3: Fase 3
    { id: 'todo-7', month: 3, text: 'API DIAN y Certificados Digitales (Fase 3)', checked: false, badge: 'Legal', badgeColor: 'danger', detail: 'Conexión con Proveedor Tecnológico y carga de firmas (.p12).' },
    { id: 'todo-8', month: 3, text: 'Generación Legal (CUFE y QR)', checked: false, detail: 'Inyección del CUFE y generación del Código QR en las representaciones gráficas (PDFs) de la factura.' },
    { id: 'todo-9', month: 3, text: 'Distribución Automática por Email', checked: false, badge: 'Hito MVP', badgeColor: 'warning', detail: 'Envío masivo de facturas validadas con XML al cliente final. Producto comercializable 100%.' },

    // MES 4: Fase 4
    { id: 'todo-10', month: 4, text: 'Gestión de RRHH y Novedades (Fase 4)', checked: false, detail: 'Base de datos de empleados, contratos, salarios, incapacidades y horas extras.' },
    { id: 'todo-11', month: 4, text: 'Liquidación de Nómina NIIF', checked: false, badge: 'Legal', badgeColor: 'danger', detail: 'Cálculos de parafiscales y automatización del gasto hacia Contabilidad NIIF.' },
    { id: 'todo-12', month: 4, text: 'Transmisión Nómina Electrónica DIAN', checked: false, detail: 'Generación del Documento Soporte, creación del CUNE y transmisión al ente fiscal.' },

    // MES 5: Fase 5 y 6
    { id: 'todo-13', month: 5, text: 'Portal de Base de Conocimiento (Fase 5)', checked: false, badge: 'Soporte', badgeColor: 'info', detail: 'Portal interactivo en el ERP con manuales de usuario y tutoriales para onboarding.' },
    { id: 'todo-14', month: 5, text: 'Orquestación n8n Inteligente (Fase 6)', checked: false, detail: 'Sugerencias de clasificación contable de facturas de proveedores y alertas de stock.' },
    { id: 'todo-15', month: 5, text: 'Chatbot Financiero IA (Fase 6)', checked: false, badge: 'GTM', badgeColor: 'warning', detail: 'Asistente de IA para responder dudas técnicas y analizar datos contables gerenciales.' }
  ]);

  const monthTitles = {
    1: 'Mes 1 (16 Jun - 15 Jul): SaaS y Comercial',
    2: 'Mes 2 (16 Jul - 15 Ago): Contabilidad NIIF',
    3: 'Mes 3 (16 Ago - 15 Sep): Facturación DIAN',
    4: 'Mes 4 (16 Sep - 15 Oct): Nómina Electrónica',
    5: 'Mes 5 (16 Oct - 15 Nov): Base Conocimiento e IA'
  };

  const handleCheck = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const monthsKeys = [1, 2, 3, 4, 5];
  
  // Datos para el Bar Chart (Completadas vs Totales)
  const completedBarData = monthsKeys.map(m => tasks.filter(t => t.month === m && t.checked).length);
  const totalBarData = monthsKeys.map(m => tasks.filter(t => t.month === m).length);
  
  // Datos para el Line Chart (Acumulado %)
  let cumulative = 0;
  const totalTasks = tasks.length;
  const lineData = [0, ...monthsKeys.map(m => {
    cumulative += tasks.filter(t => t.month === m && t.checked).length;
    return Math.round((cumulative / totalTasks) * 100);
  })];

  const barChartOptions = {
    tooltip: { 
      trigger: 'axis', 
      padding: [7, 10], 
      backgroundColor: '#f9fafd', 
      borderColor: '#d8e2ef', 
      textStyle: { color: '#0b1727' },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Total Tareas', 'Tareas Cumplidas'],
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#5e6e82' }
    },
    xAxis: {
      type: 'category',
      data: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5'],
      axisLine: { lineStyle: { color: '#d8e2ef' } },
      axisLabel: { color: '#5e6e82', fontWeight: 'bold' }
    },
    yAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e3e6ed', type: 'dashed' } },
      axisLabel: { color: '#5e6e82' },
      minInterval: 1
    },
    series: [
      {
        name: 'Total Tareas',
        type: 'bar',
        data: totalBarData,
        itemStyle: { color: '#edf2f9', borderRadius: [4, 4, 0, 0] },
        barGap: '-100%', // Overlap completely
        barWidth: '35%',
        animation: false
      },
      {
        name: 'Tareas Cumplidas',
        type: 'bar',
        data: completedBarData,
        barWidth: '35%',
        z: 10,
        itemStyle: {
          color: function (params) {
            // Colores vibrantes y modernos para cada fase
            const colors = ['#2c7be5', '#00d27a', '#e63757', '#f5803e', '#27bcfd'];
            return colors[params.dataIndex];
          },
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#5e6e82',
          formatter: (params) => params.value > 0 ? params.value : ''
        }
      }
    ],
    grid: { left: '5%', right: '5%', bottom: '15%', top: '10%', containLabel: true }
  };

  const lineChartOptions = {
    tooltip: { 
      trigger: 'axis', 
      padding: [7, 10], 
      backgroundColor: '#f9fafd', 
      borderColor: '#d8e2ef', 
      textStyle: { color: '#0b1727' },
      formatter: '{b0}<br/>Progreso: <b>{c0}%</b>'
    },
    xAxis: {
      type: 'category',
      data: ['Inicio', 'Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d8e2ef' } },
      axisLabel: { color: '#5e6e82', fontWeight: 'bold' }
    },
    yAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e3e6ed', type: 'dashed' } },
      axisLabel: { color: '#5e6e82', formatter: '{value}%' },
      max: 100
    },
    series: [
      {
        name: 'Rendimiento %',
        type: 'line',
        data: lineData,
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { 
          color: '#8ae1f9', 
          width: 4,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: { color: '#2c7be5', borderColor: '#fff', borderWidth: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(138,225,249,0.5)' },
              { offset: 1, color: 'rgba(44,123,229,0.05)' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#2c7be5',
          fontWeight: 'bold'
        }
      }
    ],
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row flex-between-center">
            <div className="col-md">
              <h5 className="mb-2 mb-md-0">
                <span className="fas fa-route text-primary me-2"></span> Roadmap de Desarrollo
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Gráficas ECharts */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Desempeño Mensual (Bar Chart)</h5>
            </div>
            <div className="card-body">
              <ReactECharts option={barChartOptions} style={{ height: '300px' }} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Rendimiento Semanal (Line Chart)</h5>
            </div>
            <div className="card-body">
              <ReactECharts option={lineChartOptions} style={{ height: '300px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* Columna 1: To-Do List */}
        <div className="col-lg-12">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center p-0">
              <ul className="nav nav-tabs border-bottom-0 w-100" id="roadmapTab" role="tablist">
                {monthsKeys.map((month) => (
                  <li className="nav-item flex-1 text-center" role="presentation" key={month}>
                    <button
                      className={`nav-link w-100 fw-semi-bold ${activeTab === month ? 'active' : ''}`}
                      id={`tab-mes-${month}`}
                      type="button"
                      role="tab"
                      onClick={() => setActiveTab(month)}
                      style={{ cursor: 'pointer', borderRadius: '0' }}
                    >
                      Mes {month}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body p-0 scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <div className="tab-content" id="roadmapTabContent">
                {monthsKeys.map((month) => (
                  <div 
                    key={month} 
                    className={`tab-pane fade ${activeTab === month ? 'show active' : ''}`} 
                    id={`pane-mes-${month}`} 
                    role="tabpanel"
                  >
                    <div className="p-3 bg-light border-bottom">
                      <h6 className="mb-0 text-primary"><span className="fas fa-flag-checkered me-2"></span>{monthTitles[month]}</h6>
                    </div>
                    <div className="accordion" id={`accordion-mes-${month}`}>
                      {tasks.filter(t => t.month === month).map((task) => (
                        <div key={task.id} className="accordion-item border-x-0 border-top-0">
                          <h2 className="accordion-header" id={`heading-${task.id}`}>
                            <button 
                              className="accordion-button collapsed shadow-none py-3" 
                              type="button" 
                              data-bs-toggle="collapse" 
                              data-bs-target={`#collapse-${task.id}`} 
                              aria-expanded="false" 
                              aria-controls={`collapse-${task.id}`}
                            >
                              <div className="d-flex align-items-center w-100 pe-3">
                                <input 
                                  className="form-check-input me-3 mt-0" 
                                  type="checkbox" 
                                  checked={task.checked}
                                  onChange={(e) => { e.stopPropagation(); handleCheck(task.id); }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className={`fw-semi-bold ${task.checked ? 'text-400 text-decoration-line-through' : 'text-900'}`}>
                                  {task.text}
                                </span>
                                {task.badge && (
                                  <span className={`badge badge-soft-${task.badgeColor || 'primary'} ms-auto`}>
                                    {task.badge}
                                  </span>
                                )}
                              </div>
                            </button>
                          </h2>
                          <div 
                            id={`collapse-${task.id}`} 
                            className="accordion-collapse collapse" 
                            aria-labelledby={`heading-${task.id}`} 
                            data-bs-parent={`#accordion-mes-${month}`}
                          >
                            <div className="accordion-body pt-0 pb-3 ps-5">
                              <p className="mb-0 text-600 fs--1">{task.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <RoadmapCalendar />
        </div>
      </div>
    </>
  );
}

export default RoadmapDev;
