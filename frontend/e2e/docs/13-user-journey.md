# 13. User Journey — Luong nghiep vu toan trinh

## Summary

Kiem tra cac luong nghiep vu hoan chinh (end-to-end business flow): nguoi dung tu duyet san pham → xem chi tiet → lien he tu van, tim kiem san pham, dien form tu van nang cao, va su dung tren mobile. Dam bao toan bo hanh trinh khach hang khong bi gian doan.

**File test:** `e2e/user-journey.spec.ts`
**So test:** 12 (3 browse-to-contact + 3 search + 4 consultation + 2 mobile)
**Trang:** Tat ca trang public

## Workflow

```
Journey 1: Browse → Detail → Contact
  /projects → click project → /projects/[slug] (xem chi tiet) → /contact (form tu van)

Journey 2: Catalog → Filter → Product
  /catalog → click filter button (desktop) → click product → /catalog/[slug]

Journey 3: Homepage → Articles → Read
  / → click "Bai viet" trong nav → /articles → click article → /articles/[slug]

Journey 4: Search
  / → click search icon → /search → nhap keyword → ket qua

Journey 5: Consultation Form
  /contact → kiem tra dropdown → validate email → validate phone → contact info

Journey 6: Mobile
  / → hamburger menu → navigate → detail page
  / → scroll bottom → footer visible + copyright
```

## Chi tiet cac test case

### Browse to Contact (3 tests)

**TC-01: browse projects → view detail → contact**
- Buoc 1: `/projects` → h1 visible
- Buoc 2: Click project card → verify detail page loaded (h1/h2 visible)
- Buoc 3: Goto `/contact` → h1 visible
- Buoc 4: Form visible + submit button enabled
- **Y nghia nghiep vu:** Day la conversion funnel chinh — khach xem du an → an tuong → dang ky tu van

**TC-02: browse catalog → filter → view product**
- Buoc 1: `/catalog` → h1 visible
- Buoc 2: Desktop: click filter button trong sidebar (neu co)
- Buoc 3: Click product → verify detail page (h1/h2 visible)
- **Y nghia nghiep vu:** Khach tim san pham theo vat lieu → xem chi tiet ky thuat

**TC-03: homepage → articles → read article**
- Buoc 1: Homepage
- Buoc 2: Click "Bai viet" trong header nav (hoac goto truc tiep)
- Buoc 3: Click article card → verify detail + body content > 100 ky tu
- **Y nghia nghiep vu:** Content marketing — khach doc bai → tin tuong → lien he

### Search Flow (3 tests)

**TC-04: search from homepage using search icon**
- Click search icon trong header (visible check truoc khi click)
- Mobile: search icon an → goto `/search` truc tiep
- Ky vong: URL chua `/search`

**TC-05: search with keyword**
- Goto `/search` → fill "noi that" → Enter → cho 3s → body text > 100
- **Y nghia nghiep vu:** Khach co nhu cau cu the → tim kiem → tim duoc san pham/du an phu hop

**TC-06: search with no results**
- Goto `/search?q=xyznonexistent12345` → body text truthy
- Ky vong: Hien empty state thay vi blank page

### Consultation Form Advanced (4 tests)

**TC-07: form has dropdown/select**
- Kiem tra co `select`, `[role="combobox"]`, `[role="listbox"]`, hoac `button[class*="select"]`
- Soft check — form co the khong co dropdown

**TC-08: form validates email format**
- Fill "invalid-email" vao email input → submit → kiem tra browser validation hoac custom error
- Ky vong: `hasValidation === true`
- **Y nghia nghiep vu:** Tranh nhan email sai → khong lien lac duoc khach

**TC-09: form validates phone number**
- Fill "abc" vao phone input → submit → kiem tra error
- Ky vong: Co validation error
- **Y nghia nghiep vu:** So dien thoai la kenh lien he chinh voi khach Viet Nam

**TC-10: contact page shows company info**
- Tim `a[href^="tel:"]`, `a[href^="mailto:"]`, hoac text "dia chi"
- Soft check

### Mobile User Journey (2 tests)

**TC-11: hamburger menu → navigate → detail page**
- Click hamburger → mobile menu xuat hien → click "Du an" → verify URL
- **Y nghia nghiep vu:** > 60% traffic tu mobile — menu phai hoat dong tren dien thoai

**TC-12: scroll to bottom shows footer**
- Scroll xuong cuoi → footer visible → copyright `©.*VietNet` visible
- **Y nghia nghiep vu:** Footer chua thong tin phap ly, dia chi, links quan trong

## Giai phap xu ly edge cases

| Case | Xu ly |
|------|-------|
| Data trong (khong co projects/articles/products) | `test.skip(true, 'No data available')` |
| Search icon an tren mobile | Check `isVisible()` truoc → fallback goto truc tiep |
| Nav link khong visible | Check visible truoc click → fallback goto |
| Filter sidebar khong co tren mobile | Kiem tra ca filter button va sidebar |
