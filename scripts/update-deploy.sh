#!/bin/bash
# ============================================================
# VietNet Interior — UPDATE DEPLOY (Khong setup lai tu dau)
# ============================================================
# Chay tu may local khi can cap nhat code len VPS da deploy
# Chi build lai + upload + restart, KHONG tao DB/Nginx/SSL moi
#
# Usage:
#   bash scripts/update-deploy.sh <vps-ip>
#   bash scripts/update-deploy.sh 213.163.199.176
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/update-deploy.sh <vps-ip>}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/vietnet"

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
step "1/5 — Build local"
cd "$ROOT_DIR/backend" && npm run build
cd "$ROOT_DIR/frontend" && npm run build
cd "$ROOT_DIR"
log "Build OK"

# 2. Upload
step "2/5 — Upload to VPS"
ssh "${VPS_HOST}" "rm -rf ${APP_DIR}/backend/src ${APP_DIR}/backend/dist ${APP_DIR}/frontend/src ${APP_DIR}/frontend/.next"

echo "  Uploading backend..."
scp -r "$ROOT_DIR/backend/src" "${VPS_HOST}:${APP_DIR}/backend/"
scp -r "$ROOT_DIR/backend/dist" "${VPS_HOST}:${APP_DIR}/backend/" 2>/dev/null || true
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
step "3/5 — DB Changelog"
CHANGELOG_DIR="$ROOT_DIR/db/changelog"
if [ -d "$CHANGELOG_DIR" ] && ls "$CHANGELOG_DIR"/V*.sql 1>/dev/null 2>&1; then
  MYSQL_PWD=$(ssh "${VPS_HOST}" "grep '^MYSQL_PASSWORD=' ${APP_DIR}/.env | cut -d= -f2-")
  for f in $(find "$CHANGELOG_DIR" -name 'V*.sql' -type f | sort); do
    FNAME=$(basename "$f")
    echo -n "  $FNAME ... "
    ssh "${VPS_HOST}" "docker exec -i vietnet-mysql mysql -u vietnet -p${MYSQL_PWD} vietnet" < "$f" 2>&1 && echo "OK" || echo "SKIP"
  done
  log "DB Changelog done"
else
  log "No changelog files (skip)"
fi

# 4. Rebuild + Restart
step "4/5 — Rebuild Docker + Restart"
ssh "${VPS_HOST}" "
  cd ${APP_DIR}
  docker compose build backend frontend 2>&1 | tail -5
  docker compose up -d backend frontend
  echo 'Containers restarted'
"
log "Containers restarted"

# 5. Health check
step "5/5 — Health check"
sleep 8
ssh "${VPS_HOST}" "
  curl -sf http://localhost:4100/api/health && echo '' || echo 'API not ready'
  curl -sf http://localhost:3100 > /dev/null && echo 'Frontend: OK' || echo 'Frontend not ready'
  echo ''
  cd ${APP_DIR} && docker compose ps --format 'table {{.Names}}\t{{.Status}}'
"
log "Update deploy done!"

echo ""
echo "=== Update complete ==="
echo "  https://bhquan.store"
echo ""
