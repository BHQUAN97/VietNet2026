# VIETNET INTERIOR — DEPLOYMENT GUIDE

> Domain: bhquan.store | VPS: 188.166.190.81 (shared with WebPhoto bhquan.site)

---

## Kiến trúc Production

```
  VPS Ubuntu (188.166.190.81)
  ┌──────────────────────────────────────────────┐
  │  shared-nginx (Docker) :80/:443               │
  │  ├─ bhquan.site  → photo-api:4000 (WebPhoto) │
  │  │                 + static /usr/share/nginx  │
  │  └─ bhquan.store → vietnet-api:4000 (API)    │
  │                    + vietnet-frontend:3000    │
  │                                               │
  │  Shared (WebPhoto owns)                       │
  │  ├─ shared-mysql  :3306                        │
  │  │   ├─ DB: photo_storage                     │
  │  │   └─ DB: vietnet                           │
  │  ├─ shared-redis  :6379                        │
  │  └─ shared-nginx  (serves both domains)        │
  │                                               │
  │  VietNet Containers                           │
  │  ├─ vietnet-api      :4100→4000 (NestJS)     │
  │  └─ vietnet-frontend :3100→3000 (Next.js)    │
  │                                               │
  │  Docker Networks                              │
  │  ├─ webphoto_backend   (mysql, redis, api)    │
  │  ├─ webphoto_frontend  (shared-nginx, api)     │
  │  └─ vietnet_frontend   (shared-nginx, vietnet) │
  └──────────────────────────────────────────────┘
```

### Nginx routing (Docker, không phải host)

Config tại: `/opt/webphoto/nginx/conf.d/bhquan.store.conf`
Proxy dùng **container name** (không phải localhost):
- `/api/*` → `http://vietnet-api:4000`
- `/socket.io/*` → `http://vietnet-api:4000`
- `/_next/static/*` → `http://vietnet-frontend:3000` (cache immutable)
- `/*` → `http://vietnet-frontend:3000` (SSR)

---

## Deploy

### Lần đầu
```bash
bash scripts/quick-deploy.sh 188.166.190.81 bhquan.store
```

### Cập nhật code
```bash
bash scripts/update-deploy.sh 188.166.190.81
```

### Auto Deploy
Push to `main` → GitHub Actions → deploy

Secrets: `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`

---

## Quản lý

```bash
ssh root@188.166.190.81
cd /opt/vietnet

docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose restart backend frontend

# Nginx config (trong WebPhoto dir)
vim /opt/webphoto/nginx/conf.d/bhquan.store.conf
docker exec shared-nginx nginx -t && docker exec shared-nginx nginx -s reload

# DB backup
docker exec shared-mysql mysqldump -u root -p"<PASS>" vietnet \
  --single-transaction | gzip > backup_vietnet_$(date +%Y%m%d).sql.gz
```

---

## Troubleshooting

```bash
# API logs
docker compose logs backend --tail 50

# Nginx 502 — check network
docker inspect shared-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
# Phải có: webphoto_frontend, vietnet_frontend
# Nếu thiếu: docker network connect vietnet_frontend shared-nginx

# SSL cert renew
certbot renew
CERT_VOL=$(docker volume inspect webphoto_certbot_data --format '{{.Mountpoint}}')
cp -rL /etc/letsencrypt/live/bhquan.store/* $CERT_VOL/live/bhquan.store/
docker exec shared-nginx nginx -s reload
```
