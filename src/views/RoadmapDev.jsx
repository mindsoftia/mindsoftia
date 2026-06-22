import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

function RoadmapDev() {
  const [activeTab, setActiveTab] = useState(1);
  const [activeTabReportes, setActiveTabReportes] = useState(1);
  const [tasks, setTasks] = useState([
    // MES 1: Núcleo SaaS
    { id: 'todo-1', month: 1, text: 'Autenticación y Multi-Tenancy (Multiempresa)', checked: true, detail: 'Refinar el Login, registro y selección de la empresa con la que el usuario va a operar.' },
    { id: 'todo-2', month: 1, text: 'Gestión de Planes y Suscripciones', checked: true, detail: 'Configuración para que las empresas puedan elegir su plan SaaS y facturación interna.' },
    { id: 'todo-3', month: 1, text: 'Dashboard Gerencial (BI)', checked: false, detail: 'Crear la pantalla principal con gráficos modernos mostrando indicadores clave (Ventas, Utilidad, Cartera).' },
    
    // MES 2: Facturación y POS
    { id: 'todo-4', month: 2, text: 'Facturación Electrónica DIAN', checked: false, badge: 'Alta Prioridad', badgeColor: 'danger', detail: 'Formularios de creación de facturas, cotizaciones y notas de crédito con un flujo rápido e intuitivo.' },
    { id: 'todo-5', month: 2, text: 'POS Cloud Offline-first', checked: false, badge: 'Offline', badgeColor: 'success', detail: 'Interfaz rápida para ventas de mostrador compatible con PWA sin internet.' },
    { id: 'todo-6', month: 2, text: 'Cuentas por Cobrar (Cartera)', checked: false, detail: 'Tabla de control de cartera, riesgo de mora y recordatorios de pago automáticos.' },

    // MES 3: Contabilidad Total
    { id: 'todo-7', month: 3, text: 'Plan Único de Cuentas (PUC)', checked: false, badge: 'Core', badgeColor: 'primary', detail: 'Árbol contable dinámico, NIIF y centros de costos.' },
    { id: 'todo-8', month: 3, text: 'Comprobantes y Asientos Contables', checked: false, detail: 'Pantalla de digitación contable optimizada para velocidad (atajos de teclado).' },
    { id: 'todo-9', month: 3, text: 'Tesorero y Cuentas por Pagar', checked: false, detail: 'Gestión de bancos, caja chica, proveedores, y proyección de flujo de efectivo.' },
    { id: 'todo-10', month: 3, text: 'Portal del Contador', checked: false, detail: 'Acceso especial y reportes oficiales (Balances, NIIF, Estados de Resultados).' },

    // MES 4: Operaciones y RRHH
    { id: 'todo-11', month: 4, text: 'Inventarios Inteligentes', checked: false, detail: 'Entradas, salidas, Kardex (Costo Promedio Ponderado), lotes y traslados.' },
    { id: 'todo-12', month: 4, text: 'Nómina Electrónica DIAN', checked: false, detail: 'Liquidación automática, parafiscales, prestaciones y generación de desprendibles.' },
    { id: 'todo-13', month: 4, text: 'Portal del Empleado y Docs', checked: false, detail: 'Área de autoservicio para el equipo y repositorio de gestión documental en la nube.' },

    // MES 5: Revolución IA
    { id: 'todo-14', month: 5, text: 'Analista Financiero IA', checked: false, badge: 'GTM', badgeColor: 'info', detail: 'Integrar un chat de IA para que el gerente pregunte en lenguaje natural por sus finanzas.' },
    { id: 'todo-15', month: 5, text: 'Automatizaciones IA', checked: false, badge: 'Diferenciador', badgeColor: 'warning', detail: 'Sugerencias de compras, clasificación de gastos y predicción de cierre en CRM.' },
    { id: 'todo-16', month: 5, text: 'Despliegue Comercial y QA', checked: false, detail: 'Paso a producción final y activación masiva de empresas y contadores.' }
  ]);

  const monthTitles = {
    1: 'Fase 1: Núcleo SaaS y Tablero Gerencial',
    2: 'Fase 2: Facturación y Punto de Venta',
    3: 'Fase 3: Contabilidad Total y Fiscal',
    4: 'Fase 4: Operaciones y Recursos Humanos',
    5: 'Fase 5: Inteligencia Artificial y GTM'
  };

  const handleCheck = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const monthsKeys = [1, 2, 3, 4, 5];
  const barData = monthsKeys.map(m => tasks.filter(t => t.month === m && t.checked).length);
  
  let cumulative = 0;
  const totalTasks = tasks.length;
  const lineData = [0, ...monthsKeys.map(m => {
    cumulative += tasks.filter(t => t.month === m && t.checked).length;
    return Math.round((cumulative / totalTasks) * 100);
  })];

  const barChartOptions = {
    tooltip: { trigger: 'axis', padding: [7, 10], backgroundColor: '#f9fafd', borderColor: '#d8e2ef', textStyle: { color: '#0b1727' } },
    xAxis: {
      type: 'category',
      data: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5'],
      axisLine: { lineStyle: { color: '#d8e2ef' } },
      axisLabel: { color: '#5e6e82' }
    },
    yAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e3e6ed' } },
      axisLabel: { color: '#5e6e82' }
    },
    series: [
      {
        name: 'Tareas Cumplidas',
        type: 'bar',
        data: barData,
        barWidth: '40%',
        itemStyle: {
          color: function (params) {
            const colors = ['#cbd0d9', '#fdb888', '#8ae1f9', '#a2f5cb', '#b9d4f9'];
            return colors[params.dataIndex];
          },
          borderRadius: [2, 2, 0, 0]
        }
      }
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  };

  const lineChartOptions = {
    tooltip: { trigger: 'axis', padding: [7, 10], backgroundColor: '#f9fafd', borderColor: '#d8e2ef', textStyle: { color: '#0b1727' } },
    xAxis: {
      type: 'category',
      data: ['Sem 1', 'Sem 4', 'Sem 8', 'Sem 12', 'Sem 16', 'Sem 20'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d8e2ef' } },
      axisLabel: { color: '#5e6e82' }
    },
    yAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e3e6ed' } },
      axisLabel: { color: '#5e6e82' },
      max: 100
    },
    series: [
      {
        name: 'Rendimiento %',
        type: 'line',
        data: lineData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#2c7be5', width: 2 },
        itemStyle: { color: '#2c7be5', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(44,123,229,0.2)' },
              { offset: 1, color: 'rgba(44,123,229,0)' }
            ]
          }
        }
      }
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
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
        <div className="col-lg-6">
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
            <div className="card-body p-0 scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
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

        {/* Columna 2: Actividades Recientes (Reportes Ejecutivos) */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center p-0">
              <ul className="nav nav-tabs border-bottom-0 w-100" id="reportesTab" role="tablist">
                {monthsKeys.map((month) => (
                  <li className="nav-item flex-1 text-center" role="presentation" key={`rep-tab-${month}`}>
                    <button
                      className={`nav-link w-100 fw-semi-bold ${activeTabReportes === month ? 'active' : ''}`}
                      id={`tab-rep-mes-${month}`}
                      type="button"
                      role="tab"
                      onClick={() => setActiveTabReportes(month)}
                      style={{ cursor: 'pointer', borderRadius: '0' }}
                    >
                      Mes {month}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body p-0 scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="tab-content" id="reportesTabContent">
                {monthsKeys.map((month) => (
                  <div 
                    key={`rep-pane-${month}`} 
                    className={`tab-pane fade ${activeTabReportes === month ? 'show active' : ''}`} 
                    id={`pane-rep-mes-${month}`} 
                    role="tabpanel"
                  >
                    <div className="p-3 bg-light border-bottom">
                      <h6 className="mb-0 text-primary"><span className="fas fa-file-invoice me-2"></span>Reportes de {monthTitles[month].split(':')[0]}</h6>
                    </div>
                    
                    <div className="accordion" id={`accordionReportes-${month}`}>
                      {month === 1 ? (
                        <>
                          {/* Reporte Hoy: 19 de Junio 2026 */}
                          <div className="accordion-item border-top-0 border-x-0">
                            <h2 className="accordion-header" id="headingToday">
                              <button className="accordion-button shadow-none py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseToday" aria-expanded="true" aria-controls="collapseToday">
                                <span className="fas fa-check-circle text-success me-2"></span> Resumen de Avances: 19 Jun, 2026
                              </button>
                            </h2>
                            <div className="accordion-collapse collapse show" id="collapseToday" aria-labelledby="headingToday" data-bs-parent={`#accordionReportes-${month}`}>
                              <div className="accordion-body pt-0 pb-3 ps-5">
                                <div className="border-start border-3 border-primary ps-3 mt-2">
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 1. Arquitectura Superadmin (Multi-Tenant)</h6>
                                  <p className="fs--1 mb-3 text-600">Diseño y maquetación de la estructura del Backoffice, aislando la gestión global del SaaS. Se creó una barra lateral con módulos de Empresas, Facturación y App Store.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 2. Tablero de Certificados DIAN (.p12)</h6>
                                  <p className="fs--1 mb-3 text-600">Creación de un panel vital con semaforización para monitorear vencimientos de firmas digitales de clientes, previniendo caídas en la facturación electrónica.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 3. App Store y Feature Toggles</h6>
                                  <p className="fs--1 mb-3 text-600">Interfaz de App Store para activar/desactivar submódulos (Nómina, CRM, ERP) por tenant, unificando el diseño visual bajo una sola marca premium.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 4. Gestión de Suscripciones (Billing)</h6>
                                  <p className="fs--1 mb-3 text-600">Implementación del módulo financiero con vistas dedicadas para Suscripciones Activas, Planes y Precios, Historial de Pagos y Cupones promocionales.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 5. Enrutamiento Frontend</h6>
                                  <p className="fs--1 mb-0 text-600">Resolución de conflictos en el React Router DOM, estabilizando rutas profundas (`/empresas/directorio`) y creando marcadores (Próximamente) para funciones futuras.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reporte: 18 de Junio 2026 */}
                          <div className="accordion-item border-top-0 border-x-0">
                            <h2 className="accordion-header" id="heading18">
                              <button className="accordion-button collapsed shadow-none py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapse18" aria-expanded="false" aria-controls="collapse18">
                                <span className="fas fa-check-circle text-success me-2"></span> Resumen de Avances: 18 Jun, 2026
                              </button>
                            </h2>
                            <div className="accordion-collapse collapse" id="collapse18" aria-labelledby="heading18" data-bs-parent={`#accordionReportes-${month}`}>
                              <div className="accordion-body pt-0 pb-3 ps-5">
                                <div className="border-start border-3 border-primary ps-3 mt-2">
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 1. Despliegue en Producción y Seguridad SSL</h6>
                                  <p className="fs--1 mb-3 text-600">Implementación exitosa de Certbot en el servidor VPS Ubuntu, garantizando que todo el tráfico de la API y el frontend se cifre bajo protocolo HTTPS estricto.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 2. Arquitectura de Base de Datos Multitenant</h6>
                                  <p className="fs--1 mb-3 text-600">Resolución de conflictos de puertos con el Connection Pooler de Supabase (Port 6543 vs 5432). Creación e integración de la tabla central `empresas` en el esquema relacional conectada a los `users`.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 3. Aislamiento Lógico (Global Scopes)</h6>
                                  <p className="fs--1 mb-3 text-600">Desarrollo del trait `Multitenantable` en Laravel. Esto asegura que todas las consultas (Libro Diario, Terceros) inyecten automáticamente la restricción `empresa_id`, eliminando fugas de información entre cuentas comerciales.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 4. Sincronización Auth de Supabase a Laravel</h6>
                                  <p className="fs--1 mb-3 text-600">Actualización crítica del Middleware `VerifySupabaseToken` para que desencripte el JWT de Supabase Auth en cada petición y loguee la sesión silenciosa en Laravel, conectando la identidad con su `empresa_id`.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 5. Frontend UI/UX: Panel Superadmin</h6>
                                  <p className="fs--1 mb-0 text-600">Diseño en React del submódulo de Tenants para superadministradores. Incluye gestión de subdominios, validaciones de API, y un modelo modular compacto preparado para la estructura funcional SaaS 2026 (Nómina Auto, Facturación DIAN, IA).</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reporte 2: 17 de Junio 2026 */}
                          <div className="accordion-item border-top-0 border-x-0">
                            <h2 className="accordion-header" id="headingTwo">
                              <button className="accordion-button collapsed shadow-none py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                <span className="fas fa-check-circle text-success me-2"></span> Resumen de Avances: 17 Jun, 2026
                              </button>
                            </h2>
                            <div className="accordion-collapse collapse" id="collapseTwo" aria-labelledby="headingTwo" data-bs-parent={`#accordionReportes-${month}`}>
                              <div className="accordion-body pt-0 pb-3 ps-5">
                                <div className="border-start border-3 border-primary ps-3 mt-2">
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 1. Infraestructura VPS y API Separada</h6>
                                  <p className="fs--1 mb-3 text-600">Transición del entorno local a producción en el VPS (Ubuntu 26.04). Apache configurado para enrutar el frontend estático (`dist`) y el backend Laravel (`backend/public`). Corrección de enrutamiento SPA mediante archivo `.htaccess` en public.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 2. Desarrollo del Backend Contable (PUC)</h6>
                                  <p className="fs--1 mb-3 text-600">Implementación de esquema para el Plan Único de Cuentas (PUC). Migración y Modelo `Account.php` creados con soporte para jerarquías (padre-hijo), naturaleza contable y aislamiento Multitenant.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 3. Seeding de Seguridad</h6>
                                  <p className="fs--1 mb-3 text-600">Creación de `RolSeeder.php` integrado en `DatabaseSeeder.php`. Poblamiento de la tabla `cnf_roles` con 6 perfiles base de sistema (Super Administrador, Propietario, Analista de Cartera, Director de Marketing, Vendedor, Auditor Externo).</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 4. Refactorización React UI (Usuarios)</h6>
                                  <p className="fs--1 mb-3 text-600">Actualización de `Users.jsx` aplicando tablas avanzadas auténticas de Falcon (avatares, selección). Integración de botón flotante (FAB) y modal con estilo propio Mindsoftia. Conexión directa del CRUD Frontend a Supabase.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 5. Gestión de Repositorio Segura</h6>
                                  <p className="fs--1 mb-0 text-600">Bloqueos de GitHub resueltos al remover archivos de tokens expuestos (`tokengit`). Flujo de despliegue estabilizado permitiendo actualizaciones rápidas mediante `git pull` y `npm run build` en el servidor.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reporte 1: 16 de Junio 2026 */}
                          <div className="accordion-item border-top-0 border-x-0 border-bottom-0">
                            <h2 className="accordion-header" id="headingOne">
                              <button className="accordion-button collapsed shadow-none py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                <span className="fas fa-check-circle text-success me-2"></span> Resumen de Avances: 16 Jun, 2026
                              </button>
                            </h2>
                            <div className="accordion-collapse collapse" id="collapseOne" aria-labelledby="headingOne" data-bs-parent={`#accordionReportes-${month}`}>
                              <div className="accordion-body pt-0 pb-3 ps-5">
                                <div className="border-start border-3 border-primary ps-3 mt-2">
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 1. Seguridad Multi-Tenant</h6>
                                  <p className="fs--1 mb-3 text-600">Base de datos PostgreSQL en Supabase. Custom JWT Hook encriptado e inmutable. Middlewares en Laravel (VerifySupabaseToken, CheckPermission).</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 2. Módulo de Permisología Integral</h6>
                                  <p className="fs--1 mb-3 text-600">Diseño de tablas modulares. API REST RolePermissionController. Matriz visual en React con switches dinámicos y protección a Super Admin.</p>
                                  
                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 3. Optimización UI Falcon</h6>
                                  <p className="fs--1 mb-3 text-600">Manejo de estado global (Zustand). TopNav limpio sin búsqueda. Tema configurado a 'Collapsed', modo 'Card' y ancho 'Fluid'. Cierre de sesión seguro.</p>

                                  <h6 className="text-800 mb-1"><span className="fas fa-check-circle text-success me-1 fs--1"></span> 4. Sincronización Servidores</h6>
                                  <p className="fs--1 mb-0 text-600">Archivos .env estabilizados. Apache configurado (mindsoftia.conf y .htaccess) para convivir React y Laravel en la misma ruta sin conflictos.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Futuros reportes para otros meses */
                        <div className="accordion-item border-x-0 border-top-0 border-bottom-0">
                          <h2 className="accordion-header" id={`headingFuture-${month}`}>
                            <button className="accordion-button collapsed shadow-none text-500 py-3" type="button" data-bs-toggle="collapse" data-bs-target={`#collapseFuture-${month}`} aria-expanded="false" aria-controls={`collapseFuture-${month}`} disabled>
                              <span className="fas fa-hourglass-half me-2"></span> Próximos reportes se registrarán aquí...
                            </button>
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default RoadmapDev;
