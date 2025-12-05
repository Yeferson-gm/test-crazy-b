# ================================
# Dockerfile para Crazy Shop Backend
# Stack: Bun Runtime + Elysia Framework + Prisma ORM
# ================================

# ================================
# ETAPA 1: Base con Bun
# ================================
FROM oven/bun:1.1.38-alpine AS base
WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL y otras herramientas
RUN apk add --no-cache \
    postgresql-client \
    curl \
    ca-certificates \
    nodejs \
    npm

# ================================
# ETAPA 2: Instalar dependencias
# ================================
FROM base AS deps

# Copiar archivos de dependencias
COPY package.json bun.lock ./

# Instalar todas las dependencias (incluyendo prisma para migraciones)
RUN bun install --frozen-lockfile

# ================================
# ETAPA 3: Build
# ================================
FROM base AS builder

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN bunx prisma generate

# Verificar que existen las migraciones
RUN ls -la prisma/migrations/ || echo "⚠️  Carpeta prisma/migrations no encontrada"

# ================================
# ETAPA 4: Producción
# ================================
FROM base AS runner

# Establecer NODE_ENV
ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 bungroup && \
    adduser --system --uid 1001 bunuser --ingroup bungroup

# Copiar dependencias y código
COPY --from=deps --chown=bunuser:bungroup /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:bungroup /app/src ./src
COPY --from=builder --chown=bunuser:bungroup /app/prisma ./prisma
COPY --from=builder --chown=bunuser:bungroup /app/index.ts ./
COPY --from=builder --chown=bunuser:bungroup /app/package.json ./
COPY --from=builder --chown=bunuser:bungroup /app/tsconfig.json ./

# Copiar script de inicio
COPY --chown=bunuser:bungroup <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "🚀 Iniciando Crazy Shop Backend..."

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurada"
  exit 1
fi

echo "✅ Variables de entorno verificadas"

# Esperar a que PostgreSQL esté disponible
echo "⏳ Esperando conexión a PostgreSQL..."
until pg_isready -d "$DATABASE_URL" -t 1; do
  echo "⏳ PostgreSQL no disponible, reintentando en 2s..."
  sleep 2
done
echo "✅ PostgreSQL está listo"

# Ejecutar migraciones
echo "� Ejecutando migraciones de Prisma..."
bunx prisma migrate deploy || {
  echo "❌ Error ejecutando migraciones"
  exit 1
}
echo "✅ Migraciones completadas"

# Ejecutar seeds
echo "🌱 Ejecutando seeds..."
bunx prisma db seed || {
  echo "⚠️  Warning: Error ejecutando seeds (puede ser normal si ya existen datos)"
}
echo "✅ Seeds completados"

# Iniciar aplicación
echo "🎯 Iniciando servidor en puerto $PORT..."
exec bun run index.ts
EOF

# Dar permisos de ejecución al script
RUN chmod +x /app/start.sh

# Cambiar a usuario no-root
USER bunuser

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["/app/start.sh"]
