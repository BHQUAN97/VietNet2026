# 🛡️ QUY TẮC KIẾN TRÚC (MASTER RULES V3.0)

## 1. BACKEND RULES (NESTJS - 25 RULES)
1. **Layered Responsibility:** Controller -> Service -> Repository -> Entity.
2. **Interface-first:** Luôn định nghĩa Interface trước khi Implement Class.
3. **Template Method (Base CRUD):** Hook flow: `beforeSave` -> `validate` -> `saveData` -> `afterSave`.
4. **DI via Factory:** Đăng ký Dependency tập trung tại Module.
5. **Global Filter:** 1 lớp catch lỗi duy nhất format JSON đồng nhất.
6. **Structured Logging:** Log 5 mức (Pino) kèm RequestID để debug Docker.
7. **Transactions:** Bắt buộc dùng cho ghi nhiều bảng.
8. **Slim Controller:** 1 endpoint = 1 service call.
9. **Strict DTO:** Validate input bằng class-validator tại cổng vào.
10. **Guard-Clause:** Check sai và throw ngay đầu method.
11. **Async Pattern:** Async toàn chain; Task.WhenAll cho tác vụ song song.
12. **Background Job:** Nén ảnh (Sharp), gửi mail qua BullMQ + Redis.
13. **Soft Delete:** Dùng `deleted_at` cho mọi bảng.
14. **Performance:** Cache query nặng vào Redis; Tránh N+1 query.
15. **Security:** Parameterized query; Rate limiting (5req/min cho Contact Form).
16. **Auto-Audit:** Tự động ghi `created_by/at` qua Interceptor.
17. **Response Wrapper:** Format: `{ success, data, message, meta }`.
18. **Migration:** Thay đổi DB 100% qua code Migration.
19. ... (Tuân thủ các quy tắc Clean Code khác).

## 2. FRONTEND RULES (NEXT.JS - 20 RULES)
1. **SEO Hydration:** Đảm bảo HTML từ Server giống Client.
2. **Adaptive Image:** Dùng `next/image`, auto WebP, alt-text chuẩn dự án.
3. **Optimistic UI:** Cập nhật giao diện trước khi API trả về (tạo cảm giác nhanh).
4. **Token Refresh:** Axios Interceptor xử lý race condition khi hết hạn token.
5. **Popup Registry:** Quản lý Modal/Drawer bằng tên (Lazy load).
6. **ISR Revalidate:** Dùng `revalidatePath("/")` khi Admin sửa Home Page.
7. **JSON-LD:** Tự động chèn Schema Article/Product cho SEO.
8. **Mobile-First:** Ưu tiên Drawer cho Mobile, Modal cho Desktop.
9. **URL State:** Lưu Filter/Search vào URL Search Params.
10. **IndexedDB:** Cache danh mục tĩnh vào trình duyệt để chuyển trang Admin cực nhanh.