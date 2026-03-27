# 🛡️ CHI TIẾT QUY CHUẨN CODE (RULES V2.1)

## 1. BACKEND (NESTJS)
- **Rule 9 (Template Method):** Mọi Service tạo/sửa dữ liệu PHẢI kế thừa `BaseService`.
- **Rule 13 (Worker):** BullMQ xử lý 3 loại Job: `MAIL_JOB`, `IMAGE_JOB`, `TRAFFIC_SYNC_JOB`.
- **Rule 26 (Media Optimization):** 
    - Ảnh gốc -> Resize 2048px (Desktop), 768px (Mobile).
    - Convert 100% sang `.webp` chất lượng 80.
    - Xóa EXIF data để bảo mật và giảm dung lượng.
- **Rule 27 (Spam Protection):** Sử dụng `ThrottlerModule` bảo vệ các endpoint `POST /contact`.

## 2. FRONTEND (NEXT.JS)
- **Rule 4 (Cache Invalidation):** Sau khi Admin sửa bài, gọi `revalidatePath` hoặc `revalidateTag`.
- **Rule 9 (Popup Registry):** Không import Modal bừa bãi. Dùng một `ModalManager` để quản lý mở/đóng.
- **Rule 16 (SEO Social):** Mỗi trang dự án phải có:
    - `<title>` và `<meta description>` chứa từ khóa nội thất.
    - `og:image`: Ảnh đại diện công trình chất lượng cao.
    - `canonical tag`: Tránh trùng lặp URL.
- **Rule 21 (Admin Preview):** Cho phép Admin xem trang chủ với dữ liệu chưa Publish qua một URL bí mật (Token-based).