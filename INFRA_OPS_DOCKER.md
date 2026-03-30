# INFRASTRUCTURE & OPS V3.0

> Docker Compose | VPS 4 Core / 16GB RAM / 160GB SSD
> Domain: bhquan.site | SSL: Cloudflare | Media: Cloudflare R2

---

## 1. Docker Services Overview

All services run within a single `docker-compose.yml` on the VPS. Inter-service communication uses Docker's internal network. Only Nginx exposes ports to the host.

```
Internet --> Cloudflare (SSL/CDN) --> VPS:443 --> Nginx Container
                                                    |
                            +-----------+-----------+-----------+
                            |           |           |           |
                         NestJS      Next.js      MySQL       Redis
                        :4000       :3000        :3306       :6379
                       (internal)  (internal)   (internal)  (internal)
```

### Service 1: Nginx (Reverse Proxy and Cache)

- Image: `nginx:alpine`
- Ports exposed: `80:80`, `443:443` (host-mapped)
- Upstream routing:
  - `/api/*` and `/socket.io/*` --> NestJS on port 4000
  - All other requests --> Next.js on port 3000
- Configuration:
  - `client_max_body_size 20M` for file uploads
  - Gzip compression for text/html, text/css, application/javascript, application/json, image/svg+xml
  - Brotli compression (via ngx_brotli module) for the same MIME types
  - Micro-caching with 1-second TTL for public API endpoints (GET requests only, excluding auth endpoints)
  - Cache bypass for requests with `Authorization` header or `Set-Cookie` in response
  - SSL termination handled by Cloudflare; Nginx receives traffic over HTTP from Cloudflare proxy
  - Proxy headers: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`
- Health check: Nginx returns 200 on `/nginx-health`

### Service 2: NestJS App (Backend API)

- Image: Custom Dockerfile (Node 20 Alpine + pm2)
- Internal port: 4000
- Process management: pm2 cluster mode, 4 instances (one per CPU core)
- Resource limits: `cpus: 2.0`, `mem_limit: 4g`
- Environment variables loaded from `.env` file
- Depends on: MySQL (healthy), Redis (healthy)
- Restart policy: `unless-stopped`
- Volumes: None (stateless; media stored in Cloudflare R2)

### Service 3: Next.js FE (SSR)

- Image: Custom Dockerfile (Node 20 Alpine, `next start`)
- Internal port: 3000
- Resource limits: `cpus: 1.0`, `mem_limit: 4g`
- Environment: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`
- Depends on: NestJS (healthy)
- Restart policy: `unless-stopped`
- ISR cache stored in container filesystem (ephemeral, rebuilt on deploy)

### Service 4: MySQL 8.0

- Image: `mysql:8.0`
- Internal port: 3306 (not exposed to host)
- Configuration (`my.cnf` or command flags):
  - `innodb_buffer_pool_size=4G` (optimized for 16GB RAM)
  - `innodb_log_file_size=256M`
  - `max_connections=200`
  - `character-set-server=utf8mb4`
  - `collation-server=utf8mb4_unicode_ci`
  - `slow_query_log=ON` with `long_query_time=2`
- Volumes: Named volume `mysql_data` for data persistence
- Health check: `mysqladmin ping -h localhost`
- Resource limits: `cpus: 0.5`, `mem_limit: 5g`

### Service 5: Redis 7

- Image: `redis:7-alpine`
- Internal port: 6379 (not exposed to host)
- Roles:
  - Cache layer (NestJS CacheModule)
  - BullMQ job queue (IMAGE_JOB, MAIL_JOB, TRAFFIC_SYNC_JOB)
  - Socket.io adapter (multi-instance pub/sub)
- Configuration:
  - `maxmemory 1gb`
  - `maxmemory-policy allkeys-lru`
  - `appendonly yes` (AOF persistence)
- Volumes: Named volume `redis_data` for persistence
- Health check: `redis-cli ping`
- Resource limits: `cpus: 0.5`, `mem_limit: 2g`

---

## 2. Resource Management (160GB SSD)

### Disk Budget

| Category        | Estimated Usage | Location           |
|-----------------|----------------|--------------------|
| OS and Docker   | 10 GB          | Root filesystem    |
| Docker images   | 5 GB           | /var/lib/docker    |
| MySQL data      | 20 GB          | mysql_data volume  |
| Redis AOF       | 2 GB           | redis_data volume  |
| Logs            | 3 GB           | Container logs     |
| Backups (local) | 10 GB          | /opt/backups       |
| Free space      | 110 GB         | Reserve            |

### Log Rotation

All Docker services use the `json-file` logging driver:

```yaml
logging:
  driver: json-file
  options:
    max-size: "50m"
    max-file: "5"
```

This caps total log storage at 250MB per service (5 files x 50MB), 1.25GB total for 5 services.

### Media Storage

All user-uploaded media is stored in Cloudflare R2, not on the VPS:

- Private bucket: Original uploads (full resolution)
- Public bucket: Processed images (thumbnails, WebP previews)
- No media files reside inside Docker containers or volumes

### Database Backups

- Schedule: Daily at 03:00 UTC via cron on the host
- Method: `mysqldump` executed inside the MySQL container
- Local retention: 7 days in `/opt/backups/mysql/`
- Remote: Upload compressed dump to S3-compatible storage or Google Drive via rclone
- Backup script location: `/opt/scripts/backup-mysql.sh`

```bash
# Example backup command
docker exec mysql-container mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
  --single-transaction --routines --triggers vietnet_db \
  | gzip > /opt/backups/mysql/vietnet_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 3. Deploy Pipeline

### Workflow: main branch push to production

```
Developer pushes to main
  --> GitHub Actions triggered
    --> Step 1: Run lint + typecheck (tsc --noEmit)
    --> Step 2: Run tests (vitest run)
    --> Step 3: Build Docker images (FE + BE)
    --> Step 4: Push images to container registry (GHCR or Docker Hub)
    --> Step 5: SSH into VPS
      --> Pull new images
      --> Run database migrations: npm run migration:run
      --> docker-compose up -d (rolling restart)
      --> Health check: curl https://bhquan.site/api/health
      --> If health check fails: rollback to previous image tag
```

### Migration Safety

- Migrations run after the MySQL container reports healthy
- Command: `docker exec nestjs-container npm run migration:run`
- Destructive migrations (drop column, drop table) require manual approval in the GitHub Actions workflow
- Always backup the database before running migrations

### Rollback Procedure

1. Keep the previous Docker image tag (do not prune immediately after deploy)
2. If the new deploy fails health check or shows errors in logs:
   ```bash
   docker-compose down
   # Update docker-compose.yml to reference previous image tags
   docker-compose up -d
   ```
3. If a migration must be reverted: run `npm run migration:revert` inside the NestJS container
4. Verify rollback with health check and manual smoke test

### Zero-Downtime Considerations

- Nginx upstream health checks detect unresponsive backends
- NestJS pm2 cluster mode performs graceful reload (one worker at a time)
- Next.js container replacement causes a brief ISR cache miss (acceptable)

---

## 4. Monitoring

### Log Access

```bash
# View NestJS logs (last 200 lines, follow)
docker logs --tail 200 -f nestjs-container

# View Nginx access logs
docker logs --tail 200 -f nginx-container

# View MySQL slow query log
docker exec mysql-container cat /var/log/mysql/slow.log
```

### NestJS Application Logs

- Logger: Pino with JSON output
- Every request logged with a unique `requestId` for tracing
- Log levels: `error`, `warn`, `info` (no `debug` in production)
- Sensitive fields (password, token, authorization) are redacted automatically

### Nginx Logs

- Access log format: Combined with `$request_time` and `$upstream_response_time`
- Error log level: `warn`
- Logs available via `docker logs` (stdout/stderr)

### Redis Queue Monitoring

- BullMQ dashboard: Accessible via admin-only route `/admin/queues` (Bull Board)
- Monitor metrics: active jobs, waiting jobs, completed jobs, failed jobs
- Alert condition: Failed jobs count > 10 in 5 minutes

### Health Check Endpoint

```
GET /api/health

Response 200:
{
  "status": "ok",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "timestamp": "2026-03-27T10:00:00Z"
}
```

### Disk Space Monitoring

- Cron job runs hourly: `df -h / | awk 'NR==2 {print $5}'`
- Alert if disk usage exceeds 80%
- Auto-cleanup: Remove backup files older than 7 days, prune unused Docker images weekly

---

## 5. Docker Compose Reference

```yaml
version: "3.8"

services:
  nginx:
    image: custom-nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      nestjs:
        condition: service_healthy
      nextjs:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"

  nestjs:
    image: vietnet-api:latest
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "4000"
    env_file: .env
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 4g
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"

  nextjs:
    image: vietnet-fe:latest
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000"
    env_file: .env.frontend
    depends_on:
      nestjs:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 4g
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"

  mysql:
    image: mysql:8.0
    command: >
      --innodb-buffer-pool-size=4G
      --innodb-log-file-size=256M
      --max-connections=200
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --slow-query-log=ON
      --long-query-time=2
    env_file: .env
    volumes:
      - mysql_data:/var/lib/mysql
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 5g
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"

  redis:
    image: redis:7-alpine
    command: >
      redis-server
      --maxmemory 1gb
      --maxmemory-policy allkeys-lru
      --appendonly yes
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 2g
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"

volumes:
  mysql_data:
  redis_data:
```
