# Scripts — VietNet2026

Backup / restore / ops tooling cho VietNet2026 CMS. Tat ca script duoc viet bash + `set -euo pipefail`.

## Muc luc

| Script | Muc dich |
|---|---|
| `backup-mysql.sh` | Dump MySQL gzipped, retention 7 ngay, optional rclone upload |
| `restore-mysql.sh` | Restore dump `.sql.gz` vao container MySQL (interactive hoac tu arg) |
| `backup-gdrive.sh` + `backup-gdrive.js` | Upload backup + uploads zip len Google Drive qua Service Account |
| `deploy.sh` / `quick-deploy.sh` / `update-deploy.sh` | Docker compose deploy workflows |
| `db-changelog.sh` | Ghi log migration applied |
| `monitor-disk.sh` | Canh bao khi dung luong disk vuot nguong |
| `docker-cleanup.sh` | Don `docker system prune` an toan |

---

## 1. `backup-mysql.sh`

Dump database va nen `.sql.gz` vao `BACKUP_DIR`. Xoa backup cu hon `RETENTION_DAYS`. Neu co `rclone` se upload len remote `r2:vietnet-backups/mysql/`.

### Usage
```bash
# One-shot manual
./scripts/backup-mysql.sh

# Override config qua env vars
BACKUP_DIR=/tmp/vietnet-backups DB_NAME=vietnet RETENTION_DAYS=14 ./scripts/backup-mysql.sh

# Password: dat MYSQL_BACKUP_PASSWORD hoac luu MYSQL_PASSWORD vao /opt/vietnet/.env
export MYSQL_BACKUP_PASSWORD='xxx'
./scripts/backup-mysql.sh
```

### Env vars
- `BACKUP_DIR` (default `/opt/vietnet/backups/mysql`)
- `RETENTION_DAYS` (default `7`)
- `DB_CONTAINER` (default `vietnet2026-mysql-1`)
- `DB_NAME`, `DB_USER` (default `vietnet`)
- `MYSQL_BACKUP_PASSWORD` — bat buoc (hoac doc tu `/opt/vietnet/.env`)

### Output
- File: `${BACKUP_DIR}/${DB_NAME}_YYYY-MM-DD_HH-MM.sql.gz`
- Log: `/var/log/vietnet/backup.log`

---

## 2. `restore-mysql.sh`

Restore backup `.sql.gz` vao container MySQL. Verify gzip integrity, prompt confirmation, ghi log start/end/duration.

### Usage
```bash
# Interactive: script liet ke tat ca backup va cho chon
./scripts/restore-mysql.sh

# Restore file cu the
./scripts/restore-mysql.sh /opt/vietnet/backups/mysql/vietnet_2026-04-17_02-00.sql.gz

# Skip confirmation (dung cho CI / automation)
./scripts/restore-mysql.sh /opt/vietnet/backups/mysql/vietnet_2026-04-17_02-00.sql.gz --force
```

### Exit codes
| Code | Nghia |
|---|---|
| 0 | Success |
| 1 | File not found / directory missing |
| 2 | Gzip corrupted (`gunzip -t` fail) |
| 3 | MySQL restore failed / container khong chay / khong co password |
| 4 | User aborted (khong confirm hoac chon `q`) |

### Env vars
Cung nhom nhu backup + `LOG_FILE` (default `/var/log/vietnet/restore.log`).

---

## 3. `backup-gdrive.sh` + `backup-gdrive.js`

Upload backup DB + zip uploads folder len Google Drive qua Service Account JWT.

### Setup (lan dau)
1. Xem `scripts/.gdrive-credentials.example.json` → lam theo `_setup_instructions`.
2. `cd scripts && npm install` — cai `googleapis`, `archiver`, `dotenv`.
3. Sua `.env` root:
   ```
   GDRIVE_ENABLED=true
   GDRIVE_FOLDER_ID=<folder_id_tu_drive>
   GDRIVE_CREDENTIALS_PATH=./scripts/.gdrive-credentials.json
   BACKUP_DIR=/opt/vietnet/backups
   UPLOADS_DIR=./backend/uploads
   ```

### Usage
```bash
# Upload ca DB + media
./scripts/backup-gdrive.sh

# Chi upload DB
./scripts/backup-gdrive.sh db

# Dry-run (khong upload that)
node scripts/backup-gdrive.js --type=all --dry-run

# Bypass GDRIVE_ENABLED flag
node scripts/backup-gdrive.js --type=db --force
```

### Env vars
- `GDRIVE_ENABLED` — `true` de bat; mac dinh `false`
- `GDRIVE_FOLDER_ID` — folder Drive da share voi service account (bat buoc)
- `GDRIVE_CREDENTIALS_PATH` — path file JSON key (mac dinh `./scripts/.gdrive-credentials.json`)
- `GDRIVE_DB_SUBFOLDER` / `GDRIVE_UPLOADS_SUBFOLDER` — subfolder (default `database` / `media`)
- `GDRIVE_KEEP_COUNT` — giu N ban moi nhat, xoa cu hon (default `14`)
- `BACKUP_DIR` — thu muc chua `.sql.gz` tu `backup-mysql.sh` (default `/opt/vietnet/backups`)
- `UPLOADS_DIR` — folder uploads backend (default `./backend/uploads`)

---

## Cron setup

Tren VPS (xem `scripts/crontab.example` de biet chi tiet):

```cron
# Backup MySQL moi dem luc 2h sang
0 2 * * * /opt/vietnet/scripts/backup-mysql.sh >> /var/log/vietnet/backup.log 2>&1

# Sync len Google Drive luc 3h sang (sau khi dump xong)
0 3 * * * /opt/vietnet/scripts/backup-gdrive.sh >> /var/log/vietnet/gdrive-backup.log 2>&1

# Giam sat disk moi gio
0 * * * * /opt/vietnet/scripts/monitor-disk.sh
```

Cai dat:
```bash
crontab -e
# paste cac dong tren, save
crontab -l   # verify
```

---

## Troubleshooting

### `ERROR: MYSQL_BACKUP_PASSWORD env var not set`
- Export env var truoc khi chay, hoac dam bao `/opt/vietnet/.env` co dong `MYSQL_PASSWORD=...`.

### `Container "vietnet2026-mysql-1" khong chay`
- `docker ps` kiem tra ten container. Override qua env: `DB_CONTAINER=vietnet-mysql ./restore-mysql.sh ...`.

### `File gzip bi corrupt`
- `gunzip -t file.sql.gz` de verify thu cong. Neu corrupt thi file dump loi — lay backup khac.

### Restore xong nhung app van doc du lieu cu
- Xoa cache Redis: `docker exec vietnet2026-redis-1 redis-cli FLUSHDB`
- Restart backend: `docker compose restart backend`

### Uploads bi mat sau khi `docker compose down -v`
- `docker compose down -v` xoa named volumes. Prod dung named volume `vietnet_uploads` — backup rieng truoc khi prune:
  ```bash
  docker run --rm -v vietnet_uploads:/data -v $(pwd):/backup alpine \
    tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
  ```

### `googleapis not installed`
- `cd scripts && npm install`.

### Permission denied khi chay restore
- `chmod +x scripts/restore-mysql.sh`
- Tren Windows dung Git Bash / WSL, khong dung cmd.exe.
