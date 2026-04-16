# 09. Responsive Design — Thiet ke thich ung

## Summary

Kiem tra website hien thi dung tren 2 viewport: Mobile (412x915 — Pixel 7) va Desktop (1920x1080). Dam bao khong co horizontal overflow, menu mobile hoat dong, form tu van su dung duoc tren dien thoai, catalog filter tuong thich, va grid layout nhieu cot tren desktop.

**File test:** `e2e/responsive.spec.ts`
**So test:** 7 (5 mobile + 2 desktop)
**Viewport:** Mobile 412x915, Desktop 1920x1080

## Workflow

```
Mobile (412x915):
  → Header visible, khong horizontal scroll
  → Hamburger menu button → click → overlay/nav xuat hien
  → Contact form: inputs visible + enabled + khong overflow
  → Catalog: heading visible + co filter button hoac sidebar
  → 3 trang (/, /about, /contact): khong horizontal overflow

Desktop (1920x1080):
  → Catalog sidebar visible (aside)
  → Projects grid: display = "grid" (nhieu cot)
```

## Chi tiet cac test case

### Mobile Responsive (5 tests)

**TC-01: homepage renders correctly on mobile**
- Header visible + `scrollWidth <= clientWidth + 5`
- Giai phap: Kiem tra CSS overflow-x: hidden tren body → max-width 100vw

**TC-02: mobile menu toggle works**
- Tim `header button` (hamburger) → click → kiem tra mobile nav/overlay xuat hien
- Giai phap: Kiem tra menu component → toggle state → animation delay

**TC-03: contact page form usable on mobile**
- Form visible → >= 2 visible inputs → first input enabled → khong overflow
- Giai phap: Kiem tra input width 100% → font-size >= 16px (tranh iOS zoom)

**TC-04: catalog page works on mobile**
- h1 visible → co filter button (`/loc|filter/i`) HOAC sidebar/complementary
- Giai phap: Responsive design co the an sidebar → hien nut "Bo loc" tren mobile

**TC-05: no text overflow on mobile**
- Kiem tra 3 trang: `/`, `/about`, `/contact`
- Moi trang: `scrollWidth <= clientWidth + 5`
- Giai phap: Tim element bi tran → them `overflow-x: hidden` hoac `max-width: 100%`

### Desktop Responsive (2 tests)

**TC-06: catalog sidebar visible on desktop**
- `aside` visible tren viewport 1920px
- Giai phap: Kiem tra CSS breakpoint lg/xl cho sidebar

**TC-07: projects grid shows multiple columns**
- Tim `.card-grid` → `computed style display === 'grid'`
- Giai phap: Kiem tra Tailwind grid classes → `grid-cols-*` responsive

## Breakpoint tham chieu

| Breakpoint | Width | UI thay doi |
|-----------|-------|-------------|
| Mobile | < 768px | Hamburger menu, sidebar an, 1 cot grid |
| Tablet | 768-1023px | Menu co the visible, 2 cot grid |
| Desktop | >= 1024px | Full nav, sidebar visible, 3+ cot grid |
| Wide | >= 1920px | Max-width container, nhieu whitespace |
