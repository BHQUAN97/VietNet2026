# VIETNET INTERIOR — DEPLOYMENT GUIDE

> Domain: bhquan.store | VPS: 134.122.21.251 | Stack: NestJS + Next.js + MySQL + Redis

---

## Kiến trúc Production

```
  VPS Ubuntu (134.122.21.251)
  ┌──────────────────────────────────────────────┐
  │  shared-nginx (Docker) :80/:443               │
  │  ├─ bhquan.site  → WebPhoto                  │
  │  └─ bhquan.store → vietnet-api + frontend    │
  │                                               │
  │  Shared infra (/opt/infra)                    │
  │  ├─ shared-mysql  :3306                        │
  │  │   ├─ DB: photo_storage (WebPhoto)          │
  │  │   └─ DB: vietnet                           │
  │  └─ shared-redis  :6379                        │
  │                                               │
  │  VietNet (/opt/vietnet)                       │
  │  ├─ vietnet-api      :4100→4000 (NestJS)     │
  │  └─ vietnet-frontend :3100→3000 (Next.js)    │
  │                                               │
  │  Docker Networks                              │
  │  ├─ webphoto_backend  (mysql, redis, api)     │
  │  ├─ webphoto_frontend (nginx, photo-api)      │
  │  └─ vietnet_frontend  (nginx, vietnet)        │
  └──────────────────────────────────────────────┘
```

---

## GitHub Actions Secrets

Secrets được lưu trong **repo settings** — không commit lên git.

| Secret | Mô tả |
|--------|-------|
| `VPS_HOST` | IP VPS: `134.122.21.251` |
| `VPS_PORT` | SSH port: `22` |
| `VPS_USER` | SSH user: `root` |
| `VPS_PASSWORD` | Mật khẩu SSH VPS |
| `MYSQL_ROOT_PASSWORD` | Root password của shared-mysql |
| `VIETNET_DB_PASSWORD` | Password user `vietnet` trong MySQL |
| `JWT_SECRET` | JWT signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `REVALIDATE_SECRET` | Next.js revalidate secret |
| `CRON_SECRET` | Secret header cho cron endpoints |

### Thêm/cập nhật secret nhanh qua CLI

```bash
# Không cần vào GitHub UI — dùng gh CLI
gh secret set VPS_PASSWORD --body "mat_khau_moi" --repo BHQUAN97/VietNet2026

# Thêm từ biến môi trường
gh secret set JWT_SECRET --body "$MY_JWT_SECRET" --repo BHQUAN97/VietNet2026

# Xem danh sách secrets (chỉ thấy tên, không thấy giá trị)
gh secret list --repo BHQUAN97/VietNet2026
```

---

## Checklist trước khi deploy

- [ ] `gh secret list --repo BHQUAN97/VietNet2026` hiện đủ 10 secrets
- [ ] Push code lên `main` → Actions chạy tự động
- [ ] Xem progress: `gh run watch --repo BHQUAN97/VietNet2026`

> Đổi VPS password: `bash /e/DEVELOP/.claude-shared/secrets-infra/scripts/set-all-secrets.sh --shared`

---

## Deploy

### Tự động (Khuyên dùng)

Push lên nhánh `main` → GitHub Actions tự động chạy:
1. Typecheck FE + BE (song song)
2. Detect changes (init vs update)
3. Upload + build + start trên VPS
4. Health check

### Thủ công từ máy local

```bash
# Cài sshpass nếu chưa có
sudo apt install sshpass   # Ubuntu
brew install sshpass        # Mac

# Kết nối VPS
export SSHPASS="mat_khau_vps"
sshpass -e ssh root@134.122.21.251

# Trên VPS: xem trạng thái
cd /opt/vietnet
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Quản lý trên VPS

```bash
ssh root@134.122.21.251
cd /opt/vietnet

# Xem logs
docker logs vietnet-api --tail 50 -f
docker logs vietnet-frontend --tail 50 -f

# Restart
docker compose -f docker-compose.prod.yml restart backend frontend

# Nginx reload
docker exec shared-nginx nginx -t && docker exec shared-nginx nginx -s reload

# DB backup
docker exec shared-mysql mysqldump -u root -p"<ROOT_PASS>" vietnet \
  --single-transaction | gzip > backup_vietnet_$(date +%Y%m%d).sql.gz
```

---

## Troubleshooting

```bash
# 502 Bad Gateway — kiểm tra network
docker inspect shared-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
# Phải có: vietnet_frontend
# Nếu thiếu:
docker network connect vietnet_frontend shared-nginx
docker exec shared-nginx nginx -s reload

# Backend không start — xem logs
docker logs vietnet-api --tail 30

# Redis noeviction policy
docker exec shared-redis redis-cli CONFIG SET maxmemory-policy noeviction
```
