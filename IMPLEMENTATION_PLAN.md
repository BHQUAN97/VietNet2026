# 📅 ROADMAP TRIỂN KHAI VIETNET (6 GIAI ĐOẠN)

### GIAI ĐOẠN 1: CORE & INFRA (Tuần 1)
- Setup Docker: MySQL, Redis, Nginx, App.
- Cấu hình Nginx Micro-caching và Gzip/Brotli.
- Khởi tạo Base Backend & Frontend (Rules 1-10).

### GIAI ĐOẠN 2: MEDIA & IDENTITY (Tuần 2)
- Code Module Auth (JWT/Refresh Token/RBAC).
- **Module Media:** Setup BullMQ + Sharp. Đảm bảo upload ảnh mượt mà.
- Setup Resend API cho Mail Service.

### GIAI ĐOẠN 3: CMS CORE & SEO (Tuần 3)
- Module Danh mục & Bài viết dự án (Tham khảo nlhome.vn).
- Code SEO Engine: Sitemap động, JSON-LD, Dynamic Metadata.
- Traffic Counter: Middleware ghi nhận lượt xem vào Redis.

### GIAI ĐOẠN 4: PAGE BUILDER & PREVIEW (Tuần 4)
- JSON Config cho trang chủ.
- UI Admin sửa Banner/Block.
- Tính năng **Preview Mode** cho Admin.

### GIAI ĐOẠN 5: REAL-TIME & ANALYTICS (Tuần 5)
- Socket.io cho thông báo Admin (Liên hệ mới).
- Dashboard thống kê: Lọc Bot & IP nội bộ.
- Sync Job: Redis -> MySQL mỗi 10 phút.

### GIAI ĐOẠN 6: MAINTENANCE (Tuần 6)
- **Log Rotation:** Cấu hình Docker log max-size 10MB để không đầy ổ cứng 160GB.
- **Auto Backup:** Script dump MySQL đẩy lên S3/Google Drive hàng ngày.
- Stress test & Tối ưu PageSpeed (>90 điểm Mobile).