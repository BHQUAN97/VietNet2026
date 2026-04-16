# 05. Content Pages — Trang noi dung (Projects, Articles, Catalog, About)

## Summary

Kiem tra 4 trang noi dung chinh: Du An, Bai Viet, San Pham, va Gioi Thieu. Moi trang test heading, data loading (cards hoac empty/error state), va cac section dac trung. Cac test nay dam bao nguoi dung co the duyet qua noi dung chinh cua website.

**File test:** `e2e/content-pages.spec.ts`
**So test:** 14 (3 projects + 3 articles + 4 catalog + 3 about)
**Trang:** `/projects`, `/articles`, `/catalog`, `/about`

## Workflow

```
/projects:
  → SSR render → h1 "Du An" → API GET /projects → card-grid HOAC empty/error state
  → Moi card link den /projects/[slug]

/articles:
  → SSR render → h1 "Tin Tuc & Cam Hung" → API GET /articles → card-grid HOAC empty/error
  → Moi card co h3 title + excerpt

/catalog:
  → SSR render → h1 "San Pham Noi That" → API GET /products → aside filter + product grid
  → Sidebar co filter buttons theo vat lieu
  → Moi product link den /catalog/[slug]

/about:
  → SSR render → h1 "Kien Tao Khong Gian Song Tinh Te"
  → Stats counter (Du an hoan thanh, Nam kinh nghiem, Khach hang tin tuong, Giai thuong)
  → Cam ket chat luong (h2)
  → Bao hanh dai han (h2)
```

## Chi tiet cac test case

### Projects Page (3 tests)

**TC-01: displays page header with title**
- Ky vong: h1 visible + chua text "Du An"

**TC-02: loads project cards or shows empty state**
- Cho 3s loading → kiem tra 1 trong 3: co cards / empty message / error message
- Ky vong: `hasCards || hasEmpty || hasError`

**TC-03: project card links to detail page**
- Tim link `a[href*="/projects/"]` → kiem tra href match `/projects/[\w-]+`

### Articles Page (3 tests)

**TC-04: displays page header**
- Ky vong: h1 visible

**TC-05: loads article cards or shows empty/error state**
- Tuong tu projects — 3 trang thai hop le

**TC-06: article card has title and optional excerpt**
- Tim card dau tien → kiem tra co h3 title voi text > 0

### Catalog Page (4 tests)

**TC-07: displays page header with product count**
- Ky vong: h1 chua "San Pham"

**TC-08: material filter sidebar exists on desktop**
- Chi test khi viewport >= 1024px → aside visible → co >= 2 filter buttons

**TC-09: catalog has filter sidebar or product grid**
- Ky vong: `hasSidebar || hasProducts`

**TC-10: loads products or shows empty state**
- Tuong tu projects/articles — 3 trang thai hop le

### About Page (3 tests)

**TC-11: displays company story and quality commitment**
- h1 chua "Kien Tao" + h2 chua "chat luong" visible

**TC-12: stats counter section exists**
- Text "Du an hoan thanh" visible

**TC-13: warranty section is visible**
- Scroll xuong cuoi → h2 chua "bao hanh" visible

## Giai phap khi fail

| Loi | Nguyen nhan thuong gap | Cach fix |
|-----|----------------------|----------|
| h1 text khong match | Thay doi text trong CMS/Page Builder | Cap nhat regex trong test |
| Cards khong hien | API tra loi / backend down | Kiem tra error state hiển thị dung |
| Sidebar khong thay | CSS responsive an sidebar | Kiem tra breakpoint CSS |
| Stats khong hien | Counter animation chua chay | Tang wait timeout |
