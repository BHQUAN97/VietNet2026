# 🏆 VIETNET INTERIOR - MASTER BLUEPRINT (V2.1)
> **Focus:** High SEO, Mobile-First, Image Optimization, Clean Architecture.

## 🏗️ 1. TỔNG QUAN HỆ THỐNG
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Shadcn UI.
- **Backend:** NestJS (Modular), BullMQ (Async Tasks).
- **Data:** MySQL 8.0, Redis (Cache, Queue, Socket, Analytics).
- **Hạ tầng:** Docker Compose, Nginx (Micro-caching), Cloudflare.
- **Dịch vụ:** Resend (Mail), Socket.io (Real-time).

## 🛡️ 2. QUY TẮC CỐT LÕI (CORE RULES)
### 🟦 Backend (28 Rules - Top Priority)
1. **Rule 3 (Template Method):** Base CRUD: `beforeSave` -> `validate` -> `saveData` -> `afterSave`.
2. **Rule 12 (Media Pipeline):** Không xử lý ảnh trực tiếp. Request -> BullMQ -> Sharp (Resize/WebP) -> Storage.
3. **Rule 13 (Background Worker):** Gửi mail, Sync traffic, nén ảnh phải chạy ngầm.
4. **Rule 15 (Performance):** Nginx Micro-caching 1s cho Public API; Redis cache cho Query nặng.
5. **Rule 27 (Security):** Rate Limiting 5 req/phút cho Form liên hệ để chống spam mail.
6. **Rule 28 (Audit):** Tự động log `created_by/at` và `updated_by/at` cho mọi bảng.

### 🟧 Frontend (22 Rules - Top Priority)
1. **Rule 15 (Adaptive Image):** Dùng `next/image`, luôn có `alt` text từ tên dự án để SEO.
2. **Rule 16 (Dynamic SEO):** Metadata động + Open Graph (OG) tags cho mỗi bài viết dự án.
3. **Rule 21 (Preview Mode):** Dùng Next.js Draft Mode để Admin xem trước Page Builder.
4. **Rule 22 (Hydration):** 100% Server-side Rendering cho các trang khách hàng để Google Index.

## 📦 3. MODULE NGHIỆP VỤ
- **CMS Dự án:** Quản lý Gallery, vật liệu, thông tin SEO.
- **Page Builder:** Tùy chỉnh trang chủ qua JSON Config.
- **Traffic Analytics:** Đọc từ Redis, lọc Bot & IP Admin.
- **Media Manager:** Tự động tối ưu ảnh 4K thành WebP đa kích cỡ.