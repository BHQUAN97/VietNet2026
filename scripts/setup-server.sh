#!/bin/bash
# ──────────────────────────────────────────
# VietNet Interior — First-time Server Setup
# Run once on a fresh Ubuntu server
# Usage: bash setup-server.sh
# ──────────────────────────────────────────

set -euo pipefail

DOMAIN="bhquan.store"
APP_DIR="/opt/vietnet"
EMAIL="admin@bhquan.store"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[SETUP]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Must run as root
[ "$(id -u)" -eq 0 ] || err "Run as root: sudo bash setup-server.sh"

# ─── 1. System packages ─────────────────
log "Updating system packages..."
apt-get update -y
apt-get install -y curl git certbot

# ─── 2. Docker (if not installed) ────────
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    log "Docker already installed"
fi

# ─── 3. Create app directory ────────────
log "Creating application directory..."
mkdir -p "${APP_DIR}"
mkdir -p /opt/vietnet/backups/mysql
mkdir -p /var/log/vietnet

# ─── 4. SSL Certificate ─────────────────
log "Obtaining SSL certificate for ${DOMAIN}..."
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    certbot certonly --standalone \
        -d "${DOMAIN}" \
        --non-interactive \
        --agree-tos \
        -m "${EMAIL}" \
        --preferred-challenges http
    log "SSL certificate obtained!"
else
    log "SSL certificate already exists"
fi

# ─── 5. SSL auto-renewal ────────────────
log "Setting up SSL auto-renewal..."
cat > /etc/cron.d/certbot-renewal << 'EOF'
0 3 1,15 * * root certbot renew --quiet --deploy-hook "docker restart vietnet-nginx-1"
EOF

# ─── 6. Create production .env ───────────
if [ ! -f "${APP_DIR}/backend/.env" ]; then
    log "Creating backend .env template..."
    mkdir -p "${APP_DIR}/backend"
    cat > "${APP_DIR}/backend/.env" << ENVEOF
NODE_ENV=production
PORT=4000

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=vietnet
DB_PASSWORD=$(openssl rand -hex 16)
DB_NAME=vietnet

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT — CHANGE THIS!
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# CORS
ALLOWED_ORIGINS=https://${DOMAIN}

# R2 Storage — Fill in
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_PRIVATE=vietnet-private
R2_BUCKET_PUBLIC=vietnet-public
R2_PUBLIC_URL=

# Mail — Fill in
RESEND_API_KEY=
ADMIN_EMAIL=admin@${DOMAIN}

# ISR
REVALIDATE_SECRET=$(openssl rand -hex 16)
NEXT_REVALIDATE_URL=http://frontend:3000
ENVEOF

    log "IMPORTANT: Edit ${APP_DIR}/backend/.env with your R2 and Resend keys!"
fi

# ─── 7. Create Docker root .env ──────────
if [ ! -f "${APP_DIR}/.env" ]; then
    MYSQL_ROOT_PASS=$(openssl rand -hex 16)
    MYSQL_PASS=$(grep DB_PASSWORD "${APP_DIR}/backend/.env" | cut -d= -f2)
    cat > "${APP_DIR}/.env" << ENVEOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_PASSWORD=${MYSQL_PASS}
ENVEOF
    log "Docker .env created with random passwords"
fi

# ─── 8. Install crontabs ────────────────
log "Installing maintenance crontabs..."
if [ -f "${APP_DIR}/scripts/crontab.example" ]; then
    crontab "${APP_DIR}/scripts/crontab.example"
    log "Crontab installed"
fi

# ─── 9. Firewall ────────────────────────
log "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
    log "Firewall configured (22, 80, 443)"
fi

log "================================================"
log "  Server setup complete!"
log ""
log "  Next steps:"
log "  1. Edit ${APP_DIR}/backend/.env (R2, Resend keys)"
log "  2. Clone repo to ${APP_DIR}"
log "  3. Run: bash ${APP_DIR}/scripts/deploy.sh"
log "================================================"
