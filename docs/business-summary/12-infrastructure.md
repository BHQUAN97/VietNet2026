# 12. Infrastructure & DevOps

> Module: Stage 1 (Infra) + Stage 6 (Optimization) + INFRA_OPS_DOCKER.md
> Priority: P0 | Status: Spec Done

---

## Summary

Ha tang Docker Compose tren VPS (4 Core / 16GB RAM / 160GB SSD). 5 services: Nginx (reverse proxy + micro-cache), NestJS (API), Next.js (FE), MySQL 8, Redis 7. Domain: bhquan.site qua Cloudflare CDN. Bao gom log rotation, backup, monitoring, va performance optimization.

---

## Workflow

### Development
```
docker-compose up -d
  → Nginx (port 80/443) → proxy:
      /api/*   → NestJS (4100:4000)
      /*       → Next.js (3100:3000)
  → MySQL (3306)
  → Redis (6379)
```

### Deployment
```
git push → SSH vao VPS:
  → docker-compose pull
  → docker-compose up -d --build
  → docker-compose logs -f (verify)
```

### Health Check
```
GET /api/health → { status, database, redis, r2, bullmq, version }
  → 200 OK: tat ca services connected
  → 503 Degraded: co service disconnected
```

---

## Giai phap chi tiet

### Docker Services (5)

| Service | Image | Port | Config |
|---------|-------|------|--------|
| Nginx | nginx:1.25 | 80, 443 | Reverse proxy, Gzip/Brotli, micro-cache 1s |
| NestJS | node:20-alpine | 4100→4000 | API server |
| Next.js | node:20-alpine | 3100→3000 | SSR frontend |
| MySQL | mysql:8.0 | 3306 | innodb_buffer_pool_size=4G, utf8mb4 |
| Redis | redis:7-alpine | 6379 | maxmemory 1gb, allkeys-lru, AOF |

### Nginx Config

- Reverse proxy: /api/* → NestJS, /* → Next.js
- Micro-caching: 1s TTL cho public GET (proxy_cache)
- Gzip: level 6, min 1KB
- Brotli: level 6
- Security headers: X-Frame-Options, X-Content-Type-Options
- Rate limiting: 100 req/min general

### MySQL Config

```
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
max_connections = 100
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

### Redis Config

```
maxmemory 1gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

### Log Rotation

- Docker: max-size 50MB, max-file 5 per container
- MySQL slow query log: rotate weekly

### Backup Strategy

- MySQL: daily dump, 7-day local retention, remote upload via rclone
- Redis: AOF persistence, snapshot every 60s if 1000+ keys changed
- Media (R2): managed by Cloudflare

### Monitoring

- Disk usage alert: > 80%
- Docker image pruning: weekly cleanup
- Health endpoint: /api/health check DB + Redis + R2 + BullMQ
- Pino structured logging voi requestId

### Performance Targets

| Metric | Target |
|--------|--------|
| PageSpeed Mobile | 90+ |
| API Response (list) | < 200ms |
| API Response (detail) | < 100ms |
| Image Processing | < 5s (5MB file) |
| Homepage TTFB | < 500ms |

### BullMQ Queues Summary

| Queue | Job | Schedule | Concurrency | Retry |
|-------|-----|----------|-------------|-------|
| image-processing | IMAGE_JOB | On upload | 3 | 3x exponential |
| email | MAIL_JOB | On event | 5 | 3x exponential |
| analytics | TRAFFIC_SYNC_JOB | */10 * * * * | 1 | — |
| maintenance | CLEANUP_JOB | 0 3 * * * | 1 | — |
