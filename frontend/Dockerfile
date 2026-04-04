# ──────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build args cho Next.js NEXT_PUBLIC_* (bake at build time)
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm ci --omit=dev --ignore-scripts

# ──────────────────────────────────────────
# Stage 2: Production (standalone output)
# ──────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache curl tini

WORKDIR /app

# Copy standalone build (much smaller than full node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
