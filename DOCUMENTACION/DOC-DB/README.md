# Archivo Maestro de Base de Datos - Mindsoftia (DOC-DB)

Este directorio consolida toda la documentación, esquemas y lógica de base de datos implementada en **Supabase / PostgreSQL**. El objetivo de esta estructura es mantener el control total del núcleo de datos del ecosistema SaaS.

## Estructura de Subdirectorios

### 🗄️ `/postgrest` (Modelado y APIs Automáticas)
- Contiene los diagramas ER (Entidad-Relación), los esquemas de tablas, vistas (`Views`), y procedimientos almacenados (RPCs / Triggers). 
- **Propósito:** Mantener la columna vertebral de la base de datos documentada; es decir, todo lo que PostgREST expone automáticamente como API RESTful.

### 🛡️ `/rls` (Seguridad a Nivel de Fila)
- Documentación de todas las políticas de *Row Level Security*.
- **Propósito:** Definir los límites del Multi-Tenancy. Garantiza que ninguna empresa (`empresa_id`) pueda acceder a los datos de otra, ni ningún rol sin permisos (cajero vs. admin) pueda ejecutar acciones destructivas.

### 🔑 `/auth` (Autenticación y Sesiones)
- Configuración del módulo de GoTrue de Supabase.
- **Propósito:** Documentar esquemas de usuarios, hooks personalizados de JWT, y el mapeo entre `auth.users` y la tabla pública de usuarios (`crm_terceros` o `usuarios`).

### 📂 `/storage` (Almacenamiento de Archivos)
- Reglas de los buckets de almacenamiento y políticas RLS asociadas.
- **Propósito:** Establecer cómo y dónde se guardan los archivos (fotos de atletas, PDFs de facturas DIAN, recibos POS) y quién tiene acceso a cada bucket.

### ⚡ `/edge-functions` (Lógica Serverless)
- Documentación de las funciones de Deno implementadas en Supabase Edge Functions.
- **Propósito:** Tareas en segundo plano (Webhooks de pagos, integración asíncrona DIAN) que se ejecutan más cerca del cliente y fuera del flujo principal de PostgreSQL.

### 📡 `/realtime` (Sincronización en Vivo)
- Configuración de los canales y tablas habilitadas para el motor de suscripciones de Supabase Realtime.
- **Propósito:** Notificaciones push de inventario, chat interno o actualizaciones en vivo de KPIs en los Dashboards administrativos.

### 🧠 `/ai-vectors` (pgvector e IA)
- Esquemas de bases de datos vectoriales.
- **Propósito:** Guardar embebidos (embeddings) que permitan búsquedas semánticas o alimentación para agentes IA (como el Chatbot Financiero de Mindsoftia).

---
> *Nota para los desarrolladores:* Cada vez que se altere la infraestructura de Supabase, los scripts `.sql` u `.md` correspondientes deben quedar respaldados en su respectiva subcarpeta para garantizar un despliegue repetible en entornos de producción.
