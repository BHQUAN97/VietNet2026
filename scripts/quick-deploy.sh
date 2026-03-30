#!/bin/bash
# ──────────────────────────────────────────
# VietNet Interior — Quick Deploy to VPS
# Usage: bash scripts/quick-deploy.sh [vps-ip] [domain]
# Example: bash scripts/quick-deploy.sh 213.163.199.176 bhquan.store
# ──────────────────────────────────────────

set -euo pipefail

VPS_IP="${1:-213.163.199.176}"
DOMAIN="${2:-bhquan.store}"
VPS_USER="root"
APP_DIR="/opt/vietnet"
SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=no"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}═══ Step $1: $2 ═══${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ─── Step 0: Pre-flight checks ──────────
step "0" "Pre-flight checks"

cd "${PROJECT_DIR}"
log "Project dir: ${PROJECT_DIR}"

# Check SSH connectivity
log "Testing SSH to ${VPS_USER}@${VPS_IP}..."
ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} "echo 'SSH OK'" || err "Cannot SSH to ${VPS_IP}"
log "SSH connection OK"

# ─── Step 1: Build frontend locally ─────
step "1" "Building frontend"

cd "${PROJECT_DIR}/frontend"
log "Installing dependencies..."
npm ci --silent 2>/dev/null || npm install --silent

log "Building Next.js..."
npx next build || err "Frontend build failed"
log "Frontend build OK"

# ─── Step 2: Build backend locally ──────
step "2" "Building backend"

cd "${PROJECT_DIR}/backend"
log "Installing dependencies..."
npm ci --silent 2>/dev/null || npm install --silent

log "Building NestJS..."
npx nest build || err "Backend build failed"
log "Backend build OK"

# ─── Step 3: Prepare VPS ────────────────
step "3" "Preparing VPS"

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << 'REMOTE_SETUP'
set -e

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Create directories
mkdir -p /opt/vietnet/frontend
mkdir -p /opt/vietnet/backend
mkdir -p /opt/vietnet/nginx/conf.d
mkdir -p /opt/vietnet/db/schema
mkdir -p /opt/vietnet/scripts
mkdir -p /opt/vietnet/backups/mysql
mkdir -p /var/log/vietnet
mkdir -p /var/www/certbot

echo "VPS directories ready"
REMOTE_SETUP

log "VPS prepared"

# ─── Step 4: Upload files to VPS ────────
step "4" "Uploading files to VPS"

cd "${PROJECT_DIR}"

# Upload Docker files
log "Uploading Docker configs..."
scp ${SSH_OPTS} docker-compose.yml ${VPS_USER}@${VPS_IP}:${APP_DIR}/
scp ${SSH_OPTS} docker-compose.dev.yml ${VPS_USER}@${VPS_IP}:${APP_DIR}/
scp ${SSH_OPTS} .dockerignore ${VPS_USER}@${VPS_IP}:${APP_DIR}/ 2>/dev/null || true
scp ${SSH_OPTS} .env.example ${VPS_USER}@${VPS_IP}:${APP_DIR}/

# Upload Nginx configs
log "Uploading Nginx configs..."
scp ${SSH_OPTS} nginx/nginx.conf ${VPS_USER}@${VPS_IP}:${APP_DIR}/nginx/
scp ${SSH_OPTS} nginx/conf.d/production.conf.example ${VPS_USER}@${VPS_IP}:${APP_DIR}/nginx/conf.d/

# Upload backend
log "Uploading backend..."
scp ${SSH_OPTS} backend/package.json backend/package-lock.json ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/
scp ${SSH_OPTS} backend/tsconfig.json backend/nest-cli.json ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/
scp ${SSH_OPTS} backend/Dockerfile backend/Dockerfile.dev ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/
scp -r ${SSH_OPTS} backend/src ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/
scp -r ${SSH_OPTS} backend/dist ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/ 2>/dev/null || true

# Upload frontend
log "Uploading frontend..."
scp ${SSH_OPTS} frontend/package.json frontend/package-lock.json ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp ${SSH_OPTS} frontend/tsconfig.json frontend/next.config.js ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp ${SSH_OPTS} frontend/Dockerfile frontend/Dockerfile.dev ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp ${SSH_OPTS} frontend/tailwind.config.ts frontend/postcss.config.js ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp -r ${SSH_OPTS} frontend/src ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp -r ${SSH_OPTS} frontend/public ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/ 2>/dev/null || true

# Upload DB schema
log "Uploading DB schema..."
scp -r ${SSH_OPTS} db ${VPS_USER}@${VPS_IP}:${APP_DIR}/ 2>/dev/null || true

# Upload scripts
log "Uploading scripts..."
scp -r ${SSH_OPTS} scripts ${VPS_USER}@${VPS_IP}:${APP_DIR}/

log "All files uploaded"

# ─── Step 5: Configure environment ──────
step "5" "Configuring environment on VPS"

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << REMOTE_ENV
set -e
cd ${APP_DIR}

# Generate .env if not exists
if [ ! -f ".env" ]; then
    MYSQL_ROOT_PASS=\$(openssl rand -hex 16)
    MYSQL_PASS=\$(openssl rand -hex 16)
    cat > .env << EOF
MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASS}
MYSQL_PASSWORD=\${MYSQL_PASS}
EOF
    echo "Root .env created"
fi

# Generate backend .env if not exists
if [ ! -f "backend/.env" ]; then
    JWT_SEC=\$(openssl rand -hex 32)
    REVAL_SEC=\$(openssl rand -hex 16)
    MYSQL_PASS=\$(grep MYSQL_PASSWORD .env | head -1 | cut -d= -f2)
    cat > backend/.env << EOF
NODE_ENV=production
PORT=4000

DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=vietnet
DB_PASSWORD=\${MYSQL_PASS}
DB_NAME=vietnet

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=\${JWT_SEC}
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

ALLOWED_ORIGINS=https://${DOMAIN}

R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_PRIVATE=vietnet-private
R2_BUCKET_PUBLIC=vietnet-public
R2_PUBLIC_URL=

RESEND_API_KEY=
ADMIN_EMAIL=admin@${DOMAIN}

REVALIDATE_SECRET=\${REVAL_SEC}
NEXT_REVALIDATE_URL=http://frontend:3000
EOF
    echo "Backend .env created (EDIT R2 + Resend keys!)"
fi

# Generate frontend .env
cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF
echo "Frontend .env created"
REMOTE_ENV

log "Environment configured"

# ─── Step 6: SSL Certificate ────────────
step "6" "Setting up SSL for ${DOMAIN}"

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << REMOTE_SSL
set -e

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "Obtaining SSL certificate..."

    # Stop nginx if running to free port 80
    docker stop vietnet-nginx-1 2>/dev/null || true

    # Get cert (standalone mode)
    certbot certonly --standalone \
        -d ${DOMAIN} \
        --non-interactive \
        --agree-tos \
        -m admin@${DOMAIN} \
        --preferred-challenges http || {
        echo "WARNING: SSL cert failed. Deploy will use HTTP only initially."
        echo "Fix DNS for ${DOMAIN} -> ${VPS_IP}, then rerun certbot."
    }
else
    echo "SSL certificate already exists for ${DOMAIN}"
fi

# Setup auto-renewal
cat > /etc/cron.d/certbot-vietnet << 'EOF'
0 3 1,15 * * root certbot renew --quiet --deploy-hook "docker restart vietnet-nginx-1 2>/dev/null || true"
EOF
REMOTE_SSL

log "SSL configured"

# ─── Step 7: Configure Nginx for domain ──
step "7" "Configuring Nginx"

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << REMOTE_NGINX
set -e
cd ${APP_DIR}

# Use production config and replace domain
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    cp nginx/conf.d/production.conf.example nginx/conf.d/default.conf
    # Domain is already bhquan.store in the template, update if different
    sed -i "s/bhquan.store/${DOMAIN}/g" nginx/conf.d/default.conf
    echo "Nginx configured with SSL for ${DOMAIN}"
else
    echo "No SSL cert found, using HTTP-only config"
    # Keep default.conf as-is (HTTP only)
fi
REMOTE_NGINX

log "Nginx configured"

# ─── Step 8: Build & Start Docker ───────
step "8" "Building and starting Docker containers"

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << REMOTE_DOCKER
set -e
cd ${APP_DIR}

echo "Building Docker images..."
docker compose build --no-cache

echo "Starting services..."
docker compose up -d

echo "Waiting for services..."
sleep 15

# Health check
echo "Running health checks..."
for i in \$(seq 1 30); do
    if curl -sf http://localhost:4000/api/health > /dev/null 2>&1; then
        echo ""
        echo "Backend is healthy!"
        break
    fi
    echo -n "."
    sleep 2
done

# Show status
echo ""
docker compose ps

echo ""
echo "================================================"
echo "  VietNet Interior deployed successfully!"
echo "  URL: https://${DOMAIN}"
echo "  API: https://${DOMAIN}/api/health"
echo "================================================"
echo ""
echo "  IMPORTANT: Edit backend/.env with:"
echo "  - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY"
echo "  - RESEND_API_KEY"
echo "  Then restart: docker compose restart backend"
echo "================================================"
REMOTE_DOCKER

log "Deployment complete!"
