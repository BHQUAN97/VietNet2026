#!/bin/bash
# ──────────────────────────────────────────
# VietNet Interior — Deployment Script
# Server: Ubuntu 213.163.199.176
# Domain: bhquan.store
# ──────────────────────────────────────────

set -euo pipefail

# ─── Configuration ───────────────────────
APP_DIR="/opt/vietnet"
REPO_URL="https://github.com/your-repo/VietNet2026.git"  # Update this
BRANCH="main"
DOMAIN="bhquan.store"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD="docker-compose.prod.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Pre-flight checks ──────────────────
log "Starting deployment to ${DOMAIN}..."

# Check Docker
command -v docker >/dev/null 2>&1 || err "Docker not installed"
command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || err "Docker Compose not installed"

# Detect compose command
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
else
    COMPOSE="docker-compose"
fi

# ─── Pull latest code ───────────────────
if [ -d "${APP_DIR}/.git" ]; then
    log "Pulling latest code..."
    cd "${APP_DIR}"
    git fetch origin "${BRANCH}"
    git reset --hard "origin/${BRANCH}"
else
    log "Cloning repository..."
    git clone -b "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
    cd "${APP_DIR}"
fi

# ─── Check .env files ───────────────────
if [ ! -f "${APP_DIR}/backend/.env" ]; then
    warn "backend/.env not found! Copying from .env.example..."
    cp "${APP_DIR}/.env.example" "${APP_DIR}/backend/.env"
    warn "IMPORTANT: Edit ${APP_DIR}/backend/.env with production values!"
    exit 1
fi

if [ ! -f "${APP_DIR}/frontend/.env" ]; then
    log "Creating frontend/.env..."
    cat > "${APP_DIR}/frontend/.env" << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://bhquan.store/api
NEXT_PUBLIC_SITE_URL=https://bhquan.store
ENVEOF
fi

# ─── Ensure shared networks (app nào start trước cũng được) ──
log "Ensuring shared Docker networks..."
docker network create webphoto_backend 2>/dev/null || true
docker network create vietnet_frontend 2>/dev/null || true

# ─── Build & Deploy ─────────────────────
log "Building Docker images..."
cd "${APP_DIR}"

# Build images
${COMPOSE} -f ${COMPOSE_FILE} build --no-cache

# Stop old containers gracefully
log "Stopping old containers..."
${COMPOSE} -f ${COMPOSE_FILE} down --timeout 30

# Start new containers
log "Starting new containers..."
${COMPOSE} -f ${COMPOSE_FILE} up -d

# ─── Run DB changelogs ──────────────────
log "Running DB changelogs..."
if [ -d "${APP_DIR}/db/changelog" ]; then
    for f in $(find "${APP_DIR}/db/changelog" -name 'V*.sql' -type f 2>/dev/null | sort); do
        FNAME=$(basename "$f")
        echo -n "  $FNAME ... "
        docker exec -i photo-mysql mysql -u vietnet -p"${VIETNET_DB_PASSWORD}" vietnet < "$f" 2>&1 && echo "OK" || echo "SKIP"
    done
fi

# ─── Wait for health checks ─────────────
log "Waiting for services to start..."
sleep 10

# Check backend health
RETRIES=0
MAX_RETRIES=30
until curl -sf http://localhost:4000/api/health > /dev/null 2>&1; do
    RETRIES=$((RETRIES + 1))
    if [ ${RETRIES} -ge ${MAX_RETRIES} ]; then
        err "Backend health check failed after ${MAX_RETRIES} attempts"
    fi
    echo -n "."
    sleep 2
done
echo ""
log "Backend is healthy!"

# Check frontend
until curl -sf http://localhost:3000 > /dev/null 2>&1; do
    RETRIES=$((RETRIES + 1))
    if [ ${RETRIES} -ge ${MAX_RETRIES} ]; then
        err "Frontend health check failed"
    fi
    echo -n "."
    sleep 2
done
echo ""
log "Frontend is healthy!"

# ─── Post-deploy verification ───────────
log "Running post-deploy checks..."

# API health
HEALTH=$(curl -s http://localhost:4000/api/health)
log "Health: ${HEALTH}"

# Check all containers are running
RUNNING=$(${COMPOSE} -f ${COMPOSE_FILE} ps --services --filter "status=running" | wc -l)
EXPECTED=5
if [ "${RUNNING}" -lt "${EXPECTED}" ]; then
    warn "Only ${RUNNING}/${EXPECTED} services running!"
    ${COMPOSE} -f ${COMPOSE_FILE} ps
else
    log "All ${EXPECTED} services running"
fi

# ─── Cleanup ─────────────────────────────
log "Cleaning up old images..."
docker image prune -f > /dev/null 2>&1

log "================================================"
log "  Deployment complete!"
log "  URL: https://${DOMAIN}"
log "  API: https://${DOMAIN}/api/health"
log "================================================"
