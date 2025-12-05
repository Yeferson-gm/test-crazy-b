# 🚀 Guía de Despliegue a Producción

## Opción 1: Dockploy (Recomendado)

Dockploy es una plataforma que simplifica el deployment de aplicaciones Docker.

### Pasos:

1. **Preparar tu VPS**
```bash
# Conectarse al VPS
ssh usuario@tu-vps-ip

# Instalar Dockploy (sigue las instrucciones en https://dockploy.com)
curl -sSL https://dockploy.com/install.sh | sh
```

2. **Configurar repositorio Git**
```bash
# En tu máquina local, inicializa git si aún no lo has hecho
git init
git add .
git commit -m "Initial commit - Crazy Shop Backend"

# Sube a GitHub/GitLab/Bitbucket
git remote add origin tu-repositorio-url
git push -u origin main
```

3. **Configurar en Dockploy**
- Accede a Dockploy UI (generalmente `http://tu-vps-ip:3000`)
- Crea un nuevo proyecto
- Conecta tu repositorio Git
- Configura variables de entorno (ver sección abajo)
- Deploy automático

4. **Variables de entorno en Dockploy**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:password@postgres:5432/crazy_shop
JWT_SECRET=clave-super-segura-generada-aleatoriamente
ALLOWED_ORIGINS=https://tu-dominio.com
SUNAT_API_URL=https://tu-api-facturacion.com
SUNAT_API_KEY=tu-api-key-real
SUNAT_API_SECRET=tu-api-secret-real
```

5. **Configurar PostgreSQL en Dockploy**
- Crea un servicio de PostgreSQL
- Anota las credenciales
- Actualiza `DATABASE_URL` con las credenciales

## Opción 2: VPS Manual (Ubuntu 22.04)

### 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y git curl nginx

# Instalar Bun
curl -fsSL https://bun.sh/install | bash

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### 2. Configurar PostgreSQL

```bash
# Crear base de datos y usuario
sudo -u postgres psql

CREATE DATABASE crazy_shop;
CREATE USER crazy_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE crazy_shop TO crazy_user;
\q
```

### 3. Configurar la aplicación

```bash
# Clonar repositorio
cd /var/www
sudo git clone tu-repositorio-url crazy-shop-backend
cd crazy-shop-backend

# Instalar dependencias
bun install --production

# Configurar .env
sudo nano .env
# Pega la configuración de producción

# Ejecutar migraciones
bun run db:push
```

### 4. Configurar como servicio systemd

```bash
sudo nano /etc/systemd/system/crazy-shop.service
```

Contenido:
```ini
[Unit]
Description=Crazy Shop Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/crazy-shop-backend
Environment="NODE_ENV=production"
ExecStart=/root/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable crazy-shop
sudo systemctl start crazy-shop
sudo systemctl status crazy-shop
```

### 5. Configurar Nginx como reverse proxy

```bash
sudo nano /etc/nginx/sites-available/crazy-shop
```

Contenido:
```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/crazy-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.tu-dominio.com
```

## Opción 3: Docker Compose en VPS

### 1. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install -y docker-compose
```

### 2. Preparar archivos

```bash
# Clonar repositorio
git clone tu-repositorio-url
cd crazy-shop-backend

# Crear .env de producción
cp .env.example .env
nano .env  # Editar con valores de producción
```

### 3. Ejecutar

```bash
# Build y start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ejecutar migraciones
docker-compose exec backend bun run db:push

# Seed (opcional)
docker-compose exec backend bun run db:seed
```

### 4. Configurar Nginx (igual que opción 2, paso 5 y 6)

## 🔒 Seguridad en Producción

### 1. Variables de entorno seguras

```bash
# Generar JWT secret seguro
openssl rand -base64 32

# Usar en .env
JWT_SECRET=resultado_del_comando_anterior
```

### 2. Firewall

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Fail2ban (prevenir ataques)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### 4. Backups automáticos de PostgreSQL

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-db.sh
```

Contenido:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U crazy_user crazy_shop | gzip > $BACKUP_DIR/crazy_shop_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Hacer ejecutable y programar:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
sudo crontab -e

# Agregar: backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-db.sh
```

## 📊 Monitoreo

### 1. Logs

```bash
# Ver logs del servicio
sudo journalctl -u crazy-shop -f

# Ver logs de Docker
docker-compose logs -f backend

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
```

### 2. PM2 (alternativa a systemd)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar app
pm2 start bun --name crazy-shop -- run src/index.ts

# Ver logs
pm2 logs crazy-shop

# Monitoreo
pm2 monit

# Auto-start al reiniciar
pm2 startup
pm2 save
```

## 🔄 Actualización de la aplicación

### Con Git

```bash
cd /var/www/crazy-shop-backend
git pull origin main
bun install
bun run db:push  # Si hay nuevas migraciones
sudo systemctl restart crazy-shop
```

### Con Docker

```bash
cd /path/to/project
git pull origin main
docker-compose build
docker-compose up -d
```

### Con Dockploy

Simplemente haz push a tu repositorio, Dockploy lo desplegará automáticamente.

## ✅ Checklist de Producción

- [ ] Variables de entorno configuradas correctamente
- [ ] JWT_SECRET aleatorio y seguro
- [ ] PostgreSQL con credenciales seguras
- [ ] SSL/HTTPS configurado
- [ ] Firewall activo
- [ ] Backups automáticos configurados
- [ ] Logs monitoreados
- [ ] Dominio apuntando al servidor
- [ ] CORS configurado con dominios correctos
- [ ] Rate limiting configurado
- [ ] Healthcheck funcionando
- [ ] Documentación Swagger accesible (o deshabilitada en prod)

## 🆘 Troubleshooting

### Aplicación no inicia
```bash
# Ver logs
sudo journalctl -u crazy-shop -n 50
```

### Base de datos no conecta
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Probar conexión
psql -U crazy_user -d crazy_shop -h localhost
```

### Nginx 502 Bad Gateway
```bash
# Verificar que la app esté corriendo
sudo systemctl status crazy-shop

# Verificar puerto correcto en nginx
sudo nginx -t
```

## 📞 Soporte

Para problemas de deployment, revisa los logs y este documento.
Para bugs de la aplicación, consulta README.md.
