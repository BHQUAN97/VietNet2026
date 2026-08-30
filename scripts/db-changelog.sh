#!/bin/bash
# scripts/db-changelog.sh — Flyway-style versioned SQL migration runner (CHUẨN thống nhất)
#
# Chuẩn hóa 2026-08-30: dùng docker exec shared-mysql (KHÔNG mysql -h localhost),
# bảng schema_changelog với UNIQUE(version, filename), skip-if-applied, checksum sha256.
# Áp dụng cho VietNet.
#
# Convention: db/changelog/{version}/{NNN__mo_ta}.sql
# Cấu hình qua env: DB_CONTAINER, DB_NAME, DB_USER, DB_PASSWORD, ENV_FILE, CHANGELOG_DIR
#
# QUAN TRONG: day la nguon migration DUY NHAT cua VietNet (khong co ORM).
# scripts/deploy.sh coi script nay la FATAL — fail thi KHONG duoc deploy tiep.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

log()   { echo "[INFO] $*"; }
log_warn() { echo "[WARN] $*"; }
log_error() { echo "[ERROR] $*"; }

DB_CONTAINER="${DB_CONTAINER:-shared-mysql}"
DB_NAME="${DB_NAME:-vietnet}"
DB_USER="${DB_USER:-vietnet}"
ENV_FILE="${ENV_FILE:-/opt/vietnet/.env}"
CHANGELOG_DIR="${CHANGELOG_DIR:-${PROJECT_ROOT}/db/changelog}"
APPLIED_BY="${APPLIED_BY:-$(whoami 2>/dev/null || echo ci)}"

if [[ -n "${DB_PASSWORD:-}" ]]; then
  : # da co san
elif [[ -f "$ENV_FILE" ]]; then
  DB_PASSWORD="$(grep -E '^DB_PASSWORD=' "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
  # Fallback: check for MYSQL_PASSWORD (webphoto style)
  if [[ -z "${DB_PASSWORD:-}" ]]; then
    DB_PASSWORD="$(grep -E '^MYSQL_PASSWORD=' "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
  fi
fi
if [[ -z "${DB_PASSWORD:-}" ]]; then
  log_error "Khong tim thay DB_PASSWORD (or MYSQL_PASSWORD)"
  exit 1
fi

mysql_exec() {
  docker exec -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
    mysql --protocol=tcp -h 127.0.0.1 -u"$DB_USER" --default-character-set=utf8mb4 "$DB_NAME" "$@"
}

mysql_exec_file() {
  docker exec -i -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
    mysql --protocol=tcp -h 127.0.0.1 -u"$DB_USER" --default-character-set=utf8mb4 "$DB_NAME" < "$1"
}

# 1. Dam bao bang tracking ton tai
mysql_exec -e "
CREATE TABLE IF NOT EXISTS schema_changelog (
  version      VARCHAR(50)  NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  description  VARCHAR(255) NOT NULL DEFAULT '',
  checksum     VARCHAR(64)  NOT NULL,
  applied_by   VARCHAR(100) NOT NULL DEFAULT 'ci',
  applied_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  execution_ms INT          NULL,
  PRIMARY KEY (version, filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"

if [[ ! -d "$CHANGELOG_DIR" ]]; then
  log_warn "Khong co thu muc ${CHANGELOG_DIR} — bo qua"
  exit 0
fi

PASS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

# 2. Chay _init/*.sql truoc (idempotent), bo qua 001__schema_changelog.sql (da ensure)
if [[ -d "$CHANGELOG_DIR/_init" ]]; then
  while IFS= read -r sql_file; do
    filename="$(basename "$sql_file")"
    [[ "$filename" == "001__schema_changelog.sql" ]] && continue
    log "INIT  _init/${filename} ..."
    if mysql_exec_file "$sql_file"; then
      log "PASS  _init/${filename}"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      log_error "FAIL  _init/${filename}"
      exit 1
    fi
  done < <(find "$CHANGELOG_DIR/_init" -maxdepth 1 -name '*.sql' | sort)
fi

# 3. Scan cac version dir (bo _*), skip-if-applied
while IFS= read -r version_dir; do
  version="$(basename "$version_dir")"
  [[ "$version" == _* ]] && continue

  while IFS= read -r sql_file; do
    filename="$(basename "$sql_file")"

    already=$(mysql_exec -N -B -e \
      "SELECT COUNT(*) FROM schema_changelog WHERE version='${version}' AND filename='${filename}';" 2>/dev/null || echo "0")

    if [[ "$already" == "1" ]]; then
      log "SKIP  ${version}/${filename} (da applied)"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      continue
    fi

    log "APPLY ${version}/${filename} ..."
    if mysql_exec_file "$sql_file"; then
      checksum=$(sha256sum "$sql_file" | awk '{print $1}')
      description=$(echo "$filename" | sed -E 's/^[0-9]+_?//; s/\.sql$//; s/_/ /g')
      mysql_exec -e "INSERT INTO schema_changelog (version, filename, description, checksum, applied_by) \
        VALUES ('${version}', '${filename}', '${description}', '${checksum}', '${APPLIED_BY}');"
      log "PASS  ${version}/${filename}"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      log_error "FAIL  ${version}/${filename} — dung changelog ngay"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      log "Summary: PASS=${PASS_COUNT} SKIP=${SKIP_COUNT} FAIL=${FAIL_COUNT}"
      exit 1
    fi
  done < <(find "$version_dir" -maxdepth 1 -name '*.sql' | sort)
done < <(find "$CHANGELOG_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

log "Summary: PASS=${PASS_COUNT} SKIP=${SKIP_COUNT} FAIL=${FAIL_COUNT}"