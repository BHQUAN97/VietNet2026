#!/bin/bash
# Seed 60 bai (20 project + 20 article + 20 product) tren VPS
# Chay: bash scripts/seed-all.sh 188.166.190.81

set -e
VPS_IP="${1:?Usage: bash scripts/seed-all.sh <vps-ip>}"
VPS_HOST="root@${VPS_IP}"
APP_DIR="/opt/vietnet"

echo "=== Seeding data on ${VPS_HOST} ==="

# Upload seed script
scp "$(dirname "$0")/seed-runner.js" "${VPS_HOST}:${APP_DIR}/seed-runner.js"

# Chay trong backend container
ssh "${VPS_HOST}" "docker exec vietnet-api node /app/seed-runner.js 2>&1"

echo "=== Seed complete ==="
