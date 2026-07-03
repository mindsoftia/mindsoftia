# Guía Operativa: Gestión de DNS y Certificados SSL Wildcard
**Rol:** /master-doc
**Plataforma:** Google Workspace & Squarespace Domains
**Objetivo:** Documentar la ruta exacta para acceder a los registros DNS cuando un dominio fue comprado mediante Google Workspace, y cómo configurar el registro TXT para el SSL Wildcard de Certbot.

---

## 1. El Contexto (El "Misterio" de Google Domains)
Cuando un dominio (`mindsoftia.com`) se adquiere directamente al crear una cuenta de correo corporativo en Google Workspace, **no** se aloja en Google Cloud Console (proyectos de desarrollador). Históricamente se alojaba en *Google Domains*, pero tras la venta de este servicio, todos los dominios de Workspace fueron migrados a **Squarespace**.

## 2. Ruta de Acceso a los Registros DNS
Si en el futuro necesitas modificar a dónde apunta tu servidor (Registros A) o renovar los certificados de seguridad, esta es la ruta obligatoria:

1. Iniciar sesión en la [Consola de Administración de Google Workspace](https://admin.google.com) usando la cuenta principal de trabajo (ej. `contacto@mindsoftia.com`).
2. En el menú lateral izquierdo, navegar a **Cuenta > Dominios > Gestionar dominios**.
3. En la lista de dominios, ubicar `mindsoftia.com` y hacer clic en **Ver detalles**.
4. En el panel lateral derecho que se despliega, hacer clic en el enlace: **GESTIONAR DOMINIO (mediante Squarespace)**.
5. Esto abrirá una nueva pestaña redirigiendo a `account.squarespace.com`. Si pide login, usar el botón **Continuar con Google** y seleccionar la misma cuenta de trabajo.
6. Dentro del panel de Squarespace, hacer clic sobre el dominio `mindsoftia.com`.
7. En el menú izquierdo, hacer clic en **DNS**.

---

## 3. Procedimiento para el SSL Wildcard (Paso Actual)
Estando en la pantalla de **DNS** de Squarespace (donde ves tus Registros A apuntando a la IP `66.70.189.211`), debes ejecutar estos pasos para validar el certificado de Let's Encrypt para los subdominios Multi-Tenant:

1. Ve a la sección **Registros personalizados** y haz clic en el botón negro **AGREGAR REGISTRO**.
2. Rellena los campos exactamente de la siguiente manera:
   - **TIPO:** Selecciona `TXT` en el menú desplegable.
   - **NOMBRE (Host):** Escribe `_acme-challenge`
   - **DATOS (Valor):** Pega aquí el código largo que te generó la consola de tu VPS al ejecutar el comando de Certbot.
   - **PRIORIDAD / TTL:** Puedes dejar los valores por defecto.
3. Haz clic en **Guardar**.
4. **IMPORTANTE:** Espera entre 2 a 5 minutos. La propagación DNS no es instantánea.
5. Regresa a la consola negra de tu servidor VPS y presiona `Enter` para que Let's Encrypt verifique el registro.
6. Si todo sale bien, Certbot te dirá que los certificados se generaron correctamente y podrás aplicar la configuración segura en Apache (`000-default-le-ssl.conf`).

---
*Documento generado por el protocolo /master-doc para asegurar la trazabilidad de la infraestructura.*
