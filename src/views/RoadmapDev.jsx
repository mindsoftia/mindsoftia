import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

function RoadmapDev() {
  const [tasks, setTasks] = useState([
    { id: 'todo-1', month: 1, text: 'Arquitectura de Datos (PostgreSQL, RLS multi-tenant)', checked: true },
    { id: 'todo-2', month: 1, text: 'Accesos y Roles (Matriz de Permisología)', checked: true },
    { id: 'todo-3', month: 1, text: 'Motor Transaccional (Carga del PUC y Partida Doble)', checked: false },
    { id: 'todo-4', month: 2, text: 'Inventarios (Costo Promedio Ponderado en tiempo real)', checked: false },
    { id: 'todo-5', month: 2, text: 'POS Expreso (Interfaz táctil y consecutivos)', checked: false, badge: 'Offline-first', badgeColor: 'success' },
    { id: 'todo-6', month: 3, text: 'Emisión Electrónica (Generador XML UBL y firma digital)', checked: false },
    { id: 'todo-7', month: 3, text: 'Contingencia Estatal (Colas asíncronas para caídas DIAN)', checked: false },
    { id: 'todo-8', month: 3, text: 'Control de Efectivo (Módulo CxC/CxP y conciliación bancaria)', checked: false },
    { id: 'todo-9', month: 4, text: 'Nómina Electrónica Legal', checked: false },
    { id: 'todo-10', month: 4, text: 'Tributación (Borradores Retefuente, IVA, ICA e Inf. Exógena)', checked: false },
    { id: 'todo-11', month: 4, text: 'Analítica e Indicadores NIIF (Liquidez, Rentabilidad, Endeudamiento)', checked: false },
    { id: 'todo-12', month: 5, text: 'IA y Extracción (Integración NLP para lectura de facturas y sugerencia de gastos)', checked: false, badge: 'Semana 17', badgeColor: 'primary' },
    { id: 'todo-13', month: 5, text: 'Habilitación Estatal (Superación de pruebas de validación oficial y notas a EE.FF)', checked: false, badge: 'Semana 18', badgeColor: 'primary' },
    { id: 'todo-14', month: 5, text: 'APIs y Estrés (Apertura OpenAPI y pruebas de carga masiva en BD)', checked: false, badge: 'Semana 19', badgeColor: 'primary' },
    { id: 'todo-15', month: 5, text: 'Despliegue Comercial (Paso a producción y activación de contadores)', checked: false, badge: 'Semana 20', badgeColor: 'success' }
  ]);

  const monthTitles = {
    1: 'Mes 1: Cimiento Contable y Autenticación',
    2: 'Mes 2: Ventas, Kardex y POS Offline',
    3: 'Mes 3: Validación Fiscal y Control de Efectivo',
    4: 'Mes 4: Nómina, Tributación y Analítica',
    5: 'Mes 5: Inteligencia Artificial, Certificación y GTM'
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
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ruta de Desarrollo</h5>
            </div>
            <div className="card-body p-0 scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="accordion" id="accordionRoadmap">
                {monthsKeys.map((month) => (
                  <div key={month} className={`accordion-item border-x-0 ${month === 1 ? 'border-top-0' : ''} ${month === 5 ? 'border-bottom-0' : ''}`}>
                    <h2 className="accordion-header" id={`headingMes${month}`}>
                      <button 
                        className={`accordion-button ${month !== 1 ? 'collapsed' : ''} shadow-none bg-light text-primary fw-bold`} 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapseMes${month}`} 
                        aria-expanded={month === 1 ? "true" : "false"} 
                        aria-controls={`collapseMes${month}`}
                      >
                        {monthTitles[month]}
                      </button>
                    </h2>
                    <div 
                      id={`collapseMes${month}`} 
                      className={`accordion-collapse collapse ${month === 1 ? 'show' : ''}`} 
                      aria-labelledby={`headingMes${month}`} 
                      data-bs-parent="#accordionRoadmap"
                    >
                      <div className="accordion-body p-0">
                        {tasks.filter(t => t.month === month).map((task, idx, arr) => (
                          <div key={task.id} className={`d-flex align-items-center p-3 ${idx !== arr.length - 1 ? 'border-bottom border-200' : ''}`}>
                            <div className="form-check mb-0 flex-1">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id={task.id} 
                                checked={task.checked}
                                onChange={() => handleCheck(task.id)}
                              />
                              <label className="form-check-label mb-0 fw-semi-bold text-900 cursor-pointer" htmlFor={task.id}>
                                {task.badge && (
                                  <span className={`badge badge-soft-${task.badgeColor || 'primary'} me-2`}>
                                    {task.badge}
                                  </span>
                                )}
                                {task.text}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
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
            <div className="card-header bg-light">
              <h5 className="mb-0">Reportes Ejecutivos (Completado)</h5>
            </div>
            <div className="card-body p-0 scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              
              <div className="accordion" id="accordionReportes">
                
                {/* Reporte Hoy: 19 de Junio 2026 */}
                <div className="accordion-item border-top-0 border-x-0">
                  <h2 className="accordion-header" id="headingToday">
                    <button className="accordion-button shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseToday" aria-expanded="true" aria-controls="collapseToday">
                      <span className="fas fa-file-invoice text-primary me-2"></span> Resumen de Avances: 19 Jun, 2026
                    </button>
                  </h2>
                  <div className="accordion-collapse collapse show" id="collapseToday" aria-labelledby="headingToday" data-bs-parent="#accordionReportes">
                    <div className="accordion-body pt-0 pb-3">
                      <div className="ps-3 border-start border-3 border-primary mt-2">
                        
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
                    <button className="accordion-button collapsed shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapse18" aria-expanded="false" aria-controls="collapse18">
                      <span className="fas fa-file-invoice text-primary me-2"></span> Resumen de Avances: 18 Jun, 2026
                    </button>
                  </h2>
                  <div className="accordion-collapse collapse" id="collapse18" aria-labelledby="heading18" data-bs-parent="#accordionReportes">
                    <div className="accordion-body pt-0 pb-3">
                      <div className="ps-3 border-start border-3 border-primary mt-2">
                        
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
                    <button className="accordion-button collapsed shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      <span className="fas fa-file-invoice text-primary me-2"></span> Resumen de Avances: 17 Jun, 2026
                    </button>
                  </h2>
                  <div className="accordion-collapse collapse" id="collapseTwo" aria-labelledby="headingTwo" data-bs-parent="#accordionReportes">
                    <div className="accordion-body pt-0 pb-3">
                      <div className="ps-3 border-start border-3 border-primary mt-2">
                        
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
                <div className="accordion-item border-top-0 border-x-0">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button collapsed shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                      <span className="fas fa-file-invoice text-primary me-2"></span> Resumen de Avances: 16 Jun, 2026
                    </button>
                  </h2>
                  <div className="accordion-collapse collapse" id="collapseOne" aria-labelledby="headingOne" data-bs-parent="#accordionReportes">
                    <div className="accordion-body pt-0 pb-3">
                      <div className="ps-3 border-start border-3 border-primary mt-2">
                        
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

                {/* Futuro reporte */}
                <div className="accordion-item border-x-0">
                  <h2 className="accordion-header" id="headingThree">
                    <button className="accordion-button collapsed shadow-none text-500" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" disabled>
                      <span className="fas fa-hourglass-half me-2"></span> Próximos reportes se registrarán aquí...
                    </button>
                  </h2>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default RoadmapDev;
