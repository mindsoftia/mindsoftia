import React, { useState } from 'react';

const RoadmapCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(39); // Default: July 9 (Absolute Day 39)
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 6, 1)); // Default: July 2026 (Month 6 is July in JS)

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
    ],
    31: [
      { id: 1, title: 'Menú de Inventario y Catálogo (UX/UI)', desc: '<strong>1. ¿Qué se hizo?:</strong> Se diseñaron las pantallas del menú de Inventario y se enlazaron los catálogos de productos y clientes. Ahora todo se guarda temporalmente en el navegador del usuario.<br/><strong>2. ¿Por qué?:</strong> Para que el cajero o supervisor pueda ver y buscar productos al instante, sin tiempos de carga por lentitud del internet.<br/><strong>3. ¿Para qué?:</strong> Para garantizar que la operación de la tienda nunca se detenga y la atención al cliente sea fluida.' },
      { id: 2, title: 'Seguridad y Precisión de Stock (Kardex)', desc: '<strong>1. ¿Qué se hizo?:</strong> Se creó un "candado" virtual en el sistema para que cuando se venda o ajuste un producto, el descuento del inventario sea exacto y genere un recibo interno (Kardex).<br/><strong>2. ¿Por qué?:</strong> Si dos cajeros venden el último artículo al mismo tiempo, el sistema debe asignar la venta al primero y avisar al segundo.<br/><strong>3. ¿Para qué?:</strong> Para que los reportes de inventario que revisa el supervisor cuadren a la perfección, evitando pérdidas fantasma.' },
      { id: 3, title: 'Interfaz POS Offline y Sincronización', desc: '<strong>1. ¿Qué se hizo?:</strong> Se construyó la vista completa de la Caja Registradora (POS) con un indicador visual de conexión. Si el internet se cae, el cajero sigue cobrando y un proceso invisible sube las ventas cuando la red vuelve.<br/><strong>2. ¿Por qué?:</strong> El usuario (cajero) no debe ser bloqueado por problemas de red, manteniendo la fila avanzando.<br/><strong>3. ¿Para qué?:</strong> Para brindar una experiencia de usuario (UX) premium, donde el supervisor tiene la tranquilidad de que ninguna venta se pierde.' }
    ],
    32: [
      { id: 1, title: 'Reestructuración UX del Menú', desc: '<strong>1. ¿Qué se hizo?:</strong> Refactorización masiva de `Sidebar.jsx` y enrutamiento en `App.jsx`.<br/><strong>2. ¿Por qué?:</strong> El menú original mezclaba configuración con ventas de forma desordenada.<br/><strong>3. ¿Para qué?:</strong> Para emular un ERP profesional (Helisa/Dataico) dividido lógicamente en: Ventas, Catálogo, Compras y Finanzas.' },
      { id: 2, title: 'Arquitectura Offline Dexie v2', desc: '<strong>1. ¿Qué se hizo?:</strong> Actualización del motor local `localPosDb.js` a versión 2, incorporando nuevas tablas de caché (Categorías).<br/><strong>2. ¿Por qué?:</strong> Los catálogos deben estar disponibles instantáneamente, sin loading screens.<br/><strong>3. ¿Para qué?:</strong> Para que el POS funcione offline con la estructura de cuentas completa.' },
      { id: 3, title: 'Bases de Datos Híbrida (RLS)', desc: '<strong>1. ¿Qué se hizo?:</strong> Ejecución de `01_categorias_proveedores.sql` con políticas RLS inyectando `tenant_id` desde JWT.<br/><strong>2. ¿Por qué?:</strong> Para blindar la información de las categorías y proveedores por empresa.<br/><strong>3. ¿Para qué?:</strong> Para que la inserción de terceros sea 100% segura en un entorno Multi-Tenant.' },
      { id: 4, title: 'Vistas React CRUD Híbridas', desc: '<strong>1. ¿Qué se hizo?:</strong> Desarrollo de `CategoriasList.jsx` y `ProveedoresList.jsx` utilizando `useLiveQuery`.<br/><strong>2. ¿Por qué?:</strong> Se necesitaban interfaces gráficas limpias (Falcon) para alimentar el sistema.<br/><strong>3. ¿Para qué?:</strong> Para clasificar clientes/proveedores inteligentemente y obligar la vinculación de cuentas PUC en los catálogos.' },
      { id: 5, title: 'Sincronizador Edge-Cloud', desc: '<strong>1. ¿Qué se hizo?:</strong> Refactorización de `posSyncService.js` eliminando llamadas ineficientes al backend de Laravel.<br/><strong>2. ¿Por qué?:</strong> Supabase ya nos provee acceso directo, rápido y seguro vía JavaScript.<br/><strong>3. ¿Para qué?:</strong> Para que al crear un dato maestro en la nube, baje a la caché local instantáneamente.' }
    ],
    33: [
      { id: 1, title: 'Global Scopes (Aislamiento)', desc: '<strong>1. ¿Qué se hizo?:</strong> Inyección de Multitenantable en modelos de Eloquent.<br/><strong>2. ¿Por qué?:</strong> Para aislar automáticamente los datos por empresa sin intervención del desarrollador.<br/><strong>3. ¿Para qué?:</strong> Para blindar el backend ante fugas de información cruzada.' },
      { id: 2, title: 'Inmutabilidad Contable', desc: '<strong>1. ¿Qué se hizo?:</strong> Bloqueo de edición y eliminación (Append-Only) en Kardex y Asientos Contables.<br/><strong>2. ¿Por qué?:</strong> El historial financiero no puede ser alterado una vez registrado.<br/><strong>3. ¿Para qué?:</strong> Para garantizar la integridad de los reportes fiscales y de inventario.' },
      { id: 3, title: 'Autodestrucción Dexie.js', desc: '<strong>1. ¿Qué se hizo?:</strong> Purga total de la base de datos IndexedDB al ejecutar Logout.<br/><strong>2. ¿Por qué?:</strong> El sistema offline guardaba caché que podía ser visto por otro usuario en la misma PC.<br/><strong>3. ¿Para qué?:</strong> Para aislar los datos a nivel de hardware/navegador compartido.' },
      { id: 4, title: 'Redirección Segura Login', desc: '<strong>1. ¿Qué se hizo?:</strong> Interceptación en el root para redirigir forzosamente al subdominio del inquilino.<br/><strong>2. ¿Por qué?:</strong> El login principal es exclusivo de los Superadmins.<br/><strong>3. ¿Para qué?:</strong> Para proteger la marca central y evitar accesos no autorizados al portal.' }
    ],
    36: [
      { id: 1, title: 'Enrutamiento Multi-Tenant (Auth)', desc: '<strong>1. ¿Qué se hizo?:</strong> Se eliminó la redirección forzada a subdominios en `Login.jsx`.<br/><strong>2. ¿Por qué?:</strong> Causaba conflictos de acceso para los usuarios SuperAdministradores y bloqueaba rutas directas.<br/><strong>3. ¿Para qué?:</strong> Para permitir un flujo de autenticación limpio y acceso directo al tenant correcto sin trabas arquitectónicas.' },
      { id: 2, title: 'Preparación Arquitectura PIM', desc: '<strong>1. ¿Qué se hizo?:</strong> Auditoría de los campos faltantes en el modelo de inventario para soportar la Factura Electrónica.<br/><strong>2. ¿Por qué?:</strong> El POS requería calcular impuestos y clasificar antes de poder sincronizar la base de datos.<br/><strong>3. ¿Para qué?:</strong> Para dejar el terreno listo para la expansión del catálogo maestro.' }
    ],
    37: [
      { id: 1, title: 'Catálogo PIM Falconizado', desc: '<strong>1. ¿Qué se hizo?:</strong> Rediseño total de la creación y listado de productos usando la estética Falcon UI.<br/><strong>2. ¿Por qué?:</strong> El diseño anterior era rudimentario y no separaba conceptualmente el Catálogo del Kardex físico.<br/><strong>3. ¿Para qué?:</strong> Para brindar una experiencia corporativa premium, diferenciando la identidad del producto de sus existencias reales.' },
      { id: 2, title: 'Importación Masiva CSV (DB)', desc: '<strong>1. ¿Qué se hizo?:</strong> Desarrollo del endpoint `/api/inventario/productos/import` con inyección Batch Insert.<br/><strong>2. ¿Por qué?:</strong> Insertar productos uno a uno (en un bucle for) saturaría la red y colapsaría la memoria (Problema N+1).<br/><strong>3. ¿Para qué?:</strong> Para permitir a las empresas cargar miles de productos en milisegundos usando el motor nativo de PostgreSQL.' },
      { id: 3, title: 'Migración: Impuestos y Categorías', desc: '<strong>1. ¿Qué se hizo?:</strong> Alteración de la DB añadiendo IVA, Stock Min/Max, y relaciones con la nueva tabla `inv_categorias`.<br/><strong>2. ¿Por qué?:</strong> Es un requisito legal indispensable de la DIAN para facturación electrónica y control logístico comercial.<br/><strong>3. ¿Para qué?:</strong> Para que el cajero en el POS calcule los totales correctamente y envíe la estructura tributaria adecuada al facturar.' },
      { id: 4, title: 'Configuración Financiera y UX (Sesión 2)', desc: '<strong>1. ¿Qué se hizo?:</strong> Panel Settings global, CRUD de categorías en Falcon UI, subida de imágenes a Supabase, auto-completado de IVA y verificación DNS.<br/><strong>2. ¿Por qué?:</strong> El catálogo y el POS requerían soporte para impuestos dinámicos, carga multimedia y despliegue real SaaS.<br/><strong>3. ¿Para qué?:</strong> Para asegurar que los cálculos en facturación sean legales y que el sistema multi-tenant funcione en un dominio wildcard público.' }
    ],
    38: [
      { id: 1, title: 'Tablas Falcon y Categorías/Familias', desc: '<strong>1. ¿Qué se hizo?:</strong> Refactorización total de las tablas de Productos y Categorías/Familias con pestañas Activos/Inactivos y acciones en modal.<br/><strong>2. ¿Por qué?:</strong> Las tablas requerían estandarización Falcon UI premium y un único botón flotante (FAB) de creación.<br/><strong>3. ¿Para qué?:</strong> Para gestionar el catálogo de forma clara, corporativa y ágil.' },
      { id: 2, title: 'Reactividad y Feedback Toast', desc: '<strong>1. ¿Qué se hizo?:</strong> Reemplazo de alertas invasivas por notificaciones Toast no bloqueantes y actualización reactiva por ítem.<br/><strong>2. ¿Por qué?:</strong> Las alertas modales bloqueaban la pantalla y generaban recargas innecesarias de toda la tabla.<br/><strong>3. ¿Para qué?:</strong> Para brindar una UX instantánea donde los cambios (editar, activar/desactivar) se reflejan en vivo.' },
      { id: 3, title: 'Subida y Progreso Storage Supabase', desc: '<strong>1. ¿Qué se hizo?:</strong> Integración de subida directa de imágenes al bucket archivos_empresas con barra de progreso animada en React.<br/><strong>2. ¿Por qué?:</strong> Se eliminó el loader bloqueante de SweetAlert que provocaba colapsos del DOM al desmontar.<br/><strong>3. ¿Para qué?:</strong> Para mostrar al usuario el porcentaje de carga en tiempo real sin congelar la interfaz.' },
      { id: 4, title: 'Desbloqueo Políticas RLS en DB', desc: '<strong>1. ¿Qué se hizo?:</strong> Rediseño de public.current_tenant_id() en PostgreSQL para consultar el tenant por auth.uid() en saas_usuarios_empresas.<br/><strong>2. ¿Por qué?:</strong> El JWT de usuarios estándar no incluía tenant_id, haciendo que RLS rechazara las subidas al Storage.<br/><strong>3. ¿Para qué?:</strong> Para que el RLS verifique el tenant con exactitud y permita almacenar archivos multi-tenant de forma segura.' },
      { id: 5, title: 'Blindaje DOM Anti-Pantalla Blanca', desc: '<strong>1. ¿Qué se hizo?:</strong> Inyección de translate="no" en index.html y componente global ErrorBoundary en main.jsx.<br/><strong>2. ¿Por qué?:</strong> Traductores del navegador (Google Translate) alteran nodos de texto y rompen el desmontaje en React 18.<br/><strong>3. ¿Para qué?:</strong> Para garantizar el 100% de disponibilidad visual impidiendo que cualquier excepción provoque una página en blanco.' }
    ],
    39: [
      { id: 1, title: 'Optimización de Storage', desc: '<strong>1. ¿Qué se hizo?:</strong> Compresión de imágenes en cliente (HTML5 Canvas) y subida optimizada.<br/><strong>2. ¿Por qué?:</strong> La subida de imágenes pesadas saturaba la red y el bucket de Supabase, bloqueando la UI.<br/><strong>3. ¿Para qué?:</strong> Para garantizar subidas en milisegundos y ahorrar ancho de banda y espacio.' },
      { id: 2, title: 'Eliminación Asíncrona (Fire & Forget)', desc: '<strong>1. ¿Qué se hizo?:</strong> Borrado en segundo plano al sustituir imágenes en Supabase Storage.<br/><strong>2. ¿Por qué?:</strong> Esperar la confirmación del borrado para cerrar el modal generaba una mala experiencia (lag en UI).<br/><strong>3. ¿Para qué?:</strong> Para permitir una edición ultra fluida de productos en el catálogo sin congelar la pantalla.' },
      { id: 3, title: 'Dashboard Contable y KPIs', desc: '<strong>1. ¿Qué se hizo?:</strong> Reestructuración del Dashboard Principal SaaS reemplazando métricas inactivas por KPIs Contables (Terceros, PUC).<br/><strong>2. ¿Por qué?:</strong> El usuario (Tenant) requiere visualizar su estado de contabilidad de forma inmediata.<br/><strong>3. ¿Para qué?:</strong> Para ofrecer un panel gerencial 100% acoplado al módulo financiero.' }
    ],
    40: [
      { id: 1, title: 'Roadmap Estratégico POS', desc: '<strong>1. ¿Qué se hizo?:</strong> Creación del documento base `Roadmap_POS_Abastecimiento.md` para priorizar el desarrollo.<br/><strong>2. ¿Por qué?:</strong> Evita la construcción de módulos huérfanos definiendo dependencias: Proveedores -> Compras -> Caja.<br/><strong>3. ¿Para qué?:</strong> Para garantizar que la inyección de stock cumpla normativas contables universales.' },
      { id: 2, title: 'Gestión Proveedores y Crédito', desc: '<strong>1. ¿Qué se hizo?:</strong> Adición de `dias_credito` y `limite_credito` a la base de datos `crm_terceros` y UI.<br/><strong>2. ¿Por qué?:</strong> Se requiere perfilar a los proveedores contablemente para proyectar cuentas por pagar.<br/><strong>3. ¿Para qué?:</strong> Para preparar el ecosistema y recibir facturas de compra a crédito con plazos reales.' },
      { id: 3, title: 'Gestión Documental B2B (RUT)', desc: '<strong>1. ¿Qué se hizo?:</strong> Subida asíncrona a Supabase de RUT, Cámara de Comercio y Banco con barras de progreso.<br/><strong>2. ¿Por qué?:</strong> La auditoría financiera requiere el soporte tributario físico de quienes venden al sistema.<br/><strong>3. ¿Para qué?:</strong> Para automatizar el cumplimiento normativo en un entorno multi-tenant sin fricciones visuales.' }
    ]
  };

  // Helper function to map Year-Month-Day to the original Absolute Day indexing (June 1 = Day 1)
  const getAbsoluteDay = (year, month, day) => {
    if (year === 2026 && month === 5) return day; // Junio (Month 5 in JS Date)
    if (year === 2026 && month === 6) return 30 + day; // Julio
    return -1;
  };

  const getAbsDayFromDate = (date) => getAbsoluteDay(date.getFullYear(), date.getMonth(), date.getDate());

  // Manejo del mes actual mostrado
  const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const goToday = () => {
    setCurrentMonthDate(new Date(2026, 6, 1)); // Foco en el mes activo de desarrollo (Julio 2026)
    setSelectedDay(39); // Foco en el día actual
  };

  const renderCalendarGrid = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Rellenar días del mes anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, monthOffset: -1 });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
    }

    // Rellenar días del próximo mes para completar la grilla (máx 42 celdas)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
    }

    return days.map((cell, index) => {
      // Determinar la fecha real para buscar en dailyReports
      let cellDate;
      if (cell.monthOffset === -1) {
        cellDate = new Date(year, month - 1, cell.day);
      } else if (cell.monthOffset === 1) {
        cellDate = new Date(year, month + 1, cell.day);
      } else {
        cellDate = new Date(year, month, cell.day);
      }

      const absDay = getAbsDayFromDate(cellDate);
      const hasReport = !!dailyReports[absDay];
      const isSelected = absDay === selectedDay;

      // Aplicar estilos Falcon
      let baseClass = "py-2 position-relative d-flex align-items-center justify-content-center flex-column";
      if (!cell.isCurrentMonth) {
        baseClass += " text-400 bg-light";
      } else {
        baseClass += hasReport ? " fw-bold text-dark bg-soft-primary cursor-pointer hover-bg-200 transition-base" : " text-700 hover-bg-100 transition-base";
      }

      if (isSelected && cell.isCurrentMonth) {
        return (
          <div key={index} style={{ width: '14.28%', cursor: 'pointer' }} className="d-flex justify-content-center p-1" onClick={() => setSelectedDay(absDay)}>
            <div className="py-2 bg-primary text-white rounded shadow-sm d-flex align-items-center justify-content-center fw-bold w-100 h-100">
              {cell.day}
            </div>
          </div>
        );
      }

      return (
        <div 
          key={index} 
          className={`${baseClass} rounded m-1`} 
          style={{ width: 'calc(14.28% - 0.5rem)', height: '40px', cursor: (hasReport && cell.isCurrentMonth) ? 'pointer' : 'default' }} 
          onClick={() => {
            if (hasReport && cell.isCurrentMonth) setSelectedDay(absDay);
          }}
          title={hasReport ? "Ver reporte diario" : ""}
        >
          {cell.day}
          {hasReport && cell.isCurrentMonth && <span className="position-absolute bottom-0 start-50 translate-middle-x p-1 bg-danger border border-light rounded-circle mb-1" style={{ width: '6px', height: '6px' }}></span>}
        </div>
      );
    });
  };

  const currentEvents = dailyReports[selectedDay] || [{ id: 0, title: 'Día sin Registro de Avances', desc: 'El equipo se enfocó en análisis, diseño interno o descanso.' }];

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const displayMonth = `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  // Determinamos el día seleccionado real para mostrar en el título
  let selectedDateString = "";
  if (selectedDay > 0 && selectedDay <= 30) {
    selectedDateString = `${selectedDay} de Junio 2026`;
  } else if (selectedDay > 30) {
    selectedDateString = `${selectedDay - 30} de Julio 2026`;
  } else {
    selectedDateString = "Día sin Registro";
  }

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 border-bottom border-200">
        <h5 className="mb-0 text-800 fs-0"><span className="fas fa-calendar-alt text-primary me-2"></span>Cronograma de Avances</h5>
        <div className="d-flex align-items-center">
          <span className="fw-semi-bold fs--1 text-600 me-3 d-none d-md-inline-block">{displayMonth}</span>
          <div className="btn-group btn-group-sm" role="group">
            <button className="btn btn-falcon-default shadow-none" type="button" onClick={prevMonth} title="Mes Anterior">
              <span className="fas fa-chevron-left text-500"></span>
            </button>
            <button className="btn btn-falcon-primary shadow-none" type="button" onClick={goToday}>
              Hoy
            </button>
            <button className="btn btn-falcon-default shadow-none" type="button" onClick={nextMonth} title="Mes Siguiente">
              <span className="fas fa-chevron-right text-500"></span>
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="row g-0 h-100">
          {/* Columna Izquierda: Calendario */}
          <div className="col-md-7 border-end-md border-200">
            <div className="p-3">
              <div className="d-flex justify-content-between text-center fw-semi-bold text-500 fs--1 mb-2">
                <div style={{ width: '14.28%' }}>Dom</div>
                <div style={{ width: '14.28%' }}>Lun</div>
                <div style={{ width: '14.28%' }}>Mar</div>
                <div style={{ width: '14.28%' }}>Mié</div>
                <div style={{ width: '14.28%' }}>Jue</div>
                <div style={{ width: '14.28%' }}>Vie</div>
                <div style={{ width: '14.28%' }}>Sáb</div>
              </div>
              
              <div className="d-flex flex-wrap text-center fs--1">
                {renderCalendarGrid()}
              </div>
              <div className="d-flex justify-content-center align-items-center mt-3 fs--2 text-500">
                <span className="fas fa-circle text-danger me-2" style={{ fontSize: '8px' }}></span> 
                <span>Días con avances registrados</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Reportes */}
          <div className="col-md-5">
            <div className="p-3 h-100 d-flex flex-column bg-light rounded-end-md">
              <div className="mb-3 border-bottom border-200 pb-2">
                <h4 className="mb-1 text-800 text-primary">Reporte Técnico</h4>
                <p className="fs--1 text-600 mb-0 fw-semi-bold">
                  <span className="fas fa-clock text-info me-1"></span>
                  {selectedDateString}
                </p>
              </div>
              
              <div className="flex-1 overflow-auto pe-2 scrollbar" style={{ maxHeight: '320px' }}>
                <div className="accordion" id="accordion-report">
                  {currentEvents.map((evt, idx) => (
                    <div key={evt.id} className="accordion-item border-x-0 border-top-0 mb-1 rounded bg-white shadow-sm">
                      <h2 className="accordion-header" id={`heading-rep-${evt.id}`}>
                        <button 
                          className={`accordion-button shadow-none py-2 px-3 ${idx !== 0 ? 'collapsed' : ''}`}
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse-rep-${evt.id}`} 
                          aria-expanded={idx === 0 ? "true" : "false"} 
                          aria-controls={`collapse-rep-${evt.id}`}
                        >
                          <div className="d-flex align-items-center w-100">
                            <span className="fas fa-check-circle text-success me-2 fs--1"></span>
                            <span className="fw-bold fs--1 text-800">{evt.title}</span>
                          </div>
                        </button>
                      </h2>
                      <div 
                        id={`collapse-rep-${evt.id}`} 
                        className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} 
                        aria-labelledby={`heading-rep-${evt.id}`} 
                        data-bs-parent="#accordion-report"
                      >
                        <div className="accordion-body pt-0 pb-3 ps-4 pe-3 bg-white rounded-bottom">
                          <p className="fs--1 text-600 mb-0 mt-2" style={{ lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: evt.desc }}></p>
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
