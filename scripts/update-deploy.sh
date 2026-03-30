#!/bin/bash
# ──────────────────────────────────────────
# VietNet Interior — Update Existing Deployment
# Usage: bash scripts/update-deploy.sh [vps-ip]
# ──────────────────────────────────────────

set -euo pipefail

VPS_IP="${1:-213.163.199.176}"
VPS_USER="root"
APP_DIR="/opt/vietnet"
SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=no"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
step() { echo -e "\n${CYAN}═══ $1 ═══${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

step "1. Build locally"
cd "${PROJECT_DIR}/frontend" && npx next build
cd "${PROJECT_DIR}/backend" && npx nest build

step "2. Upload updated files"
cd "${PROJECT_DIR}"
scp -r ${SSH_OPTS} backend/src backend/dist backend/package.json ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/
scp -r ${SSH_OPTS} frontend/src frontend/public frontend/package.json frontend/next.config.js ${VPS_USER}@${VPS_IP}:${APP_DIR}/frontend/
scp ${SSH_OPTS} docker-compose.yml ${VPS_USER}@${VPS_IP}:${APP_DIR}/
scp -r ${SSH_OPTS} nginx/conf.d ${VPS_USER}@${VPS_IP}:${APP_DIR}/nginx/
scp -r ${SSH_OPTS} scripts ${VPS_USER}@${VPS_IP}:${APP_DIR}/

step "3. Rebuild & restart on VPS"
ssh ${SSH_OPTS} ${VPS_USER}@${VPS_IP} << 'REMOTE'
set -e
cd /opt/vietnet
docker compose build --no-cache
docker compose up -d
sleep 10

for i in $(seq 1 20); do
    if curl -sf http://localhost:4000/api/health > /dev/null 2>&1; then
        echo ""
        echo "Health check OK!"
        docker compose ps
        exit 0
    fi
    echo -n "."
    sleep 2
done
echo "WARNING: Health check timeout"
docker compose logs --tail 20 backend
REMOTE

log "Update deploy complete!"
