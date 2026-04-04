#!/bin/bash
# ============================================================
# VietNet Interior — QUICK DEPLOY TO VPS
# ============================================================
# Chạy TỪ MÁY LOCAL — deploy lên VPS đã có WebPhoto
# Dùng chung MySQL (photo-mysql), Redis (photo-redis), Nginx (photo-nginx)
#
# Yêu cầu:
#   - VPS đã deploy WebPhoto (photo-mysql, photo-redis, photo-nginx đang chạy)
#   - SSH key đã cấu hình
#
# Usage:
#   bash scripts/quick-deploy.sh <vps-ip> [domain]
#   bash scripts/quick-deploy.sh 188.166.190.81 bhquan.store
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/quick-deploy.sh <vps-ip> [domain]}"
DOMAIN="${2:-bhquan.store}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/vietnet"
WEBPHOTO_DIR="/opt/webphoto"

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
echo "  Mode:   Shared infra with WebPhoto"
echo "============================================================"

# ─── STEP 0: PRE-FLIGHT ──────────────────────────────────
step "0/8 — Kiem tra truoc khi deploy"

ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS_HOST}" "echo SSH_OK" 2>/dev/null || err "Khong the SSH vao ${VPS_HOST}"
log "SSH connection OK"

ssh "${VPS_HOST}" "docker ps --filter name=photo-mysql --format '{{.Status}}'" | grep -q "Up" || err "photo-mysql khong chay. Deploy WebPhoto truoc."
ssh "${VPS_HOST}" "docker ps --filter name=photo-redis --format '{{.Status}}'" | grep -q "Up" || err "photo-redis khong chay. Deploy WebPhoto truoc."
ssh "${VPS_HOST}" "docker ps --filter name=photo-nginx --format '{{.Status}}'" | grep -q "Up" || err "photo-nginx khong chay. Deploy WebPhoto truoc."
log "WebPhoto MySQL + Redis + Nginx running"

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
  mkdir -p ${APP_DIR}/db/changelog
  mkdir -p ${APP_DIR}/scripts
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

MYSQL_ROOT_PASS=$(ssh "${VPS_HOST}" "grep '^MYSQL_ROOT_PASSWORD=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")
[ -n "$MYSQL_ROOT_PASS" ] || err "Khong lay duoc MYSQL_ROOT_PASSWORD tu ${WEBPHOTO_DIR}/.env"

VIETNET_DB_PASS=$(openssl rand -hex 16)
ssh "${VPS_HOST}" "
  docker exec photo-mysql mysql -u root -p'${MYSQL_ROOT_PASS}' -e \"
    CREATE DATABASE IF NOT EXISTS vietnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS 'vietnet'@'%' IDENTIFIED WITH mysql_native_password BY '${VIETNET_DB_PASS}';
    GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'%';
    FLUSH PRIVILEGES;
  \" 2>&1
"
log "Database vietnet ready"

JWT_SEC=$(openssl rand -hex 32)
REVAL_SEC=$(openssl rand -hex 16)

# Lấy R2 + Resend keys từ WebPhoto
R2_ENDPOINT=$(ssh "${VPS_HOST}" "grep '^R2_ENDPOINT=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")
R2_ACCESS_KEY=$(ssh "${VPS_HOST}" "grep '^R2_ACCESS_KEY=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")
R2_SECRET_KEY=$(ssh "${VPS_HOST}" "grep '^R2_SECRET_KEY=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")
RESEND_KEY=$(ssh "${VPS_HOST}" "grep '^RESEND_API_KEY=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")

ssh "${VPS_HOST}" "
  cd ${APP_DIR}
  if [ ! -f '.env' ]; then
    cat > .env << EOF
DOMAIN=${DOMAIN}
VIETNET_DB_PASSWORD=${VIETNET_DB_PASS}
JWT_SECRET=${JWT_SEC}
REVALIDATE_SECRET=${REVAL_SEC}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY}
R2_SECRET_ACCESS_KEY=${R2_SECRET_KEY}
R2_ENDPOINT=${R2_ENDPOINT}
R2_PUBLIC_URL=
RESEND_API_KEY=${RESEND_KEY}
EOF
    echo '.env created'
  else
    echo '.env already exists'
  fi
"
log "Environment configured"

# ─── STEP 5: BUILD + START DOCKER ────────────────────────
step "5/8 — Build Docker images + Start"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  # Ensure shared networks (app nào start trước cũng được)
  docker network create webphoto_backend 2>/dev/null || true
  docker network create vietnet_frontend 2>/dev/null || true

  echo '  Building Docker images...'
  docker compose build 2>&1 | tail -5

  echo '  Starting VietNet containers...'
  docker compose up -d

  # Kết nối photo-nginx vào vietnet_frontend network
  if ! docker inspect photo-nginx --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}} {{end}}' | grep -q vietnet_frontend; then
    docker network connect vietnet_frontend photo-nginx
    echo '  photo-nginx connected to vietnet_frontend'
  else
    echo '  photo-nginx already on vietnet_frontend'
  fi
"
log "Containers started"

# ─── STEP 6: DB MIGRATIONS ───────────────────────────────
step "6/8 — Database migrations"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}
  if [ -d '${APP_DIR}/db/changelog' ]; then
    for f in \$(find ${APP_DIR}/db/changelog -name 'V*.sql' -type f 2>/dev/null | sort); do
      FNAME=\$(basename \"\$f\")
      echo -n \"  \$FNAME ... \"
      docker exec -i photo-mysql mysql -u vietnet -p'${VIETNET_DB_PASS}' vietnet < \"\$f\" 2>&1 && echo 'OK' || echo 'SKIP'
    done
  fi
  docker compose restart backend
  sleep 5
"
log "Database ready"

# ─── STEP 7: NGINX CONFIG ────────────────────────────────
step "7/8 — Cau hinh Nginx trong photo-nginx"

# Upload nginx config vào thư mục mount của photo-nginx
scp "$ROOT_DIR/nginx/conf.d/bhquan.store.conf" "${VPS_HOST}:${WEBPHOTO_DIR}/nginx/conf.d/bhquan.store.conf"

# SSL cert — copy vào Docker volume nếu chưa có
ssh "${VPS_HOST}" "
  CERT_VOL=\$(docker volume inspect webphoto_certbot_data --format '{{.Mountpoint}}')

  if [ ! -f \"\$CERT_VOL/live/bhquan.store/fullchain.pem\" ]; then
    # Lấy cert mới (dừng nginx tạm)
    if ! [ -d /etc/letsencrypt/live/bhquan.store ]; then
      certbot certonly --standalone -d ${DOMAIN} \
        --non-interactive --agree-tos --email admin@${DOMAIN} \
        --pre-hook 'docker stop photo-nginx' \
        --post-hook 'docker start photo-nginx' 2>&1
    fi

    # Copy cert vào Docker volume
    if [ -d /etc/letsencrypt/archive/bhquan.store ]; then
      cp -rL /etc/letsencrypt/archive/bhquan.store \$CERT_VOL/archive/
      mkdir -p \$CERT_VOL/live/bhquan.store
      cp -rL /etc/letsencrypt/live/bhquan.store/* \$CERT_VOL/live/bhquan.store/
      echo 'SSL cert copied to Docker volume'
    fi
  else
    echo 'SSL cert already in Docker volume'
  fi

  # Reload nginx
  docker exec photo-nginx nginx -t 2>&1 | tail -2
  docker exec photo-nginx nginx -s reload 2>&1
  echo 'Nginx reloaded'
"
log "Nginx configured"

# ─── STEP 8: HEALTH CHECK ────────────────────────────────
step "8/8 — Health check"

ssh "${VPS_HOST}" "
  sleep 5

  echo 'Health check:'
  curl -sf http://localhost:4100/api/health && echo '' || echo 'API not ready'
  curl -sf http://localhost:3100 > /dev/null && echo 'Frontend: OK' || echo 'Frontend not ready'
  curl -sf -o /dev/null -w 'HTTPS bhquan.store: %{http_code}\n' https://bhquan.store/ || true
  curl -sf -o /dev/null -w 'HTTPS bhquan.site:  %{http_code}\n' https://bhquan.site/ || true

  echo ''
  echo 'Container status:'
  docker ps --filter 'name=vietnet-' --filter 'name=photo-' --format 'table {{.Names}}\t{{.Status}}'
"

echo ""
echo "============================================================"
echo -e "  ${GREEN}DEPLOY HOAN TAT!${NC}"
echo "============================================================"
echo ""
echo "  https://bhquan.store        (VietNet)"
echo "  https://bhquan.store/admin  (Admin)"
echo "  https://bhquan.site         (WebPhoto — van hoat dong)"
echo ""
echo "  Update:  bash scripts/update-deploy.sh ${VPS_IP}"
echo "============================================================"
