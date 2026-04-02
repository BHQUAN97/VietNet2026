#!/bin/bash
# ============================================================
# VietNet Interior — QUICK DEPLOY TO VPS
# ============================================================
# Chạy TỪ MÁY LOCAL — deploy lên VPS đã có WebPhoto
# Dùng chung MySQL (photo-mysql) + Redis (photo-redis)
#
# Yêu cầu:
#   - VPS đã deploy WebPhoto (photo-mysql, photo-redis đang chạy)
#   - SSH key đã cấu hình
#
# Usage:
#   bash scripts/quick-deploy.sh <vps-ip> [domain]
#   bash scripts/quick-deploy.sh 213.163.199.176 bhquan.store
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/quick-deploy.sh <vps-ip> [domain]}"
DOMAIN="${2:-bhquan.store}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/vietnet"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "============================================================"
echo "  VietNet Interior — Quick Deploy"
echo "  VPS:    ${VPS_HOST}"
echo "  Domain: ${DOMAIN}"
echo "  Mode:   Shared MySQL/Redis with WebPhoto"
echo "============================================================"

# ─── STEP 0: PRE-FLIGHT ──────────────────────────────────
step "0/8 — Kiem tra truoc khi deploy"

ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS_HOST}" "echo SSH_OK" 2>/dev/null || err "Khong the SSH vao ${VPS_HOST}"
log "SSH connection OK"

# Kiểm tra WebPhoto đang chạy
ssh "${VPS_HOST}" "docker ps --filter name=photo-mysql --format '{{.Status}}'" | grep -q "Up" || err "photo-mysql khong chay. Deploy WebPhoto truoc."
ssh "${VPS_HOST}" "docker ps --filter name=photo-redis --format '{{.Status}}'" | grep -q "Up" || err "photo-redis khong chay. Deploy WebPhoto truoc."
log "WebPhoto MySQL + Redis running"

# Kiểm tra Docker network
NETWORK_EXISTS=$(ssh "${VPS_HOST}" "docker network ls --filter name=webphoto_backend --format '{{.Name}}'" 2>/dev/null)
if [ -z "$NETWORK_EXISTS" ]; then
  # Tìm network thực tế của WebPhoto
  ACTUAL_NET=$(ssh "${VPS_HOST}" "docker inspect photo-mysql --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{println \$k}}{{end}}' 2>/dev/null | head -1")
  if [ -n "$ACTUAL_NET" ]; then
    warn "WebPhoto network ten la '${ACTUAL_NET}', khong phai 'webphoto_backend'"
    warn "Se dung network: ${ACTUAL_NET}"
  else
    err "Khong tim thay Docker network cua WebPhoto"
  fi
else
  ACTUAL_NET="webphoto_backend"
fi
log "Docker network: ${ACTUAL_NET}"

ssh "${VPS_HOST}" "docker --version && docker compose version" >/dev/null 2>&1 || err "VPS chua cai Docker"
log "Docker OK"

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
  mkdir -p ${APP_DIR}/backend
  mkdir -p ${APP_DIR}/frontend
  mkdir -p ${APP_DIR}/nginx/conf.d
  mkdir -p ${APP_DIR}/db/changelog
  mkdir -p ${APP_DIR}/scripts
  mkdir -p /var/www/certbot

  if command -v ufw &>/dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
  fi

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

echo "  Uploading DB changelog..."
scp -r "$ROOT_DIR/db" "${VPS_HOST}:${APP_DIR}/" 2>/dev/null || true

echo "  Uploading scripts..."
scp -r "$ROOT_DIR/scripts" "${VPS_HOST}:${APP_DIR}/"

log "All files uploaded"

# ─── STEP 4: CREATE DB + ENV ──────────────────────────────
step "4/8 — Tao database vietnet trong photo-mysql + .env"

# Lấy MySQL root password từ WebPhoto
MYSQL_ROOT_PASS=$(ssh "${VPS_HOST}" "grep '^MYSQL_ROOT_PASSWORD=' /opt/webphoto/.env | cut -d= -f2-")
if [ -z "$MYSQL_ROOT_PASS" ]; then
  err "Khong lay duoc MYSQL_ROOT_PASSWORD tu /opt/webphoto/.env"
fi

# Tạo DB + user vietnet trong photo-mysql
VIETNET_DB_PASS=$(openssl rand -hex 16)
ssh "${VPS_HOST}" "
  docker exec photo-mysql mysql -u root -p'${MYSQL_ROOT_PASS}' -e \"
    CREATE DATABASE IF NOT EXISTS vietnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS 'vietnet'@'%' IDENTIFIED WITH mysql_native_password BY '${VIETNET_DB_PASS}';
    GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'%';
    FLUSH PRIVILEGES;
  \" 2>&1
  echo 'Database vietnet created in photo-mysql'
"
log "Database vietnet ready"

# Tạo .env
JWT_SEC=$(openssl rand -hex 32)
REVAL_SEC=$(openssl rand -hex 16)

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  if [ ! -f '.env' ]; then
    cat > .env << EOF
# VietNet — shared infra with WebPhoto
DOMAIN=${DOMAIN}
VIETNET_DB_PASSWORD=${VIETNET_DB_PASS}
JWT_SECRET=${JWT_SEC}
REVALIDATE_SECRET=${REVAL_SEC}

# Cloudflare R2 (fill in)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_PUBLIC_URL=

# Resend (fill in)
RESEND_API_KEY=
EOF
    echo '.env created'
  else
    echo '.env already exists (skip)'
  fi
"
log "Environment configured"

# ─── STEP 5: FIX DOCKER NETWORK NAME ─────────────────────
step "5/8 — Fix Docker network + Build"

# Cập nhật network name trong docker-compose nếu khác
if [ "$ACTUAL_NET" != "webphoto_backend" ]; then
  ssh "${VPS_HOST}" "
    cd ${APP_DIR}
    sed -i 's/name: webphoto_backend/name: ${ACTUAL_NET}/' docker-compose.yml
  "
  log "Network name updated to ${ACTUAL_NET}"
fi

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  echo '  Building Docker images...'
  docker compose build 2>&1 | tail -5

  echo '  Starting VietNet containers...'
  docker compose up -d
"
log "Containers started"

# ─── STEP 6: DB MIGRATIONS ───────────────────────────────
step "6/8 — Database migrations"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  # Chay DB changelog neu co
  if [ -d '${APP_DIR}/db/changelog' ]; then
    for f in \$(find ${APP_DIR}/db/changelog -name 'V*.sql' -type f 2>/dev/null | sort); do
      FNAME=\$(basename \"\$f\")
      echo -n \"  \$FNAME ... \"
      docker exec -i photo-mysql mysql -u vietnet -p'${VIETNET_DB_PASS}' vietnet < \"\$f\" 2>&1 && echo 'OK' || echo 'SKIP'
    done
  fi

  # Restart de pick up schema
  sleep 3
  docker compose restart backend 2>/dev/null || true
  sleep 5
"
log "Database ready"

# ─── STEP 7: NGINX + SSL ─────────────────────────────────
step "7/8 — Cau hinh Nginx + SSL"

NGINX_TYPE=$(ssh "${VPS_HOST}" "
  if [ -d /www/server/panel/vhost/nginx ]; then echo 'btpanel'
  elif [ -d /etc/nginx/sites-enabled ]; then echo 'system'
  elif [ -d /etc/nginx/conf.d ]; then echo 'confd'
  else echo 'unknown'; fi
")
echo "  Nginx type: ${NGINX_TYPE}"

case "$NGINX_TYPE" in
  btpanel) NGINX_CONF_DIR="/www/server/panel/vhost/nginx"; NGINX_BIN="/www/server/nginx/sbin/nginx" ;;
  system)  NGINX_CONF_DIR="/etc/nginx/sites-enabled"; NGINX_BIN="nginx" ;;
  confd)   NGINX_CONF_DIR="/etc/nginx/conf.d"; NGINX_BIN="nginx" ;;
  *)       warn "Nginx khong tim thay"; NGINX_CONF_DIR="" ;;
esac

if [ -n "$NGINX_CONF_DIR" ]; then
  # HTTP config truoc (cho certbot)
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
echo 'Nginx HTTP OK'
"
  log "Nginx HTTP OK"

  # SSL
  echo "  Getting SSL certificate..."
  SSL_RESULT=$(ssh "${VPS_HOST}" "
    certbot certonly --webroot -w /var/www/certbot \
      -d ${DOMAIN} \
      --non-interactive --agree-tos --email admin@${DOMAIN} 2>&1
  " || true)

  if echo "$SSL_RESULT" | grep -q "Successfully\|already exists"; then
    log "SSL certificate OK"
    scp "$ROOT_DIR/nginx/conf.d/bhquan.store.conf" "${VPS_HOST}:${NGINX_CONF_DIR}/${DOMAIN}.conf"
    ssh "${VPS_HOST}" "${NGINX_BIN} -t && ${NGINX_BIN} -s reload"
    log "Nginx HTTPS OK"
  else
    warn "SSL cert failed (DNS chua tro?). Chay HTTP truoc."
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
  docker ps --filter 'name=vietnet-' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

  echo ''
  echo 'Shared infra (WebPhoto):'
  docker ps --filter 'name=photo-mysql' --filter 'name=photo-redis' --format 'table {{.Names}}\t{{.Status}}'

  echo ''
  echo 'Databases in photo-mysql:'
  docker exec photo-mysql mysql -u root -p'${MYSQL_ROOT_PASS}' -e 'SHOW DATABASES;' 2>/dev/null | grep -E 'photo_storage|vietnet'
"

echo ""
echo "============================================================"
echo -e "  ${GREEN}DEPLOY HOAN TAT!${NC}"
echo "============================================================"
echo ""
echo "  Domain:   https://${DOMAIN}"
echo "  API:      https://${DOMAIN}/api/health"
echo "  Admin:    https://${DOMAIN}/admin"
echo ""
echo "  Shared:   photo-mysql (DB: vietnet), photo-redis"
echo "  VPS:      ssh ${VPS_HOST}"
echo "  Project:  ${APP_DIR}"
echo ""
echo "  IMPORTANT: Edit .env tren VPS voi:"
echo "    - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT"
echo "    - RESEND_API_KEY"
echo "  Sau do: cd ${APP_DIR} && docker compose restart backend"
echo ""
echo "  Update:   bash scripts/update-deploy.sh ${VPS_IP}"
echo "============================================================"
