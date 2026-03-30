# VIETNET INTERIOR — MASTER BLUEPRINT V3.0
> Focus: High SEO, Mobile-First, Image Optimization, Clean Architecture
> Reference: nlhome.vn | Domain: bhquan.site

---

## 1. TONG QUAN HE THONG

- **Public Web:** Gioi thieu cong trinh, san pham noi that. Toi uu SEO diem tuyet doi (90+ Mobile PageSpeed). Giao dien toi gian, sang trong, tap trung vao hinh anh cong trinh thuc te. Scroll muot ma, hieu ung Fade-in khi vao trang.
- **Admin Panel:** CMS quan ly toan bo noi dung, Page Builder (JSON config) tuy chinh trang chu linh hoat, theo doi traffic analytics, quan ly tu van.
- **Consulting:** Form lien he, thong bao real-time den admin qua Socket.io, gui mail tu van qua Resend API.
- **Quy mo:** 300 users/ngay, 5 Admin. Team: 1 Dev + Claude AI.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| Backend | NestJS (modular), TypeScript, TypeORM/Prisma |
| Database | MySQL 8.0 |
| Cache/Queue/Realtime | Redis 7 — Cache, BullMQ queue, Socket.io adapter, Analytics counters (INCR) |
| Email | Resend API |
| Image Processing | Sharp — resize, WebP conversion, EXIF removal |
| Real-time | Socket.io (rooms: `user:{userId}`, `admin`) |
| Infrastructure | Docker Compose, Nginx (micro-caching 1s, Gzip/Brotli), Cloudflare CDN |
| Storage | Cloudflare R2 — private bucket (originals), public bucket (thumb/preview) |
| Hardware | 4 Core CPU, 16GB RAM, 160GB SSD |

---

## 3. MODULE NGHIEP VU

### 3.1 Auth Module
JWT access token 60min + refresh token 7 days (HttpOnly cookies). RBAC middleware: `requireAuth`, `requireAdmin`, `requirePlan`.

### 3.2 Media Module
Upload -> BullMQ job -> Sharp processing (2048px desktop / 768px mobile, WebP 80% quality, strip EXIF) -> Cloudflare R2 storage. Khong xu ly anh truc tiep trong request — luon chay qua background worker.

### 3.3 CMS Module
Quan ly du an/bai viet, Gallery cong trinh, thong tin vat lieu, SEO metadata dong + Open Graph tags cho moi bai viet. 100% Server-side Rendering cho trang public de Google index.

### 3.4 Page Builder Module
JSON config cho homepage. Admin edit mode truc tiep tren giao dien. Next.js Draft Mode de Admin xem truoc thay doi truoc khi publish.

### 3.5 Contact/Consultation Module
Form submission tu khach hang. Rate-limited: 1 req/min per IP de chong spam. Thong bao real-time den admin qua Socket.io ngay khi co form moi.

### 3.6 Traffic Analytics Module
Redis INCR counters cho moi page view. Bot detection qua user-agent (Google, Bing, Facebook). Exclude admin IPs — khong cong don view khi admin F5 (check session/IP). Redis -> MySQL sync moi 10 phut. Thong ke theo: top pages, nguon truy cap, thiet bi (Mobile vs Desktop).

### 3.7 Mail Service
Resend API gui mail qua BullMQ `MAIL_JOB`. Xu ly nen — khong block request chinh.

### 3.8 Catalog Module
Danh muc san pham tu bep. Loc theo vat lieu, quan ly danh muc (category). Hien thi gia hang co the bat/tat.

---

## 4. DATABASE CONVENTIONS

- ULID cho tat ca primary keys
- Soft delete (`deleted_at` column)
- Auto-audit: `created_by`, `created_at`, `updated_by`, `updated_at` tu dong qua NestJS Interceptor
- 100% parameterized queries — khong bao gio noi chuoi SQL
- Transactions cho moi thao tac ghi nhieu bang
- Schema changes chi thuc hien qua code migrations

---

## 5. LOGIC TRACKING NANG CAO

- Su dung `user-agent` de phat hien Bot (Google, Bing, Facebook) — khong tinh vao page view
- Khong cong don View khi Admin F5 trang (check session/IP whitelist)
- Thong ke theo:
  - **Top pages:** Trang nao duoc xem nhieu nhat
  - **Traffic sources:** Nguon truy cap (direct, referral, search engine)
  - **Device type:** Mobile vs Desktop ratio

---

## 6. DESIGN SCREENS MAP

Tat ca file design nam trong `DESIGN/web_library/stitch_vietnet/`. Moi folder chua `screen.png` (hinh giao dien) va `code.html` (markup tham khao).

### Public Website

| Man hinh | Desktop | Mobile |
|---|---|---|
| Homepage (Viewer) | `vietnet_homepage_viewer_mode_desktop`, `vietnet_homepage_viewer_mode` | `vietnet_homepage_mobile`, `vietnet_mobile_homepage_c_gi_h_ng` |
| Homepage (Edit Mode) | `vietnet_homepage_edit_mode_desktop` | `vietnet_homepage_edit_mode` |
| Homepage Concepts | `interior_design_company_homepage_1`, `interior_design_company_homepage_2`, `interior_design_company_homepage_3` | -- |
| Product Catalog | `danh_m_c_s_n_ph_m_t_b_p`, `danh_m_c_s_n_ph_m_t_b_p_c_gi_h_ng` | `kitchen_cabinet_catalog_mobile`, `vietnet_mobile_catalog_c_gi_h_ng` |

### Admin Dashboard

| Man hinh | Desktop | Mobile |
|---|---|---|
| Dashboard Overview | `vietnet_admin_dashboard_desktop`, `admin_dashboard_overview`, `vietnet_admin_dashboard_overview` | `vietnet_mobile_admin_c_gi_h_ng` |
| Post Management | `vietnet_post_management_desktop`, `admin_post_management` | -- |
| Consultation Management | `vietnet_consultation_management` | -- |

### Design System

| File | Noi dung |
|---|---|
| `DESIGN/mobile_library/01-11.svg` | 11 file SVG — Reusable mobile UI components |
| `DESIGN/web_library/stitch_vietnet/maison_terre/DESIGN.md` | Design system "Curated Atelier" — phong cach, typography, spacing |

---

## 7. QUY TAC COT LOI

### Backend (Top Priority)
1. **Template Method:** Base CRUD: `beforeSave` -> `validate` -> `saveData` -> `afterSave`
2. **Media Pipeline:** Request -> BullMQ -> Sharp (Resize/WebP) -> R2 Storage. Khong xu ly anh inline.
3. **Background Worker:** Gui mail, sync traffic, nen anh phai chay nen qua BullMQ.
4. **Performance:** Nginx micro-caching 1s cho Public API. Redis cache cho query nang.
5. **Security:** Rate limiting cho form lien he. 100% parameterized queries.
6. **Audit:** Tu dong log `created_by/at` va `updated_by/at` cho moi bang.

### Frontend (Top Priority)
1. **Adaptive Image:** Dung `next/image`, luon co `alt` text tu ten du an de SEO.
2. **Dynamic SEO:** Metadata dong + Open Graph tags cho moi bai viet/du an.
3. **Preview Mode:** Dung Next.js Draft Mode de Admin xem truoc Page Builder.
4. **Hydration:** 100% Server-side Rendering cho cac trang public de Google index.
