# VIETNET INTERIOR — DEPLOYMENT GUIDE

> Domain: bhquan.store | VPS: cùng server với WebPhoto (bhquan.site)
> Dùng chung MySQL (photo-mysql) + Redis (photo-redis)

---

## Tổng quan kiến trúc Production

```
  Browser (https://bhquan.store)
       │
       ▼
  Cloudflare DNS (DNS only)
       │
       ▼
  VPS Ubuntu (shared with WebPhoto)
  ┌──────────────────────────────────────────────┐
  │  Nginx (BT Panel — host)                     │
  │  ├─ bhquan.site  (WebPhoto)                  │
  │  │   ├─ /        → SPA static                │
  │  │   ├─ /api/*   → proxy :4000               │
  │  │   └─ /ws/*    → proxy :4001               │
  │  │                                            │
  │  ├─ bhquan.store (VietNet)                    │
  │  │   ├─ /        → proxy :3100 (Next.js SSR) │
  │  │   ├─ /api/*   → proxy :4100 (NestJS)      │
  │  │   └─ /ws/*    → proxy :4100               │
  │  │                                            │
  │  Shared Infrastructure (Docker)               │
  │  ┌─────────────────────────────────────┐      │
  │  │ photo-mysql  :3306 (MySQL 8)        │      │
  │  │   ├─ DB: photo_storage (WebPhoto)   │      │
  │  │   └─ DB: vietnet (VietNet)          │      │
  │  │ photo-redis  :6379 (Redis 7)        │      │
  │  └─────────────────────────────────────┘      │
  │                                               │
  │  WebPhoto Containers                          │
  │  ┌─────────────────────────────────────┐      │
  │  │ photo-api    :4000 (Express)        │      │
  │  │ photo-worker (BullMQ)               │      │
  │  └─────────────────────────────────────┘      │
  │                                               │
  │  VietNet Containers                           │
  │  ┌─────────────────────────────────────┐      │
  │  │ vietnet-api      :4100→4000 (NestJS)│      │
  │  │ vietnet-frontend :3100→3000 (Next)  │      │
  │  └─────────────────────────────────────┘      │
  └──────────────────────────────────────────────┘
```

### Port Map

| Service | WebPhoto | VietNet | Ghi chú |
|---------|----------|---------|---------|
| API | 4000 | 4100 | Cùng host, khác port |
| WebSocket | 4001 | 4100 | VietNet WS qua API port |
| Frontend | — (static) | 3100 | WebPhoto serve static |
| MySQL | photo-mysql:3306 | **shared** | DB: `vietnet` |
| Redis | photo-redis:6379 | **shared** | Cùng instance |

---

## Deploy lần đầu

```bash
bash scripts/quick-deploy.sh <VPS_IP> bhquan.store
```

Script tự động:
1. Kiểm tra WebPhoto (photo-mysql, photo-redis) đang chạy
2. Build FE + BE trên máy local
3. Upload lên VPS `/opt/vietnet/`
4. Tạo DB `vietnet` + user trong photo-mysql
5. Build Docker images, join WebPhoto network
6. Chạy DB migrations
7. Cấu hình Nginx + SSL
8. Health check

### Cập nhật code

```bash
bash scripts/update-deploy.sh <VPS_IP>
```

### Auto Deploy (GitHub Actions)

Push to `main` → typecheck → deploy

Secrets cần set: `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`

---

## Quản lý Production

```bash
ssh root@<VPS_IP>
cd /opt/vietnet

# Trạng thái
docker ps --filter 'name=vietnet-'
docker compose logs -f backend
docker compose logs -f frontend

# Restart
docker compose restart backend frontend

# DB backup (dùng chung photo-mysql)
docker exec photo-mysql mysqldump -u root -p"<ROOT_PASS>" vietnet \
  --single-transaction | gzip > backup_vietnet_$(date +%Y%m%d).sql.gz
```

---

## Biến môi trường (.env)

| Biến | Mô tả |
|------|--------|
| `DOMAIN` | bhquan.store |
| `VIETNET_DB_PASSWORD` | Password cho user `vietnet` trong photo-mysql |
| `JWT_SECRET` | JWT signing secret |
| `REVALIDATE_SECRET` | ISR revalidation |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 |
| `R2_ENDPOINT` | R2 S3 endpoint |
| `R2_PUBLIC_URL` | R2 public CDN URL |
| `RESEND_API_KEY` | Email service |

---

## Troubleshooting

```bash
# API không start
docker compose logs backend --tail 50

# Frontend 502
docker compose logs frontend --tail 50

# Kiểm tra kết nối MySQL
docker exec vietnet-api wget -qO- http://localhost:4000/api/health

# Kiểm tra network
docker network inspect webphoto_backend

# Port conflict
ss -tlnp | grep -E ':(3100|4100|4000|4001) '
```
