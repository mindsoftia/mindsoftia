# Guía de Despliegue: Apache2, Supabase y Automatización Git (Mindsoftia)

> **Propósito:** Este documento técnico (estándar `/master-doc`) detalla el proceso para preparar un servidor Linux (que ya se encuentra operativo) con Apache2, desplegar la arquitectura de Mindsoftia conectada a **Supabase**, y establecer un ciclo de integración continua básico utilizando `git pull` automatizado vía Crontab.

## 1. ROL
Technical Writer Senior / Arquitecto DevOps.

## 2. CONTEXTO Y ALCANCE
A diferencia de guías de instalación desde cero (Bare-Metal), este documento parte de un sistema operativo funcional. Nos concentraremos exclusivamente en:
1. Instalar la pila web (Apache2, PHP, Node.js). No se instalarán motores de bases de datos locales, ya que Mindsoftia delegará esta responsabilidad a **Supabase**.
2. Autenticar el servidor con Git mediante llaves SSH.
3. Desplegar el código y construir los artefactos (Laravel API y React/Vite PWA).
4. Configurar un script de actualización continua en Crontab.

## 3. AUDIENCIA OBJETIVO Y REQUISITOS PREVIOS
**Audiencia:** Administradores de Servidores y DevOps.
**Requisitos Previos:**
- Servidor Linux Debian/Ubuntu con acceso SSH y permisos de `root`.
- Proyecto Mindsoftia alojado en un repositorio (ej. GitHub).
- Credenciales de acceso a la base de datos externa en Supabase (URL, Keys, Postgres Connection String).

---

## FASE 1: Preparación del Entorno Web

Instalaremos Apache2, PHP (para el backend en Laravel) y Node.js (para compilar el frontend). **Omitimos Postgres local**, pero sí instalaremos la extensión de PHP para que Laravel pueda comunicarse con Supabase.

### 1.1 Actualización e Instalación de Paquetes Base
```bash
su -
apt update && apt upgrade -y

# Instalar Apache2, PHP y extensiones requeridas por Laravel (incluyendo pdo_pgsql para Supabase)
apt install -y apache2 php libapache2-mod-php php-cli php-mbstring php-xml php-bcmath php-curl php-pgsql php-zip unzip curl git cron

# Habilitar módulos de enrutamiento web
a2enmod rewrite alias headers
systemctl restart apache2
```

### 1.2 Instalación de Composer y Node.js
```bash
# Composer (PHP)
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Node.js (Versión 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

---

## FASE 2: Autenticación Git y Clonado Inicial

Para que el cron pueda hacer `git pull` sin interacción humana, el servidor necesita una llave SSH registrada en el repositorio.

### 2.1 Generación de la Llave SSH
```bash
# Generar llave sin contraseña
ssh-keygen -t ed25519 -C "deploy-mindsoftia"
# Presiona Enter a todo.

# Mostrar la llave para copiarla
cat ~/.ssh/id_ed25519.pub
```
> [!IMPORTANT]
> Copia el texto devuelto por el comando anterior y agrégalo en la configuración de tu repositorio (En GitHub: **Settings -> Deploy Keys -> Add deploy key**).

### 2.2 Clonado del Repositorio
```bash
mkdir -p /var/www/html/mindsoftia
chown -R www-data:www-data /var/www/html/mindsoftia
chmod -R 775 /var/www/html/mindsoftia

cd /var/www/html
# Al ejecutar esto por primera vez, escribe 'yes' para confirmar la conexión
git clone git@github.com:TU_USUARIO/mindsoftia.git
```

---

## FASE 3: Construcción y Conexión a Supabase

### 3.1 Backend (Laravel)
```bash
cd /var/www/html/mindsoftia/backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Archivo de Entorno
cp .env.example .env
php artisan key:generate
```

Edita el archivo `.env` (`nano .env`) y configura la conexión a **Supabase**. Asegúrate de tener los siguientes parámetros:
```env
DB_CONNECTION=pgsql
DB_HOST=aws-0-REGION.pooler.supabase.com
DB_PORT=6543 # O el puerto del connection pooler
DB_DATABASE=postgres
DB_USERNAME=postgres.tu_proyecto_id
DB_PASSWORD=tu_contraseña_segura
```

Ajusta los permisos para evitar errores 500:
```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 3.2 Frontend (React/Vite)
```bash
cd /var/www/html/mindsoftia

# Compilar los estáticos
npm install
npm run build
```

---

## FASE 4: Configuración de Apache2 (VirtualHost)

Debemos servir el Frontend (en `dist/`) y enrutar las peticiones API al Backend.

1. Crear el archivo `nano /etc/apache2/sites-available/mindsoftia.conf`:

```apache
<VirtualHost *:80>
    ServerName midominio.com # Cambiar por IP o Dominio

    # 1. Servir el Frontend (React/Vite)
    DocumentRoot /var/www/html/mindsoftia/dist
    <Directory /var/www/html/mindsoftia/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    # 2. Servir el Backend (Laravel API)
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

2. Aplicar los cambios:
```bash
a2dissite 000-default.conf
a2ensite mindsoftia.conf
systemctl restart apache2
```

---

## FASE 5: Automatización con Crontab (Git Pull)

En lugar de poner el `git pull` suelto en el crontab, es más seguro usar un script que actualice todo ordenadamente.

1. Crea el script `nano /var/www/html/mindsoftia/deploy.sh`:

```bash
#!/bin/bash
# Ubicación: /var/www/html/mindsoftia/deploy.sh
echo "--- Iniciando Despliegue Automático ($(date)) ---"
cd /var/www/html/mindsoftia

# Traer últimos cambios sin pedir contraseña (gracias a la llave SSH)
git pull origin master

# Reconstruir Frontend
npm install
npm run build

# Reconstruir Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
# Las migraciones a Supabase deben ejecutarse con precaución, pero si es necesario:
# php artisan migrate --force

# Restaurar permisos (Laravel tiende a crear archivos con root en crontab)
chown -R www-data:www-data storage bootstrap/cache

echo "--- Despliegue Finalizado ---"
```

2. Dar permisos de ejecución:
```bash
chmod +x /var/www/html/mindsoftia/deploy.sh
```

3. Agregarlo a Crontab (`crontab -e` como usuario root) para que corra diariamente a las 3:00 AM:
```crontab
0 3 * * * /var/www/html/mindsoftia/deploy.sh >> /var/log/mindsoftia_deploy.log 2>&1
```

> [!TIP]
> Puedes revisar el historial de actualizaciones leyendo el log: `cat /var/log/mindsoftia_deploy.log`.
