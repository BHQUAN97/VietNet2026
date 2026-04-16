# 11. Detail Pages — Trang chi tiet [slug]

## Summary

Kiem tra 3 loai trang chi tiet: Du An (`/projects/[slug]`), Bai Viet (`/articles/[slug]`), San Pham (`/catalog/[slug]`). Moi trang test: noi dung load dung, co heading, co hinh anh, co back navigation/breadcrumb, co description, va co CTA button (san pham). Tat ca tests skip graceful khi khong co data.

**File test:** `e2e/detail-pages.spec.ts`
**So test:** 11 (4 project + 3 article + 4 catalog)
**Trang:** `/projects/[slug]`, `/articles/[slug]`, `/catalog/[slug]`

## Workflow

```
Project Detail:
  /projects → click card → /projects/[slug]
    → h1/h2: ten du an
    → Gallery images (>= 1 img)
    → Description text (> 50 ky tu)
    → Back link ve /projects hoac breadcrumb

Article Detail:
  /articles → click card → /articles/[slug]
    → h1: tieu de bai viet
    → Body content (> 100 ky tu)
    → Meta info: ngay, tac gia, luot xem (optional)

Product Detail:
  /catalog → click card → /catalog/[slug]
    → h1/h2: ten san pham
    → Images (>= 1)
    → CTA button: "Tu van" / "Lien he" / link /contact
    → Thong tin vat lieu/kich thuoc (text > 50 ky tu)
```

## Chi tiet cac test case

### Project Detail (4 tests)

**TC-01: navigates to project detail and shows content**
- Tu `/projects` → click link dau tien → verify URL + heading visible + text > 0
- Skip khi: Khong co project nao

**TC-02: project detail has back navigation**
- Kiem tra co `a[href="/projects"]` hoac breadcrumb nav
- Giai phap: Them breadcrumb component vao detail layout

**TC-03: project detail has images or gallery**
- Dem `img[src]` → count > 0
- Giai phap: Kiem tra gallery component → API tra images? → CDN URL dung?

**TC-04: project detail has description**
- Main content text > 50 ky tu
- Giai phap: Kiem tra RichText renderer → HTML sanitization

### Article Detail (3 tests)

**TC-05: navigates to article detail**
- URL chua `/articles/` + h1 visible

**TC-06: article detail has body content**
- Content text > 100 ky tu
- Giai phap: Kiem tra article content field → API tra du data?

**TC-07: article has meta info (soft check)**
- Tim `time`, `.date`, `.author`, `.meta`, `.tag` elements
- Soft check — khong fail hard neu khong co

### Product Detail (4 tests)

**TC-08: navigates to product detail**
- URL chua `/catalog/` + heading visible

**TC-09: product detail has CTA button**
- Tim `a[href*="/contact"]` HOAC button chua "tu van" / "lien he"
- Ky vong: hasCTA === true
- Giai phap: Them CTA section trong product detail template

**TC-10: product detail has images**
- `img[src]` count > 0

**TC-11: product has material/dimension info**
- Main content text > 50 ky tu

## Giai phap skip graceful

```typescript
const productLink = page.locator('a[href*="/catalog/"]').first()
if ((await productLink.count()) === 0) {
  test.skip(true, 'No products available to test detail page')
  return
}
```

**Ly do:** Data test phu thuoc vao database. Khi DB trong hoac API down, test skip thay vi fail.
