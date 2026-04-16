# 01. Homepage — Trang chu

## Summary

Kiem tra trang chu (/) — man hinh quan trong nhat cua website VietNet Interior. Trang su dung Page Builder SectionRenderer de render cac section dong (Hero, Triet ly thiet ke, Du an noi bat, Bai viet, CTA). Test dam bao trang load dung, khong loi nghiem trong, hinh anh khong bi hong, va dat yeu cau performance.

**File test:** `e2e/homepage.spec.ts`
**So test:** 4
**Trang:** `/`

## Workflow

```
User truy cap bhquan.store
  → Server render homepage (SSR via Next.js App Router)
    → SectionRenderer doc JSON config tu API → render sections
      → Hero section (h1 + background images)
      → Triet ly thiet ke section (h2 + paragraphs)
      → Du an noi bat (project cards tu API)
      → Bai viet (article cards tu API)
      → Contact CTA
    → Floating widgets (Zalo, Messenger, Phone)
    → Footer
```

## Chi tiet cac test case

### TC-01: renders hero section
- **Muc dich:** Dam bao Page Builder render it nhat 1 `<section>` tag
- **Buoc:** Goto `/` → dem so `<section>` elements
- **Ky vong:** `count > 0`
- **Giai phap khi fail:** Kiem tra API PageBuilder, JSON config homepage, SectionRenderer component

### TC-02: loads without critical console errors
- **Muc dich:** Phat hien loi JS nghiem trong khi page load
- **Buoc:** Lang nghe `console.error` → goto `/` (waitUntil: load) → cho 2s settle → loc loi known
- **Loi duoc bo qua (known):**
  - Hydration warnings (React SSR mismatch)
  - Favicon not found
  - Failed to load resource / network errors
  - RSC payload prefetch failures (Next.js prefetch khi backend down)
  - WebSocket/Socket errors
  - 502 errors (backend down)
  - ChunkLoadError (code splitting)
- **Ky vong:** `criticalErrors <= 3`
- **Giai phap khi fail:** Doc log errors cu the → fix tai source (component loi, API call loi)

### TC-03: no broken images on homepage
- **Muc dich:** Moi hinh anh phai load thanh cong (naturalWidth > 0)
- **Buoc:** Goto `/` (networkidle) → kiem tra 10 img dau tien → skip data: URLs va SVGs
- **Ky vong:** Moi img co `naturalWidth > 0`
- **Giai phap khi fail:** Kiem tra src URL → CDN (R2) con hoat dong? → image bi xoa? → fallback image?

### TC-04: page loads within performance budget
- **Muc dich:** DOM content loaded trong 5 giay
- **Buoc:** Do thoi gian tu `page.goto` den `domcontentloaded`
- **Ky vong:** `loadTime < 5000ms`
- **Giai phap khi fail:** Kiem tra server response time → SSR co bi cham? → API calls blocking render? → Bundle size?
