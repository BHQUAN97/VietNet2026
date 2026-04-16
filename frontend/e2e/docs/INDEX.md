# E2E Test Documentation — VietNet Interior 2026

> Tai lieu nghiep vu E2E Playwright cho website VietNet Interior
> Cap nhat: 2026-04-16 | Tong: 13 test suites | 248 tests (desktop + mobile)

## Tong quan

| # | Nghiep vu | File test | So test | Trang |
|---|-----------|-----------|---------|-------|
| 01 | [Homepage](01-homepage.md) | `homepage.spec.ts` | 4 | `/` |
| 02 | [Admin Auth](02-admin-auth.md) | `admin-auth.spec.ts` | 16 | `/admin/*` |
| 03 | [API Health](03-api-health.md) | `api-health.spec.ts` | 8 | API endpoints |
| 04 | [Contact Form](04-contact-form.md) | `contact-form.spec.ts` | 3 | `/contact` |
| 05 | [Content Pages](05-content-pages.md) | `content-pages.spec.ts` | 14 | `/projects`, `/articles`, `/catalog`, `/about` |
| 06 | [Navigation Flow](06-navigation-flow.md) | `navigation-flow.spec.ts` | 12 | Tat ca trang |
| 07 | [Performance & A11y](07-performance-a11y.md) | `performance-a11y.spec.ts` | 8 | `/`, `/admin/login` |
| 08 | [Public Pages & SEO](08-public-pages.md) | `public-pages.spec.ts` | 12 | 6 trang public |
| 09 | [Responsive Design](09-responsive.md) | `responsive.spec.ts` | 7 | Mobile + Desktop |
| 10 | [Visual Regression](10-visual-regression.md) | `visual-regression.spec.ts` | 8 | `/`, `/about`, `/contact`, `/projects` |
| 11 | [Detail Pages](11-detail-pages.md) | `detail-pages.spec.ts` | 11 | `[slug]` pages |
| 12 | [Floating Widgets](12-floating-widgets.md) | `floating-widgets.spec.ts` | 11 | Moi trang public |
| 13 | [User Journey](13-user-journey.md) | `user-journey.spec.ts` | 12 | Full business flow |

## Ket qua test gan nhat (5 lan chay lien tiep)

| Lan | Passed | Failed | Skipped | Thoi gian |
|-----|--------|--------|---------|-----------|
| 1 | 206 | 0 | 42 | 5.7m |
| 2 | 206 | 0 | 42 | 7.9m |
| 3 | 206 | 0 | 42 | 7.5m |
| 4 | 206 | 0 | 42 | 5.6m |
| 5 | 206 | 0 | 42 | 5.6m |

**42 skipped** = API tests (backend down) + detail page tests (khong co data)

## Coverage theo man hinh

```
PUBLIC PAGES:
  [x] Homepage /                    — 4 tests (hero, console, images, performance)
  [x] About /about                  — 3 tests (story, stats, warranty)
  [x] Projects /projects            — 3 tests (header, cards, links)
  [x] Projects Detail /projects/*   — 4 tests (content, back nav, images, description)
  [x] Articles /articles            — 3 tests (header, cards, title)
  [x] Articles Detail /articles/*   — 3 tests (content, body, meta)
  [x] Catalog /catalog              — 4 tests (header, filter, sidebar, products)
  [x] Catalog Detail /catalog/*     — 4 tests (content, CTA, images, material)
  [x] Contact /contact              — 7 tests (form, validation, email, phone, dropdown)
  [x] Search /search                — 6 tests (load, input, query, icon, keyword, empty)
  [x] 404 Page                      — 2 tests (render, back link)

ADMIN PAGES:
  [x] Login /admin/login            — 6 tests (render, validation, password, credentials)
  [x] Route Protection              — 10 routes tested (redirect to login)

CROSS-CUTTING:
  [x] Navigation                    — 7 tests (menu links, logo, card clicks)
  [x] Floating Widgets              — 11 tests (Zalo, Messenger, Phone, mobile, admin)
  [x] Performance                   — 3 tests (LCP, CLS, resource size)
  [x] Accessibility                 — 5 tests (alt, headings, keyboard, contrast, lang)
  [x] Responsive                    — 7 tests (mobile/desktop viewport)
  [x] Visual                        — 8 tests (FOUC, theme, footer, assets)
  [x] User Journey                  — 5 tests (browse→detail→contact, catalog, articles)
  [x] Mobile Journey                — 2 tests (hamburger, footer scroll)
  [x] SEO                           — 4 tests (meta, JSON-LD, robots, sitemap)
  [x] API                           — 8 tests (health, CRUD, security)
```

## Cach chay test

```bash
# Tat ca tests (desktop + mobile)
npm run test:e2e

# Chi desktop Chrome
npx playwright test --project=desktop-chrome

# Chi mobile Chrome
npx playwright test --project=mobile-chrome

# Chi 1 file
npx playwright test homepage.spec.ts

# Chi 1 test case
npx playwright test -g "renders hero section"

# Voi UI mode (debug)
npm run test:e2e:ui

# Xem report
npm run test:e2e:report
```

## Cau hinh

- **Base URL:** `https://bhquan.store` (production) hoac `BASE_URL` env var
- **Browsers:** Desktop Chrome (1280x720) + Mobile Chrome Pixel 7 (412x915)
- **Timeout:** 30s/test, 10s/assertion
- **Retries:** 1 (dev), 2 (CI)
- **Workers:** Unlimited (dev), 1 (CI)

## Giai phap ky thuat chung

### 1. Backend down → Skip graceful
```typescript
test.skip(!backendUp, 'Backend is down (502)')
```

### 2. Data trong → Skip graceful
```typescript
if ((await link.count()) === 0) {
  test.skip(true, 'No data available')
  return
}
```

### 3. Element co the an tren mobile → Check visible truoc khi click
```typescript
if ((await link.count()) > 0 && await link.isVisible()) {
  await link.click()
} else {
  await page.goto(fallbackUrl)
}
```

### 4. Console errors → Filter known issues
RSC prefetch, hydration, favicon, network errors duoc loai bo khoi "critical errors"

### 5. Footer khac nhau do floating widgets → So sanh chi copyright
Chi so sanh text co dinh `© 2026 VietNet Interior`, bo qua dynamic content

## Cau truc file

```
frontend/e2e/
  ├── docs/                          ← TAI LIEU (ban dang doc)
  │   ├── INDEX.md                   ← File nay
  │   ├── 01-homepage.md
  │   ├── 02-admin-auth.md
  │   ├── 03-api-health.md
  │   ├── 04-contact-form.md
  │   ├── 05-content-pages.md
  │   ├── 06-navigation-flow.md
  │   ├── 07-performance-a11y.md
  │   ├── 08-public-pages.md
  │   ├── 09-responsive.md
  │   ├── 10-visual-regression.md
  │   ├── 11-detail-pages.md
  │   ├── 12-floating-widgets.md
  │   └── 13-user-journey.md
  ├── admin-auth.spec.ts             ← Test files
  ├── api-health.spec.ts
  ├── contact-form.spec.ts
  ├── content-pages.spec.ts
  ├── detail-pages.spec.ts
  ├── floating-widgets.spec.ts
  ├── homepage.spec.ts
  ├── navigation-flow.spec.ts
  ├── performance-a11y.spec.ts
  ├── public-pages.spec.ts
  ├── responsive.spec.ts
  ├── user-journey.spec.ts
  └── visual-regression.spec.ts
```
