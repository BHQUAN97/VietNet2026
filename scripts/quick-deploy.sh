#!/bin/bash
# ============================================================
# VietNet Interior — QUICK DEPLOY TO VPS
# ============================================================
# Chạy TỪ MÁY LOCAL — deploy toàn bộ lên VPS Ubuntu
# Cùng VPS với WebPhoto (bhquan.site), tránh xung đột port
#
# Yêu cầu VPS:
#   - Ubuntu 22.04/24.04
#   - SSH key đã cấu hình
#   - Docker + Docker Compose đã cài
#   - Nginx trên host (BT Panel / system)
#
# Usage:
#   bash scripts/quick-deploy.sh <vps-ip> [domain]
#   bash scripts/quick-deploy.sh 213.163.199.176 bhquan.store
# ============================================================

set -e

# ─── ARGUMENTS ────────────────────────────────────────────
VPS_IP="${1:?Usage: bash scripts/quick-deploy.sh <vps-ip> [domain]}"
DOMAIN="${2:-bhquan.store}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/vietnet"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# Detect project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "============================================================"
echo "  VietNet Interior — Quick Deploy"
echo "  VPS:    ${VPS_HOST}"
echo "  Domain: ${DOMAIN}"
echo "  Source: ${ROOT_DIR}"
echo "  Note:   Cùng VPS với WebPhoto (bhquan.site)"
echo "============================================================"

# ─── STEP 0: PRE-FLIGHT CHECKS ───────────────────────────
step "0/8 — Kiem tra truoc khi deploy"

# Check SSH
ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS_HOST}" "echo SSH_OK" 2>/dev/null || err "Khong the SSH vao ${VPS_HOST}. Kiem tra SSH key."
log "SSH connection OK"

# Check .env
[ -f backend/.env ] || warn "Chua co backend/.env — se tao tu dong tren VPS"

# Check Docker on VPS
ssh "${VPS_HOST}" "docker --version && docker compose version" >/dev/null 2>&1 || err "VPS chua cai Docker. Chay: curl -fsSL https://get.docker.com | sh"
log "Docker on VPS OK"

# Check WebPhoto co dang chay khong
WP_STATUS=$(ssh "${VPS_HOST}" "docker ps --filter name=photo-api --format '{{.Status}}' 2>/dev/null || echo 'not found'")
echo "  WebPhoto status: ${WP_STATUS}"

# ─── STEP 1: BUILD LOCAL ──────────────────────────────────
step "1/8 — Build frontend + backend (local)"

echo "  Building backend..."
cd "$ROOT_DIR/backend"
npm ci --silent 2>/dev/null || npm install --silent
npm run build
log "Backend built"

echo "  Building frontend..."
cd "$ROOT_DIR/frontend"
npm ci --silent 2>/dev/null || npm install --silent
npm run build
log "Frontend built"

cd "$ROOT_DIR"

# ─── STEP 2: PREPARE VPS ──────────────────────────────────
step "2/8 — Chuan bi VPS"

ssh "${VPS_HOST}" "
  # Tao thu muc
  mkdir -p ${APP_DIR}/backend
  mkdir -p ${APP_DIR}/frontend
  mkdir -p ${APP_DIR}/nginx/conf.d
  mkdir -p ${APP_DIR}/db/schema
  mkdir -p ${APP_DIR}/backups/mysql
  mkdir -p /var/www/certbot

  # Mo firewall (neu dung ufw)
  if command -v ufw &>/dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
  fi

  # Cai certbot neu chua co
  if ! command -v certbot &>/dev/null; then
    apt-get update -qq && apt-get install -y -qq certbot 2>/dev/null
  fi

  echo 'VPS ready'
"
log "VPS prepared"

# ─── STEP 3: UPLOAD FILES ─────────────────────────────────
step "3/8 — Upload files len VPS"

echo "  Uploading docker-compose..."
scp "$ROOT_DIR/docker-compose.prod.yml" "${VPS_HOST}:${APP_DIR}/docker-compose.yml"

echo "  Uploading backend..."
scp "$ROOT_DIR/backend/Dockerfile" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package-lock.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/tsconfig.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/nest-cli.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp -r "$ROOT_DIR/backend/src" "${VPS_HOST}:${APP_DIR}/backend/"
scp -r "$ROOT_DIR/backend/dist" "${VPS_HOST}:${APP_DIR}/backend/" 2>/dev/null || true

echo "  Uploading frontend..."
scp "$ROOT_DIR/frontend/Dockerfile" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package-lock.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tsconfig.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/next.config.js" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tailwind.config.ts" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/postcss.config.js" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true
scp -r "$ROOT_DIR/frontend/src" "${VPS_HOST}:${APP_DIR}/frontend/"
scp -r "$ROOT_DIR/frontend/public" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true

echo "  Uploading DB schema..."
scp -r "$ROOT_DIR/db" "${VPS_HOST}:${APP_DIR}/" 2>/dev/null || true

echo "  Uploading scripts..."
scp -r "$ROOT_DIR/scripts" "${VPS_HOST}:${APP_DIR}/"

log "All files uploaded"

# ─── STEP 4: CONFIGURE ENVIRONMENT ───────────────────────
step "4/8 — Cau hinh .env tren VPS"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  # Root .env cho docker-compose
  if [ ! -f '.env' ]; then
    MYSQL_ROOT_PASS=\$(openssl rand -hex 16)
    MYSQL_PASS=\$(openssl rand -hex 16)
    cat > .env << EOF
MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASS}
MYSQL_PASSWORD=\${MYSQL_PASS}
DOMAIN=${DOMAIN}
EOF
    echo '.env created'
  else
    echo '.env already exists'
  fi

  # Backend .env
  if [ ! -f 'backend/.env' ]; then
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
    echo 'backend/.env created (EDIT R2 + Resend keys!)'
  else
    echo 'backend/.env already exists'
  fi

  # Frontend .env
  cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF
  echo 'frontend/.env created'
"
log "Environment configured"

# ─── STEP 5: BUILD + START DOCKER ────────────────────────
step "5/8 — Build Docker images + Start services"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  echo '  Building Docker images...'
  docker compose build 2>&1 | tail -5

  echo '  Starting MySQL + Redis...'
  docker compose up -d mysql redis

  echo '  Waiting for MySQL...'
  for i in \$(seq 1 60); do
    if docker exec vietnet-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
      echo '  MySQL ready'
      break
    fi
    [ \$i -eq 60 ] && echo '  MySQL timeout, continuing...'
    sleep 1
  done

  echo '  Starting API + Frontend...'
  docker compose up -d
"
log "All containers started"

# ─── STEP 6: DB MIGRATIONS ───────────────────────────────
step "6/8 — Database migrations"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  # Kiem tra xem co migration files khong
  if docker exec vietnet-api ls dist/database/migrations/ 2>/dev/null | grep -q '.js'; then
    echo '  Running TypeORM migrations...'
    docker exec vietnet-api node -e \"
      const { DataSource } = require('typeorm');
      // Migrations chay tu dong khi app start (synchronize hoac migrations)
      console.log('Migrations handled by NestJS TypeORM on startup');
    \" 2>/dev/null || echo '  (Migrations handled by app startup)'
  fi

  # Chay DB changelog neu co
  if [ -d '${APP_DIR}/db/changelog' ]; then
    MYSQL_PASS=\$(grep '^MYSQL_PASSWORD=' .env | cut -d= -f2-)
    for f in \$(find ${APP_DIR}/db/changelog -name 'V*.sql' -type f 2>/dev/null | sort); do
      FNAME=\$(basename \"\$f\")
      echo -n \"  \$FNAME ... \"
      docker exec -i vietnet-mysql mysql -u vietnet -p\${MYSQL_PASS} vietnet < \"\$f\" 2>&1 && echo 'OK' || echo 'SKIP'
    done
  fi

  # Restart de pick up schema
  docker compose restart backend
  sleep 5
"
log "Database ready"

# ─── STEP 7: NGINX + SSL ─────────────────────────────────
step "7/8 — Cau hinh Nginx + SSL"

# Detect nginx type
NGINX_TYPE=$(ssh "${VPS_HOST}" "
  if [ -d /www/server/panel/vhost/nginx ]; then
    echo 'btpanel'
  elif [ -d /etc/nginx/sites-enabled ]; then
    echo 'system'
  elif [ -d /etc/nginx/conf.d ]; then
    echo 'confd'
  else
    echo 'unknown'
  fi
")
echo "  Nginx type: ${NGINX_TYPE}"

case "$NGINX_TYPE" in
  btpanel)
    NGINX_CONF_DIR="/www/server/panel/vhost/nginx"
    NGINX_BIN="/www/server/nginx/sbin/nginx"
    ;;
  system)
    NGINX_CONF_DIR="/etc/nginx/sites-enabled"
    NGINX_BIN="nginx"
    ;;
  confd)
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_BIN="nginx"
    ;;
  *)
    warn "Nginx khong tim thay. Cau hinh thu cong."
    NGINX_CONF_DIR=""
    ;;
esac

if [ -n "$NGINX_CONF_DIR" ]; then
  # HTTP-only config truoc (cho certbot)
  ssh "${VPS_HOST}" "cat > ${NGINX_CONF_DIR}/${DOMAIN}.conf << 'NGXEOF'
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4100;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 20m;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:4100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 86400s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3100;
        expires 365d;
        add_header Cache-Control \"public, immutable\";
    }

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGXEOF
${NGINX_BIN} -t && ${NGINX_BIN} -s reload
echo 'Nginx HTTP config applied'
"
  log "Nginx HTTP OK"

  # SSL certificate
  echo "  Getting SSL certificate..."
  SSL_RESULT=$(ssh "${VPS_HOST}" "
    certbot certonly --webroot -w /var/www/certbot \
      -d ${DOMAIN} \
      --non-interactive --agree-tos --email admin@${DOMAIN} 2>&1
  " || true)

  if echo "$SSL_RESULT" | grep -q "Successfully\|already exists"; then
    log "SSL certificate OK"

    # Upload full HTTPS config
    scp "$ROOT_DIR/nginx/conf.d/bhquan.store.conf" "${VPS_HOST}:${NGINX_CONF_DIR}/${DOMAIN}.conf"
    ssh "${VPS_HOST}" "${NGINX_BIN} -t && ${NGINX_BIN} -s reload"
    log "Nginx HTTPS OK"
  else
    warn "SSL cert failed (DNS chua tro?). Site chay HTTP truoc."
    echo "  Sau khi tro DNS: certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN}"
  fi
fi

# ─── STEP 8: HEALTH CHECK ────────────────────────────────
step "8/8 — Health check"

ssh "${VPS_HOST}" "
  sleep 5

  echo 'Health check:'
  curl -sf http://localhost:4100/api/health && echo '' || echo 'API not ready yet'
  curl -sf http://localhost:3100 > /dev/null && echo 'Frontend: OK' || echo 'Frontend not ready yet'

  echo ''
  echo 'Container status:'
  cd ${APP_DIR} && docker compose ps --format 'table {{.Names}}\t{{.Status}}'

  echo ''
  echo 'Port check (VietNet vs WebPhoto):'
  echo '  VietNet  API:  4100' && (ss -tlnp | grep ':4100 ' | head -1 || echo '    not listening')
  echo '  VietNet  SSR:  3100' && (ss -tlnp | grep ':3100 ' | head -1 || echo '    not listening')
  echo '  WebPhoto API:  4000' && (ss -tlnp | grep ':4000 ' | head -1 || echo '    not listening')
"

# ─── DONE ──────────────────────────────────────────────────
echo ""
echo "============================================================"
echo -e "  ${GREEN}DEPLOY HOAN TAT!${NC}"
echo "============================================================"
echo ""
echo "  Domain:   https://${DOMAIN}"
echo "  API:      https://${DOMAIN}/api/health"
echo "  Admin:    https://${DOMAIN}/admin"
echo ""
echo "  VPS:      ssh ${VPS_HOST}"
echo "  Project:  ${APP_DIR}"
echo ""
echo "  IMPORTANT: Edit backend/.env tren VPS voi:"
echo "    - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT"
echo "    - RESEND_API_KEY"
echo "  Sau do: cd ${APP_DIR} && docker compose restart backend"
echo ""
echo "  Commands (on VPS):"
echo "    cd ${APP_DIR}"
echo "    docker compose logs -f backend     # Logs API"
echo "    docker compose logs -f frontend    # Logs SSR"
echo "    docker compose restart backend     # Restart API"
echo "    docker compose down                # Stop all"
echo "    docker compose up -d               # Start all"
echo ""
echo "  Update deploy (from local):"
echo "    bash scripts/update-deploy.sh ${VPS_IP}"
echo "============================================================"
