# 🛒 ĐẶC TẢ CHI TIẾT VIETNET INTERIOR

## 1. THAM CHIẾU: nlhome.vn
- Giao diện: Tối giản, sang trọng, tập trung vào hình ảnh công trình thực tế.
- UX: Scroll mượt mà, hiệu ứng Fade-in khi vào trang.

## 2. CHI TIẾT TECH STACK
- **Email:** Resend (Dễ dùng, tin cậy hơn SMTP truyền thống).
- **Image:** Sharp (Xử lý cực nhanh trên 4 core CPU).
- **Queue:** BullMQ (Xử lý nền mạnh mẽ nhất cho Node.js).
- **Analytics:** Redis INCR (Tốc độ cao, không làm chậm DB chính).

## 3. LOGIC TRACKING NÂNG CAO
- Sử dụng `user-agent` để phát hiện Bot (Google, Bing, Facebook).
- Không cộng dồn View khi Admin F5 trang (Check session/IP).
- Thống kê theo: Page dẫn đầu, Nguồn truy cập, Thiết bị (Mobile vs Desktop).