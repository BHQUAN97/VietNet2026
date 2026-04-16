# 08. Public Pages — Trang cong khai & SEO

## Summary

Kiem tra 6 trang public load thanh cong, co title + heading dung, header/footer hien, va cac yeu to SEO thiet yeu (meta description, JSON-LD structured data, robots.txt, sitemap.xml). Dam bao Google va cac search engine index dung.

**File test:** `e2e/public-pages.spec.ts`
**So test:** 12 (6 page load + 2 navigation + 4 SEO)
**Trang:** `/`, `/about`, `/projects`, `/articles`, `/catalog`, `/contact`

## Workflow

```
6 trang public:
  / → Title: "VietNet Interior | Noi that cao cap" → h1: "Kien Tao..."
  /about → Title: "Gioi thieu | VietNet Interior" → h1: "Kien Tao..."
  /projects → Title: chua "du an" → h1: chua "du an"
  /articles → Title: chua "tin tuc" / "blog" / "vietnet" → h1: chua "tin tuc"/"cam hung"/"bai viet"
  /catalog → Title: chua "san pham"/"catalog" → h1: chua "san pham"
  /contact → Title: chua "lien he"/"tu van" → h1: chua "tu van"/"lien he"

SEO:
  / → meta[name="description"] length > 20
  / → script[type="application/ld+json"] co @context schema.org
  /robots.txt → status 200
  /sitemap.xml → status 200
```

## Chi tiet cac test case

### Page Load (6 tests)

Moi trang kiem tra 3 dieu:
1. **HTTP status < 400** (khong 404, 500)
2. **Title match regex** (case-insensitive)
3. **h1 visible + text match regex**

| Trang | Title regex | Heading regex |
|-------|-------------|---------------|
| `/` | `'VietNet Interior'` | `/kien tao\|noi that\|interior/i` |
| `/about` | `/gioi thieu\|vietnet/i` | `/kien tao\|ve chung toi/i` |
| `/projects` | `/du an/i` | `/du an/i` |
| `/articles` | `/tin tuc\|blog\|vietnet/i` | `/tin tuc\|cam hung\|bai viet/i` |
| `/catalog` | `/san pham\|catalog/i` | `/san pham/i` |
| `/contact` | `/lien he\|tu van/i` | `/tu van\|lien he/i` |

### Navigation (2 tests)

**TC-07: header navigation links work**
- Goto `/` → header visible → dem nav links → count > 0

**TC-08: footer is visible on homepage**
- Goto `/` → footer visible

### SEO Essentials (4 tests)

**TC-09: homepage has meta description**
- `meta[name="description"]` → content length > 20
- Giai phap: Cap nhat `metadata` trong `app/(public)/page.tsx`

**TC-10: homepage has JSON-LD structured data**
- Tim `script[type="application/ld+json"]` → parse JSON → co `@context` chua "schema.org"
- Giai phap: Them JsonLd component trong layout/page

**TC-11: robots.txt is accessible**
- GET `/robots.txt` → status 200
- Giai phap: Tao `app/robots.ts` hoac `public/robots.txt`

**TC-12: sitemap.xml is accessible**
- GET `/sitemap.xml` → status 200
- Giai phap: Tao `app/sitemap.ts` (Next.js auto-generate)
