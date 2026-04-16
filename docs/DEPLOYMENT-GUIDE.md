# VietNet Interior — Huong Dan Trien Khai Chi Tiet

> Website noi that VietNet — He thong CMS + Public Site
> Stack: Next.js 14 + NestJS 10 + MySQL 8.0 + Redis 7 + Nginx + Docker
> Domain: bhquan.store | VPS: 188.166.190.81 (shared voi WebPhoto bhquan.site)
> Cap nhat: 2026-04-16

---

## Muc luc

1. [Tong quan Kien truc](#1-tong-quan-kien-truc)
2. [Yeu cau He thong](#2-yeu-cau-he-thong)
3. [Bien Moi truong (Environment Variables)](#3-bien-moi-truong)
4. [Trien khai Local (Development)](#4-trien-khai-local-development)
5. [Trien khai Docker (Development)](#5-trien-khai-docker-development)
6. [Testing](#6-testing)
7. [Trien khai Production (VPS)](#7-trien-khai-production-vps)
8. [Database Management](#8-database-management)
9. [Nginx Configuration](#9-nginx-configuration)
10. [SSL/HTTPS](#10-sslhttps)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Backup & Restore](#12-backup--restore)
13. [Monitoring & Health Check](#13-monitoring--health-check)
14. [Troubleshooting](#14-troubleshooting)
15. [Port Map & Resource Limits](#15-port-map--resource-limits)

---

## 1. Tong quan Kien truc

### Deployment Architecture

```
                         Internet
                            |
                     ┌──────▼──────┐
                     │shared-nginx │  SSL termination
                     │  :80/:443   │  Reverse proxy, Gzip, Security headers
                     └──────┬──────┘
                            |
               ┌────────────┼────────────┐
               |                         |
          ┌────▼─────┐             ┌─────▼────┐
          │ Frontend  │             │ Backend  │
          │ Next.js   │  ────────▶  │ NestJS   │
          │ :3000     │  (API call) │ :4000    │
          │ SSR+ISR   │             │ REST API │
          └───────────┘             └────┬─────┘
                                        |
                             ┌──────────┼──────────┐
                             |                     |
                        ┌────▼────┐          ┌─────▼────┐
                        │ MySQL   │          │  Redis   │
                        │ 8.0     │          │  7       │
                        │ :3306   │          │  :6379   │
                        └─────────┘          └──────────┘
                             |                     |
                        Shared MySQL          BullMQ queues
                        (vietnet DB)          Socket.io adapter
                                              Cache layer
```

### Docker Container Map (Production)

```
┌─────────────────────────────────────────────────────┐
│              VPS (188.166.190.81)                     │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │     shared-nginx (webphoto_frontend)         │    │
│  │     Port 80/443 → Internet                   │    │
│  │     ├─ bhquan.site  → WebPhoto               │    │
│  │     └─ bhquan.store → VietNet                │    │
│  └─────────┬──────────────────────┬─────────────┘    │
│            │                      │                  │
│  ┌─────────▼─────────┐  ┌───────▼──────────┐       │
│  │ vietnet-frontend   │  │  vietnet-api     │       │
│  │ Port 3100→3000     │  │  Port 4100→4000  │       │
│  │ (vietnet_frontend) │  │  (vietnet_frontend│       │
│  └───────────────────┘  │  + webphoto_backend)      │
│                          └───────┬──────────┘       │
│                                  │                  │
│  ┌───────────────────────────────┼──────────┐       │
│  │        webphoto_backend network          │       │
│  │  ┌─────────────┐  ┌───────────────┐     │       │
│  │  │ shared-mysql │  │ shared-redis  │     │       │
│  │  │ MySQL 8.0    │  │ Redis 7       │     │       │
│  │  └──────────────┘  └───────────────┘     │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Thanh phan chinh

| Thanh phan | Vai tro | Image |
|------------|---------|-------|
| **Nginx** | Reverse proxy, SSL, gzip, security headers | `nginx:1.25-alpine` (shared-nginx) |
| **Frontend** | SSR/ISR web app, SEO, "Curated Atelier" theme | `node:20-alpine` (standalone) |
| **Backend** | REST API, BullMQ workers, Socket.io | `node:20-alpine` + PM2 (4 instances) |
| **MySQL** | Database chinh (shared voi WebPhoto) | `mysql:8.0` |
| **Redis** | Cache, BullMQ queue, Socket.io adapter | `redis:7-alpine` |

### Dac trung VietNet

- **Page Builder**: Admin CMS voi JSON config, Draft Mode preview
- **Workers**: BullMQ — IMAGE_JOB (xu ly anh), MAIL_JOB (email qua Resend), TRAFFIC_SYNC_JOB
- **Real-time**: Socket.io rooms (`user:{userId}`, `admin`)
- **Storage**: Cloudflare R2 (private + public buckets) hoac local uploads (fallback)
- **Rich text**: Tiptap editor trong admin

---

## 2. Yeu cau He thong

### Development (Local)

| Yeu cau | Phien ban | Ghi chu |
|---------|-----------|---------|
| Node.js | 20 LTS | Required cho ca FE + BE |
| npm | 10.x+ | Di kem Node.js |
| MySQL | 8.0 | hoac Docker container |
| Redis | 7.x | hoac Docker container |
| Git | 2.x+ | |
| Docker | 24.x+ | Optional cho local dev |

### Production (VPS)

| Yeu cau | Toi thieu | Hien tai |
|---------|-----------|----------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 16 GB |
| Disk | 20 GB SSD | 160 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |
| Docker | 24+ | Latest |
| Docker Compose | v2+ | Latest |

### Resource Limits (Production)

| Service | CPU | Memory |
|---------|-----|--------|
| Backend (PM2 x4) | 2.0 | 4 GB |
| Frontend | 1.0 | 4 GB |
| MySQL (shared) | 0.5 | 5 GB |
| Redis (shared) | 0.5 | 2 GB |
| **Tong** | **4.0** | **15 GB** |

---

## 3. Bien Moi truong

### 3.1 Root `.env` (Docker Compose dev)

```bash
# === MYSQL ===
MYSQL_ROOT_PASSWORD=vietnet_root
MYSQL_PASSWORD=vietnet_dev

# === BACKEND ===
DB_HOST=mysql                    # Container name (Docker) hoac localhost (local)
DB_PORT=3306
DB_USERNAME=vietnet
DB_PASSWORD=vietnet_dev
DB_NAME=vietnet

# === REDIS ===
REDIS_HOST=redis                 # Container name (Docker) hoac localhost (local)
REDIS_PORT=6379

# === JWT (BAT BUOC) ===
JWT_SECRET=change-me-to-a-long-random-secret  # KHONG dung gia tri nay trong production
JWT_EXPIRATION=3600                            # 1 gio
REFRESH_TOKEN_EXPIRATION=604800                # 7 ngay

# === CLOUDFLARE R2 (Optional) ===
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_PRIVATE=vietnet-private
R2_BUCKET_PUBLIC=vietnet-public
R2_PUBLIC_URL=https://pub-vietnet.r2.dev

# === MAIL (Resend) ===
RESEND_API_KEY=
ADMIN_EMAIL=admin@bhquan.site

# === ISR REVALIDATION ===
REVALIDATE_SECRET=change-me-to-a-random-secret
NEXT_REVALIDATE_URL=http://frontend:3000

# === FRONTEND ===
NEXT_PUBLIC_API_URL=https://bhquan.store/api
NEXT_PUBLIC_SITE_URL=https://bhquan.store

# === BACKUP ===
MYSQL_BACKUP_PASSWORD=vietnet_dev
```

### 3.2 Backend `.env` (Local dev)

```bash
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=vietnet
DB_PASS=vietnet_dev
DB_NAME=vietnet

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=dev-secret-change-this-in-production-min-32-chars
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

ADMIN_EMAIL=admin@bhquan.site
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
```

### 3.3 Frontend `.env` (Local dev)

```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:8080

# URL noi bo cho SSR fetch trong Docker
INTERNAL_API_URL=http://backend:4000/api

# Preview / Revalidation (server-side only)
PREVIEW_SECRET=change-me-to-a-random-secret
REVALIDATE_SECRET=change-me-to-a-random-secret
```

### 3.4 Validation khi khoi dong

Backend tu dong validate khi start:
- **BAT BUOC**: `DB_HOST`, `DB_PORT`, `DB_USERNAME`/`DB_USER`, `DB_PASSWORD`/`DB_PASS`, `DB_NAME`, `JWT_SECRET`
- **Production check**: `JWT_SECRET` KHONG duoc chua `"change-this"` hoac `"change-me"`
- Thieu → app crash voi error message ro rang

---

## 4. Trien khai Local (Development)

### Buoc 1: Clone & Cai dat

```bash
git clone https://github.com/BHQUAN97/VietNet2026.git
cd VietNet2026

# Backend
cd backend
cp .env.example .env           # Chinh sua .env theo moi truong
npm install

# Frontend
cd ../frontend
cp .env.example .env           # Chinh sua .env
npm install
```

### Buoc 2: Chuan bi Database

```bash
# Option A: MySQL local (da cai san)
mysql -u root -p
> CREATE DATABASE vietnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> CREATE USER 'vietnet'@'localhost' IDENTIFIED BY 'vietnet_dev';
> GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'localhost';
> FLUSH PRIVILEGES;

# Option B: Dung Docker chi cho MySQL + Redis
docker run -d --name vietnet-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=vietnet \
  -e MYSQL_USER=vietnet \
  -e MYSQL_PASSWORD=vietnet_dev \
  mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

docker run -d --name vietnet-redis -p 6379:6379 redis:7-alpine
```

### Buoc 3: Migration & Seed

```bash
cd backend

# Chay migration (TypeORM)
npm run migration:run

# Seed admin user (BAT BUOC truoc)
npm run seed:admin

# Seed demo data (projects, articles, products)
npm run seed:data
```

> **Luu y:** Seeds deu idempotent — chay lai an toan, tu dong skip neu da ton tai.

### Buoc 4: Khoi dong

```bash
# Terminal 1: Backend
cd backend
npm run dev                    # http://localhost:4000

# Terminal 2: Frontend
cd frontend
npm run dev                    # http://localhost:3000
```

### Buoc 5: Windows — Quick Start

```batch
# Start tat ca (Docker + Backend + Frontend)
run-local.bat
```

Script tu dong:
- Kiem tra Docker installed + running
- Tao .env tu .env.example neu chua co
- Start MySQL + Redis bang Docker
- Chay migrations + seed admin
- Start backend + frontend

### Kiem tra

| URL | Ket qua mong doi |
|-----|------------------|
| `http://localhost:3000` | Trang chu public (SSR) |
| `http://localhost:3000/admin` | Admin login page |
| `http://localhost:4000/api/health` | `{ "status": "ok" }` |
| `http://localhost:8080` | Qua Nginx (Docker dev) |

---

## 5. Trien khai Docker (Development)

### Buoc 1: Chuan bi

```bash
cd VietNet2026
cp .env.example .env           # Chinh sua .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Buoc 2: Development mode (hot reload)

```bash
# Start voi hot reload — mount source code, ko Nginx
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Xem logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
```

### Buoc 3: All-in-one (bao gom Nginx)

```bash
# Start tat ca services (Nginx + Backend + Frontend + MySQL + Redis)
docker compose up -d

# Xem trang thai
docker compose ps
```

### Buoc 4: Migration & Seed (trong container)

```bash
# Chay migration
docker compose exec backend npm run migration:run

# Seed data
docker compose exec backend npm run seed:admin
docker compose exec backend npm run seed:data
```

### Port Map (Development Docker)

| Service | Host Port | Container Port | URL |
|---------|-----------|---------------|-----|
| Frontend | 3100 | 3000 | `http://localhost:3100` |
| Backend | 5102 (all-in-one) / 4100 (dev) | 4000 | `http://localhost:4100/api` |
| MySQL | 3307 | 3306 | `mysql -h localhost -P 3307` |
| Redis | 6380 | 6379 | `redis-cli -p 6380` |
| Nginx (HTTP) | 5100 | 80 | `http://localhost:5100` |
| Nginx (HTTPS) | 5101 | 443 | `https://localhost:5101` |

### Hot Reload (dev mode)

Development Docker mount source code:
- `./backend/src` → `/app/src` (backend container)
- `./frontend/src` → `/app/src` (frontend container)

Thay doi code → tu dong reload, khong can rebuild.

---

## 6. Testing

### 6.1 TypeScript Check

```bash
# Frontend
cd frontend && npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

### 6.2 Lint

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

### 6.3 Unit Tests

```bash
# Backend — Jest
cd backend
npx jest --passWithNoTests        # Chay 1 lan

# Frontend — Vitest (khi co test)
cd frontend
npx vitest run --passWithNoTests
```

### 6.4 E2E Tests — Playwright

```bash
cd frontend

# Cai Playwright browsers (lan dau)
npx playwright install

# Chay tat ca E2E tests
npm run test:e2e

# Chay voi UI mode (debug)
npm run test:e2e:ui

# Xem HTML report
npm run test:e2e:report

# Chay 1 project cu the
npx playwright test --project=desktop-chrome
npx playwright test --project=mobile-chrome

# Chay tren local thay vi production
BASE_URL=http://localhost:3000 npm run test:e2e
```

**E2E Test config:**
- Default base URL: `https://bhquan.store` (production), override bang `BASE_URL` env
- Projects: Desktop Chrome (1280x720) + Mobile Chrome (Pixel 7)
- Timeout: 30s test / 10s expect
- Screenshots: on failure
- Video: retain on failure
- Trace: on first retry
- Retries: 2 (CI) / 1 (local)
- Parallel: yes (local), sequential (CI)

---

## 7. Trien khai Production (VPS)

### 7.1 Yeu cau truoc khi deploy

- VPS da co **WebPhoto shared infrastructure** chay:
  - `shared-mysql` (MySQL 8.0) — tren network `webphoto_backend`
  - `shared-redis` (Redis 7) — tren network `webphoto_backend`
  - `shared-nginx` (Nginx reverse proxy) — tren network `webphoto_frontend`
- SSH access da cau hinh
- Domain `bhquan.store` da tro DNS ve VPS IP (188.166.190.81)

### 7.2 First-time Server Setup

```bash
# SSH vao VPS
ssh root@188.166.190.81

# Chay setup script (cai Docker, tao directories, SSL, crontab, firewall)
bash scripts/setup-server.sh
```

Script tu dong:
- Cap nhat system packages
- Cai Docker (neu chua co)
- Tao `/opt/vietnet/`, `/opt/vietnet/backups/mysql/`, `/var/log/vietnet/`
- Lay SSL certificate cho `bhquan.store`
- Tao template `.env` voi random passwords
- Cai crontab (backup, monitoring, cleanup)
- Cau hinh firewall (ports 22, 80, 443)

### 7.3 Quick Deploy (1 lenh tu local)

```bash
# Tu may local
bash scripts/quick-deploy.sh 188.166.190.81 bhquan.store
```

**8 buoc tu dong:**

| Buoc | Mo ta | Chi tiet |
|------|--------|----------|
| 0/8 | Pre-flight check | SSH connection, shared-mysql/redis/nginx running |
| 1/8 | Build local | `npm run build` cho backend + frontend |
| 2/8 | Chuan bi VPS | Tao `/opt/vietnet/` directories |
| 3/8 | Upload files | SCP: docker-compose.prod.yml, backend, frontend, scripts, db, nginx |
| 4/8 | DB + ENV | Tao database `vietnet` trong shared-mysql, tao `.env` |
| 5/8 | Docker build + start | Build images, start containers, connect networks |
| 6/8 | Nginx config | Upload bhquan.store.conf vao shared-nginx, SSL, reload |
| 7/8 | Seed data | Chay seed-runner.js trong container |
| 8/8 | Health check | Curl API + HTTPS, hien thi container status |

### 7.4 Update Deploy (cap nhat code)

```bash
# Tu may local — chi upload code thay doi + restart
bash scripts/update-deploy.sh 188.166.190.81
```

**6 buoc:**

| Buoc | Mo ta |
|------|--------|
| 1/6 | Build local (backend + frontend) |
| 2/6 | Upload source code len VPS |
| 3/6 | DB Changelog (chay SQL files pending) |
| 4/6 | Update Nginx config |
| 5/6 | Docker rebuild + restart |
| 6/6 | Health check |

### 7.5 Auto Deploy (GitHub Actions)

Push to `main` → GitHub Actions tu dong deploy.

```
Push → main (tru *.md, docs/*)
    |
    ├── Stage 1: Typecheck (FE + BE parallel)
    ├── Stage 2: Detect changes (fe/be/infra/db/config)
    ├── Stage 3: Deploy to VPS (INIT hoac UPDATE mode)
    └── Stage 4: Health check + verify
```

### 7.6 Production docker-compose.prod.yml

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: vietnet-api
    restart: always
    ports:
      - '4100:4000'
    environment:
      NODE_ENV: production
      DB_HOST: shared-mysql
      DB_PORT: 3306
      DB_USERNAME: vietnet
      DB_PASSWORD: ${VIETNET_DB_PASSWORD}
      DB_NAME: vietnet
      REDIS_HOST: shared-redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: https://${DOMAIN:-bhquan.store}
      RESEND_API_KEY: ${RESEND_API_KEY}
      ADMIN_EMAIL: admin@${DOMAIN:-bhquan.store}
      REVALIDATE_SECRET: ${REVALIDATE_SECRET}
      NEXT_REVALIDATE_URL: http://vietnet-frontend:3000
    volumes:
      - vietnet_uploads:/app/uploads
    networks:
      - webphoto_backend     # Access MySQL + Redis
      - vietnet_frontend     # shared-nginx proxy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: vietnet-frontend
    restart: always
    ports:
      - '3100:3000'
    environment:
      NEXT_PUBLIC_API_URL: /api
      NEXT_PUBLIC_SITE_URL: https://${DOMAIN:-bhquan.store}
      INTERNAL_API_URL: http://backend:4000/api
    networks:
      - vietnet_frontend     # shared-nginx proxy

volumes:
  vietnet_uploads:

networks:
  webphoto_backend:
    external: true
  vietnet_frontend:
    external: true
```

### 7.7 Manual Deploy (tung buoc)

```bash
# 1. SSH vao VPS
ssh root@188.166.190.81

# 2. Tao directory
mkdir -p /opt/vietnet
cd /opt/vietnet

# 3. Upload source tu local
scp -r backend/ frontend/ docker-compose.prod.yml scripts/ db/ nginx/ \
  root@188.166.190.81:/opt/vietnet/

# 4. Tao .env
cat > /opt/vietnet/.env << 'EOF'
DOMAIN=bhquan.store
VIETNET_DB_PASSWORD=<generated-password>
JWT_SECRET=<random-64-chars>
REVALIDATE_SECRET=<random-32-chars>
RESEND_API_KEY=<resend-key>
EOF

# 5. Tao database trong shared-mysql
docker exec shared-mysql mysql -u root -p -e "
  CREATE DATABASE IF NOT EXISTS vietnet
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'vietnet'@'%'
    IDENTIFIED WITH mysql_native_password BY '<password>';
  GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'%';
  FLUSH PRIVILEGES;
"

# 6. Tao Docker networks
docker network create webphoto_backend 2>/dev/null || true
docker network create vietnet_frontend 2>/dev/null || true

# 7. Build + start
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 8. Ket noi shared-nginx vao network
docker network connect vietnet_frontend shared-nginx

# 9. Migration + Seed
docker exec vietnet-api npm run migration:run:prod
docker exec vietnet-api npm run seed:admin:prod
docker exec vietnet-api npm run seed:data:prod

# 10. Nginx config
cp nginx/conf.d/bhquan.store.conf /opt/webphoto/nginx/conf.d/
docker exec shared-nginx nginx -t
docker exec shared-nginx nginx -s reload

# 11. Health check
curl -s http://localhost:4100/api/health
curl -sf https://bhquan.store/
```

### 7.8 Ket qua deploy

```
  https://bhquan.store          (Public site — SSR)
  https://bhquan.store/admin    (Admin CMS)
  https://bhquan.store/api      (REST API)
```

---

## 8. Database Management

### 8.1 TypeORM Migrations

VietNet dung **TypeORM migrations** (khong phai directory-versioned SQL).

**Migration files** trong `backend/src/database/migrations/`:

| # | File | Noi dung |
|---|------|---------|
| 1 | `1711929600000-InitialSchema.ts` | Tao tat ca tables ban dau |
| 2 | `1711929700000-CreateAppLogs.ts` | Bang app_logs |
| 3 | `1711929800000-TranslateHomepageVietnamese.ts` | Dich noi dung homepage |
| 4 | `1711929900000-AddCategoryEnumValues.ts` | Them enum values cho categories |

**Migration commands:**

```bash
# Development (TypeScript)
cd backend
npm run migration:run              # Chay tat ca migrations pending

# Production (Compiled JavaScript — trong container)
docker exec vietnet-api npm run migration:run:prod
```

### 8.2 DB Changelog (SQL bo sung)

Ngoai TypeORM migrations, co `db/changelog/` cho SQL changes:

```
db/changelog/
├── _init/              # Schema khoi tao
│   └── *.sql
└── 1.0.0/              # Version-based changes
    └── *.sql
```

**Convention:** `NNN__description.sql` (vi du: `001__add_seo_fields.sql`)

**Chay changelog:**
```bash
# Tu local
bash scripts/db-changelog.sh <vps-ip>

# Xem trang thai
bash scripts/db-changelog.sh <vps-ip> --status
```

### 8.3 Schema init

File `db/schema/init.sql` duoc auto-load khi MySQL container khoi dong lan dau (mount vao `/docker-entrypoint-initdb.d/`).

### 8.4 Seed Data

```bash
# Development
cd backend
npm run seed:admin                # Tao Super Admin (BAT BUOC truoc)
npm run seed:data                 # Seed demo data (projects, articles, products)

# Production (trong container)
docker exec vietnet-api npm run seed:admin:prod
docker exec vietnet-api npm run seed:data:prod

# Seed tu local len VPS (60 records — 20 project + 20 article + 20 product)
bash scripts/seed-all.sh 188.166.190.81
```

### 8.5 Tao Migration Moi

```bash
cd backend

# 1. Sua entity file (VD: src/database/entities/project.entity.ts)
# 2. Tao migration tu entity changes
npx typeorm migration:generate -d src/database/data-source.ts src/database/migrations/NewMigration

# 3. Review migration file
# 4. Chay migration
npm run migration:run
```

---

## 9. Nginx Configuration

### 9.1 File config

Config dat tai: `/opt/webphoto/nginx/conf.d/bhquan.store.conf` (trong shared-nginx container).

Nginx chay trong Docker → proxy qua **container name** (khong phai localhost):
- `vietnet-api:4000` (backend)
- `vietnet-frontend:3000` (frontend)

### 9.2 Routing

| Path | Upstream | Dac biet |
|------|----------|---------|
| `/` | vietnet-frontend:3000 | SSR pages |
| `/api/auth/*`, `/api/login/*` | vietnet-api:4000 | Auth endpoints |
| `/api/*/upload` | vietnet-api:4000 | Max 20MB, timeout 120s |
| `/api/draft/*`, `/api/revalidate/*` | vietnet-frontend:3000 | Next.js API routes (ISR) |
| `/api/*` | vietnet-api:4000 | REST API, timeout 60s |
| `/uploads/*` | vietnet-api:4000 | Static files, cache 30d |
| `/socket.io/` | vietnet-api:4000 | WebSocket, timeout 86400s |
| `/_next/static/*` | vietnet-frontend:3000 | Cache 365d, immutable |

### 9.3 Security Headers

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
```

### 9.4 Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 256;
gzip_types text/plain text/css text/xml text/javascript
           application/javascript application/json application/xml
           application/rss+xml image/svg+xml font/woff2;
```

### 9.5 Client Settings

```nginx
client_max_body_size 20M;       # Upload limit
client_body_buffer_size 128k;
proxy_buffer_size 128k;
proxy_buffers 4 256k;
```

---

## 10. SSL/HTTPS

### 10.1 Let's Encrypt (Production)

```bash
# Lay certificate (chay 1 lan qua setup-server.sh hoac manual)
certbot certonly --standalone -d bhquan.store \
  --non-interactive --agree-tos -m admin@bhquan.store

# Certificate luu tai:
# /etc/letsencrypt/live/bhquan.store/fullchain.pem
# /etc/letsencrypt/live/bhquan.store/privkey.pem
```

### 10.2 Nginx SSL Config

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name bhquan.store;

    ssl_certificate     /etc/letsencrypt/live/bhquan.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bhquan.store/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name bhquan.store;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;     # Certbot renewal
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 10.3 Auto-renew

```bash
# Test renewal
certbot renew --dry-run

# Cron tu dong (da cai qua setup-server.sh)
# 0 3 1,15 * * certbot renew --quiet --deploy-hook "docker restart vietnet-nginx-1"
```

**Luu y SSL Docker volume:**
Khi renew cert, can copy vao Docker volume neu shared-nginx mount tu volume (khong phai host path):
```bash
CERT_VOL=$(docker volume inspect webphoto_certbot_data --format '{{.Mountpoint}}')
cp -rL /etc/letsencrypt/live/bhquan.store/* $CERT_VOL/live/bhquan.store/
docker exec shared-nginx nginx -s reload
```

---

## 11. CI/CD Pipeline

### 11.1 CI Pipeline (`.github/workflows/ci.yml`)

Trigger: Push/PR → `main`

```
Push/PR → main
    |
    ├── Security Scan
    │   ├── No .env files committed
    │   ├── No hardcoded secrets (AWS, Resend, GitHub keys)
    │   └── npm audit (high severity) — BE + FE
    |
    ├── DB Changelog Validation
    │   ├── Naming convention check (NNN__description.sql)
    │   ├── SQL safety (no DROP without IF EXISTS, no TRUNCATE)
    │   └── UTF8MB4 requirement
    |
    ├── Backend
    │   ├── npm ci
    │   ├── eslint lint
    │   ├── tsc --noEmit (type check)
    │   ├── nest build
    │   └── jest tests (--passWithNoTests)
    |
    └── Frontend
        ├── npm ci
        ├── next lint
        ├── tsc --noEmit
        ├── next build
        └── vitest tests (--passWithNoTests)
```

### 11.2 Deploy Pipeline (`.github/workflows/deploy.yml`)

Trigger: Push → `main` (tru `*.md`, `docs/**`)

```
Push → main
    |
    ├── Stage 1: Typecheck (FE + BE parallel)
    |
    ├── Stage 2: Detect Changes
    │   ├── INIT mode (first deploy) vs UPDATE mode
    │   └── Change detection: frontend/, backend/, docker, nginx, db, config
    |
    ├── Stage 3: Deploy to VPS
    │   ├── INIT: Upload all → build → start → SSL → seed
    │   └── UPDATE: Upload changed → rebuild affected → restart
    │   |
    │   └── Shared steps:
    │       ├── Sync .env tu config/env
    │       ├── Ensure DB + user
    │       ├── Run TypeORM migrations
    │       └── Run DB changelog
    |
    └── Stage 4: Verify
        ├── Health check backend
        ├── Health check frontend
        ├── Container status
        └── Deploy summary
```

### 11.3 Scheduled Tasks (`.github/workflows/cron.yml`)

| Schedule | Task | Status |
|----------|------|--------|
| 1:00 AM UTC+7 | Traffic sync (`/api/cron/traffic-sync`) | DISABLED (fix CRON_SECRET) |
| 2:00 AM UTC+7 | Cleanup expired sessions (`/api/cron/cleanup-sessions`) | Active |

### 11.4 VPS Setup (`.github/workflows/vps-setup.yml`)

Workflow cho setup VPS lan dau (manual trigger).

### 11.5 Restore (`.github/workflows/restore.yml`)

Workflow restore DB tu backup (manual trigger).

### 11.6 Deploy Config

Deploy config luu trong `config/env` (khong phai GitHub Secrets):
```
VPS_HOST=188.166.190.81
VPS_USER=root
VPS_PORT=22
VPS_PASSWORD=...
DOMAIN=bhquan.store
API_URL=https://bhquan.store
CRON_SECRET=...
```

---

## 12. Backup & Restore

### 12.1 Backup tu dong

**Script:** `scripts/backup-mysql.sh`

```bash
# Crontab — chay 2:00 AM hang ngay
0 2 * * * /opt/vietnet/scripts/backup-mysql.sh >> /var/log/vietnet/cron.log 2>&1

# Output: /opt/vietnet/backups/mysql/vietnet_YYYY-MM-DD_HH-MM.sql.gz
```

**Backup process:**
1. `mysqldump` voi `--single-transaction --routines --triggers --events --set-gtid-purged=OFF`
2. Compress bang `gzip`
3. Verify integrity bang `gunzip -t`
4. Xoa backup cu hon 7 ngay
5. Upload len R2 qua `rclone` (neu co cai)

### 12.2 Backup thu cong

```bash
# Backup nhanh
docker exec shared-mysql mysqldump -u root -p"<PASS>" vietnet \
  --single-transaction | gzip > backup_vietnet_$(date +%Y%m%d).sql.gz
```

### 12.3 Restore thu cong

```bash
# 1. Tim backup file
ls -la /opt/vietnet/backups/mysql/

# 2. Tao safety backup truoc khi restore
docker exec shared-mysql mysqldump -u root -p"<PASS>" vietnet | gzip > safety_backup.sql.gz

# 3. Drop va recreate database
docker exec shared-mysql mysql -u root -p"<PASS>" -e "
  DROP DATABASE vietnet;
  CREATE DATABASE vietnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'%';
"

# 4. Restore tu backup
gunzip -c /opt/vietnet/backups/mysql/vietnet_2026-04-16_02-00.sql.gz | \
  docker exec -i shared-mysql mysql -u root -p"<PASS>" vietnet

# 5. Chay migrations (neu co pending)
docker exec vietnet-api npm run migration:run:prod

# 6. Restart services
docker restart vietnet-api vietnet-frontend

# 7. Verify
curl -s http://localhost:4100/api/health
```

### 12.4 Restore tu dong (GitHub Actions)

Trigger: `workflow_dispatch` — `.github/workflows/restore.yml`

Options:
- `date`: Ngay backup cu the hoac "latest"
- Restore DB, run migrations, restart services, health check

### 12.5 Backup Uploads (local storage)

```bash
# Backup volume uploads
docker run --rm -v vietnet_uploads:/data -v /opt/vietnet/backups:/backup \
  alpine tar czf /backup/uploads_$(date +%Y-%m-%d).tar.gz -C /data .

# Restore
docker run --rm -v vietnet_uploads:/data -v /opt/vietnet/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/uploads_2026-04-16.tar.gz"
```

---

## 13. Monitoring & Health Check

### 13.1 Health Check Endpoints

| Service | URL | Response |
|---------|-----|----------|
| Backend | `GET /api/health` | `{ "status": "ok", "uptime": 3600, "database": "connected", "redis": "connected" }` |
| Frontend | `GET /` | HTTP 200 + HTML |
| MySQL | `mysqladmin ping` | "mysqld is alive" |
| Redis | `redis-cli ping` | "PONG" |
| Nginx | `GET /nginx-health` | HTTP 200 |

### 13.2 Docker Health Checks

```yaml
# Backend
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:4000/api/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3

# Frontend
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3

# MySQL
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 10s
  timeout: 5s
  retries: 5

# Redis
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### 13.3 Monitoring Commands

```bash
# Trang thai containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Resource usage
docker stats --no-stream

# Logs (real-time)
docker logs vietnet-api -f --tail 100
docker logs vietnet-frontend -f --tail 100
docker logs shared-nginx -f --tail 100

# MySQL slow queries
docker exec shared-mysql cat /var/log/mysql/slow.log

# Redis memory
docker exec shared-redis redis-cli INFO memory

# Disk usage
docker system df
du -sh /opt/vietnet/backups/
```

### 13.4 Crontab Monitoring

Da cai qua `scripts/crontab.example`:

| Schedule | Task | Log |
|----------|------|-----|
| 2:00 AM hang ngay | MySQL backup | `/var/log/vietnet/cron.log` |
| Moi 30 phut | Disk monitoring (alert > 80%) | `/var/log/vietnet/cron.log` |
| 3:00 AM Chu nhat | Docker cleanup | `/var/log/vietnet/cron.log` |

### 13.5 Process Manager (PM2)

Backend chay PM2 trong production:
```dockerfile
CMD ["pm2-runtime", "dist/main.js", "-i", "4"]
```
- 4 cluster instances (1 per CPU core)
- Auto-restart khi crash
- `pm2-runtime` giu container alive

### 13.6 Application Logging

- Logger: **Pino** voi JSON output
- Moi request co `requestId` de tracing
- Log levels: `error`, `warn`, `info` (production) / them `debug` (dev)
- Sensitive fields (password, token, authorization) tu dong redact

### 13.7 BullMQ Queue Monitoring

- Dashboard: `/admin/queues` (Bull Board — admin-only)
- Queues: `IMAGE_JOB`, `MAIL_JOB`, `TRAFFIC_SYNC_JOB`
- Metrics: active/waiting/completed/failed jobs

---

## 14. Troubleshooting

### 14.1 Container khong start

```bash
# Xem logs chi tiet
docker compose -f docker-compose.prod.yml logs backend

# Kiem tra .env
docker compose -f docker-compose.prod.yml config

# Kiem tra network
docker network ls
docker network inspect webphoto_backend
docker network inspect vietnet_frontend

# Rebuild
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
```

### 14.2 Database connection refused

```bash
# Kiem tra MySQL chay chua
docker exec shared-mysql mysqladmin ping -u root -p

# Kiem tra user/database ton tai
docker exec shared-mysql mysql -u root -p -e "SHOW DATABASES; SELECT user, host FROM mysql.user;"

# Kiem tra network connectivity
docker exec vietnet-api ping shared-mysql

# Tao lai database neu can
docker exec shared-mysql mysql -u root -p -e "
  CREATE DATABASE IF NOT EXISTS vietnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'vietnet'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON vietnet.* TO 'vietnet'@'%';
  FLUSH PRIVILEGES;
"
```

### 14.3 Nginx 502 Bad Gateway

```bash
# Kiem tra containers dang chay
docker ps --filter 'name=vietnet'

# Kiem tra shared-nginx co tren dung network
docker inspect shared-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
# Phai co: webphoto_frontend, vietnet_frontend

# Ket noi lai neu thieu
docker network connect vietnet_frontend shared-nginx

# Test nginx config
docker exec shared-nginx nginx -t

# Reload
docker exec shared-nginx nginx -s reload
```

### 14.4 Frontend build that bai

```bash
# Kiem tra TypeScript errors
cd frontend && npx tsc --noEmit

# Kiem tra env vars NEXT_PUBLIC_* co duoc truyen vao build args
docker compose -f docker-compose.prod.yml config | grep NEXT_PUBLIC

# Rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### 14.5 API 401 Unauthorized

```bash
# Kiem tra JWT_SECRET giong nhau
docker exec vietnet-api env | grep JWT

# Kiem tra CORS
docker exec vietnet-api env | grep ALLOWED_ORIGINS

# Kiem tra cookie domain
# Neu domain khac → refresh token khong gui duoc
```

### 14.6 Upload khong duoc

```bash
# Kiem tra volume mount
docker exec vietnet-api ls -la /app/uploads/

# Kiem tra quyen ghi
docker exec vietnet-api touch /app/uploads/test && echo "OK" || echo "NO WRITE"

# Kiem tra R2 config (neu dung)
docker exec vietnet-api env | grep R2

# Kiem tra Nginx max body size (20M)
docker exec shared-nginx nginx -T | grep client_max_body_size
```

### 14.7 Migration loi

```bash
# Xem migration status
docker exec vietnet-api npx typeorm migration:show -d dist/database/data-source.js

# Chay lai migration
docker exec vietnet-api npm run migration:run:prod

# Neu can revert migration cuoi
docker exec vietnet-api npx typeorm migration:revert -d dist/database/data-source.js
```

### 14.8 SSL Certificate het han

```bash
# Renew
certbot renew

# Copy vao Docker volume neu can
CERT_VOL=$(docker volume inspect webphoto_certbot_data --format '{{.Mountpoint}}')
cp -rL /etc/letsencrypt/live/bhquan.store/* $CERT_VOL/live/bhquan.store/

# Reload nginx
docker exec shared-nginx nginx -s reload
```

### 14.9 Out of memory

```bash
# Kiem tra memory usage
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Xoa unused images/volumes
docker system prune -a --volumes

# Tang memory limit trong docker-compose.prod.yml
# deploy.resources.limits.memory: 8G
```

### 14.10 Port xung dot

VietNet dung port rieng tranh xung dot voi cac project khac tren shared VPS:

| Project | Frontend | Backend | MySQL | Redis |
|---------|----------|---------|-------|-------|
| WebPhoto | 3000 | 4000 | 3306 | 6379 |
| **VietNet** | **3100** | **4100** | **3307** | **6380** |
| LeQuyDon | 3200 | 4200 | 3308 | 6381 |
| FashionEcom | 3300 | 4300 | 3309 | 6382 |

Neu port bi chiem, sua trong `.env` va restart.

---

## 15. Port Map & Resource Limits

### Tong hop Ports

| Service | Dev Local | Dev Docker | Prod Docker | Exposed |
|---------|-----------|------------|-------------|---------|
| Frontend | 3000 | 3100 → 3000 | 3100 → 3000 | Qua shared-nginx |
| Backend | 4000 | 4100 → 4000 | 4100 → 4000 | Qua shared-nginx |
| MySQL | 3306 | 3307 → 3306 | Internal only | Shared |
| Redis | 6379 | 6380 → 6379 | Internal only | Shared |
| Nginx (dev) | — | 5100/5101 | — | — |
| Nginx (prod) | — | — | 80/443 | Internet (shared-nginx) |

### Tong hop Resource Limits

| Moi truong | Backend | Frontend | MySQL | Redis | Tong |
|------------|---------|----------|-------|-------|------|
| **Dev Docker** | 2 CPU / 4G | 1 CPU / 4G | 0.5 CPU / 5G | 0.5 CPU / 2G | 4 CPU / 15G |
| **Production** | 2 CPU / 4G | 1 CPU / 4G | 0.5 CPU / 5G | 0.5 CPU / 2G | 4 CPU / 15G |

### Logging

Tat ca containers:
```yaml
logging:
  driver: json-file
  options:
    max-size: "50m"
    max-file: "5"
```
→ Toi da 250 MB log/container (5 files x 50 MB), 1.25 GB total cho 5 services.

### Disk Budget (160GB SSD)

| Category | Estimated | Location |
|----------|-----------|----------|
| OS + Docker | 10 GB | Root filesystem |
| Docker images | 5 GB | /var/lib/docker |
| MySQL data | 20 GB | mysql_data volume |
| Redis AOF | 2 GB | redis_data volume |
| Logs | 3 GB | Container logs |
| Backups (local) | 10 GB | /opt/vietnet/backups |
| Free space | 110 GB | Reserve |

---

## Quick Reference Card

### Lenh hay dung

```bash
# === DEVELOPMENT ===
cd backend && npm run dev                   # Backend dev (http://localhost:4000)
cd frontend && npm run dev                  # Frontend dev (http://localhost:3000)
run-local.bat                               # Windows: start tat ca
docker compose -f docker-compose.yml \
  -f docker-compose.dev.yml up -d           # Docker dev (hot reload)

# === PRODUCTION ===
bash scripts/quick-deploy.sh 188.166.190.81 bhquan.store    # First deploy
bash scripts/update-deploy.sh 188.166.190.81                 # Update deploy
docker compose -f docker-compose.prod.yml up -d              # Start (tren VPS)
docker compose -f docker-compose.prod.yml down               # Stop
docker compose -f docker-compose.prod.yml build --no-cache   # Rebuild
docker compose -f docker-compose.prod.yml logs -f            # Logs

# === DATABASE ===
npm run migration:run                       # Dev migrations
docker exec vietnet-api npm run migration:run:prod  # Prod migrations
npm run seed:admin                          # Seed admin (dev)
npm run seed:data                           # Seed data (dev)
bash scripts/seed-all.sh 188.166.190.81     # Seed data (VPS)

# === TESTING ===
cd frontend && npx tsc --noEmit             # Type check FE
cd backend && npx tsc --noEmit              # Type check BE
cd frontend && npm run test:e2e             # E2E tests
BASE_URL=http://localhost:3000 npm run test:e2e  # E2E local

# === MONITORING ===
docker ps                                   # Container status
docker stats                                # Resource usage
curl localhost:4100/api/health              # API health (VPS)

# === BACKUP ===
docker exec shared-mysql mysqldump -u root -p vietnet | gzip > backup.sql.gz

# === NGINX ===
vim /opt/webphoto/nginx/conf.d/bhquan.store.conf
docker exec shared-nginx nginx -t           # Test config
docker exec shared-nginx nginx -s reload    # Reload config

# === CLEANUP ===
docker system prune -a                      # Xoa unused images
docker volume prune                         # Xoa unused volumes
```

### URL Quan trong

| URL | Muc dich |
|-----|---------|
| `https://bhquan.store` | Production site |
| `https://bhquan.store/admin` | Admin CMS |
| `https://bhquan.store/api/health` | API health check |
| `http://localhost:3000` | Dev frontend |
| `http://localhost:4000/api/health` | Dev API health |

---

> **Tai lieu nay huong dan trien khai day du he thong VietNet Interior CMS.**
> Tu local development → Docker development → Production VPS.
> Bao gom: setup, migration, seed, Nginx, SSL, CI/CD, backup, monitoring, troubleshooting.
