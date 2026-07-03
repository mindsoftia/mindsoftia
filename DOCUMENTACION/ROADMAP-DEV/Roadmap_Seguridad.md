# Roadmap de Seguridad Multi-Tenant (Mindsoftia SaaS)
**Rol:** /master-sec
**Objetivo:** Garantizar el aislamiento absoluto de datos entre inquilinos y blindar la infraestructura contra ataques.

La verdadera seguridad en una arquitectura SaaS Híbrida (Nube + Offline) se construye por capas. Si una falla, la siguiente debe contener el riesgo. Este es el plan de implementación en estricto orden de prioridad.

---

## 🛑 FASE 1: Aislamiento de Base de Datos (La Barrera Infranqueable)
**Prioridad:** CRÍTICA (Si esto falla, un inquilino verá los datos de otro).
**Estado:** *En progreso (Se han aplicado políticas iniciales en tablas nuevas).*

1. **Revisión Exhaustiva de RLS (Row Level Security):**
   - Asegurar que TODAS las tablas (excepto tablas maestras globales) tengan habilitado `ENABLE ROW LEVEL SECURITY`.
   - Validar que cada política exija que `empresa_id` coincida exactamente con el `tenant_id` extraído del JWT.
   - **Regla estricta:** Ningún *query* se ejecuta con el rol `postgres` o *Service Role* en la API pública. Todo acceso debe pasar por el JWT autenticado.
2. **Restricción de Integridad (Foreign Keys):**
   - Impedir que un inquilino pueda enlazar un registro suyo a una entidad (ej. Categoría o Proveedor) que pertenece a otro inquilino (`empresa_id` debe coincidir en ambas tablas).

---

## 🛡️ FASE 2: Hardening del Servidor (Apache & Red)
**Prioridad:** ALTA (Previene fugas de información estructural e intercepciones).
**Estado:** *Pendiente de aplicación en el Virtual Host.*

1. **Bloqueo de Listado de Directorios:**
   - Modificar `mindsoftia.conf` y `000-default.conf` para cambiar `Options Indexes` a `Options -Indexes`. Nadie debe poder ver la estructura de carpetas del servidor.
2. **Inyección de Cabeceras de Seguridad (Security Headers):**
   - Configurar en Apache: `Strict-Transport-Security` (HSTS), `X-Content-Type-Options`, `X-Frame-Options` y `X-XSS-Protection`.
3. **Estrategia SSL (Wildcard vs Path-Based):**
   - Si se decide usar subdominios (`empresa.mindsoftia.com`), tramitar y configurar el certificado Wildcard SSL (`*.mindsoftia.com`) con Certbot y ajustar el `ServerAlias`.

---

## ⚙️ FASE 3: Blindaje del Backend (Laravel API)
**Prioridad:** ALTA (Es el guardián de la lógica de negocio).
**Estado:** *Pendiente de auditoría en los controladores.*

1. **Global Scopes (Middleware):**
   - Configurar un *Global Scope* en todos los modelos Eloquent de Laravel que añada automáticamente `WHERE empresa_id = ?` según el Token del usuario. Esto previene que a un programador "se le olvide" filtrar los datos.
2. **Validación de Propiedad (Ownership) en Escritura:**
   - Para las operaciones UPDATE y DELETE, verificar explícitamente que el recurso solicitado pertenece a la empresa del usuario que hace la solicitud.
3. **Rate Limiting (Control de Tráfico):**
   - Implementar bloqueos en endpoints críticos (como `/api/pos/sync` o login) para mitigar ataques de denegación de servicio (DDoS) o fuerza bruta.

---

## 💻 FASE 4: Seguridad Híbrida (Frontend & Caché Offline)
**Prioridad:** MEDIA-ALTA (Protege el dispositivo del cliente).
**Estado:** *Pendiente.*

1. **Manejo Seguro del JWT:**
   - El token nunca debe exponerse en el LocalStorage de forma descuidada si se puede usar cookies HttpOnly. Si se usa LocalStorage, configurar expiración corta con *Refresh Token*.
2. **Limpieza del IndexedDB (Dexie):**
   - Garantizar que la función de *Logout* ejecute una orden atómica de `posDB.delete()` para borrar absolutamente toda la caché y ventas offline. Si otro usuario inicia sesión en la misma PC, no debe quedar rastro de la empresa anterior.
3. **Validación de Datos Pre-Sync:**
   - Al estar offline, el usuario podría modificar el IndexedDB manualmente desde la consola del navegador. El Backend debe validar matemáticamente la integridad de cada venta antes de insertarla en la nube (ej. recalcular los subtotales y totales).

---

## 📊 FASE 5: Auditoría e Inmutabilidad Financiera
**Prioridad:** MEDIA (Fundamental para certificación ERP).
**Estado:** *Planificado para la fase contable.*

1. **Tablas Inmutables (Append-Only):**
   - Tablas críticas como `inv_kardex` (movimientos de inventario) y `contab_asientos` (registros contables) nunca deben permitir operaciones de `UPDATE` o `DELETE`. Para corregir un error, se debe emitir un documento de reversión (Nota Crédito / Ajuste).
2. **Audit Trails (Trazabilidad):**
   - Guardar el `usuario_id` y un timestamp preciso de quién autorizó cada transacción importante.

---
*Fin del Roadmap de Seguridad. Se recomienda ejecutar las fases de forma secuencial.*
