# 10. Visual Regression & Assets — Nhat quan giao dien va tai nguyen

## Summary

Kiem tra tinh nhat quan ve mat giao dien giua cac trang: CSS load dung (khong FOUC), body co content, background color applied, footer copyright giong nhau. Dong thoi kiem tra tai nguyen: favicon, khong mixed content (HTTP tren HTTPS), tat ca CSS va JS load thanh cong.

**File test:** `e2e/visual-regression.spec.ts`
**So test:** 8 (4 visual + 4 assets)
**Trang:** `/`, `/about`, `/contact`, `/projects`

## Workflow

```
Visual Consistency:
  → CSS load → document.styleSheets.length > 0 (khong FOUC)
  → Body co content → scrollHeight > 500px (khong blank page)
  → Background color applied → khong transparent
  → Footer copyright giong nhau tren 4 trang

Assets & Resources:
  → Favicon link[rel="icon"] co href
  → Khong co HTTP request tren HTTPS page (mixed content)
  → Tat ca .css files load thanh cong (status < 400)
  → Tat ca .js files load thanh cong (status < 400)
```

## Chi tiet cac test case

### Visual Consistency (4 tests)

**TC-01: page renders consistently - no FOUC**
- FOUC = Flash Of Unstyled Content
- Kiem tra `document.styleSheets.length > 0`
- Giai phap: Dam bao CSS duoc inline/preload trong `<head>`

**TC-02: homepage screenshot matches viewport**
- Viewport co gia tri → body scrollHeight > 500px
- Ky vong: Page co content dang ke, khong blank
- Giai phap: Kiem tra SSR render → API co tra data? → Component co render?

**TC-03: dark mode / theme consistency**
- Kiem tra `body.backgroundColor` khac rong
- Ky vong: Co background color applied
- Giai phap: Kiem tra Tailwind theme → CSS variables → body styles

**TC-04: footer consistent across pages**
- Duyet 4 trang → lay text tu `footer text=/©.*VietNet/`
- So sanh copyright text giua cac trang
- Ky vong: Copyright giong nhau + truthy
- **Giai phap da ap dung:** Chi so sanh phan copyright (co dinh), bo qua floating widgets (dong)

### Assets & Resources (4 tests)

**TC-05: favicon is accessible**
- Tim `link[rel="icon"]` hoac `link[rel="shortcut icon"]` → href truthy
- Giai phap: Them favicon vao `app/favicon.ico` hoac `app/icon.tsx`

**TC-06: no mixed content on HTTPS pages**
- Lang nghe request events → ghi nhan URL bat dau `http://` (tru localhost)
- Ky vong: `mixedContentUrls.length === 0`
- Giai phap: Doi tat ca URL sang `https://` → kiem tra image src tu CMS → CDN URL

**TC-07: page loads all critical CSS**
- Lang nghe response → ghi nhan `.css` file co status >= 400
- Ky vong: `failedCSS.length === 0`
- Giai phap: Kiem tra build output → CSS chunk bi xoa? → CDN cache expired?

**TC-08: page loads all critical JavaScript**
- Lang nghe response → ghi nhan `.js` file co status >= 400
- Ky vong: `failedJS.length === 0`
- Giai phap: Kiem tra build output → Code splitting loi? → Stale deploy?
