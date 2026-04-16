# 07. Performance & Accessibility — Hieu nang va kha nang truy cap

## Summary

Kiem tra cac chi so Core Web Vitals (LCP, CLS, resource size) va tieu chuan accessibility co ban (alt text, heading hierarchy, keyboard navigation, language attribute, color contrast). Dam bao website dat chuan SEO va UX cua Google.

**File test:** `e2e/performance-a11y.spec.ts`
**So test:** 8 (3 performance + 5 accessibility)
**Trang:** `/`, `/admin/login`

## Workflow

```
Performance:
  → Do LCP (Largest Contentful Paint) < 5s
  → Do CLS (Cumulative Layout Shift) < 0.25
  → Kiem tra khong co resource > 2MB (tru images)

Accessibility:
  → Moi img co alt text hoac role="presentation"
  → Chinh xac 1 h1 tren trang
  → Tab focus hoat dong (keyboard navigation)
  → Button submit co text doc duoc
  → html tag co lang attribute
```

## Chi tiet cac test case

### Performance (3 tests)

**TC-01: homepage LCP under 5 seconds**
- Do `Date.now()` truoc va sau `page.goto('/', waitUntil: 'load')`
- Ky vong: `loadTime < 5000`
- Giai phap: Optimize SSR → lazy load images → reduce API calls → CDN cache

**TC-02: no large layout shifts**
- Dung `PerformanceObserver` API do CLS tren homepage
- Cho 3s de layout on dinh → doc gia tri CLS tich luy
- Ky vong: `CLS < 0.25` (Google: < 0.1 = good, < 0.25 = needs improvement)
- Giai phap: Set width/height cho img → dung skeleton loader → avoid dynamic content insert

**TC-03: page resources dont exceed size limits**
- Lang nghe response events → ghi nhan resource > 500KB
- Loc resource > 2MB khong phai image
- Ky vong: `largeNonImages.length === 0`
- Giai phap: Code splitting → tree shaking → lazy load heavy libraries

### Accessibility (5 tests)

**TC-04: all images have alt text**
- Duyet moi `img` tag → kiem tra co `alt` attribute hoac `role="presentation"`
- Ky vong: Moi image deu co alt hoac presentation
- Giai phap: Them alt text trong CMS → Next/Image component require alt

**TC-05: page has proper heading hierarchy**
- Dem so h1 tren homepage
- Ky vong: Chinh xac 1 h1
- Giai phap: Kiem tra component tree → section headings dung h2-h6

**TC-06: interactive elements are keyboard accessible**
- Tren `/admin/login` → nhan Tab → kiem tra `document.activeElement`
- Ky vong: Focus element co tag name (INPUT, BUTTON, etc.)
- Giai phap: Them tabIndex → dung semantic HTML → focus styles

**TC-07: color contrast - login button visible**
- Button submit visible + co text doc duoc (length > 0)
- Giai phap: Kiem tra foreground/background contrast ratio >= 4.5:1

**TC-08: language attribute set on html**
- `<html lang="vi">` hoac bat ky lang value
- Ky vong: `lang` attribute truthy
- Giai phap: Set trong `app/layout.tsx` → `<html lang="vi">`
