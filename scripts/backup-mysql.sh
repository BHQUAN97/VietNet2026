#!/bin/bash
# ──────────────────────────────────────────
# MySQL Daily Backup Script
# Run via cron: 0 2 * * * /opt/vietnet/scripts/backup-mysql.sh
# ──────────────────────────────────────────

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/vietnet/backups/mysql"
RETENTION_DAYS=7
DB_CONTAINER="vietnet2026-mysql-1"
DB_NAME="vietnet"
DB_USER="vietnet"
DB_PASSWORD="${MYSQL_BACKUP_PASSWORD:-vietnet_dev}"
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"
LOG_FILE="/var/log/vietnet/backup.log"

# Ensure directories exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "Starting MySQL backup..."

# Dump database from Docker container
if docker exec "${DB_CONTAINER}" mysqldump \
    -u"${DB_USER}" \
    -p"${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --set-gtid-purged=OFF \
    "${DB_NAME}" | gzip > "${BACKUP_FILE}"; then

    FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup created: ${BACKUP_FILE} (${FILESIZE})"
else
    log "ERROR: MySQL backup failed!"
    exit 1
fi

# Verify backup is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
    log "ERROR: Backup file is empty!"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Remove backups older than retention period
DELETED=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    log "Cleaned up ${DELETED} backup(s) older than ${RETENTION_DAYS} days"
fi

# Upload to remote storage via rclone (if configured)
if command -v rclone &> /dev/null; then
    REMOTE="r2:vietnet-backups/mysql/"
    if rclone copy "${BACKUP_FILE}" "${REMOTE}" --progress 2>> "${LOG_FILE}"; then
        log "Uploaded to remote: ${REMOTE}"
    else
        log "WARNING: Remote upload failed, local backup preserved"
    fi
else
    log "rclone not installed, skipping remote upload"
fi

log "Backup completed successfully"
