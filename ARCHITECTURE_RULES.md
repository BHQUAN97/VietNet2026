# ARCHITECTURE RULES V3.0

> NestJS (Backend) | Next.js 14+ App Router (Frontend)

---

## BACKEND RULES (NestJS -- 28 Rules)

### Architecture & Structure

1. **Layered Responsibility:** Controller -> Service -> Repository -> Entity. Moi lop chi lam dung nhiem vu cua minh, khong vuot tang.

2. **Interface-first:** Luon dinh nghia Interface truoc khi implement class. Service phu thuoc vao abstraction, khong phu thuoc vao implementation cu the.

3. **Template Method (Base CRUD):** Moi Service tao/sua du lieu PHAI ke thua `BaseService`. Hook flow bat buoc: `beforeSave` -> `validate` -> `saveData` -> `afterSave`.

4. **DI via Factory:** Dang ky Dependency tap trung tai Module. Khong `new` truc tiep trong Service.

5. **Slim Controller:** 1 endpoint = 1 service call. Controller khong chua business logic, chi nhan request va tra response.

6. **Strict DTO:** Validate moi input bang `class-validator` tai cong vao (Controller). Khong truy cap `req.body.x` truc tiep ma khong qua DTO.

7. **Guard-Clause:** Check dieu kien sai va `throw` ngay dau method. Khong nest nhieu cap `if`.

8. **Async Pattern:** Async toan chain tu Controller den Repository. Dung `Promise.all` cho cac tac vu song song doc lap.

### Data & Database

9. **Transactions:** Bat buoc dung transaction cho moi thao tac ghi nhieu bang. Rollback neu bat ky buoc nao fail.

10. **Soft Delete:** Moi bang phai co truong `deleted_at`. Khong xoa cung du lieu, chi danh dau thoi gian xoa.

11. **Auto-Audit:** Tu dong ghi `created_by`, `created_at`, `updated_by`, `updated_at` qua Interceptor. Developer khong set thu cong.

12. **Migration:** 100% thay doi DB phai qua code migration. Khong sua DB bang tay tren production.

13. **Performance:** Cache query nang vao Redis voi TTL phu hop. Tranh N+1 query bang cach dung JOIN hoac batch query.

14. **ULID:** Validate dinh dang ULID truoc khi query DB. Tra 400 neu ULID khong hop le.

### Error Handling & Logging

15. **Global Filter:** Mot exception filter duy nhat xu ly tat ca loi. Moi response tra ve format thong nhat: `{ success, data, message, meta }`.

16. **Structured Logging:** Dung Pino voi 5 muc log (trace, debug, info, warn, error). Moi request phai co `RequestID` de trace trong Docker.

17. **Response Wrapper:** Tat ca API response bat buoc theo format `{ success: boolean, data: any, message: string, meta?: object }`. Khong tra format khac.

### Background & Media

18. **Background Job:** Dung BullMQ + Redis cho 3 loai job: `IMAGE_JOB` (xu ly anh), `MAIL_JOB` (gui mail), `TRAFFIC_SYNC_JOB` (dong bo traffic).

19. **Media Pipeline:** Upload -> BullMQ queue -> Sharp xu ly: resize 2048px (desktop) / 768px (mobile), convert WebP chat luong 80%, strip EXIF data -> Luu R2 Storage.

20. **Mail:** Gui mail qua Resend API thong qua BullMQ worker. Khong gui mail inline trong request handler.

### Security

21. **Parameterized Queries:** Chi dung parameterized query. Cam tuyet doi string concatenation trong SQL.

22. **Rate Limiting:** Dung `ThrottlerModule`. Login: khoa sau 5 lan fail trong 10 phut. Contact form: toi da 1 request/phut.

23. **DOMPurify:** Sanitize moi noi dung HTML tu editor bang DOMPurify truoc khi luu DB.

24. **CORS:** Chi cho phep cac domain trong whitelist. Khong dung `origin: *` tren production.

25. **Helmet.js:** Bat security headers (X-Frame-Options, X-Content-Type-Options, CSP) qua Helmet middleware.

26. **No Sensitive Logs:** Khong log password, token, credit card, hoac bat ky du lieu nhay cam nao.

27. **No Stack Traces:** Error message tra ve client khong duoc chua stack trace hoac thong tin he thong noi bo.

### Clean Code

28. **NestJS Best Practices:** Dat ten nhat quan (camelCase cho variable, PascalCase cho class/interface). Cau truc modular theo feature. Moi module tu quan ly routes, services, entities cua minh.

---

## FRONTEND RULES (Next.js 14+ -- 22 Rules)

### SSR & SEO

1. **SSR-first:** 100% trang public phai server-rendered. Google bot phai index duoc noi dung day du ma khong can JavaScript.

2. **SEO Hydration:** HTML tu Server phai khop chinh xac voi Client. Khong duoc co hydration mismatch giua server va client render.

3. **Dynamic SEO:** Moi trang du an phai co day du: `<title>` va `<meta description>` chua tu khoa, `og:image` (anh dai dien chat luong cao), `canonical` tag (tranh trung URL), va `JSON-LD` schema (Article/Product).

4. **Adaptive Image:** Dung `next/image` cho moi anh. Tu dong convert WebP, dat `alt` text chuan theo ten du an/cong trinh.

5. **Sitemap:** Tu dong generate sitemap.xml dong. Cap nhat khi co bai viet/du an moi.

### Data & State

6. **ISR Revalidate:** Khi Admin sua noi dung, goi `revalidatePath` hoac `revalidateTag` de cap nhat cache. Khong doi TTL het han.

7. **Token Refresh:** Dung Axios interceptor xu ly refresh token. Phai handle race condition khi nhieu request cung gap token het han dong thoi.

8. **URL State:** Luu trang thai filter, search, pagination vao URL search params. Cho phep share link va back button hoat dong dung.

9. **IndexedDB:** Cache danh muc tinh (categories, tags) vao IndexedDB tren trinh duyet. Giup chuyen trang Admin nhanh ma khong goi lai API.

10. **Optimistic UI:** Cap nhat giao dien ngay lap tuc truoc khi API tra ve ket qua. Rollback neu API fail.

### Components & UI

11. **Popup Registry:** Quan ly Modal/Drawer tap trung qua `ModalManager`. Khong import modal tuy tien. Lazy load component khi mo.

12. **Mobile-First:** Uu tien Drawer cho mobile (< 768px), Modal cho desktop (>= 768px). Responsive theo breakpoint.

13. **Loading/Error/Empty States:** Moi component fetch data bat buoc co 3 trang thai: loading (spinner/skeleton), error (thong bao loi ro rang), empty (message khi khong co data).

14. **Design Tokens:** Khong hardcode mau sac, spacing, font-size. Dung CSS custom properties tu file tokens. Vi du: `var(--color-primary)`, `var(--spacing-4)`.

15. **Props Typing:** Moi component phai co TypeScript type annotation day du cho props. Khong dung `any`.

16. **No console.log:** Khong de `console.log` trong production code. Dung logger hoac xoa truoc khi commit.

17. **Null Safety:** Luon check null/undefined truoc khi truy cap nested object. Dung optional chaining (`?.`) hoac `v-if` / conditional rendering.

### Admin Features

18. **Page Builder:** Trang chu Admin tuy chinh bang JSON config. Moi section la mot JSON block co the sap xep, an/hien, chinh sua noi dung.

19. **Preview Mode:** Dung Next.js Draft Mode cho Admin xem truoc noi dung chua publish. Truy cap qua URL bi mat (token-based secret).

20. **Cache Invalidation:** Sau moi thao tac sua/tao/xoa cua Admin, goi `revalidatePath` tuong ung. Dam bao trang public cap nhat ngay.

### Performance

21. **Framer Motion:** Dung Framer Motion cho animation: scroll fade-in, hover effects, page transitions. Khong dung CSS animation phuc tap.

22. **Image Optimization:** Dung `next/image` voi: auto WebP, `sizes` prop dung theo breakpoint, lazy loading cho anh duoi fold, priority loading cho anh tren fold.
