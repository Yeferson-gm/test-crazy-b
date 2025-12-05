# Crazy Shop - Backend POS

Sistema de punto de venta (POS) multi-tienda con facturación electrónica SUNAT para Perú.

## 🚀 Tecnologías

- **Runtime**: Bun 1.x
- **Framework**: ElysiaJS 1.4
- **Base de datos**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Autenticación**: JWT con cookies
- **Validación**: Zod + TypeBox
- **Documentación**: Swagger/OpenAPI

## 📋 Características

### ✅ Implementadas

- ✅ Autenticación JWT con roles (admin, manager, cashier, seller)
- ✅ Sistema multi-tienda con aislamiento de datos
- ✅ Gestión de productos con categorías
- ✅ Inventario en tiempo real por tienda
- ✅ Transferencias entre tiendas
- ✅ Registro de ventas con múltiples métodos de pago
- ✅ Facturación electrónica SUNAT (Boleta, Factura, Notas)
- ✅ Gestión de clientes
- ✅ Historial de transacciones
- ✅ Alertas de stock mínimo
- ✅ Reportes y estadísticas por tienda
- ✅ API RESTful completa
- ✅ Documentación Swagger interactiva
- ✅ Docker y Docker Compose
- ✅ Listo para producción con Dockploy

## 🛠️ Instalación

### Prerrequisitos

- Bun 1.0 o superior
- PostgreSQL 16 o superior
- Docker y Docker Compose (opcional)

### Configuración local

1. **Instalar dependencias**
```bash
bun install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crazy_shop
JWT_SECRET=tu-clave-secreta-super-segura
SUNAT_API_URL=https://tu-api-facturacion.com
SUNAT_API_KEY=tu-api-key
```

3. **Crear base de datos**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE crazy_shop;
\q
```

4. **Generar y ejecutar migraciones**
```bash
# Generar migraciones de Drizzle
bun run db:generate

# Aplicar migraciones a la base de datos
bun run db:push
```

5. **Iniciar servidor de desarrollo**
```bash
bun run dev
```

El servidor estará corriendo en:
- API: http://localhost:3000
- Documentación: http://localhost:3000/swagger
- Health Check: http://localhost:3000/health

## 🐳 Docker

### Desarrollo con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

### Producción con Dockploy

1. **Construir imagen**
```bash
docker build -t crazy-shop-backend .
```

2. **Desplegar en VPS con Dockploy**
- Sube tu código al repositorio Git
- Configura Dockploy para apuntar al repositorio
- Configura las variables de entorno en Dockploy
- Dockploy se encargará del deployment automático

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/              # Módulos funcionales
│   │   ├── auth/            # Autenticación
│   │   ├── stores/          # Tiendas
│   │   ├── products/        # Productos
│   │   ├── inventory/       # Inventario
│   │   ├── sales/           # Ventas
│   │   └── invoicing/       # Facturación
│   ├── shared/              # Código compartido
│   ├── database/            # Base de datos
│   └── index.ts             # Punto de entrada
├── Dockerfile
├── docker-compose.yml
└── drizzle.config.ts
```

## 🔐 Autenticación

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

### Roles y permisos

- **admin**: Acceso total a todas las tiendas
- **manager**: Gestión completa de su tienda
- **cashier**: Ventas y consultas de su tienda
- **seller**: Ventas básicas de su tienda

## 📊 API Endpoints Principales

### Auth
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Usuario actual

### Tiendas
- `GET /api/v1/stores` - Listar tiendas
- `POST /api/v1/stores` - Crear tienda (admin)

### Productos
- `GET /api/v1/products` - Listar productos
- `GET /api/v1/products/barcode/:code` - Buscar por QR/código
- `POST /api/v1/products` - Crear producto

### Inventario
- `GET /api/v1/inventory/store/:storeId` - Inventario de tienda
- `POST /api/v1/inventory/adjust` - Ajustar inventario
- `POST /api/v1/inventory/transfer` - Transferencia entre tiendas

### Ventas
- `POST /api/v1/sales` - Crear venta
- `GET /api/v1/sales/store/:storeId` - Ventas por tienda

### Facturación
- `POST /api/v1/invoices` - Generar comprobante SUNAT
- `GET /api/v1/invoices/store/:storeId` - Comprobantes por tienda

Ver documentación completa en: **http://localhost:3000/swagger**

## 🔌 Integración con API de Facturación SUNAT

Configura tu API personalizada en `.env`:

```env
SUNAT_API_URL=https://tu-api-facturacion.com
SUNAT_API_KEY=tu-api-key
SUNAT_API_SECRET=tu-api-secret
```

El sistema enviará requests POST a `/generar-comprobante` con los datos de la venta.

## 📱 Escaneo con Cámara

Para escanear códigos QR/barras con la cámara:

1. Frontend implementa ruta `/camera` con acceso a cámara
2. Usa librería como `html5-qrcode` para decodificar
3. Envía el código al endpoint: `GET /api/v1/products/barcode/:code`

## 🔄 Scripts disponibles

```bash
bun run dev              # Desarrollo con hot reload
bun run start            # Producción
bun run db:generate      # Generar migraciones
bun run db:push          # Aplicar migraciones
bun run db:studio        # GUI de base de datos
```

## 🚦 Testing

Prueba el API con:
- **Swagger UI**: http://localhost:3000/swagger
- **Postman/Insomnia**: Importa desde Swagger
- **cURL**: Ejemplos en documentación

## 🔐 Seguridad

- ✅ JWT con cookies HttpOnly
- ✅ Validación de datos con Zod
- ✅ CORS configurado
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Aislamiento de datos por tienda
- ✅ Middleware de autorización por roles

## 📞 Soporte

Para bugs o features, contacta al equipo de desarrollo.

## 📄 Licencia

Privado © 2024 Crazy Shop
