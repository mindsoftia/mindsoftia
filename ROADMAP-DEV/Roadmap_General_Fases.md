# Hoja de Ruta Estratégica: Desarrollo de Módulos (SaaS Contable)
**Periodo de Ejecución:** 16 de Junio de 2026 – 15 de Noviembre de 2026 (5 Meses)
**Documento de Arquitectura y Negocios**
*Elaborado por el equipo multidisciplinario (Desarrollo Full Stack, Contadores Expertos, Negocios y Marketing).*

---

## 🎯 Visión General y Cronograma
Para construir un ERP contable robusto y escalable, el desarrollo debe seguir el flujo natural de los datos operativos de una empresa. No se puede contabilizar sin ventas, y no se puede reportar a la DIAN sin contabilización previa. 

Este proyecto tiene un *time-to-market* estricto de **5 meses**. A continuación, se detalla el cronograma mes a mes de las 6 fases de desarrollo.

---

### 📅 MES 1 (16 de Junio – 15 de Julio)
**Núcleo SaaS y FASE 1: Gestión Comercial & POS**
- **Objetivo del Mes:** Dejar la plataforma lista para registrar empresas (Multi-tenant) y lanzar el motor operativo donde nacen los datos empresariales.
- **Entregables Explícitos:**
  1. **Núcleo SaaS (Completado):** Autenticación de Supabase, protección de rutas, asignación de roles (RBAC) y aislamiento de datos por inquilino mediante Row Level Security (RLS).
  2. **Maestros Operativos:** CRUD completo para la creación de Clientes (Directorio CRM) y Proveedores.
  3. **Inventario Inteligente:** Catálogo de productos, control de stock multibodega, costeo e impuestos asociados.
  4. **Punto de Venta (POS):** Interfaz ágil (Offline-first / PWA) orientada a la venta rápida en mostrador, integración con lectores de código de barras y generación de tickets de venta.
- **Hito de Negocio:** La plataforma ya sirve como sistema de caja e inventario funcional para comercios pequeños.

---

### 📅 MES 2 (16 de Julio – 15 de Agosto)
**FASE 2: El Corazón Financiero (Contabilidad NIIF)**
- **Objetivo del Mes:** Tomar la data transaccional del Mes 1 (las ventas y el inventario) y transformarla en lenguaje contable y financiero.
- **Entregables Explícitos:**
  1. **Plan Único de Cuentas (PUC):** Árbol dinámico de cuentas configurado bajo normativas NIIF para Colombia.
  2. **Automatización de Asientos:** Triggers y lógicas en backend que generen un asiento contable automáticamente por cada ticket del POS vendido.
  3. **Comprobantes y Digitación:** Pantalla avanzada para contadores que permita registrar notas manuales, comprobantes de egreso y recibos de caja con atajos de teclado.
  4. **Reportes Financieros Base:** Generación en tiempo real del Libro Diario, Balance General de Prueba y Estado de Resultados.
- **Hito de Negocio:** El sistema ahora maneja toda la salud financiera de la empresa y atrae a los Contadores.

---

### 📅 MES 3 (16 de Agosto – 15 de Septiembre)
**FASE 3: Cumplimiento Legal (Facturación Electrónica DIAN)**
- **Objetivo del Mes:** Conectar nuestro motor financiero con los entes gubernamentales para reportar ventas formales.
- **Entregables Explícitos:**
  1. **Integración Proveedor Tecnológico (PT) / API DIAN:** Conexión segura para enviar XML de facturas, notas de crédito y notas de débito.
  2. **Certificados Digitales:** Panel para cargar y gestionar las firmas electrónicas (.p12) de cada empresa inquilina.
  3. **Generación Legal:** Inyección del CUFE y generación del Código QR en las representaciones gráficas (PDFs) de la factura.
  4. **Distribución Automática:** Motor de envío masivo para entregar la factura electrónica validada junto con el XML al correo del cliente final.
- **Hito de Negocio:** *Producto Mínimo Viable (MVP) Comercializable al 100%.* Ya se puede vender la suscripción del ERP a empresas formales.

---

### 📅 MES 4 (16 de Septiembre – 15 de Octubre)
**FASE 4: Cumplimiento Legal y Talento (Nómina Electrónica DIAN)**
- **Objetivo del Mes:** Cubrir la segunda obligación fiscal más importante de Colombia, automatizando el área de Recursos Humanos.
- **Entregables Explícitos:**
  1. **Gestión de RRHH:** Base de datos de empleados, contratos, salarios base y configuración de seguridad social.
  2. **Novedades y Liquidación:** Módulo para registrar horas extras, vacaciones, incapacidades y liquidar la nómina quincenal o mensual.
  3. **Contabilización:** Automatización del gasto de nómina hacia el módulo de Contabilidad NIIF (Mes 2).
  4. **Transmisión DIAN:** Generación del Documento Soporte de Pago de Nómina Electrónica, creación del CUNE y envío al ente fiscal.

---

### 📅 MES 5 (16 de Octubre – 15 de Noviembre)
**FASE 5: Base de Conocimiento y FASE 6: Inteligencia Artificial**
- **Objetivo del Mes:** Reducir la fricción, escalar el soporte técnico y dotar al software de una ventaja competitiva masiva (IA) justo antes del cierre de año.
- **Entregables Explícitos:**
  1. **Centro de Ayuda (Fase 5):** Portal interactivo integrado dentro del ERP con manuales de usuario, glosario contable y tutoriales en video para onboarding autónomo.
  2. **Chatbot Financiero (Fase 6):** Un asistente de IA integrado que lee la Base de Conocimiento para responder dudas técnicas, y analiza los datos contables para responder preguntas directas gerenciales (Ej: "¿Cuál fue mi rentabilidad este mes?").
  3. **Orquestación con n8n (Fase 6):** Flujos automatizados que sugieren la clasificación contable de una factura de proveedor escaneada o alertan predictivamente sobre quiebres inminentes de stock.
- **Hito de Negocio:** Lanzamiento de la versión "Premium/Enterprise", posicionando a Mindsoftia como un ERP de última generación frente a los competidores clásicos.

---

## 📝 Plan de Acción Inmediato (Semana Actual)
Nos encontramos en el **Mes 1**. Las tareas de infraestuctura SaaS (Multi-tenant) están terminadas. 
**Paso a seguir:** Iniciar con la creación del esquema en Supabase de las tablas `clientes`, `productos` y la UI del catálogo de inventario en React.
