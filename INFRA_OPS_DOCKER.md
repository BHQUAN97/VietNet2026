# 🐳 HẠ TẦNG & TRIỂN KHAI (INFRASTRUCTURE & OPS)

## 1. Cấu hình Docker (4 Core / 16GB RAM)
- **Service 1: Nginx** (Reverse Proxy & Cache)
  - Giới hạn `client_max_body_size 20M` cho upload ảnh.
  - Cấu hình Gzip & Brotli để nén file CSS/JS.
- **Service 2: NestJS App**
  - Chạy Cluster mode (pm2) để tận dụng 4 Core.
  - Resource Limit: CPU 2.0, RAM 4GB.
- **Service 3: Next.js FE** (SSR Mode)
  - Resource Limit: CPU 1.0, RAM 4GB.
- **Service 4: MySQL 8**
  - Cấu hình `innodb_buffer_pool_size=4G` (Tối ưu cho 16GB RAM).
- **Service 5: Redis**
  - Dùng làm Cache layer & Queue (BullMQ).

## 2. Quản lý Tài nguyên (Disk 160GB)
- **Log Rotation:** Giới hạn mỗi file log tối đa 50MB, lưu tối đa 5 file. (Lệnh: `max-size: "50m"`, `max-file: "5"`).
- **Media Storage:** Lưu ảnh trong Volume Docker gắn ngoài hoặc Cloudflare R2 để không làm nặng Container.

## 3. Quy trình triển khai (Git Pipeline)
- **Branch main:** Đẩy code -> GitHub Actions tự build Docker Image -> SSH vào Server kéo Image mới -> `docker-compose up -d`.
- **Database Migration:** Chạy lệnh `npm run migration:run` ngay sau khi container DB khởi động xong.