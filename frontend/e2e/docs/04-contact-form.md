# 04. Contact / Consultation Form — Form tu van

## Summary

Kiem tra form dang ky tu van thiet ke noi that tren trang `/contact`. Day la diem chuyen doi (conversion) chinh cua website — khach hang dien thong tin de duoc tu van mien phi. Test bao gom: render form day du, validation khi submit trong, nut submit hoat dong.

**File test:** `e2e/contact-form.spec.ts`
**So test:** 3
**Trang:** `/contact`

## Workflow

```
Khach truy cap /contact
  → Page render: h1 "Tu Van Thiet Ke Noi That"
  → Form hien thi voi cac truong:
    - Ho ten (input text, required)
    - Email (input email, required)
    - So dien thoai (input tel, required)
    - Loai du an (select/dropdown)
    - Ngan sach (select/dropdown)
    - Noi dung yeu cau (textarea)
    - Honeypot field (hidden, chong spam)
  → Submit button "Gui yeu cau"
  
Khi submit:
  → Client validation (required, email format, phone format)
    → Fail → Hien error messages tai truong loi
    → Pass → POST /api/consultations
      → 201 → Hien success message + reset form
      → 400 → Hien validation errors tu server
      → 502 → Hien "Server dang bao tri"
```

## Chi tiet cac test case

### TC-01: form renders with required fields
- **Muc dich:** Form co day du it nhat 3 input fields (name, phone/email, message)
- **Buoc:** Goto `/contact` → kiem tra h1 visible → form visible → dem input/textarea/select
- **Ky vong:** `inputCount >= 3`
- **Giai phap khi fail:** Kiem tra ConsultationForm component → form fields bi an? → conditional rendering?

### TC-02: shows validation errors on empty submit
- **Muc dich:** Submit form trong → hien loi validation
- **Buoc:** Tim submit button → click → cho 500ms → kiem tra `:invalid` hoac `[aria-invalid]` hoac error messages
- **Ky vong:** `hasErrors === true`
- **Giai phap khi fail:** Kiem tra required attribute tren input → custom validation logic → error display component

### TC-03: submit button exists and is enabled
- **Muc dich:** Nut submit hien thi va co the click (khong bi disabled)
- **Buoc:** Tim `form button[type="submit"]` → kiem tra visible + enabled
- **Ky vong:** Visible va enabled
- **Giai phap khi fail:** Kiem tra loading state → co bi disabled khi chua fill form?
