# Reporte de Desarrollo y Seguridad Multi-Tenant
**Fecha:** 03 de Julio de 2026
**Módulo:** Infraestructura de Seguridad y Aislamiento de Datos

> **Propósito:** Documentar los avances críticos implementados en la infraestructura del servidor (VPS), base de datos y frontend híbrido para garantizar que el sistema SaaS opere bajo estándares de seguridad Enterprise (aislamiento de inquilinos, inmutabilidad contable y protección de caché).

---

## 1. ROL
**Technical Writer & Arquitecto de Seguridad**

## 2. CONTEXTO Y ALCANCE
El sistema pasó de una fase de construcción de características (frontend/backend) a una etapa de **producción y hardening**. Este documento abarca la finalización de la "Fase 2" a la "Fase 5" del Roadmap de Seguridad, asegurando que ninguna fuga de datos entre empresas (Tenants) pueda ocurrir a nivel de URL, Base de Datos o Caché de Navegador.

## 3. AUDIENCIA OBJETIVO
Equipo de Desarrollo Backend/Frontend, Administradores del Servidor VPS (Linux/Apache) y Auditores de Seguridad.

---

## 4. ESTRUCTURA DEL DOCUMENTO (Avances del Día)

### 4.1. Fase 2: Hardening del Servidor y Certificados SSL Wildcard
* **¿Qué se hizo?** Se configuró y generó exitosamente un certificado SSL Wildcard (`*.mindsoftia.com`) utilizando Let's Encrypt mediante verificación de registros DNS TXT en Squarespace.
* **¿Por qué?** Para habilitar automáticamente el cifrado HTTPS en todos los subdominios generados dinámicamente para cada inquilino de la plataforma SaaS.
* **Ajustes Adicionales:** Se endureció la configuración en Apache (`mindsoftia.conf` y `000-default-le-ssl.conf`) apagando la indexación de directorios (`-Indexes`), ocultando la firma del servidor y añadiendo cabeceras HTTP de protección anti-XSS y Clickjacking.

### 4.2. Fase 3: Aislamiento de Datos (Laravel Global Scopes)
* **¿Qué se hizo?** Se inyectó el rasgo `Multitenantable.php` en los modelos críticos del sistema (`InvProducto`, `Tercero`, `InvKardex`, `InvStockSede`, `PosVenta`, `ContabAsiento`, `InvSede`, `InvLote`).
* **¿Por qué?** Para interceptar silenciosamente todas las consultas a la base de datos (Select, Update, Delete) e inyectar el filtro `where('empresa_id', auth()->user()->empresa_id)`.
* **Resultado:** Se mitiga completamente el riesgo de que una petición maliciosa extraiga o modifique la información de un Tenant ajeno, ya que Laravel aísla la base de datos a nivel de capa ORM.

### 4.3. Fase 4: Autodestrucción de Caché Frontend (Dexie.js)
* **¿Qué se hizo?** Se modificó la acción `logout` en `src/store/authStore.js` para iterar y purgar (`clear()`) todas las tablas transaccionales y de caché locales administradas por IndexedDB.
* **¿Por qué?** Mindsoftia usa tecnología Offline-First. Si un usuario cierra sesión en un ordenador compartido, los datos de su empresa seguían almacenados físicamente en el navegador. Con esta purga masiva, el sistema destruye el caché antes de retornar a la pantalla de login, logrando aislamiento en hardware compartido.

### 4.4. Fase 5: Inmutabilidad Contable (Append-Only)
* **¿Qué se hizo?** Se sobreescribieron los eventos `updating` y `deleting` mediante el método `boot()` en los modelos `InvKardex` y `ContabAsiento`.
* **¿Por qué?** En ERPs financieros, el historial no debe alterarse. Si alguien intenta eliminar un movimiento o cambiar el monto financiero de un asiento, Laravel interceptará la petición arrojando una **Excepción de Violación de Seguridad**. Los errores deben solucionarse creando un nuevo registro contable (Nota de crédito/Reversión).

### 4.5. Bloqueo de Redirección y Acceso Raíz
* **¿Qué se hizo?** En `Login.jsx`, se implementó una interceptación de la ruta raíz (`mindsoftia.com`). Si un empleado estándar se loguea allí, la sesión se destruye instantáneamente. Simultáneamente, el backend (`AuthController@me`) extrae el "subdominio" del inquilino y activa una alerta visual (SweetAlert2) que redirige al usuario a su portal oficial (ej: `https://miempresa.mindsoftia.com/login`).
* **¿Por qué?** Evita confusión de marca, impide el acceso masivo a dominios administrativos y refuerza la sensación de pertenencia e identidad corporativa de cada cliente.

### 4.6. Correcciones Operativas
* **Solución de VITE_SUPABASE_URL:** El frontend en el VPS devolvía un error 500 silencioso o un listado vacío de empresas porque se había omitido la configuración de las variables de entorno de React (`.env` raíz) antes de compilar. 
* **Optimización de Assets:** Se auditó la velocidad de carga (Loader), detectando que `logo.png` superaba los 2.19MB. Se dejó como instrucción obligatoria su compresión para mejorar el *First Contentful Paint*.

---

## 5. ENTREGABLE / ESTADO DEL REPOSITORIO
Todos los módulos mencionados fueron integrados, probados exitosamente en entornos locales y compilados en producción (`npm run build`). Posteriormente, los cambios fueron versionados y empaquetados en Git (`feat(security): Implement Phase 3...`) asegurando trazabilidad de la infraestructura de seguridad.
