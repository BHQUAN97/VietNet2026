#!/bin/bash
# ============================================================
# VietNet Interior — UPDATE DEPLOY
# ============================================================
# Chay tu may local — chi build + upload + restart
# Nginx chay trong Docker (shared-nginx), config tai /opt/webphoto/nginx/conf.d/
#
# Usage:
#   bash scripts/update-deploy.sh <vps-ip>
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/update-deploy.sh <vps-ip>}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/vietnet"
WEBPHOTO_DIR="/opt/webphoto"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'
log() { echo -e "${GREEN}[OK]${NC} $1"; }
step() { echo -e "\n${CYAN}━━━ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "=== VietNet Interior — Update Deploy ==="
echo "  VPS: ${VPS_HOST}"
echo ""

# 1. Build
step "1/6 — Build local"
cd "$ROOT_DIR/backend" && npm run build
cd "$ROOT_DIR/frontend" && npm run build
cd "$ROOT_DIR"
log "Build OK"

# 2. Upload
step "2/6 — Upload to VPS"
ssh "${VPS_HOST}" "rm -rf ${APP_DIR}/backend/src ${APP_DIR}/backend/dist ${APP_DIR}/frontend/src"

echo "  Uploading backend..."
scp -r "$ROOT_DIR/backend/src" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package-lock.json" "${VPS_HOST}:${APP_DIR}/backend/"

echo "  Uploading frontend..."
scp -r "$ROOT_DIR/frontend/src" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package-lock.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/next.config.js" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tailwind.config.ts" "${VPS_HOST}:${APP_DIR}/frontend/"
scp -r "$ROOT_DIR/frontend/public" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true

log "Upload OK"

# 3. DB Changelog
step "3/6 — DB Changelog"
CHANGELOG_DIR="$ROOT_DIR/db/changelog"
if [ -d "$CHANGELOG_DIR" ] && ls "$CHANGELOG_DIR"/V*.sql 1>/dev/null 2>&1; then
  VIETNET_DB_PASS=$(ssh "${VPS_HOST}" "grep '^VIETNET_DB_PASSWORD=' ${APP_DIR}/.env | cut -d= -f2-")
  for f in $(find "$CHANGELOG_DIR" -name 'V*.sql' -type f | sort); do
    FNAME=$(basename "$f")
    echo -n "  $FNAME ... "
    ssh "${VPS_HOST}" "docker exec -i shared-mysql mysql -u vietnet -p'${VIETNET_DB_PASS}' vietnet" < "$f" 2>&1 && echo "OK" || echo "SKIP"
  done
  log "DB Changelog done"
else
  log "No changelog files (skip)"
fi

# 4. Update Nginx config (nếu thay đổi)
step "4/6 — Update Nginx config"
scp "$ROOT_DIR/nginx/conf.d/bhquan.store.conf" "${VPS_HOST}:${WEBPHOTO_DIR}/nginx/conf.d/bhquan.store.conf"
ssh "${VPS_HOST}" "docker exec shared-nginx nginx -t 2>&1 | tail -1 && docker exec shared-nginx nginx -s reload 2>&1"
log "Nginx config updated"

# 5. Rebuild + Restart
step "5/6 — Rebuild Docker + Restart"
ssh "${VPS_HOST}" "
  # Ensure shared networks (app nào start trước cũng được)
  docker network create webphoto_backend 2>/dev/null || true
  docker network create vietnet_frontend 2>/dev/null || true

  cd ${APP_DIR}
  docker compose build backend frontend 2>&1 | tail -5
  docker compose up -d backend frontend

  # Đảm bảo shared-nginx trên vietnet_frontend network
  if ! docker inspect shared-nginx --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}} {{end}}' | grep -q vietnet_frontend; then
    docker network connect vietnet_frontend shared-nginx
    echo 'shared-nginx reconnected to vietnet_frontend'
  fi
"
log "Containers restarted"

# 6. Health check
step "6/6 — Health check"
sleep 8
ssh "${VPS_HOST}" "
  curl -sf http://localhost:4100/api/health && echo '' || echo 'API not ready'
  curl -sf -o /dev/null -w 'HTTPS: %{http_code}\n' https://bhquan.store/ || true
  docker ps --filter 'name=vietnet-' --format 'table {{.Names}}\t{{.Status}}'
"
log "Update deploy done!"

echo ""
echo "=== Update complete — https://bhquan.store ==="
echo ""
