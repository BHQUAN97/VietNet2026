# ──────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove dev dependencies
RUN npm ci --omit=dev

# ──────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache curl tini

WORKDIR /app

# Install pm2 globally for cluster mode
RUN npm install -g pm2

# Copy built artifacts and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy pm2 ecosystem config if it exists
COPY ecosystem.config.js* ./

# Local uploads directory (fallback khi R2 chưa config)
RUN mkdir -p /app/uploads

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app/uploads
USER nestjs

EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["pm2-runtime", "dist/main.js", "-i", "4"]
