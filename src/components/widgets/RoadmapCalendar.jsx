import React, { useState } from 'react';

const RoadmapCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(30); // Default to latest logic/today

  // Datos interactivos de los reportes diarios
    const dailyReports = {
    16: [
      { id: 1, title: 'Seguridad Multi-Tenant', desc: '<strong>1. ¿Qué se hizo?:</strong> Configuración de PostgreSQL en Supabase con JWT y Middlewares en Laravel.<br/><strong>2. ¿Por qué?:</strong> Porque un ERP SaaS requiere bases de datos compartidas pero aisladas por inquilino.<br/><strong>3. ¿Para qué?:</strong> Para garantizar la privacidad de los datos mediante RLS (Row Level Security).' },
      { id: 2, title: 'Módulo de Permisología', desc: '<strong>1. ¿Qué se hizo?:</strong> Diseño de API REST RolePermissionController y matriz visual en React.<br/><strong>2. ¿Por qué?:</strong> El sistema necesita diferenciar entre superadmin, administradores, y cajeros operativos.<br/><strong>3. ¿Para qué?:</strong> Para controlar qué ve cada usuario y evitar operaciones no autorizadas.' },
      { id: 3, title: 'Optimización UI Falcon', desc: '<strong>1. ¿Qué se hizo?:</strong> Configuración global del estado con Zustand y tema Collapsed (Card).<br/><strong>2. ¿Por qué?:</strong> El template base era pesado y la barra lateral consumía mucho espacio de pantalla.<br/><strong>3. ¿Para qué?:</strong> Para ofrecer una experiencia de usuario limpia, centrada en los datos contables.' }
    ],
    17: [
      { id: 1, title: 'Infraestructura VPS y SSL', desc: '<strong>1. ¿Qué se hizo?:</strong> Transición del entorno local a producción en Ubuntu y configuración de Apache.<br/><strong>2. ¿Por qué?:</strong> Para tener un entorno real de pruebas y asegurar el tráfico con Certbot (HTTPS).<br/><strong>3. ¿Para qué?:</strong> Para que las pruebas de facturación y manejo de datos financieros sean seguras y reales.' },
      { id: 2, title: 'Backend Contable (PUC)', desc: '<strong>1. ¿Qué se hizo?:</strong> Implementación del modelo Plan Único de Cuentas (PUC) en la base de datos.<br/><strong>2. ¿Por qué?:</strong> Es la columna vertebral de cualquier ERP contable bajo norma NIIF.<br/><strong>3. ¿Para qué?:</strong> Para asentar las bases de la automatización de comprobantes diarios.' },
      { id: 3, title: 'Seguridad y Roles Base', desc: '<strong>1. ¿Qué se hizo?:</strong> Seeding de 6 perfiles base de sistema en la base de datos.<br/><strong>2. ¿Por qué?:</strong> Evitar crear manualmente los roles cada vez que se levanta un entorno nuevo.<br/><strong>3. ¿Para qué?:</strong> Para agilizar el proceso de desarrollo e integración de nuevos inquilinos.' }
    ],
    18: [
      { id: 1, title: 'Resolución de Connection Pooler', desc: '<strong>1. ¿Qué se hizo?:</strong> Solución de conflictos de puertos con Supabase y PgBouncer.<br/><strong>2. ¿Por qué?:</strong> Las migraciones de Laravel chocaban contra el gestor de conexiones por defecto de Supabase.<br/><strong>3. ¿Para qué?:</strong> Para asegurar estabilidad al alterar la estructura de la base de datos en caliente.' },
      { id: 2, title: 'Global Scopes en Laravel', desc: '<strong>1. ¿Qué se hizo?:</strong> Desarrollo de traits Multitenantable para aislar datos automáticamente en Eloquent.<br/><strong>2. ¿Por qué?:</strong> Requeríamos que los desarrolladores no tuvieran que filtrar manualmente por empresa_id.<br/><strong>3. ¿Para qué?:</strong> Para prevenir fugas de información accidental entre inquilinos.' },
      { id: 3, title: 'Verificación HTTPS Estricto', desc: '<strong>1. ¿Qué se hizo?:</strong> Forzado de SSL a nivel de servidor web.<br/><strong>2. ¿Por qué?:</strong> Supabase y las pasarelas de pago rechazan peticiones sin cifrado.<br/><strong>3. ¿Para qué?:</strong> Para cumplir normativas de protección de datos (HSTS).' }
    ],
    19: [
      { id: 1, title: 'Arquitectura Superadmin', desc: '<strong>1. ¿Qué se hizo?:</strong> Diseño y maquetación del Backoffice global para gestión SaaS.<br/><strong>2. ¿Por qué?:</strong> Se requería un portal centralizado distinto al panel de los clientes finales.<br/><strong>3. ¿Para qué?:</strong> Para gestionar inquilinos, suscripciones y configuración maestra del sistema.' },
      { id: 2, title: 'Tablero Certificados DIAN (.p12)', desc: '<strong>1. ¿Qué se hizo?:</strong> Semaforización para monitorear vencimientos de firmas digitales.<br/><strong>2. ¿Por qué?:</strong> Las firmas caducan y bloquean la facturación electrónica sin previo aviso.<br/><strong>3. ¿Para qué?:</strong> Para notificar proactivamente a los clientes antes de que fallen sus comprobantes.' },
      { id: 3, title: 'App Store de Módulos (Toggles)', desc: '<strong>1. ¿Qué se hizo?:</strong> Interfaz para activar o desactivar submódulos por inquilino.<br/><strong>2. ¿Por qué?:</strong> No todas las empresas pagan por todos los módulos (nómina, contabilidad, POS).<br/><strong>3. ¿Para qué?:</strong> Para tener flexibilidad comercial y limitar el software según el plan contratado.' }
    ],
    22: [
      { id: 1, title: 'Onboarding B2B y Wizards', desc: '<strong>1. ¿Qué se hizo?:</strong> Conexión del Wizard React con Laravel para registro automático.<br/><strong>2. ¿Por qué?:</strong> El proceso de alta de una nueva empresa debe ser autogestionado (sin intervención manual).<br/><strong>3. ¿Para qué?:</strong> Para acelerar las ventas SaaS y que los clientes configuren su empresa al instante.' },
      { id: 2, title: 'PWA (Progressive Web App)', desc: '<strong>1. ¿Qué se hizo?:</strong> Configuración de Service Workers y Manifest (vite-plugin-pwa).<br/><strong>2. ¿Por qué?:</strong> Se necesita que el POS funcione rápidamente incluso con intermitencia de red.<br/><strong>3. ¿Para qué?:</strong> Para que Mindsoftia sea instalable nativamente como una App en tablets de mostrador.' },
      { id: 3, title: 'Seguridad en Rutas React', desc: '<strong>1. ¿Qué se hizo?:</strong> Bloqueo y redirección forzosa a usuarios sin empresa asignada.<br/><strong>2. ¿Por qué?:</strong> Usuarios huérfanos generaban excepciones fatales al consultar datos en la API.<br/><strong>3. ¿Para qué?:</strong> Para mantener la estabilidad del frontend y forzar el onboarding.' }
    ],
    23: [
      { id: 1, title: 'RLS (Row Level Security)', desc: '<strong>1. ¿Qué se hizo?:</strong> Configuración de políticas a nivel de fila en Supabase (Storage y Data).<br/><strong>2. ¿Por qué?:</strong> Era imperativo asegurar que los clientes no leyeran datos de terceros modificando APIs.<br/><strong>3. ¿Para qué?:</strong> Para blindar jurídicamente la aplicación SaaS a nivel arquitectura.' },
      { id: 2, title: 'Inyección de tenant_id en JWT', desc: '<strong>1. ¿Qué se hizo?:</strong> El controlador de Auth inyecta la metadata de empresa en los tokens.<br/><strong>2. ¿Por qué?:</strong> Supabase debe saber qué empresa hace la petición directo desde el frontend.<br/><strong>3. ¿Para qué?:</strong> Para evitar pasar el ID manualmente en cada request HTTP y asegurar inmutabilidad.' },
      { id: 3, title: 'Políticas de Sesión Estricta', desc: '<strong>1. ¿Qué se hizo?:</strong> Migración a sessionStorage y cierre por inactividad de 15 min.<br/><strong>2. ¿Por qué?:</strong> Es software financiero; dejar sesiones abiertas expone datos sensibles (nómina, balances).<br/><strong>3. ¿Para qué?:</strong> Para cumplir con normativas de seguridad bancaria y prevenir robo de información.' }
    ],
    24: [
      { id: 1, title: 'Cierre de Infraestructura Core', desc: '<strong>1. ¿Qué se hizo?:</strong> Finalización y auditoría del ecosistema de autenticación RLS.<br/><strong>2. ¿Por qué?:</strong> No se podía iniciar el desarrollo comercial sin un cimiento inquebrantable.<br/><strong>3. ¿Para qué?:</strong> Para iniciar la codificación de lógica de negocio (POS/Inventario) sin preocuparse por la seguridad.' },
      { id: 2, title: 'Dashboard Dinámico React', desc: '<strong>1. ¿Qué se hizo?:</strong> Integración del dashboard central de métricas SaaS conectadas a Laravel.<br/><strong>2. ¿Por qué?:</strong> Antes los datos de ingresos y usuarios eran estáticos (mockups).<br/><strong>3. ¿Para qué?:</strong> Para que el dueño del ERP visualice el MRR y el crecimiento del software en vivo.' },
      { id: 3, title: 'Endpoint de Métricas (API)', desc: '<strong>1. ¿Qué se hizo?:</strong> Rutas en backend que calculan MRR, total de empresas y ARPU.<br/><strong>2. ¿Por qué?:</strong> Reemplazar queries pesadas por una respuesta json ligera y optimizada.<br/><strong>3. ¿Para qué?:</strong> Para evitar cuellos de botella en la base de datos cuando el Superadmin inicia sesión.' }
    ],
    25: [
      { id: 1, title: 'Resolución de Bucle de Login', desc: '<strong>1. ¿Qué se hizo?:</strong> Corrección de interceptores globales Axios (Error 401).<br/><strong>2. ¿Por qué?:</strong> El panel expulsaba al usuario inmediatamente después del login exitoso por desfase de firmas.<br/><strong>3. ¿Para qué?:</strong> Para permitir a los desarrolladores y usuarios interactuar con la plataforma sin bloqueos.' },
      { id: 2, title: 'Puente Criptográfico ES256', desc: '<strong>1. ¿Qué se hizo?:</strong> Adaptación del middleware Laravel para soportar JWT asimétricos de Supabase.<br/><strong>2. ¿Por qué?:</strong> Supabase actualizó su algoritmo de seguridad de HS256 a firmas más seguras.<br/><strong>3. ¿Para qué?:</strong> Para garantizar la legitimidad y firma electrónica de todas las peticiones a la API.' },
      { id: 3, title: 'Saneamiento Caché Laravel', desc: '<strong>1. ¿Qué se hizo?:</strong> Recompilación y limpieza de variables de entorno (artisan cache:clear).<br/><strong>2. ¿Por qué?:</strong> El servidor seguía usando llaves secretas antiguas que generaban falsos positivos de hackeo.<br/><strong>3. ¿Para qué?:</strong> Para estabilizar completamente el entorno de producción.' }
    ],
    26: [
      { id: 1, title: 'Refactorización UI Roadmap', desc: '<strong>1. ¿Qué se hizo?:</strong> Ampliación a ancho completo (col-lg-12) y rediseño de ECharts (barras y porcentajes).<br/><strong>2. ¿Por qué?:</strong> El diseño anterior duplicaba información y no aprovechaba el espacio, viéndose muy básico.<br/><strong>3. ¿Para qué?:</strong> Para ofrecer una visualización premium que motive el seguimiento de las fases tácticas.' },
      { id: 2, title: 'Arquitectura DB Comercial (Fase 1)', desc: '<strong>1. ¿Qué se hizo?:</strong> Diseño SQL híbrido Helisa/Dataico, unificando clientes/proveedores en crm_terceros.<br/><strong>2. ¿Por qué?:</strong> Ante la DIAN un NIT es único; separarlos generaría problemas en medios magnéticos.<br/><strong>3. ¿Para qué?:</strong> Para que el POS asiente automáticamente la contabilidad sin afectar la escalabilidad NIIF.' },
      { id: 3, title: 'Despliegue de Migraciones en Nube', desc: '<strong>1. ¿Qué se hizo?:</strong> Resolución de tipado (BigInt vs UUID), actualización llaves GPG e inyección en Supabase.<br/><strong>2. ¿Por qué?:</strong> El backend (Laravel) no lograba traducir el modelo SQL a la base de datos remota.<br/><strong>3. ¿Para qué?:</strong> Para dejar estructuradas oficialmente las primeras tablas de producción del ERP.' }
    ],
    29: [
      { id: 1, title: 'Estructura DB Híbrida', desc: '<strong>1. ¿Qué se hizo?:</strong> Diseño offline-first con llaves primarias UUID.<br/><strong>2. ¿Por qué?:</strong> Evita colisiones de IDs durante sincronización si múltiples cajas facturan offline.<br/><strong>3. ¿Para qué?:</strong> Para permitir a los clientes operar ininterrumpidamente sin conexión a internet.' },
      { id: 2, title: 'Inventario Multisede', desc: '<strong>1. ¿Qué se hizo?:</strong> Migraciones para sedes, productos, kardex y lotes PEPS.<br/><strong>2. ¿Por qué?:</strong> El comercio moderno exige separar existencias por sucursales y bodegas físicas.<br/><strong>3. ¿Para qué?:</strong> Para trazar la cadena de suministros e implementar control de mermas.' },
      { id: 3, title: 'Motor Contable NIIF', desc: '<strong>1. ¿Qué se hizo?:</strong> Implementación de `PosVentaObserver` para asentar partida doble automática.<br/><strong>2. ¿Por qué?:</strong> Desacopla la lógica pesada del POS; si la cuenta falla, la venta no se detiene.<br/><strong>3. ¿Para qué?:</strong> Para ahorrarle horas de digitación manual al contador del cliente.' }
    ],
    30: [
      { id: 1, title: 'SuperAdmin: Gestión de Empresas y POS', desc: '<strong>1. ¿Qué se hizo?:</strong> Ahora el SuperAdmin puede crear empresas, visualizarlas en el directorio y asignarles dinámicamente el módulo POS.<br/><strong>2. ¿Por qué?:</strong> Es el flujo maestro de monetización SaaS (Pay-As-You-Go).<br/><strong>3. ¿Para qué?:</strong> Para que la empresa creada herede el acceso, el tenant pueda ver el módulo en su menú y operar la caja registradora directamente.' },
      { id: 2, title: 'Motor Offline y Unificación UI', desc: '<strong>1. ¿Qué se hizo?:</strong> Configuración de `Dexie.js` (IndexedDB) y rediseño total del POS para eliminar el Dark Mode y adaptarlo a Falcon.<br/><strong>2. ¿Por qué?:</strong> El POS debe ser ultra rápido (sin red) pero verse como parte del mismo ecosistema corporativo.<br/><strong>3. ¿Para qué?:</strong> Para cobrar en 5 milisegundos reales brindando una UX premium, limpia y coherente.' },
      { id: 3, title: 'Hito: Despliegue de Abastecimiento', desc: '<strong>1. ¿Qué se hizo?:</strong> Al tener la caja operativa, se marca el punto de inicio para el ecosistema de suministros.<br/><strong>2. ¿Por qué?:</strong> Una caja no puede funcionar a largo plazo sin alimentar su stock y pagar sus facturas.<br/><strong>3. Próximos pasos:</strong> Catálogo de Productos, Inventario/Kardex, Gestión de Proveedores, Compras/Gastos y Reportes Z.' }
    ]
  };

  const currentEvents = dailyReports[selectedDay] || [{ id: 0, title: 'Día sin Registro de Avances', desc: 'El equipo se enfocó en análisis, diseño interno o descanso.' }];

  const renderDay = (day) => {
    // Definimos el estilo base y si el día es clickeable (si tiene reporte)
    const hasReport = !!dailyReports[day];
    let baseClass = `py-2 position-relative ${hasReport ? 'fw-bold text-dark' : 'text-500'}`;
    
    // Colores temáticos originales para mantener la estética de las fases
    if (day >= 1 && day <= 15) {
      baseClass += " bg-soft-primary";
      if (day === 1) baseClass += " rounded-start-pill";
      if (day === 15) baseClass += " rounded-end-pill";
    } else if (day >= 16 && day <= 22) {
      if (day === 16) baseClass += " border border-success rounded-start-pill border-end-0";
      else if (day >= 17 && day <= 21) baseClass += " border border-success border-start-0 border-end-0";
      else if (day === 22) baseClass += " border border-success border-start-0 rounded-end-pill";
    } else if (day >= 23 && day <= 30) {
      baseClass += " bg-soft-warning";
      if (day === 23) baseClass += " rounded-start-pill";
      if (day === 30) baseClass += " rounded-end-pill";
    }

    if (day === selectedDay) {
       return (
         <div key={`day-${day}`} style={{ width: '14%', cursor: 'pointer' }} className="d-flex justify-content-center" onClick={() => setSelectedDay(day)}>
            <div className="py-2 bg-primary text-white rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>
              {day}
            </div>
         </div>
       );
    }

    return (
      <div 
        key={`day-${day}`} 
        className={`${baseClass} text-center`} 
        style={{ width: '14%', cursor: hasReport ? 'pointer' : 'default' }} 
        onClick={() => hasReport && setSelectedDay(day)}
        title={hasReport ? "Ver reporte diario" : ""}
      >
        {day}
        {hasReport && <span className="position-absolute top-0 start-50 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '8px', height: '8px' }}></span>}
      </div>
    );
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
        <h5 className="mb-0 text-800 fs-0"><span className="fas fa-calendar-alt text-primary me-2"></span>Cronograma de Avances</h5>
        <div className="btn-group btn-group-sm" role="group">
          <button className="btn btn-outline-secondary shadow-none" type="button"><span className="fas fa-chevron-left"></span></button>
          <button className="btn btn-outline-secondary shadow-none active" type="button">Hoy</button>
          <button className="btn btn-outline-secondary shadow-none" type="button"><span className="fas fa-chevron-right"></span></button>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="row g-0 h-100">
          <div className="col-md-6 border-end-md border-200">
            <div className="p-3">
              <div className="d-flex justify-content-between text-center fw-semi-bold text-500 fs--1 mb-3">
                <div style={{ width: '14%' }}>Dom</div>
                <div style={{ width: '14%' }}>Lun</div>
                <div style={{ width: '14%' }}>Mar</div>
                <div style={{ width: '14%' }}>Mié</div>
                <div style={{ width: '14%' }}>Jue</div>
                <div style={{ width: '14%' }}>Vie</div>
                <div style={{ width: '14%' }}>Sáb</div>
              </div>
              
              <div className="d-flex flex-wrap text-center fs--1 text-700 align-items-center">
                {/* 31 May */}
                <div className="text-400 py-2" style={{ width: '14%' }}>31</div>
                
                {/* Days 1 to 30 */}
                {[...Array(30)].map((_, i) => renderDay(i + 1))}

                {/* Next month days */}
                <div className="py-2 text-400" style={{ width: '14%' }}>1</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>2</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>3</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>4</div>
              </div>
              <div className="text-center mt-3 fs--2 text-500">
                <span className="fas fa-info-circle me-1"></span> Los días con un punto rojo contienen reportes de avance.
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 h-100 d-flex flex-column bg-light">
              <h4 className="mb-0 text-800 text-primary">Junio 2026</h4>
              <p className="fs--1 text-500 mb-4 fw-semi-bold">
                Reporte del {selectedDay} de Junio
              </p>
              
              <div className="flex-1 overflow-auto pe-2 scrollbar" style={{ maxHeight: '270px' }}>
                <div className="accordion" id={`accordion-report-${selectedDay}`}>
                  {currentEvents.map((evt, idx) => (
                    <div key={evt.id} className="accordion-item border-x-0 border-top-0">
                      <h2 className="accordion-header" id={`heading-rep-${evt.id}`}>
                        <button 
                          className={`accordion-button shadow-none py-2 px-1 ${idx !== 0 ? 'collapsed' : ''}`}
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse-rep-${evt.id}`} 
                          aria-expanded={idx === 0 ? "true" : "false"} 
                          aria-controls={`collapse-rep-${evt.id}`}
                          style={{ backgroundColor: 'transparent' }}
                        >
                          <span className="fas fa-check-circle text-success me-2 fs--1"></span>
                          <span className="fw-bold fs--1 text-800">{evt.title}</span>
                        </button>
                      </h2>
                      <div 
                        id={`collapse-rep-${evt.id}`} 
                        className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} 
                        aria-labelledby={`heading-rep-${evt.id}`} 
                        data-bs-parent={`#accordion-report-${selectedDay}`}
                      >
                        <div className="accordion-body pt-0 pb-2 ps-4 pe-2">
                          <p className="fs--1 text-600 mb-0" style={{ lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: evt.desc }}></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapCalendar;
