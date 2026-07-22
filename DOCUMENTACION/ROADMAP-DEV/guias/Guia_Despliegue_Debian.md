# Guía de Despliegue Oficial de Mindsoftia (Apache2 + Laravel + React/Vite)

> **Propósito:** Esta guía técnica, elaborada bajo el estándar `/master-doc`, proporciona un paso a paso limpio y estructurado para instalar el sistema operativo base, preparar el entorno de servidor **Apache2** para una arquitectura híbrida (Frontend React/Vite + Backend Laravel), y configurar el despliegue automatizado.

## 1. ROL
Technical Writer Senior / Arquitecto de Infraestructura.

## 2. CONTEXTO Y ALCANCE
Mindsoftia posee una arquitectura desacoplada en el mismo repositorio:
- **Frontend (SPA/PWA):** Construido con React y Vite (directorio raíz).
- **Backend (API):** Construido con Laravel (directorio `backend/`).

Este documento cubre desde la instalación en "bare metal" (Debian con entorno gráfico para administración remota), la configuración de los VirtualHosts en Apache2 para servir ambas aplicaciones, hasta la automatización con Crontab.

---

## FASE 1: Instalación del Sistema Operativo y Acceso Remoto

### 1.1 Preparación del Medio de Instalación (Rufus)
1. Descarga la ISO de Debian (Netinst) desde su [sitio oficial](https://www.debian.org/distrib/).
2. Descarga **Rufus Portable** desde [rufus.ie](https://rufus.ie/es/).
3. Ejecuta Rufus, selecciona tu USB, elige la imagen de Debian y presiona **EMPEZAR** (Elegir "Modo Imagen ISO").

### 1.2 Instalación de Debian (con Entorno Gráfico)
1. Inicia el equipo desde la USB y selecciona **"Graphical install"**.
2. Sigue el asistente de idioma, red (asignar IP fija en el router más adelante) y creación de usuario `root` y estándar (ej. `admin`).
3. En el paso de **Selección de Software**, **DEJA MARCADA** la opción **"Entorno de escritorio de Debian"** y **"GNOME"**. Esto es vital para la administración remota sin complicaciones de NAT. Marca también `Servidor SSH`.
4. Instala el gestor de arranque GRUB y finaliza.

### 1.3 Configuración de Administración Remota (AnyDesk)
Debido a que el servidor carece de IP pública directa, utilizaremos AnyDesk operando sobre GNOME.
1. Abre la **Terminal** en GNOME en el servidor físico.
2. Ingresa como superusuario: `su -`
3. Ejecuta los comandos oficiales de AnyDesk:
   ```bash
   wget -qO - https://keys.anydesk.com/repos/ANYDESK-GPG-KEY | apt-key add -
   echo "deb http://deb.anydesk.com/ all main" > /etc/apt/sources.list.d/anydesk-stable.list
   apt update
   apt install anydesk -y
   ```
4. Abre AnyDesk desde las aplicaciones. Ve a **Seguridad -> Permitir el acceso no presencial** y configura una contraseña.

> [!TIP]
> A partir de este momento, todo el proceso puede realizarse remotamente desde tu máquina personal abriendo AnyDesk, conectándote al ID del servidor, abriendo la Terminal y ejecutando `su -`.

---

## FASE 2: Preparación del Entorno (Pila LAMP y Node)

Instalaremos las dependencias necesarias para que Apache2 sirva tanto el build de React como la API de Laravel.

### 2.1 Actualización del Sistema
```bash
apt update && apt upgrade -y
```

### 2.2 Instalación de Apache2, PHP y Bases de Datos
Mindsoftia requiere PHP (para Laravel) y opcionalmente PostgreSQL/MySQL según tu base de datos principal.

```bash
# Servidor web, PHP y extensiones clave para Laravel
apt install -y apache2 php libapache2-mod-php php-cli php-mbstring php-xml php-bcmath php-curl php-pgsql php-mysql php-zip unzip curl git cron

# Habilitar módulos de Apache necesarios para Laravel y Vite
a2enmod rewrite alias headers
systemctl restart apache2
```

### 2.3 Instalación de Herramientas de Desarrollo (Node.js y Composer)
```bash
# Composer para dependencias del Backend
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Node.js (Versión 20.x) para compilar el Frontend
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

---

## FASE 3: Despliegue de Mindsoftia y Configuración de Apache

### 3.1 Configuración de Acceso a Git y Clonado (Sin Contraseña)
Para que el despliegue automático (cron) funcione en segundo plano sin quedarse bloqueado pidiendo contraseña, debemos autenticar el servidor usando llaves SSH (Deploy Keys de GitHub).

```bash
# 1. Generar la llave SSH para el usuario root (quien ejecutará el crontab)
ssh-keygen -t ed25519 -C "servidor-mindsoftia"
# (Presiona Enter a todas las preguntas para dejar la llave SIN contraseña)

# 2. Mostrar la llave pública en pantalla
cat ~/.ssh/id_ed25519.pub
# ---> COPIA EL TEXTO COMPLETO Y PÉGALO EN: 
# GitHub -> Repositorio Mindsoftia -> Settings -> Deploy Keys -> Add deploy key.

# 3. Preparar directorios y clonar
mkdir -p /var/www/html/mindsoftia
chown -R www-data:www-data /var/www/html/mindsoftia
usermod -aG www-data admin
chmod -R 775 /var/www/html/mindsoftia

cd /var/www/html
# Al clonar la primera vez, escriba "yes" para confirmar la huella de seguridad de github
git clone git@github.com:TU_USUARIO/mindsoftia.git
```

### 3.2 Construcción del Backend (Laravel)
```bash
cd /var/www/html/mindsoftia/backend

# Instalar dependencias PHP
composer install --no-dev --optimize-autoloader

# Configuración del entorno
cp .env.example .env
php artisan key:generate

# Permisos estrictos para Laravel
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 3.3 Construcción del Frontend (React/Vite PWA)
```bash
cd /var/www/html/mindsoftia

# Instalar dependencias JS y generar la carpeta 'dist/'
npm install
npm run build
```

### 3.4 Configuración del VirtualHost en Apache2
Debemos configurar Apache para que la ruta principal sirva el `dist/` (Frontend) y que todas las peticiones a `/api` se enruten al directorio `backend/public/` de Laravel.

Crea un archivo de configuración:
```bash
nano /etc/apache2/sites-available/mindsoftia.conf
```
Añade el siguiente bloque:

```apache
<VirtualHost *:80>
    ServerName mindsoftia.local
    DocumentRoot /var/www/html/mindsoftia/dist

    # Configuración Frontend (Vite/React)
    <Directory /var/www/html/mindsoftia/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        # Para que el enrutamiento de React funcione (Fallback a index.html)
        FallbackResource /index.html
    </Directory>

    # Configuración Backend (Laravel API)
    Alias /api /var/www/html/mindsoftia/backend/public
    <Directory /var/www/html/mindsoftia/backend/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/mindsoftia_error.log
    CustomLog ${APACHE_LOG_DIR}/mindsoftia_access.log combined
</VirtualHost>
```

Activa el sitio y reinicia Apache:
```bash
a2dissite 000-default.conf
a2ensite mindsoftia.conf
systemctl restart apache2
```

### 3.5 Automatización con Git y Crontab
Para actualizar automáticamente, crearemos un script de despliegue.

```bash
nano /var/www/html/mindsoftia/deploy.sh
```

**Contenido del script:**
```bash
#!/bin/bash
echo "--- Iniciando Despliegue Automático ---"
cd /var/www/html/mindsoftia

# 1. Actualizar repositorio
git fetch origin master
git reset --hard origin/master

# 2. Reconstruir Frontend
npm install
npm run build

# 3. Actualizar Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
# php artisan migrate --force # Descomentar si usas la base de datos central de Laravel

# 4. Asegurar permisos
chown -R www-data:www-data storage bootstrap/cache

echo "--- Despliegue Finalizado ---"
```

Da permisos y añádelo al cron de `root` (`crontab -e`):
```bash
chmod +x /var/www/html/mindsoftia/deploy.sh
```
```crontab
0 3 * * * /var/www/html/mindsoftia/deploy.sh >> /var/log/mindsoftia_deploy.log 2>&1
```

> [!IMPORTANT]
> Esta configuración asume que estás gestionando la base de datos vía Supabase (por tu `.env`), pero si requieres el motor de PostgreSQL local, debes añadir `apt install postgresql` en la Fase 2.
