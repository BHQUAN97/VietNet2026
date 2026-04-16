# 12. Floating Widgets — Widget lien he nhanh

## Summary

Kiem tra cac nut lien he noi (Zalo, Messenger, Goi dien) xuat hien tren moi trang public. Widgets cho phep khach hang lien he nhanh khong can vao trang Contact. Test tren ca desktop va mobile, kiem tra URL dung, khong gay overflow, va behavior tren admin page.

**File test:** `e2e/floating-widgets.spec.ts`
**So test:** 11 (8 desktop + 2 mobile + 1 admin)
**Component:** `FloatingWidgets.tsx`

## Workflow

```
Moi trang public:
  → FloatingWidgets render goc phai duoi
  → Desktop: 3 icon links (Zalo, Messenger, Phone) trong group[role="group"]
  → Mobile: Co the la FAB button, click de expand

Widget links:
  → Zalo: https://zalo.me/vietnetinterior
  → Messenger: https://m.me/vietnetinterior
  → Phone: tel:0901234567

Admin pages:
  → Widgets co the bi an (tuy implementation)
```

## Chi tiet cac test case

### Desktop (8 tests)

**TC-01 den TC-05: floating widgets visible on each page**
- 5 trang: `/`, `/about`, `/projects`, `/catalog`, `/contact`
- Moi trang kiem tra: co `[role="group"]` / `[class*="floating"]` / `[class*="fab"]` HOAC co direct links Zalo/Messenger/Phone
- Ky vong: It nhat 1 widget co mat

**TC-06: Zalo link has correct URL**
- `a[href*="zalo.me"]` → href chua "zalo.me"
- Giai phap: Kiem tra FloatingWidgets config → Zalo OA URL

**TC-07: Messenger link has correct URL**
- `a[href*="m.me"]` → href chua "m.me"
- Giai phap: Kiem tra Facebook Messenger page URL

**TC-08: Phone link has tel: protocol**
- `a[href^="tel:"]` → href match `/^tel:[+\d]/`
- Skip khi khong tim thay phone link

### Mobile (2 tests)

**TC-09: floating widgets accessible on mobile**
- Viewport 412x915 → kiem tra co direct links HOAC FAB button
- Giai phap: FAB co the can click de expand → test interaction

**TC-10: widgets do not overlap content on mobile**
- `scrollWidth <= clientWidth + 5` → khong horizontal overflow
- Giai phap: Kiem tra `position: fixed` + `right/bottom` → `overflow-x: hidden`

### Admin (1 test)

**TC-11: widgets on admin login page (soft check)**
- Goto `/admin/login` → dem Zalo + Messenger links
- Khong fail hard — chi ghi nhan
- Giai phap: Neu can an tren admin → kiem tra layout condition
