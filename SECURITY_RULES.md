# 🛡️ KIỂM TRA AN NINH (SECURITY STANDARDS)

## 1. Bảo vệ đầu vào (Input Sanitization)
- **Rule:** Mọi dữ liệu HTML từ Editor (TinyMCE/CKEditor) gửi lên phải qua bộ lọc **DOMPurify** (Backend) để loại bỏ các tag `<script>` hoặc thuộc tính `onerror` (Chống XSS).
- **Validation:** Sử dụng `class-validator` (NestJS) bắt buộc đúng kiểu dữ liệu, không chấp nhận các ký tự lạ trong Slug.

## 2. Chống Spam & Tấn công (Defense)
- **Rate Limiting:** 
  - Login: Tối đa 5 lần sai/10 phút. Nếu vượt quá, khóa IP 30 phút.
  - Form liên hệ: Mỗi IP chỉ được gửi 1 yêu cầu/phút.
- **SQL Injection:** 100% sử dụng TypeORM Query Builder hoặc Prisma. Tuyệt đối không cộng chuỗi SQL.

## 3. Quản lý Phiên đăng nhập (Session)
- **JWT:** Lưu trong `HttpOnly Cookie`. 
- **CORS:** Chỉ cho phép domain chính thức và domain Admin được truy cập API.
- **Security Headers:** Cấu hình Helmet để bật `Strict-Transport-Security`, `X-Content-Type-Options`.