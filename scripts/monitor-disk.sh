#!/bin/bash
# ──────────────────────────────────────────
# Disk Usage Monitoring Script
# Run via cron: */30 * * * * /opt/vietnet/scripts/monitor-disk.sh
# ──────────────────────────────────────────

set -euo pipefail

THRESHOLD=80
LOG_FILE="/var/log/vietnet/disk-monitor.log"
ALERT_FILE="/tmp/disk_alert_sent"

mkdir -p "$(dirname "${LOG_FILE}")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Check disk usage for root partition
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ "${USAGE}" -ge "${THRESHOLD}" ]; then
    log "WARNING: Disk usage at ${USAGE}% (threshold: ${THRESHOLD}%)"

    # Show what's using space
    log "Top directories by size:"
    du -sh /var/lib/docker/ /var/lib/mysql/ /opt/vietnet/backups/ 2>/dev/null | sort -rh | head -5 >> "${LOG_FILE}"

    # Docker-specific cleanup suggestions
    DOCKER_SIZE=$(docker system df --format '{{.Size}}' 2>/dev/null | head -1 || echo "unknown")
    log "Docker disk usage: ${DOCKER_SIZE}"

    # Only send alert once per hour
    if [ ! -f "${ALERT_FILE}" ] || [ "$(find "${ALERT_FILE}" -mmin +60 2>/dev/null)" ]; then
        touch "${ALERT_FILE}"
        # If mail is configured, send alert
        if command -v mail &> /dev/null; then
            echo "Disk usage on $(hostname) is at ${USAGE}%. Threshold: ${THRESHOLD}%." | \
                mail -s "[VietNet] Disk Alert: ${USAGE}% used" admin@bhquan.site 2>/dev/null || true
        fi
        log "Alert sent"
    fi
else
    # Clear alert flag when back to normal
    rm -f "${ALERT_FILE}"
fi

# Log Docker volume sizes
log "Docker volumes:"
docker system df -v 2>/dev/null | grep -E "^(VOLUME|Local)" >> "${LOG_FILE}" 2>/dev/null || true
