# VIETNET INTERIOR — DEPLOYMENT GUIDE

> Domain: bhquan.store | VPS: cùng server với WebPhoto (bhquan.site)

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
  │  ├─ :80  → redirect HTTPS                    │
  │  ├─ :443 → SSL (Let's Encrypt)               │
  │  │   ├─ /              → proxy :3100 (SSR)   │
  │  │   ├─ /api/*         → proxy :4100 (API)   │
  │  │   ├─ /socket.io/*   → proxy :4100 (WS)    │
  │  │   └─ /_next/static/ → proxy :3100 (cache) │
  │  │                                            │
  │  │  === WebPhoto (bhquan.site) ===            │
  │  │   ├─ /              → SPA static           │
  │  │   ├─ /api/*         → proxy :4000          │
  │  │   └─ /socket.io/*   → proxy :4001          │
  │  │                                            │
  │  Docker Containers — VietNet                  │
  │  ┌─────────────────────────────────────┐      │
  │  │ vietnet-api      :4100→4000 (NestJS)│      │
  │  │ vietnet-frontend :3100→3000 (Next)  │      │
  │  │ vietnet-mysql    (internal 3306)    │      │
  │  │ vietnet-redis    (internal 6379)    │      │
  │  └─────────────────────────────────────┘      │
  │                                               │
  │  Docker Containers — WebPhoto                 │
  │  ┌─────────────────────────────────────┐      │
  │  │ photo-api        :4000 (Express)    │      │
  │  │ photo-worker     (BullMQ)           │      │
  │  │ photo-mysql      :3306 (MySQL)      │      │
  │  │ photo-redis      :6379 (Redis)      │      │
  │  └─────────────────────────────────────┘      │
  └──────────────────────────────────────────────┘
```

### Khác biệt so với WebPhoto

| | WebPhoto | VietNet |
|---|---|---|
| Frontend | SPA (Vite) → Nginx static | SSR (Next.js) → Docker container |
| Backend | Express.js | NestJS + PM2 cluster |
| API port | 4000 | 4100 (host) → 4000 (container) |
| FE port | — (static) | 3100 (host) → 3000 (container) |
| DB | photo-mysql | vietnet-mysql (riêng) |
| Redis | photo-redis | vietnet-redis (riêng) |
| Domain | bhquan.site | bhquan.store |

---

## Deploy nhanh (VPS mới hoặc đã có WebPhoto)

### Yêu cầu

- VPS: Ubuntu 22.04/24.04 (shared with WebPhoto)
- Docker + Docker Compose đã cài
- Nginx trên host (BT Panel / aaPanel / system)
- SSH key đã cấu hình

### Deploy lần đầu

```bash
bash scripts/quick-deploy.sh <VPS_IP> bhquan.store
```

Script tự động 8 bước:

| Step | Mô tả |
|------|--------|
| 0/8 | Kiểm tra SSH, Docker, WebPhoto status |
| 1/8 | Build frontend (Next.js) + backend (NestJS) trên máy local |
| 2/8 | Chuẩn bị VPS (thư mục, firewall, certbot) |
| 3/8 | Upload files lên VPS via SCP |
| 4/8 | Tạo .env (auto-generate secrets) |
| 5/8 | Build Docker images + Start MySQL, Redis, API, Frontend |
| 6/8 | Database migrations + changelog |
| 7/8 | Cấu hình Nginx (auto-detect BT Panel/system) + SSL |
| 8/8 | Health check + port conflict check |

### Cập nhật code (các lần sau)

```bash
bash scripts/update-deploy.sh <VPS_IP>
```

### Auto Deploy (GitHub Actions)

Push to `main` → CI typecheck → Deploy to VPS

GitHub Secrets cần set:
- `SSH_PRIVATE_KEY` — private key SSH
- `VPS_HOST` — IP của VPS
- `VPS_USER` — user SSH (default: root)

---

## Port Map (tránh xung đột)

| Service | WebPhoto | VietNet | Ghi chú |
|---------|----------|---------|---------|
| API | 4000 | 4100 | Host port khác, container đều 4000 |
| WebSocket | 4001 | 4100 | VietNet dùng chung port API |
| Frontend | — | 3100 | WebPhoto serve static, không cần port |
| MySQL | photo-mysql | vietnet-mysql | Container riêng, internal network |
| Redis | photo-redis | vietnet-redis | Container riêng, internal network |

---

## Quản lý Production

```bash
# === KẾT NỐI VPS ===
ssh root@<VPS_IP>
cd /opt/vietnet

# === TRẠNG THÁI ===
docker compose ps
docker compose logs -f backend      # Logs API
docker compose logs -f frontend     # Logs SSR

# === RESTART ===
docker compose restart backend frontend
docker compose down && docker compose up -d

# === DATABASE ===
# Backup
docker exec vietnet-mysql mysqldump -u root -p"<ROOT_PASS>" vietnet \
  --single-transaction | gzip > backup_$(date +%Y%m%d).sql.gz

# === CẬP NHẬT (từ máy local) ===
bash scripts/update-deploy.sh <VPS_IP>
```

---

## Biến môi trường

### Root `.env` (docker-compose)

| Biến | Mô tả |
|------|--------|
| `MYSQL_ROOT_PASSWORD` | Root password MySQL |
| `MYSQL_PASSWORD` | App user password MySQL |
| `DOMAIN` | Domain (bhquan.store) |

### `backend/.env`

| Biến | Mô tả |
|------|--------|
| `JWT_SECRET` | Secret cho JWT (auto-generated) |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret |
| `R2_ENDPOINT` | R2 S3-compatible endpoint |
| `RESEND_API_KEY` | Email API key |
| `REVALIDATE_SECRET` | ISR revalidation secret |

---

## Troubleshooting

### API không start
```bash
docker compose logs backend --tail 50
```

### Frontend trắng / 502
```bash
docker compose logs frontend --tail 50
# Kiểm tra Next.js standalone output
docker exec vietnet-frontend ls /app/server.js
```

### Port conflict với WebPhoto
```bash
ss -tlnp | grep -E ':(3100|4100|4000|4001) '
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

### SSL cert lỗi
```bash
dig +short bhquan.store  # Phải trả về VPS IP
certbot certonly --webroot -w /var/www/certbot -d bhquan.store
```
