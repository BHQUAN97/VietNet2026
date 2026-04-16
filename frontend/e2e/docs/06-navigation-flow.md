# 06. Navigation Flow — Dieu huong nguoi dung

## Summary

Kiem tra toan bo luong dieu huong: menu header links, click card vao detail page, logo ve trang chu, trang 404, va chuc nang tim kiem. Dam bao nguoi dung co the di chuyen giua cac trang ma khong bi ket hoac gap loi.

**File test:** `e2e/navigation-flow.spec.ts`
**So test:** 12 (7 navigation + 2 error pages + 3 search)
**Trang:** Tat ca trang public

## Workflow

```
User Navigation Journey:
  Homepage → [click "Du An"] → /projects → [click card] → /projects/[slug]
  Homepage → [click "Bai Viet"] → /articles → [click card] → /articles/[slug]
  Homepage → [click "Tu Van"] → /contact
  Homepage → [click "San Pham"] → /catalog → [click product] → /catalog/[slug]
  Any page → [click logo] → /
  
Error Pages:
  /random-url → 404 page voi link ve trang chu
  
Search:
  /search → input field → nhap keyword → ket qua hoac empty state
```

## Chi tiet cac test case

### User Navigation Journey (7 tests)

**TC-01: homepage to projects via nav link**
- Click `header a[href*="/projects"]` → verify URL + heading

**TC-02: homepage to articles via nav link**
- Click `header a[href*="/articles"]` → verify URL

**TC-03: homepage to contact via nav link**
- Click `header a[href*="/contact"]` → verify URL

**TC-04: project card to detail page**
- `/projects` → click card → verify URL `/projects/[slug]` + heading visible

**TC-05: article card to detail page**
- `/articles` → click card → verify URL `/articles/[slug]` + article visible

**TC-06: catalog product to detail page**
- `/catalog` → click product → verify URL `/catalog/[slug]`

**TC-07: logo returns to homepage**
- Tu `/about` → click `header a[href="/"]` → verify pathname = "/"

### Error Pages (2 tests)

**TC-08: 404 page renders**
- Goto `/this-page-does-not-exist-123` → status 404 HOAC page chua text "404" / "not found"

**TC-09: 404 has link back to homepage**
- Kiem tra co `a[href="/"]` hoac header navigation

### Search (3 tests)

**TC-10: search page loads**
- Goto `/search` → status < 400

**TC-11: search page has input field**
- Tim input: `type="search"` / `type="text"` / placeholder chua "tim" / "search"

**TC-12: search with query returns results or empty state**
- Goto `/search?q=noi+that` → body text > 100 ky tu

## Giai phap khi fail

| Loi | Nguyen nhan | Cach fix |
|-----|-------------|----------|
| Nav link khong visible | Mobile viewport an menu | Test can kiem tra isVisible truoc khi click |
| Card khong co | Data trong / API loi | Test dung conditional `if count > 0` |
| 404 khong tra status 404 | Next.js custom error page | Kiem tra not-found.tsx |
| Search input khong tim thay | Selector sai | Cap nhat selector match UI moi |
