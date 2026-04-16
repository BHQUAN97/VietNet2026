# 02. Admin Authentication — Xac thuc quan tri

## Summary

Kiem tra toan bo luong xac thuc admin: trang login render dung, form validation (email/password), toggle password visibility, xu ly credentials sai, va bao ve 10 routes admin bang middleware redirect. Day la lop bao ve quan trong nhat cua he thong CMS.

**File test:** `e2e/admin-auth.spec.ts`
**So test:** 16 (6 login + 10 route protection)
**Trang:** `/admin/login`, `/admin/*`

## Workflow

```
User truy cap /admin/*
  → Middleware kiem tra session cookie
    → Khong co cookie → Redirect 302 den /admin/login
    → Co cookie → Cho truy cap dashboard
  
User o trang /admin/login
  → Nhap email + password
  → Client-side validation (email format, password length)
  → Submit → POST /api/auth/login
    → 200 + JWT token → Redirect /admin (dashboard)
    → 401 → Hien error message
    → 502 → Backend down, hien network error
```

## Chi tiet cac test case

### TC-01: unauthenticated user redirects to login
- **Muc dich:** Truy cap `/admin` khi chua login phai redirect ve `/admin/login`
- **Buoc:** Goto `/admin` → waitForURL chứa `/admin/login`
- **Ky vong:** URL chua `/admin/login`
- **Giai phap khi fail:** Kiem tra middleware.ts → cookie name dung? → redirect logic?

### TC-02: login page renders correctly
- **Muc dich:** Form login co day du: h1 "Dang nhap", email input, password input, submit button
- **Buoc:** Goto `/admin/login` → verify tung element visible
- **Ky vong:** Tat ca 4 element visible + text dung
- **Giai phap khi fail:** Kiem tra LoginPage component → CSS an element? → Text thay doi?

### TC-03: shows validation errors for empty email
- **Muc dich:** Submit form khi chua nhap email → hien error
- **Buoc:** Chi fill password → click submit → cho 500ms → kiem tra error elements
- **Ky vong:** Co error text chua "email" HOAC co element `.text-error` / `[class*="error"]`
- **Giai phap khi fail:** Kiem tra form validation schema (Zod/Yup) → error message component

### TC-04: shows validation errors for short password
- **Muc dich:** Password qua ngan (2 ky tu) → hien error
- **Buoc:** Fill email hop le + password "12" → submit → kiem tra error
- **Ky vong:** Co error elements `.text-error, [class*="error"]`
- **Giai phap khi fail:** Kiem tra min password length trong validation schema

### TC-05: toggle password visibility
- **Muc dich:** Click icon mat → chuyen password field tu type="password" sang type="text"
- **Buoc:** Tim button co SVG icon (cuoi cung) → click → kiem tra input type
- **Ky vong:** Xuat hien `input[type="text"]`
- **Giai phap khi fail:** Kiem tra toggle state trong PasswordInput component

### TC-06: shows error on invalid credentials
- **Muc dich:** Dang nhap sai → hien thong bao loi (soft check vi API co the down)
- **Buoc:** Fill fake email + wrong password → submit → cho 3s → kiem tra error div
- **Ky vong:** `errorCount >= 0` (soft — API co the khong available)
- **Giai phap khi fail:** Kiem tra error handling trong login handler → toast/alert component

### TC-07 den TC-16: Route Protection (10 routes)
- **Muc dich:** Moi route admin phai redirect ve login khi chua xac thuc
- **Routes duoc test:**
  1. `/admin` (dashboard)
  2. `/admin/articles` (quan ly bai viet)
  3. `/admin/projects` (quan ly du an)
  4. `/admin/products` (quan ly san pham)
  5. `/admin/consultations` (quan ly tu van)
  6. `/admin/analytics` (thong ke)
  7. `/admin/users` (quan ly nguoi dung)
  8. `/admin/settings` (cai dat)
  9. `/admin/pages` (page builder)
  10. `/admin/logs` (nhat ky he thong)
- **Ky vong:** Moi route redirect ve `/admin/login`
- **Giai phap khi fail:** Kiem tra middleware.ts → matcher config co bao gom route nay?
