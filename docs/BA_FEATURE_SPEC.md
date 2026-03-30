# BA_FEATURE_SPEC -- Dac ta tinh nang VietNet Interior

> **Version:** 1.0 | **Status:** BA_DONE
> **Reference:** nlhome.vn | **Domain:** bhquan.site
> **Ngay tao:** 2026-03-27
> **Tac gia:** Agent_BA

---

## MUC TIEU HE THONG

| Muc tieu | Mo ta |
|---|---|
| **Public Web** | Website gioi thieu du an noi that, san pham tu bep, thu hut khach hang tu van. SEO score 90+ Mobile. |
| **Admin Panel** | He thong quan ly noi dung (CMS), Page Builder truc quan, Analytics, quan ly yeu cau tu van. |
| **Scale** | 300 users/ngay, 5 admin dong thoi, 500+ hinh anh, 50+ du an. |
| **Tech Stack** | Vue 3 + TypeScript + Tailwind CSS 4 (FE), Express.js 5 + TypeScript + Drizzle ORM (BE), MySQL 8, Redis 7, Cloudflare R2. |
| **Brand Voice** | Sang trong, tinh te, hien dai -- tone mau nau am (brown palette), glassmorphism, typography thanh lich. |

---

## DESIGN FILE REFERENCE MAP

| Design File | Mo ta | Module |
|---|---|---|
| `vietnet_homepage_viewer_mode_desktop/` | Trang chu desktop -- viewer mode | A1, A2 |
| `vietnet_homepage_mobile/` | Trang chu mobile | A1, A2 |
| `vietnet_mobile_homepage_c_gi_h_ng/` | Trang chu mobile (ban cap nhat) | A1, A2 |
| `vietnet_homepage_viewer_mode/` | Trang chu viewer mode (mobile) | A1, A2 |
| `danh_m_c_s_n_ph_m_t_b_p/` | Danh muc tu bep desktop | A3 |
| `danh_m_c_s_n_ph_m_t_b_p_c_gi_h_ng/` | Danh muc tu bep desktop (cap nhat) | A3 |
| `kitchen_cabinet_catalog_mobile/` | Danh muc tu bep mobile | A3 |
| `vietnet_mobile_catalog_c_gi_h_ng/` | Danh muc tu bep mobile (cap nhat) | A3 |
| `vietnet_admin_dashboard_desktop/` | Admin dashboard desktop | B2 |
| `vietnet_admin_dashboard_overview/` | Admin dashboard tong quan | B2 |
| `vietnet_mobile_admin_c_gi_h_ng/` | Admin dashboard mobile | B2 |
| `admin_dashboard_overview/` | Admin dashboard overview (phien ban khac) | B2 |
| `vietnet_post_management_desktop/` | Quan ly bai viet/du an desktop | B3 |
| `admin_post_management/` | Quan ly bai viet (phien ban khac) | B3 |
| `vietnet_consultation_management/` | Quan ly tu van | B4 |
| `vietnet_homepage_edit_mode_desktop/` | Page builder -- edit mode desktop | B5 |
| `vietnet_homepage_edit_mode/` | Page builder -- edit mode mobile | B5 |
| `DESIGN/mobile_library/01-11.svg` | Component library mobile | Tat ca |

---

## BA_DONE

- **Use cases:** 38 tinh nang chinh, chia thanh 3 module (Public Website, Admin Panel, System/Backend)
- **Business rules:** Xem chi tiet tung feature ben duoi
- **Acceptance criteria:** Moi feature co 3-5 dieu kien kiem thu cu the

---

# =============================================
# MODULE A: PUBLIC WEBSITE
# =============================================

---

## A1. NAVIGATION & LAYOUT

---

### A1.1 Glassmorphic Top Navigation

- **Feature ID:** A1.1
- **Priority:** P0
- **Description:** Thanh dieu huong co dinh (fixed) phia tren man hinh voi hieu ung glassmorphism (backdrop-blur, background ban trong suot). Chua logo VietNet ben trai, menu chinh o giua/phai, va cac icon tien ich (gio hang, tai khoan).
- **User story:** As a khach truy cap, I want to thay thanh dieu huong luon hien thi khi cuon trang, so that toi co the di chuyen giua cac trang bat ky luc nao.
- **Acceptance criteria:**
  - Thanh nav co dinh o top viewport, khong bien mat khi scroll
  - Hieu ung backdrop-blur-md ap dung, nen ban trong suot (rgba nau hoac trang voi opacity)
  - Logo "VietNet" hien thi ben trai, click ve trang chu
  - Menu desktop hien thi day du: Trang chu, Du an, Danh muc, Vat lieu, Tu van
  - Mobile: menu hamburger icon (3 gach) thay the menu text, mo ra drawer/overlay khi tap
  - Cart badge hien thi so luong san pham (neu co), account icon ben phai
  - z-index cao hon moi noi dung trang
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (header area), `vietnet_homepage_mobile/screen.png` (mobile header)

---

### A1.2 Mobile Bottom Navigation

- **Feature ID:** A1.2
- **Priority:** P0
- **Description:** Thanh dieu huong co dinh phia duoi man hinh mobile voi 5 tab chinh, giup nguoi dung di chuyen nhanh giua cac khu vuc quan trong cua website.
- **User story:** As a nguoi dung mobile, I want to co thanh nav o cuoi man hinh voi cac tab chinh, so that toi co the chuyen trang nhanh bang mot tay ma khong can cuon len dau.
- **Acceptance criteria:**
  - Hien thi co dinh (fixed bottom) chi tren viewport <= 768px
  - 5 tab: Home (icon nha), Projects (icon tam giac/kien truc), Catalog (icon grid -- active highlight), Consult (icon tin nhan), Menu/Contact (icon menu)
  - Tab dang active co mau nau dam (brand color), icon phong to nhe hoac underline
  - Touch target toi thieu 44x44px cho moi tab
  - An di tren desktop (hidden khi viewport > 768px)
  - Khong che noi dung trang -- trang co padding-bottom tuong ung
- **Design ref:** `vietnet_mobile_catalog_c_gi_h_ng/screen.png` (bottom nav visible), `kitchen_cabinet_catalog_mobile/screen.png` (bottom nav with 5 tabs)

---

### A1.3 Floating Action Widgets

- **Feature ID:** A1.3
- **Priority:** P1
- **Description:** Nhom nut lien he nhanh co dinh ben phai man hinh (Zalo, Messenger, Dien thoai) voi hieu ung pulse animation thu hut su chu y.
- **User story:** As a khach hang tiem nang, I want to thay cac nut lien he nhanh luon hien thi, so that toi co the lien lac voi VietNet ngay lap tuc khi co nhu cau.
- **Acceptance criteria:**
  - 3 nut tron xep doc ben phai: Zalo (icon Zalo), Messenger (icon FB Messenger), Phone (icon dien thoai)
  - Vi tri fixed, cach bottom 80px (tranh de len bottom nav tren mobile)
  - Pulse animation (box-shadow nhap nhay) chay lien tuc de thu hut chu y
  - Click Zalo: mo link Zalo chat, Click Messenger: mo link Messenger, Click Phone: goi tel: link
  - Tren mobile: hien thi ca 3 nut. Tren desktop: co the an hoac thu gon (tuy thiet ke)
  - Khong che noi dung chinh cua trang
- **Design ref:** Missing -- needs design (khong thay trong cac file hien tai, can bo sung)

---

### A1.4 Footer

- **Feature ID:** A1.4
- **Priority:** P0
- **Description:** Footer chua thong tin thuong hieu, lien ket nhanh, thong tin showroom va form dang ky nhan tin. Chia thanh 3 cot tren desktop, stack tren mobile.
- **User story:** As a khach truy cap, I want to thay thong tin lien he, dia chi showroom va cac lien ket quan trong o cuoi trang, so that toi co the tim duoc moi thong tin can thiet.
- **Acceptance criteria:**
  - Desktop: 3 cot -- (1) Brand "VietNet Interior" + mo ta ngan + social links, (2) Internal Links (Project Archives, Vendor Database, Material Library, Brand Assets), (3) Legal (Privacy Policy, Terms of Service)
  - Mobile: cac cot stack doc, brand o tren, links o giua, legal o duoi
  - Hien thi dia chi showroom, gio lam viec, so dien thoai, email
  - Copyright line o cuoi: "(c) 2026 VietNet Interior Design. Meticulously Crafted."
  - Nen mau nau dam (dark brown), text mau sang de tuong phan
  - Newsletter signup input + button (neu co trong thiet ke)
- **Design ref:** `vietnet_post_management_desktop/screen.png` (footer visible), `vietnet_homepage_mobile/screen.png` (mobile footer)

---

### A1.5 Breadcrumb

- **Feature ID:** A1.5
- **Priority:** P1
- **Description:** Thanh breadcrumb hien thi duong dan dieu huong hien tai tren cac trang catalog va chi tiet du an, giup nguoi dung biet vi tri hien tai va quay lai de dang.
- **User story:** As a nguoi dung dang xem chi tiet san pham, I want to thay breadcrumb "Trang chu > Danh muc > Tu Bep > [Ten san pham]", so that toi co the quay lai trang danh muc nhanh chong.
- **Acceptance criteria:**
  - Hien thi tren trang Catalog va trang chi tiet (Project Detail, Product Detail)
  - Format: Home > [Category] > [Current Page], phan cach bang dau ">"
  - Moi phan (tru trang hien tai) la link click duoc
  - Trang hien tai hien thi text thuong (khong phai link), mau dam hon
  - Responsive: tren mobile co the rut gon thanh "... > [Parent] > [Current]" neu qua dai
  - Co schema markup BreadcrumbList cho SEO
- **Design ref:** `danh_m_c_s_n_ph_m_t_b_p/screen.png` (breadcrumb area below header)

---

## A2. HOMEPAGE

---

### A2.1 Hero Section

- **Feature ID:** A2.1
- **Priority:** P0
- **Description:** Khu vuc hero chiem toan bo viewport (full-height) voi hinh anh noi that chat luong cao, lop gradient overlay mau toi, tieu de lon va 2 nut CTA.
- **User story:** As a khach truy cap lan dau, I want to thay hinh anh an tuong va thong diep ro rang ngay khi mo trang, so that toi hieu ngay VietNet la cong ty thiet ke noi that cao cap.
- **Acceptance criteria:**
  - Hinh anh nen chiem 100vh (full viewport height), object-fit: cover
  - Gradient overlay tu duoi len (linear-gradient) de text doc duoc tren hinh
  - Desktop: Headline "Crafting Silent Elegance." (hoac tieng Viet: "Nghe Thuat Noi That Dang Cap & Tinh Te"), font lon (48-64px), mau trang
  - Subtitle mo ta ngan 1-2 dong
  - 2 CTA buttons: "Kham Pha Du An" (primary -- nen nau) va "Explore Catalog" (secondary -- vien trang)
  - Mobile: headline nho hon (32-40px), 1 CTA chinh, subtitle an hoac rut gon
  - Lazy load hinh anh hero, uu tien loading (priority hint)
  - Stats bar phia duoi hero: "500+ Du an" va "12 Giai thuong" (tu design mobile cap nhat)
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (hero section), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (mobile hero)

---

### A2.2 About Section

- **Feature ID:** A2.2
- **Priority:** P0
- **Description:** Khu vuc gioi thieu cong ty voi layout bat doi xung (asymmetric), hinh anh ben phai, noi dung text ben trai, kem theo cac chi so noi bat.
- **User story:** As a khach hang tiem nang, I want to doc tom tat ve VietNet va thay cac thanh tuu, so that toi co the tin tuong vao nang luc cua cong ty.
- **Acceptance criteria:**
  - Desktop: layout 2 cot bat doi xung -- text chiem ~55%, hinh anh chiem ~45%
  - Headline: "Design is a dialogue between light and material." (hoac tieng Viet: "Noi Ban Sac Ca Nhan Duoc Ton Vinh")
  - Noi dung mo ta 2-3 doan ve triet ly thiet ke
  - Stats counter: "150+ Du an hoan thanh" va "12 Giai thuong thiet ke" (desktop), "15+ Nam kinh nghiem" va "500+ Khach hang" (mobile)
  - Hinh anh noi that minh hoa, co border-radius nhe
  - Mobile: stack doc, text truoc, hinh sau, stats nam ngang
  - Background mau sang (kem/trang), tuong phan voi hero section
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (about section), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (about section mobile)

---

### A2.3 Featured Projects

- **Feature ID:** A2.3
- **Priority:** P0
- **Description:** Luoi hien thi 3 du an noi bat nhat tren trang chu, voi hinh anh lon, ten du an, va hover overlay. Tren mobile chuyen sang dang carousel cuon ngang.
- **User story:** As a khach truy cap, I want to xem nhanh cac du an tieu bieu cua VietNet, so that toi co the danh gia chat luong thiet ke truoc khi lien he.
- **Acceptance criteria:**
  - Desktop: luoi 3 cot, moi card co hinh anh (aspect ratio ~4:3), ten du an, loai (Villa, Office, v.v.)
  - Hover effect: overlay mau toi voi ten du an va nut "Xem chi tiet" hien ra
  - Header khu vuc: "Featured Projects" / "Kiet Tac Thiet Ke" voi link "Xem tat ca" ben phai
  - Mobile: carousel cuon ngang (snap scroll), hien 1 card lon tai mot thoi diem
  - Card mobile: hinh anh lon, ten du an overlay phia duoi, tag danh muc
  - Click vao card di chuyen den trang chi tiet du an (route: /projects/:slug)
  - Toi thieu 3, toi da 6 du an hien thi
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (Featured Projects section), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (Kiet Tac Thiet Ke)

---

### A2.4 Material Samples

- **Feature ID:** A2.4
- **Priority:** P1
- **Description:** Hien thi 4 mau vat lieu dang hinh tron hoac hinh vuong, cuon ngang tren mobile, giup khach hang thay truoc chat lieu VietNet su dung.
- **User story:** As a khach hang quan tam den vat lieu, I want to xem cac mau vat lieu noi bat tren trang chu, so that toi biet VietNet su dung nhung chat lieu gi.
- **Acceptance criteria:**
  - Desktop: 4 mau vat lieu hien thi hang ngang (Oak, Granite, Brass, Marble hoac tuong tu)
  - Moi mau: hinh tron/vuong voi hinh anh texture, ten vat lieu phia duoi
  - Mobile: cuon ngang (horizontal scroll), snap tung mau
  - Click vao mau vat lieu di chuyen den trang catalog loc theo vat lieu do
  - Section header: "Signature Materials" / "Vat Lieu Dac Trung"
  - Hinh anh chat luong cao, the hien ro be mat vat lieu
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (material section below projects), `kitchen_cabinet_catalog_mobile/screen.png` (Material Samples section o cuoi)

---

### A2.5 Testimonials

- **Feature ID:** A2.5
- **Priority:** P1
- **Description:** Khu vuc danh gia cua khach hang voi 2 card, moi card co 5-star rating, avatar, ten khach hang, va loi nhan xet.
- **User story:** As a khach hang chua quyet dinh, I want to doc nhan xet cua khach hang cu, so that toi cam thay yem tam hon khi chon VietNet.
- **Acceptance criteria:**
  - Desktop: 2 card danh gia nam canh nhau
  - Moi card: icon dau nhay kep (quotation mark), noi dung nhan xet (2-3 cau), 5 ngoi sao vang, ten khach hang, chuc danh/vi tri
  - Mobile: 1 card hien thi, vuot ngang de xem card khac (hoac stack doc)
  - Rating: 5 sao vang (filled stars), khong cho phep tuong tac
  - Background card: mau trang hoac kem nhat, co shadow nhe
  - Noi dung nhan xet la static (quan ly tu admin CMS)
  - Header: "Client Perspectives" / "Khach Hang Noi Gi"
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (Client Perspectives section), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (Khach Hang Noi Gi)

---

### A2.6 Consultation CTA Form

- **Feature ID:** A2.6
- **Priority:** P0
- **Description:** Form dang ky tu van mien phi ngay tren trang chu, thu thap thong tin co ban cua khach hang de admin lien he lai. Nen nau dam de noi bat.
- **User story:** As a khach hang muon tu van, I want to dien form nhanh ngay tren trang chu, so that toi khong can tim kiem trang lien he rieng.
- **Acceptance criteria:**
  - Fields: Ho ten (text, required), Email (email, required), Loai du an (dropdown: Thiet ke noi that, Can ho, Biet thu, Van phong, Khac), Tin nhan (textarea, optional)
  - Button submit: "Gui Yeu Cau" / "Request Consultation" -- mau nau dam, full width tren mobile
  - Nen section: mau nau dam (dark brown), text trang, tao tuong phan manh
  - Desktop: form nam ben phai, text mo ta ben trai ("Ready to define your space?" / "Nhan Tu Van Mien Phi")
  - Mobile: stack doc, text tren, form duoi
  - Sau khi submit: hien thong bao thanh cong (toast hoac inline message), reset form
  - Validation: hien thi loi inline duoi moi field sai
  - Gui du lieu den API: POST /api/consultations
  - Admin nhan real-time notification qua Socket.io
  - Email xac nhan tu dong gui cho khach hang qua Resend API
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (CTA form bottom section), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (Nhan Tu Van Mien Phi)

---

### A2.7 Stats Counter

- **Feature ID:** A2.7
- **Priority:** P1
- **Description:** Hieu ung dem so tu 0 len gia tri thuc (animated counting) cho cac chi so noi bat, kich hoat khi scroll den khu vuc tuong ung (Intersection Observer).
- **User story:** As a khach truy cap, I want to thay cac con so dem len tao hieu ung an tuong, so that toi cam nhan duoc quy mo va kinh nghiem cua VietNet.
- **Acceptance criteria:**
  - Ap dung cho moi so lieu trong About section va hero stats: "150+", "12", "500+", "15+"
  - Animation: dem tu 0 den gia tri dich trong 2 giay, easing decelerate
  - Chi chay animation 1 lan khi element vao viewport (Intersection Observer, threshold 0.5)
  - Hien thi dau "+" sau con so neu co
  - Tren mobile: animation van chay binh thuong
  - Fallback: neu Intersection Observer khong ho tro, hien thi so tinh
- **Design ref:** `vietnet_homepage_viewer_mode_desktop/screen.png` (stats "150+" va "12"), `vietnet_mobile_homepage_c_gi_h_ng/screen.png` (stats "15+" va "500+")

---

## A3. PRODUCT CATALOG (Tu Bep)

---

### A3.1 Material Filter Sidebar

- **Feature ID:** A3.1
- **Priority:** P0
- **Description:** Sidebar loc san pham theo chat lieu o ben trai trang catalog tren desktop. Chua cac radio button cho tung loai go/vat lieu va nut "Ap dung".
- **User story:** As a khach hang tim tu bep, I want to loc san pham theo loai vat lieu, so that toi chi thay cac san pham phu hop voi so thich cua toi.
- **Acceptance criteria:**
  - Hien thi ben trai trang catalog, chiem ~250px width tren desktop
  - Cac radio filter: "Tat ca vat lieu" (mac dinh), "Go Cong Nghiep" (Industrial Wood), "Go Tu Nhien" (Natural Wood), "Kinh Cuong Luc" (Glass-fronted), "Acrylic", "Melamine"
  - Nut "Ap Dung" (Apply) de thuc hien loc
  - Material samples preview: hien thi hinh nen nho cua tung vat lieu ben canh ten
  - Chi hien thi tren desktop (>= 1024px), an tren mobile (thay bang A3.2)
  - Khi chon filter, URL query string cap nhat (?material=industrial-wood) de ho tro chia se link
  - Dem so luong san pham theo tung filter hien thi ben canh
- **Design ref:** `danh_m_c_s_n_ph_m_t_b_p/screen.png` (left sidebar), `danh_m_c_s_n_ph_m_t_b_p_c_gi_h_ng/screen.png`

---

### A3.2 Mobile Filter Bottom Sheet

- **Feature ID:** A3.2
- **Priority:** P0
- **Description:** Modal truot len tu duoi (bottom sheet) tren mobile chua cac tuy chon loc, thay the sidebar desktop. Co drag handle de keo len/xuong.
- **User story:** As a nguoi dung mobile, I want to mo bo loc tu mot nut bam va chon vat lieu, so that toi co the loc san pham de dang tren man hinh nho.
- **Acceptance criteria:**
  - Nut "Filter & Sort" hien thi phia tren luoi san pham tren mobile
  - Tap vao nut mo bottom sheet truot len tu duoi voi animation smooth
  - Drag handle (thanh ngang nho) o dau de keo xuong dong bottom sheet
  - Chua cac filter tuong tu sidebar desktop: loai vat lieu, sap xep
  - Nut "Ap Dung" o cuoi bottom sheet, dong sheet sau khi ap dung
  - Overlay mau toi phia sau bottom sheet, tap vao overlay dong sheet
  - Backdrop khong cuon trang phia sau khi bottom sheet mo
- **Design ref:** `kitchen_cabinet_catalog_mobile/screen.png` (FILTER & SORT button), `vietnet_mobile_catalog_c_gi_h_ng/screen.png` (FILTERS button)

---

### A3.3 Horizontal Filter Chips

- **Feature ID:** A3.3
- **Priority:** P1
- **Description:** Cac the (chips/tags) loc nhanh theo vat lieu, hien thi hang ngang cuon duoc tren mobile, cho phep loc nhanh ma khong can mo bottom sheet.
- **User story:** As a nguoi dung mobile, I want to tap nhanh vao chip vat lieu de loc, so that toi khong can mo bottom sheet cho moi lan doi filter.
- **Acceptance criteria:**
  - Hang ngang cac chip cuon duoc (overflow-x: auto, scrollbar an)
  - Cac chip: "All Materials" (mac dinh active), "Industrial Wood", "Natural Wood", "Acrylic", "Melamine", v.v.
  - Chip active: nen nau dam, text trang. Chip inactive: nen xam nhat, text den
  - Tap chip de toggle active/inactive, chi cho phep 1 chip active tai 1 thoi diem
  - Dong bo voi bottom sheet filter (A3.2) -- chon chip cap nhat filter va nguoc lai
  - Hien thi phia tren luoi san pham, duoi page header
  - Tren desktop: van hien thi nhung uu tien sidebar (A3.1)
- **Design ref:** `vietnet_mobile_catalog_c_gi_h_ng/screen.png` (chips: All Materials, Industrial Wood, Natural Wood)

---

### A3.4 Product Grid

- **Feature ID:** A3.4
- **Priority:** P0
- **Description:** Luoi hien thi san pham tu bep voi hinh anh, ten, tag vat lieu, gia (neu co), va nut xem chi tiet. Layout thay doi theo breakpoint.
- **User story:** As a khach hang, I want to xem danh sach san pham tu bep duoi dang luoi voi hinh anh ro rang, so that toi co the so sanh va chon san pham phu hop.
- **Acceptance criteria:**
  - Desktop: luoi 3 cot, card co hinh anh (aspect ratio 4:5), ten san pham, loai vat lieu, gia (neu co)
  - Mobile: luoi 2 cot so le (staggered/masonry), card co hinh anh (aspect ratio 3:4), ten, vat lieu tag, nut "View Details"
  - Hinh anh lazy load, format WebP, placeholder skeleton khi dang tai
  - Card co shadow nhe, border-radius 8-12px
  - Spacing deu giua cac card (gap 16-24px)
  - Responsive: 3 col (>= 1024px), 2 col (>= 375px), 1 col (< 375px)
  - Hien thi "No results" message khi filter khong co ket qua
- **Design ref:** `danh_m_c_s_n_ph_m_t_b_p/screen.png` (3-col grid), `vietnet_mobile_catalog_c_gi_h_ng/screen.png` (2-col staggered), `kitchen_cabinet_catalog_mobile/screen.png` (2-col grid)

---

### A3.5 Product Card Interactions

- **Feature ID:** A3.5
- **Priority:** P1
- **Description:** Cac tuong tac tren product card: hover zoom hinh anh, badge "New", star rating, nut add-to-cart (mobile).
- **User story:** As a khach hang, I want to thay hieu ung khi hover vao san pham va cac thong tin nhanh nhu badge moi, rating, so that toi co trai nghiem duyet san pham thu vi va du thong tin.
- **Acceptance criteria:**
  - Desktop hover: hinh anh zoom nhe (scale 1.05) voi transition 300ms
  - Badge "NEW": goc trai tren card, nen nau/vang, text trang, chi hien thi voi san pham duoc danh dau moi (trong 30 ngay)
  - Star rating: hien thi 1 ngoi sao va diem trung binh (vd: 4.5) hoac de trong neu chua co rating
  - Mobile: nut add-to-cart (icon gio hang) goc phai duoi card, touch target 44x44px
  - Click card (khong phai nut) di chuyen den trang chi tiet san pham
  - Focus state ro rang cho keyboard navigation (outline 2px)
- **Design ref:** `kitchen_cabinet_catalog_mobile/screen.png` (card with NEW badge, star, cart icon), `vietnet_mobile_catalog_c_gi_h_ng/screen.png` (card with VIEW DETAILS)

---

### A3.6 Product Count

- **Feature ID:** A3.6
- **Priority:** P1
- **Description:** Hien thi tong so san pham sau khi loc, giup nguoi dung biet co bao nhieu ket qua.
- **User story:** As a nguoi dung, I want to biet co bao nhieu san pham phu hop voi filter cua toi, so that toi co the quyet dinh co can thay doi filter khong.
- **Acceptance criteria:**
  - Hien thi dang: "12 ITEMS" hoac "Showing 12 of 28 boutique projects"
  - Vi tri: phia tren luoi san pham, ben phai (doi dien voi nut filter tren mobile)
  - Cap nhat tu dong khi filter thay doi, khong can tai lai trang
  - So luong phai chinh xac voi du lieu tu API
  - Font size nho hon tieu de, mau xam nhat
- **Design ref:** `kitchen_cabinet_catalog_mobile/screen.png` (12 ITEMS), `vietnet_post_management_desktop/screen.png` (Showing 4 of 28)

---

### A3.7 Pagination

- **Feature ID:** A3.7
- **Priority:** P0
- **Description:** Phan trang cho danh sach san pham, desktop dung page numbers, mobile dung dots va nut "Load More".
- **User story:** As a nguoi dung, I want to chuyen trang de xem them san pham, so that toi khong phai tai het du lieu cung luc.
- **Acceptance criteria:**
  - Desktop: nut Previous/Next, page numbers (1, 2, 3...), trang hien tai highlight mau nau
  - Mobile: dots indicator (pagination dots) va nut "LOAD MORE ITEMS" phia duoi grid
  - "Load More" append san pham vao grid hien tai (khong thay the), co loading state
  - Mac dinh 9 san pham/trang (desktop), 6 san pham/trang (mobile)
  - URL cap nhat query ?page=2 khi chuyen trang de ho tro bookmark
  - API ho tro: GET /api/products?page=1&limit=9&material=industrial-wood
  - Disable nut Previous khi o trang 1, disable Next khi o trang cuoi
- **Design ref:** `kitchen_cabinet_catalog_mobile/screen.png` (dots + LOAD MORE), `vietnet_post_management_desktop/screen.png` (page numbers < 1 2 3 >)

---

### A3.8 Material Samples Section

- **Feature ID:** A3.8
- **Priority:** P2
- **Description:** Khu vuc gioi thieu mau vat lieu (Oak, Granite, Brass, Marble) o cuoi trang catalog duoi dang carousel ngang.
- **User story:** As a khach hang, I want to xem cac mau vat lieu o cuoi trang catalog, so that toi co them thong tin ve chat lieu truoc khi quyet dinh.
- **Acceptance criteria:**
  - Hien thi 4+ mau vat lieu dang hinh vuong/tron voi ten phia duoi
  - Desktop: hang ngang 4 mau deu nhau
  - Mobile: carousel cuon ngang, snap tung mau
  - Header: "Material Samples"
  - Click mau vat lieu loc danh sach san pham theo vat lieu do (scroll len grid)
  - Hinh anh texture chat luong cao, lazy load
- **Design ref:** `kitchen_cabinet_catalog_mobile/screen.png` (Material Samples: OAK, GRANITE, BRASS)

---

## A4. PROJECT DETAIL PAGE

---

### A4.1 Project Hero

- **Feature ID:** A4.1
- **Priority:** P0
- **Description:** Hinh anh bia lon cua du an chiem toan bo chieu rong trang, tao an tuong manh khi vao trang chi tiet.
- **User story:** As a khach hang dang xem du an, I want to thay hinh anh bia lon va dep, so that toi co the cam nhan khong gian thiet ke ngay lap tuc.
- **Acceptance criteria:**
  - Hinh anh chiem 100% width, chieu cao 50-70vh, object-fit: cover
  - Gradient overlay nhe o phan duoi de text doc duoc (neu co text overlay)
  - Responsive: giu ti le tren moi breakpoint, khong bi bop meo
  - Lazy load voi placeholder blur (blurhash hoac LQIP)
  - Alt text mo ta du an cho accessibility va SEO
- **Design ref:** Missing -- needs design

---

### A4.2 Project Info

- **Feature ID:** A4.2
- **Priority:** P0
- **Description:** Khu vuc thong tin chi tiet du an bao gom tieu de, mo ta, phong cach thiet ke, vat lieu su dung, dien tich.
- **User story:** As a khach hang, I want to doc thong tin chi tiet ve du an (phong cach, vat lieu, dien tich), so that toi co the danh gia du an co phu hop voi nhu cau cua toi khong.
- **Acceptance criteria:**
  - Tieu de du an: font lon (32-40px desktop, 24-28px mobile), font weight bold
  - Mo ta: 2-4 doan van ve du an, typography de doc (line-height 1.6-1.8)
  - Thong tin ky thuat dang key-value: Phong cach (Modern, Classic, v.v.), Vat lieu chinh, Dien tich (m2), Dia diem, Nam hoan thanh
  - Desktop: thong tin ky thuat nam canh mo ta (2 cot)
  - Mobile: stack doc, thong tin ky thuat nam duoi mo ta
  - Du lieu tu API: GET /api/projects/:slug
- **Design ref:** Missing -- needs design

---

### A4.3 Image Gallery

- **Feature ID:** A4.3
- **Priority:** P0
- **Description:** Luoi hinh anh du an (6+ anh) voi chuc nang lightbox zoom khi click vao tung anh.
- **User story:** As a khach hang, I want to xem nhieu hinh anh du an va phong to tung anh, so that toi co the thay chi tiet thiet ke tu nhieu goc do.
- **Acceptance criteria:**
  - Desktop: luoi 2-3 cot, hinh anh co aspect ratio thong nhat (4:3 hoac 3:2)
  - Mobile: luoi 1-2 cot, cuon doc
  - Click vao hinh mo lightbox overlay: hinh phong to, nut Previous/Next, nut Close (X)
  - Lightbox: nen den 90% opacity, hinh anh max-width 90vw, max-height 90vh
  - Keyboard navigation trong lightbox: Arrow Left/Right, Escape de dong
  - Swipe trai/phai tren mobile de chuyen hinh trong lightbox
  - Counter: "3/12" hien thi vi tri hinh hien tai
  - Lazy load cho cac hinh ngoai viewport
- **Design ref:** Missing -- needs design

---

### A4.4 Related Projects

- **Feature ID:** A4.4
- **Priority:** P1
- **Description:** Hien thi 3 du an lien quan o cuoi trang chi tiet, giup nguoi dung kham pha them.
- **User story:** As a khach hang da xem xong 1 du an, I want to thay cac du an tuong tu, so that toi co the tiep tuc kham pha ma khong can quay lai trang danh sach.
- **Acceptance criteria:**
  - 3 card du an lien quan, cung category hoac cung phong cach
  - Layout giong A2.3 Featured Projects (3 cot desktop, carousel mobile)
  - Header: "Du an lien quan" / "Related Projects"
  - Moi card: hinh anh, ten du an, category tag
  - Click di chuyen den trang chi tiet du an tuong ung
  - API: GET /api/projects/:id/related?limit=3
- **Design ref:** Missing -- needs design

---

### A4.5 Social Sharing

- **Feature ID:** A4.5
- **Priority:** P2
- **Description:** Cac nut chia se du an len mang xa hoi: Facebook, Zalo, Pinterest.
- **User story:** As a nguoi dung thich 1 du an, I want to chia se len Facebook hoac Zalo, so that ban be/nguoi than cua toi co the xem du an nay.
- **Acceptance criteria:**
  - 3 nut chia se: Facebook (share dialog), Zalo (Zalo share API), Pinterest (pin image)
  - Vi tri: ben canh tieu de du an hoac cuoi phan mo ta
  - Mo cua so popup khi click (window.open, khong chuyen huong trang chinh)
  - URL chia se bao gom OG meta day du (tieu de, mo ta, hinh anh)
  - Tren mobile: co the them nut "Copy Link" va su dung Web Share API (navigator.share)
- **Design ref:** Missing -- needs design

---

### A4.6 SEO

- **Feature ID:** A4.6
- **Priority:** P0
- **Description:** Toi uu SEO cho trang chi tiet du an voi dynamic meta tags, Open Graph, va JSON-LD structured data.
- **User story:** As a SEO manager, I want to moi trang du an co meta tags va structured data day du, so that Google va mang xa hoi hien thi thong tin chinh xac khi index/share.
- **Acceptance criteria:**
  - Title tag: "[Ten du an] | VietNet Interior"
  - Meta description: tu dong lay 160 ky tu dau tien cua mo ta du an
  - OG tags: og:title, og:description, og:image (hinh bia du an), og:url, og:type=article
  - Twitter Card: twitter:card=summary_large_image, twitter:title, twitter:description, twitter:image
  - JSON-LD: @type=Article voi name, description, image, datePublished, author (VietNet Interior)
  - Canonical URL: https://bhquan.site/projects/[slug]
  - Server-side rendering (SSR) hoac pre-rendering de bot doc duoc meta tags
- **Design ref:** N/A (ky thuat, khong can design)

---

### A4.7 Breadcrumb

- **Feature ID:** A4.7
- **Priority:** P1
- **Description:** Breadcrumb tren trang chi tiet du an: Home > Du an > [Ten du an].
- **User story:** As a nguoi dung, I want to thay breadcrumb de biet vi tri hien tai va quay lai danh sach du an, so that toi di chuyen de dang giua cac trang.
- **Acceptance criteria:**
  - Format: Trang chu > Du an > [Ten du an]
  - "Trang chu" va "Du an" la link click duoc
  - "[Ten du an]" la text thuong (khong link), mau dam
  - Schema markup BreadcrumbList cho SEO
  - Responsive: khong bi tran dong tren mobile (text-overflow: ellipsis cho ten du an dai)
- **Design ref:** Missing -- needs design (tham chieu A1.5)

---

## A5. PRODUCT DETAIL PAGE

---

### A5.1 Product Images

- **Feature ID:** A5.1
- **Priority:** P0
- **Description:** Gallery hinh anh san pham voi 1 hinh chinh lon va cac thumbnail nho phia duoi/ben canh.
- **User story:** As a khach hang, I want to xem hinh anh san pham tu nhieu goc do, so that toi co the danh gia ngoai hinh san pham truoc khi lien he.
- **Acceptance criteria:**
  - Hinh chinh: lon, chiem 50-60% width desktop, 100% width mobile
  - Thumbnails: 4-6 hinh nho phia duoi (mobile) hoac ben trai (desktop)
  - Click thumbnail thay doi hinh chinh (khong tai lai trang)
  - Click hinh chinh mo lightbox zoom (tuong tu A4.3)
  - Hinh anh WebP, lazy load thumbnails, priority load hinh chinh
  - Swipe tren mobile de chuyen hinh
- **Design ref:** Missing -- needs design

---

### A5.2 Product Info

- **Feature ID:** A5.2
- **Priority:** P0
- **Description:** Thong tin san pham: ten, loai vat lieu, mo ta chi tiet, kich thuoc.
- **User story:** As a khach hang, I want to doc thong tin day du ve san pham tu bep, so that toi co du thong tin de quyet dinh co muon tu van khong.
- **Acceptance criteria:**
  - Ten san pham: font lon (28-36px desktop), bold
  - Tag vat lieu: chip/badge hien thi loai go (vd: "Go Tu Nhien", "Acrylic")
  - Mo ta chi tiet: 2-3 doan van, ho tro rich text (bold, list, v.v.)
  - Kich thuoc: bang hoac danh sach key-value (Chieu rong, Chieu cao, Chieu sau)
  - Desktop: thong tin nam ben phai hinh anh (2 cot)
  - Mobile: stack doc, hinh tren, thong tin duoi
  - API: GET /api/products/:slug
- **Design ref:** Missing -- needs design

---

### A5.3 Material Specs

- **Feature ID:** A5.3
- **Priority:** P1
- **Description:** Thong tin chi tiet ve vat lieu cua san pham: xuat xu, do ben, bao tri, mau sac co san.
- **User story:** As a khach hang ky tinh, I want to biet chi tiet ve vat lieu (xuat xu, do ben, cach bao tri), so that toi co the danh gia chat luong truoc khi quyet dinh.
- **Acceptance criteria:**
  - Hien thi dang bang hoac accordion: Ten vat lieu, Xuat xu, Do ben (nam), Huong dan bao tri
  - Mau sac/phien ban co san: hien thi dang color swatches (hinh tron mau)
  - Click swatch doi hinh anh san pham sang phien ban mau tuong ung (neu co)
  - Co the expand/collapse de khong chiem qua nhieu khong gian
- **Design ref:** Missing -- needs design

---

### A5.4 Related Products

- **Feature ID:** A5.4
- **Priority:** P1
- **Description:** Luoi san pham tuong tu o cuoi trang chi tiet san pham.
- **User story:** As a khach hang, I want to thay cac san pham tuong tu, so that toi co the so sanh va chon san pham phu hop nhat.
- **Acceptance criteria:**
  - 3-4 product cards, cung loai vat lieu hoac cung danh muc
  - Layout giong A3.4 Product Grid (3 col desktop, 2 col mobile)
  - Header: "San pham tuong tu" / "Similar Products"
  - Click card di chuyen den trang chi tiet san pham tuong ung
  - API: GET /api/products/:id/related?limit=4
- **Design ref:** Missing -- needs design

---

### A5.5 Consultation CTA

- **Feature ID:** A5.5
- **Priority:** P0
- **Description:** Nut keu goi hanh dong "Yeu cau bao gia cho san pham nay" tren trang chi tiet san pham.
- **User story:** As a khach hang quan tam san pham, I want to bam nut de yeu cau bao gia cu the cho san pham nay, so that toi nhan duoc thong tin gia ca nhanh chong.
- **Acceptance criteria:**
  - Nut lon, noi bat: "Yeu cau bao gia" / "Request Quote" -- mau nau dam, full width tren mobile
  - Vi tri: ngay duoi thong tin san pham (sticky tren mobile o bottom)
  - Click mo form tu van (modal hoac scroll den form) voi ten san pham da dien san
  - Form fields: Ho ten, So dien thoai, Email, Ghi chu -- pre-fill "San pham: [ten san pham]"
  - Submit gui API: POST /api/consultations voi product_id dinh kem
  - Loading state khi dang gui, success message sau khi gui
- **Design ref:** Missing -- needs design

---

## A6. ABOUT PAGE

---

### A6.1 Company Story

- **Feature ID:** A6.1
- **Priority:** P1
- **Description:** Trang gioi thieu ve cong ty VietNet: su menh, tam nhin, lich su hinh thanh.
- **User story:** As a khach hang muon tim hieu, I want to doc cau chuyen cua VietNet, so that toi hieu duoc gia tri va triet ly thiet ke cua ho.
- **Acceptance criteria:**
  - Section su menh (Mission): 1 doan ngan ve muc tieu cua VietNet
  - Section tam nhin (Vision): 1 doan ve huong phat trien tuong lai
  - Lich su: timeline hoac cac moc quan trong (nam thanh lap, du an dau tien, v.v.)
  - Hinh anh minh hoa: anh doi ngu, anh showroom
  - Desktop: layout 2 cot (text + hinh), mobile: stack doc
  - Tone van ban: trang trong nhung gan gui, the hien su chuyen nghiep
- **Design ref:** Missing -- needs design

---

### A6.2 Facility Showcase

- **Feature ID:** A6.2
- **Priority:** P2
- **Description:** Hien thi hinh anh xuong san xuat va showroom cua VietNet.
- **User story:** As a khach hang, I want to thay hinh anh co so san xuat va showroom, so that toi tin tuong vao nang luc thuc te cua VietNet.
- **Acceptance criteria:**
  - Gallery 4-6 hinh anh xuong san xuat va showroom
  - Layout grid 2-3 cot desktop, 1-2 cot mobile
  - Co the click de xem lightbox phong to
  - Caption mo ta cho moi hinh (vd: "Xuong san xuat go tai Binh Duong")
- **Design ref:** Missing -- needs design

---

### A6.3 Stats Counter

- **Feature ID:** A6.3
- **Priority:** P1
- **Description:** Cac chi so noi bat cua cong ty voi hieu ung dem so animated (tuong tu A2.7).
- **User story:** As a khach hang, I want to thay cac con so an tuong ve VietNet, so that toi cam nhan duoc quy mo cong ty.
- **Acceptance criteria:**
  - Cac metric: So du an hoan thanh (150+), So nam kinh nghiem (15+), So khach hang (500+), So giai thuong (12)
  - Animated counter tuong tu A2.7 (dung chung component)
  - Vi tri: giua trang, nen mau tuong phan (nau dam hoac xam nhat)
  - Desktop: 4 cot ngang. Mobile: 2x2 grid
- **Design ref:** Missing -- needs design

---

### A6.4 Quality Commitment

- **Feature ID:** A6.4
- **Priority:** P2
- **Description:** Khu vuc cam ket chat luong vat lieu cua VietNet.
- **User story:** As a khach hang lo ngai chat luong, I want to doc cam ket ve vat lieu cua VietNet, so that toi yen tam ve do ben va an toan.
- **Acceptance criteria:**
  - 3-4 card cam ket: vd "Go nhap khau chuan chau Au", "Khong su dung hoa chat doc hai", "Kiem dinh chat luong 100%"
  - Moi card: icon, tieu de, mo ta ngan (2-3 cau)
  - Desktop: 3-4 cot ngang. Mobile: stack doc hoac carousel
  - Tone van ban: tu tin, chuyen nghiep
- **Design ref:** Missing -- needs design

---

### A6.5 Warranty Policy

- **Feature ID:** A6.5
- **Priority:** P1
- **Description:** Thong tin chinh sach bao hanh san pham tu 12-36 thang.
- **User story:** As a khach hang, I want to biet chinh sach bao hanh cu the, so that toi yen tam ve dich vu hau mai.
- **Acceptance criteria:**
  - Bang hoac danh sach cac muc bao hanh theo loai san pham
  - Tu bep go tu nhien: 36 thang, Tu bep go cong nghiep: 24 thang, Phu kien: 12 thang
  - Dieu kien bao hanh va khong bao hanh ro rang
  - Quy trinh bao hanh: 3-4 buoc (Lien he -> Kiem tra -> Sua chua/Thay the -> Hoan thanh)
  - CTA: "Lien he bao hanh" link den trang lien he
- **Design ref:** Missing -- needs design

---

## A7. CONTACT PAGE

---

### A7.1 Contact Form

- **Feature ID:** A7.1
- **Priority:** P0
- **Description:** Form tu van day du tren trang lien he, thu thap thong tin chi tiet hon form trang chu.
- **User story:** As a khach hang muon tu van chi tiet, I want to dien form voi day du thong tin yeu cau, so that VietNet co the chuan bi tu van sat voi nhu cau cua toi.
- **Acceptance criteria:**
  - Fields: Ho ten (required), So dien thoai (required), Email (required), Loai du an (dropdown: Biet thu, Can ho, Van phong, Nha pho, Khac), Dien tich (number, m2), Ngan sach du kien (dropdown: range), Noi dung yeu cau (textarea, required)
  - Validation: inline error message cho moi field, validate khi blur va khi submit
  - Button: "Gui Yeu Cau Tu Van" -- full width, mau nau dam
  - Sau submit: thong bao thanh cong, reset form, gui email xac nhan
  - Rate limit: toi da 3 lan submit/IP/gio de tranh spam
  - API: POST /api/consultations (cung endpoint voi A2.6 nhung nhieu fields hon)
  - Honeypot field (an) de chong bot spam
- **Design ref:** Missing -- needs design

---

### A7.2 Map

- **Feature ID:** A7.2
- **Priority:** P2
- **Description:** Ban do nhung (embedded) hien thi vi tri showroom VietNet.
- **User story:** As a khach hang muon den showroom, I want to thay ban do vi tri chinh xac, so that toi co the tim duong de dang.
- **Acceptance criteria:**
  - Google Maps embed hoac Mapbox
  - Pin marker tai vi tri showroom VietNet
  - Cho phep zoom va keo ban do
  - Desktop: chiem 50% width ben canh thong tin lien he
  - Mobile: full width, chieu cao 300px
  - Lazy load iframe de khong anh huong page load speed
- **Design ref:** Missing -- needs design

---

### A7.3 Contact Info

- **Feature ID:** A7.3
- **Priority:** P0
- **Description:** Thong tin lien he truc tiep: dia chi, dien thoai, email, gio lam viec.
- **User story:** As a khach hang, I want to thay thong tin lien he ro rang, so that toi co the goi dien hoac den truc tiep showroom.
- **Acceptance criteria:**
  - Dia chi day du (so nha, duong, quan, thanh pho)
  - So dien thoai: click-to-call (tel: link) tren mobile
  - Email: click-to-mail (mailto: link)
  - Gio lam viec: bang hoac danh sach (Thu 2 - Thu 7: 8:00 - 18:00, Chu nhat: 9:00 - 16:00)
  - Icon tuong ung cho moi muc (phone, email, clock, map-pin)
  - Desktop: card hoac danh sach ben canh ban do
  - Mobile: stack doc phia tren ban do
- **Design ref:** Missing -- needs design

---

### A7.4 Social Links

- **Feature ID:** A7.4
- **Priority:** P2
- **Description:** Cac lien ket mang xa hoi cua VietNet tren trang lien he.
- **User story:** As a khach hang, I want to theo doi VietNet tren mang xa hoi, so that toi cap nhat duoc cac du an va uu dai moi.
- **Acceptance criteria:**
  - Cac link: Zalo (OA), Facebook (page), Instagram (neu co), YouTube (neu co)
  - Hien thi dang icon tron/vuong voi logo mang xa hoi
  - Mo tab moi khi click (target="_blank", rel="noopener noreferrer")
  - Vi tri: duoi thong tin lien he hoac cuoi trang
  - Icon co hover effect (doi mau hoac scale nhe)
- **Design ref:** Missing -- needs design

---

## A8. SEARCH RESULTS PAGE

---

### A8.1 Search Input

- **Feature ID:** A8.1
- **Priority:** P1
- **Description:** O tim kiem toan cuc voi autocomplete goi y khi go.
- **User story:** As a nguoi dung, I want to tim kiem san pham hoac du an bang tu khoa, so that toi nhanh chong tim duoc noi dung quan tam.
- **Acceptance criteria:**
  - Search input o header (icon kinh lup), expand ra khi click
  - Autocomplete dropdown hien thi toi da 5 goi y khi go (debounce 300ms)
  - Goi y bao gom: du an (icon khac) va san pham (icon khac), nhom rieng
  - Enter hoac click nut tim kiem di chuyen den trang ket qua (/search?q=keyword)
  - Click vao goi y di chuyen thang den trang chi tiet
  - API: GET /api/search?q=keyword&limit=5 (autocomplete), GET /api/search?q=keyword&page=1 (full results)
  - Mobile: tap icon search mo full-screen search overlay
- **Design ref:** Missing -- needs design

---

### A8.2 Results List

- **Feature ID:** A8.2
- **Priority:** P1
- **Description:** Trang ket qua tim kiem hien thi ket qua hon hop (du an + san pham).
- **User story:** As a nguoi dung da tim kiem, I want to thay ket qua chia thanh nhom (du an, san pham), so that toi de dang phan biet va chon ket qua phu hop.
- **Acceptance criteria:**
  - Header: "Ket qua tim kiem cho '[keyword]'" voi tong so ket qua
  - Nhom ket qua: "Du an" (hien thi 3 dau, nut "Xem tat ca") va "San pham" (hien thi 6 dau, nut "Xem tat ca")
  - Moi ket qua: hinh thu nho, tieu de (highlight tu khoa match), mo ta ngan
  - Click vao ket qua di chuyen den trang chi tiet tuong ung
  - Pagination cho ket qua day du
  - Loading skeleton khi dang tai ket qua
- **Design ref:** Missing -- needs design

---

### A8.3 No Results State

- **Feature ID:** A8.3
- **Priority:** P1
- **Description:** Trang thai khong co ket qua tim kiem voi thong bao ro rang va goi y.
- **User story:** As a nguoi dung khong tim duoc ket qua, I want to thay thong bao ro rang va goi y, so that toi biet lam gi tiep theo.
- **Acceptance criteria:**
  - Message: "Khong tim thay ket qua cho '[keyword]'"
  - Goi y: "Thu tim kiem voi tu khoa khac", "Xem danh muc san pham", "Lien he tu van"
  - Icon minh hoa (illustration) cho trang thai rong
  - Link "Xem danh muc" va "Lien he" la click duoc
  - Khong hien thi pagination khi khong co ket qua
- **Design ref:** Missing -- needs design

---

## A9. ERROR PAGES

---

### A9.1 404 Page

- **Feature ID:** A9.1
- **Priority:** P1
- **Description:** Trang loi 404 khi nguoi dung truy cap URL khong ton tai.
- **User story:** As a nguoi dung lac duong, I want to thay trang 404 than thien voi goi y dieu huong, so that toi co the quay lai noi dung chinh thay vi roi khoi website.
- **Acceptance criteria:**
  - Tieu de lon: "404" va "Trang khong ton tai"
  - Mo ta: "Trang ban dang tim khong ton tai hoac da bi xoa."
  - CTA: nut "Ve trang chu" (primary) va "Xem danh muc" (secondary)
  - Design phong cach nhat quan voi website (mau nau, typography)
  - Navigation (header + footer) van hien thi binh thuong
  - HTTP status code 404 thuc su (khong phai 200)
- **Design ref:** Missing -- needs design

---

### A9.2 500 Page

- **Feature ID:** A9.2
- **Priority:** P1
- **Description:** Trang loi 500 khi server gap loi.
- **User story:** As a nguoi dung gap loi server, I want to thay thong bao loi ro rang va co nut thu lai, so that toi khong bi boi roi va co the tiep tuc su dung.
- **Acceptance criteria:**
  - Tieu de: "500" va "Loi he thong"
  - Mo ta: "Co loi xay ra. Vui long thu lai sau it phut."
  - CTA: nut "Thu lai" (reload trang) va "Ve trang chu"
  - Khong hien thi stack trace hoac thong tin ky thuat
  - Navigation (header + footer) van hien thi binh thuong
  - Log loi chi tiet o server side (Pino logger voi RequestID)
- **Design ref:** Missing -- needs design

---

# =============================================
# MODULE B: ADMIN PANEL
# =============================================

---

## B1. AUTHENTICATION

---

### B1.1 Login Page

- **Feature ID:** B1.1
- **Priority:** P0
- **Description:** Trang dang nhap admin voi email va mat khau, co rate limiting de chong brute force.
- **User story:** As a admin, I want to dang nhap an toan vao he thong quan ly, so that chi nhung nguoi co quyen moi truy cap duoc admin panel.
- **Acceptance criteria:**
  - Fields: Email (required, validate format), Mat khau (required, toi thieu 8 ky tu)
  - Button: "Dang nhap" -- full width, mau nau dam
  - Rate limiting: sau 5 lan sai lien tiep trong 10 phut -> khoa tai khoan 30 phut
  - Hien thi thong bao loi cu the: "Email hoac mat khau khong dung" (khong chi ra field nao sai)
  - Hien thi so lan con lai truoc khi bi khoa: "Con 2 lan thu"
  - Sau dang nhap thanh cong: redirect den Dashboard (/admin/dashboard)
  - Mat khau: nut toggle show/hide (icon mat)
  - API: POST /api/auth/login -> tra ve JWT access token (60 phut) + refresh token (7 ngay, HttpOnly cookie)
  - CSRF protection token
  - Khong luu mat khau trong localStorage
- **Design ref:** Missing -- needs design

---

### B1.2 Forgot Password

- **Feature ID:** B1.2
- **Priority:** P1
- **Description:** Luong quen mat khau: nhap email -> nhan link reset -> dat mat khau moi.
- **User story:** As a admin quen mat khau, I want to reset mat khau qua email, so that toi co the truy cap lai tai khoan ma khong can nho vien ky thuat.
- **Acceptance criteria:**
  - Buoc 1: Form nhap email, button "Gui link reset"
  - Buoc 2: Gui email chua link reset (token het han sau 1 gio, dung 1 lan)
  - Buoc 3: Trang dat mat khau moi (2 fields: mat khau moi, xac nhan mat khau)
  - Mat khau moi: toi thieu 8 ky tu, it nhat 1 chu hoa, 1 so, 1 ky tu dac biet
  - Thong bao thanh cong va redirect ve trang login
  - Bao mat: luon hien thi "Neu email ton tai, chung toi da gui link reset" (khong xac nhan email co ton tai)
  - API: POST /api/auth/forgot-password, POST /api/auth/reset-password
- **Design ref:** Missing -- needs design

---

### B1.3 Session Management

- **Feature ID:** B1.3
- **Priority:** P0
- **Description:** Quan ly phien dang nhap voi JWT access token va refresh token.
- **User story:** As a admin, I want to duy tri phien dang nhap trong 7 ngay, so that toi khong phai dang nhap lai moi khi mo trinh duyet.
- **Acceptance criteria:**
  - Access token: JWT, het han sau 60 phut, luu trong memory (khong localStorage)
  - Refresh token: JWT, het han sau 7 ngay, luu trong HttpOnly cookie (Secure, SameSite=Strict)
  - Tu dong refresh access token khi het han (silent refresh truoc khi token expired)
  - API interceptor: tu dong dinh kem Authorization header va xu ly 401
  - Logout: xoa ca access va refresh token, revoke refresh token phia server
  - Neu refresh token het han: redirect ve trang login voi thong bao "Phien dang nhap het han"
  - API: POST /api/auth/refresh, POST /api/auth/logout
- **Design ref:** N/A (ky thuat, khong can design)

---

## B2. DASHBOARD

---

### B2.1 KPI Metrics Cards

- **Feature ID:** B2.1
- **Priority:** P0
- **Description:** 4 card chi so chinh tren dashboard: Total Visitors, Avg Session Duration, Conversion Rate, Inquiries. Moi card co gia tri va xu huong (trend).
- **User story:** As a admin, I want to thay tong quan cac chi so quan trong ngay khi mo dashboard, so that toi nam bat tinh hinh kinh doanh nhanh chong.
- **Acceptance criteria:**
  - 4 card: "Total Visitors" (24,812 +14%), "Avg. Session" (4m 32s Stable), "Conversion" (3.2% -2%), "Inquiries" (156 +8%)
  - Trend indicator: mau xanh la voi mui ten len (tang), mau do voi mui ten xuong (giam), mau xam (stable)
  - Desktop: 4 card ngang hang, chia deu
  - Mobile: 1 card lon (Total Visits) + 2 card nho ngang hang (Leads, Active Posts) theo design mobile
  - Du lieu tu API: GET /api/admin/dashboard/kpi
  - Loading skeleton khi dang tai du lieu
  - Auto refresh moi 5 phut (hoac real-time qua Socket.io)
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (4 KPI cards), `vietnet_mobile_admin_c_gi_h_ng/screen.png` (mobile KPI layout)

---

### B2.2 Admin Sidebar

- **Feature ID:** B2.2
- **Priority:** P0
- **Description:** Thanh dieu huong ben trai admin panel voi cac menu item va trang thai active.
- **User story:** As a admin, I want to co menu ben trai de di chuyen giua cac chuc nang, so that toi truy cap nhanh bat ky phan nao cua admin panel.
- **Acceptance criteria:**
  - Menu items: Dashboard, Articles (Articles/Posts), Accounts, Analytics, Settings
  - Item active: nen mau nau dam, text trang, border-left hoac full highlight
  - Icon + text cho moi menu item
  - Logo "VietNet Admin" + subtitle "Interior Management" o dau sidebar
  - Button "+ New Project" noi bat o cuoi sidebar (mau nau, icon +)
  - Avatar + ten admin + role o cuoi sidebar
  - Desktop: luon hien thi (width ~250px)
  - Mobile: an mac dinh, mo ra khi tap hamburger icon, overlay toan man hinh
  - Transition smooth khi mo/dong tren mobile
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (sidebar), `vietnet_post_management_desktop/screen.png` (sidebar with Articles active)

---

### B2.3 Quick Actions

- **Feature ID:** B2.3
- **Priority:** P1
- **Description:** 3 nut hanh dong nhanh tren dashboard: Create New Listing, Pending Reviews, Generate Report.
- **User story:** As a admin, I want to thuc hien cac tac vu pho bien chi voi 1 click tu dashboard, so that toi tiet kiem thoi gian di chuyen qua nhieu menu.
- **Acceptance criteria:**
  - 3 card hanh dong nhanh nam ngang phia tren KPI:
    - "Create New Listing" (icon post +) -> di chuyen den /admin/projects/new
    - "Pending Reviews" (icon ?) -> hien thi so luong "12 tasks remaining", click di chuyen den danh sach
    - "Generate Report" (icon sparkles) -> mo dialog chon loai report va khoang thoi gian
  - Desktop: 3 card ngang hang
  - Mobile: "Create Post" va "Manage Consultation" la 2 nut lon (theo design mobile)
  - Hover effect tren desktop (shadow tang, scale nhe)
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (Quick Actions row), `vietnet_mobile_admin_c_gi_h_ng/screen.png` (Quick Actions mobile)

---

### B2.4 Recent Consultations

- **Feature ID:** B2.4
- **Priority:** P0
- **Description:** Bang hien thi cac yeu cau tu van gan day nhat voi cac cot: Client, Project Type, Status, Date.
- **User story:** As a admin, I want to thay cac yeu cau tu van moi nhat ngay tren dashboard, so that toi co the xu ly nhanh cac yeu cau chua lien he.
- **Acceptance criteria:**
  - Bang cot: Client (avatar initials + ten), Project Type, Status (badge mau), Date
  - Status badges: SCHEDULED (xanh duong), PENDING (vang/cam), COMPLETED (xanh la)
  - Hien thi 4-5 dong moi nhat, link "VIEW ALL" di chuyen den trang quan ly tu van
  - Avatar: hien thi 2 chu cai dau cua ten (vd: MN cho Minh Nguyen), nen mau ngau nhien
  - Mobile: chuyen sang dang Activity Feed (B2.6) thay vi bang
  - API: GET /api/admin/consultations?limit=5&sort=createdAt:desc
  - Real-time: dong moi tu dong hien thi khi co yeu cau tu van moi (Socket.io)
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (Recent Consultations table)

---

### B2.5 Top Performing Project

- **Feature ID:** B2.5
- **Priority:** P2
- **Description:** Card hien thi du an co hieu suat tot nhat (engagement cao nhat) voi hinh anh va cac chi so.
- **User story:** As a admin, I want to biet du an nao dang duoc quan tam nhieu nhat, so that toi co the hoc hoi va ap dung cho cac du an khac.
- **Acceptance criteria:**
  - Card voi hinh anh du an, ten du an, series (vd: "VILLA SERIES")
  - Metric: Engagement rate (vd: 94%), Inquiry Rate (vd: 12%)
  - Link "View Detailed Insights" di chuyen den trang analytics cua du an do
  - Vi tri: ben phai bang Recent Consultations tren desktop
  - Mobile: an hoac hien thi duoi Activity Feed
  - API: GET /api/admin/projects/top-performing
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (Top Performing card ben phai)

---

### B2.6 Activity Feed (Mobile)

- **Feature ID:** B2.6
- **Priority:** P1
- **Description:** Timeline hoat dong gan day tren mobile admin dashboard, thay the bang Recent Consultations.
- **User story:** As a admin dung mobile, I want to thay timeline hoat dong thay vi bang (kho doc tren mobile), so that toi cap nhat tinh hinh de dang tren dien thoai.
- **Acceptance criteria:**
  - Danh sach doc voi icon + mo ta + thoi gian cho moi hoat dong
  - Cac loai: "New Consultation Request" (icon tin nhan), "Updated Project Gallery" (icon hinh), "Admin Login Detected" (icon bao mat)
  - Thoi gian tuong doi: "2 hours ago", "5 hours ago", "Yesterday"
  - Hinh thumbnail nho neu hoat dong lien quan den hinh anh
  - Header: "RECENT ACTIVITY" voi link "View All"
  - Chi hien thi tren mobile (<= 768px), desktop dung bang (B2.4)
  - Toi da 5 hoat dong moi nhat
- **Design ref:** `vietnet_mobile_admin_c_gi_h_ng/screen.png` (RECENT ACTIVITY section)

---

### B2.7 Global Search

- **Feature ID:** B2.7
- **Priority:** P1
- **Description:** O tim kiem toan cuc trong admin panel de tim du an, bai viet, yeu cau tu van.
- **User story:** As a admin, I want to tim kiem nhanh bat ky noi dung nao trong admin, so that toi khong phai duyet qua nhieu trang.
- **Acceptance criteria:**
  - O search o goc phai tren header admin: "Search insights..."
  - Debounce 300ms, hien thi dropdown ket qua
  - Ket qua nhom theo loai: Projects, Consultations, Settings
  - Enter di chuyen den trang ket qua tim kiem admin
  - Click ket qua di chuyen den trang chi tiet tuong ung
  - Shortcut: Ctrl+K (hoac Cmd+K tren Mac) de focus vao search
  - API: GET /api/admin/search?q=keyword
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (Search insights... input)

---

### B2.8 Notification Bell

- **Feature ID:** B2.8
- **Priority:** P1
- **Description:** Icon chuong thong bao real-time o header admin, hien thi so thong bao chua doc.
- **User story:** As a admin, I want to nhan thong bao ngay khi co yeu cau tu van moi hoac hoat dong quan trong, so that toi xu ly kip thoi.
- **Acceptance criteria:**
  - Icon chuong o goc phai tren, ben canh search
  - Badge so mau do hien thi so thong bao chua doc (vd: badge "3")
  - Click mo dropdown danh sach thong bao (5 moi nhat)
  - Cac loai thong bao: yeu cau tu van moi, du an moi duoc publish, loi he thong
  - Real-time: nhan thong bao qua Socket.io room "admin"
  - Mark as read: click vao thong bao danh dau da doc
  - Link "Xem tat ca" di chuyen den trang thong bao day du
  - API: GET /api/admin/notifications, PUT /api/admin/notifications/:id/read
  - Socket event: "new_consultation", "project_published"
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (bell icon), `vietnet_mobile_admin_c_gi_h_ng/screen.png` (bell icon with badge "3")

---

## B3. POST/PROJECT MANAGEMENT

---

### B3.1 Project Table

- **Feature ID:** B3.1
- **Priority:** P0
- **Description:** Bang danh sach du an/bai viet voi cac cot: thumbnail, tieu de, ref code, category, ngay tao, status, actions.
- **User story:** As a admin, I want to xem danh sach tat ca du an duoi dang bang, so that toi quan ly va tim kiem du an de dang.
- **Acceptance criteria:**
  - Cac cot: Thumbnail (hinh nho 48x48), Project Information (ten + ref code VN-2024-XXX), Category (badge), Date Created, Status (badge), Actions (icon edit/delete)
  - Sap xep theo ngay tao mac dinh (moi nhat truoc)
  - Hover row: highlight nhe background
  - Click vao row mo trang chi tiet/chinh sua du an
  - Desktop: bang day du cac cot
  - Mobile: card list thay vi bang (moi du an 1 card voi thong tin chinh)
  - API: GET /api/admin/projects?page=1&limit=10&sort=createdAt:desc
- **Design ref:** `vietnet_post_management_desktop/screen.png` (Project table)

---

### B3.2 CRUD Operations

- **Feature ID:** B3.2
- **Priority:** P0
- **Description:** Tao moi, xem, chinh sua, xoa du an trong admin panel.
- **User story:** As a admin, I want to tao, chinh sua va xoa du an, so that toi quan ly noi dung website lien tuc.
- **Acceptance criteria:**
  - **Create:** Form tao du an moi voi cac fields: tieu de, mo ta (rich text editor), category, images, SEO fields. API: POST /api/admin/projects
  - **Read:** Trang chi tiet du an voi tat ca thong tin. API: GET /api/admin/projects/:id
  - **Update:** Form chinh sua voi du lieu da dien san, auto-save draft moi 30 giay. API: PUT /api/admin/projects/:id
  - **Delete:** Dialog xac nhan "Ban co chac chan muon xoa du an nay?", nhap ten du an de xac nhan (cho du an Published). API: DELETE /api/admin/projects/:id
  - Nut "+ New Project" tren sidebar va trang table
  - Sau tao/sua: redirect ve table voi toast thanh cong
  - Sau xoa: xoa khoi table, toast thanh cong, khong the undo
- **Design ref:** `vietnet_post_management_desktop/screen.png` (+ New Project button)

---

### B3.3 Status Flow

- **Feature ID:** B3.3
- **Priority:** P0
- **Description:** He thong trang thai du an: Draft -> Published, voi badge mau tuong ung.
- **User story:** As a admin, I want to quan ly trang thai du an (nhap vs da xuat ban), so that toi kiem soat noi dung nao hien thi tren website.
- **Acceptance criteria:**
  - 2 trang thai: Draft (badge mau cam/vang) va Published (badge mau xanh la)
  - Du an moi tao mac dinh la Draft
  - Nut "Publish" de chuyen tu Draft -> Published
  - Nut "Unpublish" de chuyen tu Published -> Draft
  - Chi du an Published moi hien thi tren public website
  - Bang du an: filter theo status (All, Draft, Published)
  - API: PUT /api/admin/projects/:id/status { status: "published" | "draft" }
- **Design ref:** `vietnet_post_management_desktop/screen.png` (PUBLISHED badge xanh, DRAFT badge cam)

---

### B3.4 Category System

- **Feature ID:** B3.4
- **Priority:** P0
- **Description:** He thong phan loai du an: Residential, Commercial, Hospitality.
- **User story:** As a admin, I want to gan category cho du an, so that khach hang co the loc va tim du an theo loai hinh.
- **Acceptance criteria:**
  - 3 category mac dinh: Residential (nha o), Commercial (thuong mai), Hospitality (khach san/resort)
  - Hien thi dang badge mau trong bang va chi tiet du an
  - Moi du an chi thuoc 1 category
  - Filter du an theo category trong bang quan ly
  - Co the them/sua/xoa category tu Settings (khong hardcode)
  - API: GET /api/admin/categories, POST /api/admin/categories
- **Design ref:** `vietnet_post_management_desktop/screen.png` (Residential, Commercial, Hospitality tags)

---

### B3.5 Image Gallery Manager

- **Feature ID:** B3.5
- **Priority:** P0
- **Description:** Cong cu quan ly hinh anh du an: upload nhieu hinh, sap xep thu tu keo tha, xoa hinh.
- **User story:** As a admin, I want to upload nhieu hinh anh cho du an va sap xep thu tu hien thi, so that gallery du an tren website dep va co thu tu hop ly.
- **Acceptance criteria:**
  - Upload: chon nhieu file cung luc (input multiple), ho tro drag-and-drop
  - Dinh dang cho phep: JPEG, PNG, WebP. Kich thuoc toi da: 10MB/file
  - Hien thi thumbnail preview ngay sau khi chon file (truoc khi upload)
  - Progress bar cho moi file dang upload
  - Keo tha (drag and drop) de sap xep thu tu hinh anh
  - Xoa hinh: icon X goc tren, xac nhan truoc khi xoa
  - Hinh dau tien tu dong la cover image (hoac cho phep chon cover)
  - Server xu ly: resize (2048px desktop, 768px mobile), convert WebP 80%, strip EXIF
  - API: POST /api/admin/upload (multipart/form-data) -> BullMQ IMAGE_JOB
  - Luu R2: private bucket (originals), public bucket (thumbnails/previews)
- **Design ref:** Missing -- needs design (form tao/chinh sua du an)

---

### B3.6 SEO Fields

- **Feature ID:** B3.6
- **Priority:** P1
- **Description:** Cac truong SEO trong form tao/chinh sua du an: title, description, OG image, slug.
- **User story:** As a admin, I want to tuy chinh SEO meta cho tung du an, so that du an xuat hien tot tren Google va mang xa hoi.
- **Acceptance criteria:**
  - Fields: SEO Title (max 60 ky tu, hien thi dem ky tu), SEO Description (max 160 ky tu), Slug (tu dong generate tu title, cho phep chinh sua), OG Image (chon tu gallery hoac upload rieng)
  - Preview: hien thi preview Google search result voi title va description da nhap
  - Slug auto-generate: loai bo dau tieng Viet, thay space bang dash, lowercase
  - Validate slug unique (API check khi blur)
  - Tu dong dien neu de trong: title = tieu de du an, description = 160 ky tu dau cua mo ta
  - API: nam trong body cua POST/PUT /api/admin/projects
- **Design ref:** Missing -- needs design

---

### B3.7 Search & Filter

- **Feature ID:** B3.7
- **Priority:** P1
- **Description:** Tim kiem va loc du an trong bang quan ly theo tieu de, category, status.
- **User story:** As a admin co nhieu du an, I want to tim kiem va loc nhanh du an, so that toi khong phai cuon qua danh sach dai.
- **Acceptance criteria:**
  - O search: "Search projects..." -- tim theo tieu de va ref code, debounce 300ms
  - Nut Filter: mo dropdown voi cac tuy chon loc -- Category (All, Residential, Commercial, Hospitality), Status (All, Draft, Published)
  - Ket qua cap nhat tu dong khi nhap hoac chon filter
  - Clear filter: nut xoa filter de quay ve mac dinh
  - URL cap nhat query string de ho tro bookmark va chia se
  - API: GET /api/admin/projects?q=keyword&category=residential&status=published
- **Design ref:** `vietnet_post_management_desktop/screen.png` (Search projects input + Filter button)

---

### B3.8 Pagination

- **Feature ID:** B3.8
- **Priority:** P1
- **Description:** Phan trang cho bang du an: hien thi "Showing X of Y", page numbers.
- **User story:** As a admin, I want to chuyen trang trong danh sach du an, so that toi xem duoc tat ca du an ma khong tai het cung luc.
- **Acceptance criteria:**
  - Text: "Showing 4 of 28 boutique projects" (so thuc te)
  - Page numbers: < 1 [2] 3 > voi trang hien tai highlight mau nau
  - Nut Previous (<) va Next (>) di chuyen trang
  - Mac dinh 10 du an/trang
  - Giua giu URL query ?page=2 de ho tro browser back
  - Scroll len dau bang khi chuyen trang
  - API: GET /api/admin/projects?page=2&limit=10
- **Design ref:** `vietnet_post_management_desktop/screen.png` (Showing 4 of 28, < 1 2 3 >)

---

## B4. CONSULTATION MANAGEMENT

---

### B4.1 Consultation Table

- **Feature ID:** B4.1
- **Priority:** P0
- **Description:** Bang quan ly yeu cau tu van voi cac cot: Name, Phone, Service Interest, Date, Status, Actions.
- **User story:** As a admin, I want to xem tat ca yeu cau tu van duoi dang bang, so that toi quan ly va xu ly tung yeu cau.
- **Acceptance criteria:**
  - Cac cot: Name, Phone, Service Interest (loai du an), Date, Status (text mau), Actions (nut View, Edit, Delete)
  - Du lieu tu API: GET /api/admin/consultations?page=1&limit=20
  - Sap xep theo ngay moi nhat mac dinh
  - Hover row highlight nhe
  - Mobile: chuyen sang card list
  - Status hien thi bang text mau khac nhau (New = xanh duong, Contacted = cam, v.v.)
- **Design ref:** `vietnet_consultation_management/screen.png`

---

### B4.2 Status Workflow

- **Feature ID:** B4.2
- **Priority:** P0
- **Description:** Luong trang thai yeu cau tu van: New -> Contacted -> Scheduled -> Completed.
- **User story:** As a admin, I want to cap nhat trang thai yeu cau tu van theo tien trinh, so that toi theo doi duoc qua trinh xu ly tung yeu cau.
- **Acceptance criteria:**
  - 4 trang thai: New (mau xanh duong), Contacted (mau cam), Scheduled (mau tim), Completed (mau xanh la)
  - Chi cho phep chuyen trang thai theo thu tu: New -> Contacted -> Scheduled -> Completed
  - Click vao status badge hoac dropdown de cap nhat trang thai
  - Ghi nhan thoi gian va admin thuc hien khi chuyen trang thai
  - Co the them ghi chu khi chuyen trang thai (vd: "Da goi, hen gap ngay 25/3")
  - API: PUT /api/admin/consultations/:id/status { status: "contacted", note: "..." }
  - Khong cho phep quay nguoc trang thai (Completed -> Scheduled) tru khi la super admin
- **Design ref:** `vietnet_consultation_management/screen.png` (Status column: New, Contacted, Completed)

---

### B4.3 Search & Date Filter

- **Feature ID:** B4.3
- **Priority:** P1
- **Description:** Tim kiem theo ten khach hang va loc theo khoang ngay.
- **User story:** As a admin, I want to tim yeu cau tu van theo ten hoac loc theo ngay, so that toi nhanh chong tim duoc yeu cau can xu ly.
- **Acceptance criteria:**
  - O search: tim theo ten khach hang, so dien thoai, email
  - Date filter: nut "Filter by Date" mo date range picker (tu ngay - den ngay)
  - Ket qua cap nhat ngay khi nhap hoac chon ngay
  - Clear filter: xoa bo loc de quay ve tat ca
  - API: GET /api/admin/consultations?q=keyword&from=2026-03-01&to=2026-03-27
- **Design ref:** `vietnet_consultation_management/screen.png` (Search input + Filter by Date)

---

### B4.4 Real-time Alert

- **Feature ID:** B4.4
- **Priority:** P0
- **Description:** Thong bao real-time khi co yeu cau tu van moi tu public website.
- **User story:** As a admin, I want to nhan thong bao ngay khi co khach gui yeu cau tu van, so that toi co the lien he lai nhanh nhat co the.
- **Acceptance criteria:**
  - Khi khach hang submit form tu van tren public website:
    - Admin dang online nhan Socket.io event "new_consultation"
    - Toast notification hien thi o goc tren phai: "Yeu cau tu van moi tu [Ten khach hang]"
    - Badge thong bao tren chuong (B2.8) tang len 1
    - Dong moi tu dong xuat hien trong bang Consultation (neu dang o trang do)
  - Am thanh thong bao (co the tat trong Settings)
  - Click toast di chuyen den chi tiet yeu cau tu van
  - Socket.io room: "admin" -- tat ca admin deu nhan
- **Design ref:** N/A (behavior, khong can design rieng)

---

### B4.5 Email Auto-reply

- **Feature ID:** B4.5
- **Priority:** P1
- **Description:** Tu dong gui email xac nhan cho khach hang sau khi ho gui yeu cau tu van.
- **User story:** As a khach hang vua gui yeu cau, I want to nhan email xac nhan, so that toi biet yeu cau da duoc tiep nhan va khong can lo lang.
- **Acceptance criteria:**
  - Email gui tu dong ngay sau khi form submit thanh cong
  - Noi dung email: cam on, tom tat thong tin yeu cau, thoi gian du kien lien he (24h)
  - Template email co thuong hieu VietNet (logo, mau sac nhat quan)
  - Gui qua BullMQ MAIL_JOB -> Resend API (khong gui dong bo trong request)
  - Email co the tuy chinh tu admin Settings (B8.3)
  - Retry 3 lan neu gui that bai
  - API: tu dong trigger trong handler POST /api/consultations
- **Design ref:** N/A (email template, quan ly tu admin)

---

## B5. PAGE BUILDER

---

### B5.1 Edit Mode Toggle

- **Feature ID:** B5.1
- **Priority:** P0
- **Description:** Nut chuyen doi giua che do xem (Viewer Mode) va che do chinh sua (Edit Mode) cho trang chu.
- **User story:** As a admin, I want to bat/tat che do chinh sua trang chu, so that toi co the chinh sua truc tiep noi dung tren giao dien that.
- **Acceptance criteria:**
  - Thanh cong cu admin (admin toolbar) co dinh phia tren khi dang nhap admin
  - Toggle switch hoac nut chuyen giua "Viewer Mode" va "Edit Mode"
  - Edit Mode: hien thi cac vung co the chinh sua voi vien net dut va icon edit
  - Viewer Mode: an tat ca cong cu chinh sua, hien thi nhu khach hang thay
  - Indicator ro rang: "Dang o che do chinh sua" hoac mau nen khac biet
  - Chi admin co quyen moi thay admin toolbar
  - Khong anh huong den trai nghiem khach hang (khong render toolbar cho guest)
- **Design ref:** `vietnet_homepage_edit_mode_desktop/screen.png` (edit mode), `vietnet_homepage_viewer_mode_desktop/screen.png` (viewer mode), `vietnet_homepage_edit_mode/screen.png` (mobile edit mode)

---

### B5.2 Editable Blocks

- **Feature ID:** B5.2
- **Priority:** P0
- **Description:** Cac khoi noi dung co the chinh sua tren trang chu, duoc danh dau bang vien net dut va icon trigger.
- **User story:** As a admin, I want to thay ro cac phan co the chinh sua va click vao de sua, so that toi biet chinh xac vung nao co the thay doi.
- **Acceptance criteria:**
  - Khi Edit Mode bat: moi block co the chinh sua hien thi vien dashed (net dut) mau xam
  - Icon edit (but chi) hien thi o goc tren phai moi block
  - Hover block: vien chuyen sang mau nau, icon sang len
  - Click icon hoac click vao block mo editor tuong ung (modal hoac inline)
  - Cac block: Hero, About, Portfolio/Projects, Materials, Testimonials, CTA Form, Footer
  - Moi block doc lap, chinh sua 1 block khong anh huong block khac
  - Cancel: huy thay doi, quay ve trang thai truoc
- **Design ref:** `vietnet_homepage_edit_mode_desktop/screen.png` (dashed borders visible on sections), `vietnet_homepage_edit_mode/screen.png` (mobile edit mode with edit icons)

---

### B5.3 Hero Editor

- **Feature ID:** B5.3
- **Priority:** P0
- **Description:** Editor cho Hero Section: thay doi hinh nen, headline, mo ta, text CTA.
- **User story:** As a admin, I want to thay doi hinh anh va text cua hero section, so that toi cap nhat noi dung trang chu theo chien dich marketing.
- **Acceptance criteria:**
  - Fields co the chinh sua: Hinh nen (upload hoac chon tu media library), Headline (text input, max 100 ky tu), Description (textarea, max 300 ky tu), CTA text (2 nut, text + URL)
  - Preview real-time: thay doi hien thi ngay tren giao dien (khong can save)
  - Save: luu thay doi vao database, cap nhat trang cong khai
  - Cancel: huy thay doi, quay ve trang thai truoc do
  - Validation: headline khong duoc de trong, hinh anh phai co
  - API: PUT /api/admin/page-builder/hero { image, headline, description, cta1Text, cta1Url, cta2Text, cta2Url }
- **Design ref:** `vietnet_homepage_edit_mode_desktop/screen.png` (hero section in edit mode)

---

### B5.4 Section Editors

- **Feature ID:** B5.4
- **Priority:** P1
- **Description:** Editors cho cac section khac cua trang chu: About, Portfolio, Materials, Testimonials.
- **User story:** As a admin, I want to chinh sua noi dung tung section tren trang chu, so that toi cap nhat thong tin cong ty va du an noi bat.
- **Acceptance criteria:**
  - **About Editor:** Chinh sua headline, mo ta, hinh anh, cac con so stats
  - **Portfolio Editor:** Chon 3-6 du an noi bat tu danh sach du an da Published
  - **Materials Editor:** Chinh sua cac mau vat lieu (hinh, ten, mo ta)
  - **Testimonials Editor:** Chinh sua noi dung nhan xet, ten khach hang, rating
  - Moi editor: modal hoac panel truot tu ben phai (drawer)
  - Preview real-time truoc khi save
  - API: PUT /api/admin/page-builder/sections/:sectionName { config JSON }
- **Design ref:** `vietnet_homepage_edit_mode_desktop/screen.png` (multiple sections with edit icons)

---

### B5.5 Add/Remove Sections

- **Feature ID:** B5.5
- **Priority:** P2
- **Description:** Them hoac xoa section tren trang chu, thay doi thu tu hien thi.
- **User story:** As a admin, I want to them section moi hoac an section khong can, so that trang chu linh hoat theo nhu cau.
- **Acceptance criteria:**
  - Nut "+" giua 2 section de chen section moi
  - Chon loai section tu danh sach: Hero, About, Projects, Materials, Testimonials, CTA, Custom HTML
  - Keo tha de sap xep thu tu section (drag and drop)
  - Nut "An" (icon mat) de an section ma khong xoa (toggle visibility)
  - Nut "Xoa" de xoa section vinh vien (xac nhan truoc)
  - API: PUT /api/admin/page-builder/layout { sections: [{ type, order, visible, config }] }
- **Design ref:** Missing -- needs design

---

### B5.6 Preview Mode

- **Feature ID:** B5.6
- **Priority:** P1
- **Description:** Che do xem truoc (Draft Mode) truoc khi publish thay doi trang chu.
- **User story:** As a admin, I want to xem truoc thay doi truoc khi cong khai, so that toi tranh loi hien thi tren website thuc.
- **Acceptance criteria:**
  - Nut "Preview" tren admin toolbar
  - Mo tab moi voi URL /preview?token=xxx hien thi phien ban nhap
  - Preview co banner nho: "Ban dang xem ban nhap. [Publish] [Quay lai chinh sua]"
  - Responsive preview: co the chon breakpoint (Mobile 375px, Tablet 768px, Desktop 1280px)
  - Preview token het han sau 1 gio, chi valid cho admin dang dang nhap
  - Khong index boi search engine (meta robots noindex)
- **Design ref:** Missing -- needs design

---

### B5.7 Save/Cancel

- **Feature ID:** B5.7
- **Priority:** P0
- **Description:** Co che luu va huy thay doi trong Page Builder voi JSON config storage.
- **User story:** As a admin, I want to luu hoac huy thay doi Page Builder, so that toi kiem soat duoc khi nao thay doi duoc ap dung.
- **Acceptance criteria:**
  - Nut "Save Changes": luu tat ca thay doi dang cho vao database
  - Nut "Cancel": huy tat ca thay doi, quay ve trang thai da luu truoc do
  - Confirm dialog khi Cancel neu co thay doi chua luu: "Ban co thay doi chua luu. Huy bo?"
  - Config luu dang JSON trong database: { sections: [...], updatedAt, updatedBy }
  - History: luu 5 phien ban truoc de rollback neu can
  - Auto-save draft moi 30 giay (khong publish, chi luu nhap)
  - API: PUT /api/admin/page-builder/save, GET /api/admin/page-builder/config
- **Design ref:** `vietnet_homepage_edit_mode/screen.png` (save/cancel buttons on admin toolbar)

---

## B6. ANALYTICS

---

### B6.1 Traffic Overview

- **Feature ID:** B6.1
- **Priority:** P1
- **Description:** Bieu do hien thi luot xem trang (page views) theo thoi gian.
- **User story:** As a admin, I want to thay bieu do luong truy cap theo ngay/tuan/thang, so that toi danh gia hieu qua marketing va noi dung.
- **Acceptance criteria:**
  - Bieu do duong (line chart) hien thi page views theo thoi gian
  - Bo chon khoang thoi gian: 7 ngay, 30 ngay, 90 ngay, tuy chinh
  - Hover vao diem tren bieu do hien thi tooltip voi so chinh xac
  - So sanh voi ky truoc (optional, duong net dut)
  - API: GET /api/admin/analytics/traffic?from=xxx&to=xxx&interval=day
  - Loading skeleton khi dang tai
- **Design ref:** Missing -- needs design (Analytics page chua co trong design files)

---

### B6.2 Bot Filtering

- **Feature ID:** B6.2
- **Priority:** P1
- **Description:** Loc bo luot truy cap cua bot/crawler khoi thong ke de dam bao du lieu chinh xac.
- **User story:** As a admin, I want to chi thay thong ke cua nguoi dung that, so that du lieu analytics phan anh dung thuc te.
- **Acceptance criteria:**
  - Tu dong nhan dien bot qua User-Agent (Googlebot, Bingbot, v.v.)
  - Khong dem page view tu bot vao thong ke
  - Danh sach bot pattern co the cap nhat tu Settings
  - Hien thi tuy chon "Bao gom bot traffic" (toggle) tren trang Analytics
  - API: middleware loc bot truoc khi ghi nhan page view
- **Design ref:** N/A (ky thuat, khong can design)

---

### B6.3 Admin IP Exclusion

- **Feature ID:** B6.3
- **Priority:** P2
- **Description:** Loai bo luot truy cap tu IP cua admin khoi thong ke.
- **User story:** As a admin, I want to loai bo luot truy cap cua chinh toi khoi thong ke, so that du lieu khong bi lech boi hoat dong quan tri.
- **Acceptance criteria:**
  - Danh sach IP loai tru co the cau hinh trong Settings
  - Tu dong detect va goi y IP hien tai cua admin
  - Luot truy cap tu IP trong danh sach khong duoc dem
  - Ho tro CIDR notation (vd: 192.168.1.0/24)
  - API: GET/PUT /api/admin/settings/excluded-ips
- **Design ref:** N/A (ky thuat, khong can design)

---

### B6.4 Device Breakdown

- **Feature ID:** B6.4
- **Priority:** P1
- **Description:** Bieu do hien thi ti le truy cap tu Mobile vs Desktop.
- **User story:** As a admin, I want to biet ti le nguoi dung mobile va desktop, so that toi uu tien toi uu trai nghiem cho nhom lon hon.
- **Acceptance criteria:**
  - Bieu do tron (pie/donut chart): Mobile vs Desktop vs Tablet
  - Hien thi phan tram va so luong cua moi loai
  - Co mau sac khac nhau ro rang cho tung loai thiet bi
  - Cap nhat theo khoang thoi gian da chon (dong bo voi B6.1)
  - API: GET /api/admin/analytics/devices?from=xxx&to=xxx
- **Design ref:** Missing -- needs design

---

### B6.5 Top Pages

- **Feature ID:** B6.5
- **Priority:** P1
- **Description:** Danh sach cac trang co luot xem nhieu nhat, xep hang theo views.
- **User story:** As a admin, I want to biet trang nao duoc xem nhieu nhat, so that toi tap trung toi uu noi dung cac trang pho bien.
- **Acceptance criteria:**
  - Bang: URL trang, So luot xem, Thoi gian trung binh, Bounce rate
  - Sap xep theo luot xem giam dan mac dinh
  - Toi da 20 trang hien thi
  - Click vao URL mo trang do trong tab moi
  - API: GET /api/admin/analytics/top-pages?from=xxx&to=xxx&limit=20
- **Design ref:** Missing -- needs design

---

### B6.6 Traffic Sources

- **Feature ID:** B6.6
- **Priority:** P2
- **Description:** Phan tich nguon truy cap: Direct, Organic Search, Social, Referral.
- **User story:** As a admin, I want to biet nguoi dung den tu dau, so that toi dau tu dung kenh marketing hieu qua.
- **Acceptance criteria:**
  - Bieu do cot ngang (horizontal bar chart) hoac bang: nguon truy cap va so luot
  - Cac nguon: Direct, Google Organic, Facebook, Zalo, Referral (website khac)
  - Phan tram va so tuyet doi cho moi nguon
  - Cap nhat theo khoang thoi gian da chon
  - API: GET /api/admin/analytics/sources?from=xxx&to=xxx
- **Design ref:** Missing -- needs design

---

## B7. USER MANAGEMENT

---

### B7.1 Admin List

- **Feature ID:** B7.1
- **Priority:** P0
- **Description:** Bang danh sach admin users voi thong tin co ban va actions.
- **User story:** As a super admin, I want to xem danh sach tat ca admin, so that toi quan ly quyen truy cap he thong.
- **Acceptance criteria:**
  - Cac cot: Avatar, Ten, Email, Role (Admin/Editor), Ngay tao, Trang thai (Active/Inactive), Actions
  - Sap xep theo ten mac dinh
  - Chi super admin/admin moi xem duoc trang nay
  - API: GET /api/admin/users
  - Mobile: card list thay vi bang
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (sidebar: Accounts menu item)

---

### B7.2 Create/Edit Admin

- **Feature ID:** B7.2
- **Priority:** P0
- **Description:** Form tao moi hoac chinh sua thong tin admin user.
- **User story:** As a super admin, I want to tao tai khoan admin moi hoac chinh sua thong tin admin hien co, so that toi quan ly doi ngu quan tri.
- **Acceptance criteria:**
  - Fields: Ho ten (required), Email (required, unique), Role (dropdown: Admin, Editor), Mat khau (required khi tao, optional khi sua)
  - Validation: email format, mat khau toi thieu 8 ky tu
  - Edit: hien thi du lieu hien tai, cho phep doi ten, email, role
  - Doi mat khau: field rieng, chi bat buoc khi tao moi
  - API: POST /api/admin/users (tao), PUT /api/admin/users/:id (sua)
  - Sau tao/sua: redirect ve danh sach voi toast thanh cong
- **Design ref:** Missing -- needs design

---

### B7.3 Role Management

- **Feature ID:** B7.3
- **Priority:** P1
- **Description:** He thong phan quyen: Admin (full access) va Editor (chi quan ly noi dung).
- **User story:** As a super admin, I want to phan quyen khac nhau cho tung admin, so that moi nguoi chi lam duoc nhung gi trong pham vi trach nhiem.
- **Acceptance criteria:**
  - 2 role: Admin (toan quyen: CRUD projects, consultations, users, settings, analytics) va Editor (chi CRUD projects va consultations, khong truy cap users va settings)
  - Middleware kiem tra role truoc moi API call (requireAdmin, requireEditor)
  - Menu sidebar an cac muc khong co quyen truy cap
  - API tra ve 403 Forbidden khi truy cap trai phep
  - Super admin (role rieng hoac admin dau tien) khong the bi xoa
- **Design ref:** N/A (logic, khong can design rieng)

---

### B7.4 Delete Admin

- **Feature ID:** B7.4
- **Priority:** P1
- **Description:** Xoa tai khoan admin voi dialog xac nhan.
- **User story:** As a super admin, I want to xoa tai khoan admin khong con can thiet, so that he thong gon gang va an toan.
- **Acceptance criteria:**
  - Nut Delete trong dong cua admin list (icon thung rac)
  - Dialog xac nhan: "Ban co chac chan muon xoa tai khoan [Email]?"
  - Khong the tu xoa chinh minh
  - Khong the xoa super admin (admin cuoi cung)
  - Soft delete: danh dau inactive thay vi xoa hoan toan tu database
  - API: DELETE /api/admin/users/:id
  - Sau xoa: cap nhat danh sach, toast thanh cong
- **Design ref:** Missing -- needs design

---

## B8. SETTINGS

---

### B8.1 Site Settings

- **Feature ID:** B8.1
- **Priority:** P1
- **Description:** Cau hinh thong tin chung cua website: ten cong ty, thong tin lien he, lien ket mang xa hoi.
- **User story:** As a admin, I want to cap nhat thong tin cong ty tu giao dien admin, so that toi khong can nho dev sua code moi khi doi so dien thoai hay dia chi.
- **Acceptance criteria:**
  - Fields: Ten cong ty, Slogan, Dia chi, So dien thoai, Email, Gio lam viec
  - Social links: Facebook URL, Zalo URL, Instagram URL, YouTube URL
  - Logo upload: logo chinh va logo trang (cho footer nen toi)
  - Favicon upload
  - Nut Save, hien thi trang thai "Da luu" hoac "Chua luu thay doi"
  - API: GET/PUT /api/admin/settings/site
  - Thay doi ap dung ngay tren public website (khong can deploy lai)
- **Design ref:** `vietnet_admin_dashboard_desktop/screen.png` (sidebar: Settings menu item)

---

### B8.2 SEO Defaults

- **Feature ID:** B8.2
- **Priority:** P1
- **Description:** Cau hinh SEO mac dinh cho toan website.
- **User story:** As a admin, I want to dat SEO mac dinh cho website, so that moi trang deu co meta tags tot ngay ca khi chua tuy chinh rieng.
- **Acceptance criteria:**
  - Fields: Default meta title template (vd: "[Page] | VietNet Interior"), Default meta description (160 ky tu), Default OG image (upload)
  - Google Analytics ID (neu dung GA)
  - Google Search Console verification meta tag
  - Preview: hien thi ket qua Google search mau voi title va description
  - API: GET/PUT /api/admin/settings/seo
- **Design ref:** Missing -- needs design

---

### B8.3 Email Templates

- **Feature ID:** B8.3
- **Priority:** P2
- **Description:** Quan ly template email tu dong (xac nhan tu van, thong bao admin).
- **User story:** As a admin, I want to tuy chinh noi dung email tu dong, so that email phu hop voi tone va noi dung toi muon truyen dat.
- **Acceptance criteria:**
  - Danh sach templates: Consultation Confirmation (gui cho khach), Admin Notification (gui cho admin)
  - Editor: rich text voi variables ({{name}}, {{project_type}}, {{date}})
  - Preview: hien thi email mau voi du lieu gia
  - Nut "Reset ve mac dinh" cho moi template
  - API: GET/PUT /api/admin/settings/email-templates/:templateId
  - Template luu dang HTML trong database
- **Design ref:** Missing -- needs design

---

# =============================================
# MODULE C: SYSTEM/BACKEND
# =============================================

---

## C1. Media Pipeline

---

### C1.1 Upload Endpoint

- **Feature ID:** C1.1
- **Priority:** P0
- **Description:** API upload file voi validation MIME type, kich thuoc va dinh dang.
- **User story:** As a admin upload hinh, I want to he thong tu dong kiem tra file hop le, so that khong co file doc hai hoac qua lon duoc luu tru.
- **Acceptance criteria:**
  - Endpoint: POST /api/admin/upload (multipart/form-data)
  - MIME types cho phep: image/jpeg, image/png, image/webp
  - Kich thuoc toi da: 10MB/file
  - Validate extension phai khop voi MIME type (chong doi duoi)
  - Tra ve: { success: true, data: { id, url, thumbnailUrl, width, height } }
  - Loi: 400 neu file khong hop le, 413 neu file qua lon
  - Su dung multer middleware voi limits config
  - Filename: ULID + original extension (vd: 01HYX...abc.webp)
- **Design ref:** N/A (API, khong can design)

---

### C1.2 Image Processing Job

- **Feature ID:** C1.2
- **Priority:** P0
- **Description:** BullMQ job xu ly hinh anh sau upload: resize, convert WebP, strip EXIF.
- **User story:** As a developer, I want to hinh anh duoc tu dong toi uu sau upload, so that website load nhanh va tiet kiem bang thong.
- **Acceptance criteria:**
  - BullMQ queue: IMAGE_JOB
  - Xu ly: Sharp resize 2048px (desktop), 768px (mobile thumbnail), giu aspect ratio
  - Convert sang WebP chat luong 80%
  - Strip EXIF metadata (bao mat, giam kich thuoc)
  - Tao 3 phien ban: original (giu nguyen), desktop (2048px), thumbnail (768px)
  - Retry 3 lan neu that bai, dead letter queue cho loi khong phuc hoi
  - Emit Socket.io event "image_processed" khi xong
  - Thoi gian xu ly target: < 5 giay cho 1 hinh 10MB
- **Design ref:** N/A (ky thuat)

---

### C1.3 R2 Storage

- **Feature ID:** C1.3
- **Priority:** P0
- **Description:** Luu tru hinh anh tren Cloudflare R2 voi 2 bucket: private (originals) va public (thumbnails/previews).
- **User story:** As a system, I want to luu hinh goc an toan va cung cap hinh da xu ly cong khai, so that hinh goc duoc bao ve va hinh hien thi load nhanh qua CDN.
- **Acceptance criteria:**
  - Private bucket: luu file goc, chi truy cap qua signed URL (het han 1 gio)
  - Public bucket: luu thumbnail va preview, truy cap truc tiep qua CDN URL
  - Cau truc thu muc: /{year}/{month}/{ulid}/{variant}.webp
  - Delete: khi xoa hinh tu admin, xoa ca 3 phien ban tren R2
  - Backup: private bucket co lifecycle rule giu 90 ngay
  - CDN: Cloudflare cache tren public bucket, cache-control max-age 1 nam
- **Design ref:** N/A (ky thuat)

---

## C2. Email Service

---

### C2.1 Email Job

- **Feature ID:** C2.1
- **Priority:** P0
- **Description:** BullMQ job gui email qua Resend API.
- **User story:** As a system, I want to gui email bat dong bo qua queue, so that API response nhanh va email duoc retry neu that bai.
- **Acceptance criteria:**
  - BullMQ queue: MAIL_JOB
  - Payload: { to, subject, html, from (default: noreply@bhquan.site) }
  - Gui qua Resend API (HTTP POST)
  - Retry 3 lan voi backoff exponential (1s, 4s, 16s)
  - Log moi email da gui (to, subject, status, timestamp) -- KHONG log noi dung email
  - Rate limit: toi da 100 email/gio (theo Resend free tier)
  - Dead letter queue cho email that bai sau 3 lan retry
- **Design ref:** N/A (ky thuat)

---

### C2.2 Email Templates

- **Feature ID:** C2.2
- **Priority:** P1
- **Description:** 2 template email: xac nhan tu van (gui khach) va thong bao admin (gui admin).
- **User story:** As a system, I want to co template email san, so that email gui di co thuong hieu va noi dung nhat quan.
- **Acceptance criteria:**
  - **Consultation Confirmation:** gui cho khach hang -- cam on, tom tat yeu cau, thoi gian lien he du kien
  - **Admin Notification:** gui cho tat ca admin -- thong tin khach hang, loai du an, noi dung yeu cau
  - Template HTML responsive (doc duoc tren mobile email client)
  - Variables: {{name}}, {{email}}, {{phone}}, {{projectType}}, {{message}}, {{date}}
  - Co the tuy chinh tu admin Settings (B8.3)
  - Default template co san khi deploy lan dau
- **Design ref:** N/A (ky thuat)

---

## C3. Real-time

---

### C3.1 Socket.io Rooms

- **Feature ID:** C3.1
- **Priority:** P0
- **Description:** Cau hinh Socket.io rooms cho real-time communication.
- **User story:** As a developer, I want to co he thong real-time co cau truc, so that events duoc gui dung nguoi nhan.
- **Acceptance criteria:**
  - Room "admin": tat ca admin join khi dang nhap, leave khi dang xuat
  - Room "user:{userId}": cho thong bao ca nhan (tuong lai)
  - Authentication: verify JWT token khi connect (middleware)
  - Reconnect: tu dong reconnect voi exponential backoff khi mat ket noi
  - Heartbeat: 30 giay, timeout 60 giay
  - CORS: chi cho phep tu domain bhquan.site va localhost (dev)
- **Design ref:** N/A (ky thuat)

---

### C3.2 Socket Events

- **Feature ID:** C3.2
- **Priority:** P0
- **Description:** Cac event Socket.io cho he thong.
- **User story:** As a admin, I want to nhan cap nhat real-time, so that toi khong can refresh trang de thay thong tin moi.
- **Acceptance criteria:**
  - Event "new_consultation": emit khi co yeu cau tu van moi, payload: { id, name, projectType, createdAt }
  - Event "page_view_update": emit moi 60 giay voi thong ke page view hien tai (cho dashboard)
  - Event "image_processed": emit khi xu ly hinh xong, payload: { imageId, urls }
  - Event "project_published": emit khi du an duoc publish, payload: { id, title }
  - Server chi emit, client subscribe -- khong gui du lieu nhay cam qua socket
  - Logging: ghi nhan moi event emit (type, room, timestamp)
- **Design ref:** N/A (ky thuat)

---

## C4. SEO Engine

---

### C4.1 Dynamic Sitemap

- **Feature ID:** C4.1
- **Priority:** P0
- **Description:** Tu dong generate sitemap.xml tu danh sach trang va du an/san pham da published.
- **User story:** As a SEO manager, I want to sitemap tu dong cap nhat khi co noi dung moi, so that Google index nhanh cac trang moi.
- **Acceptance criteria:**
  - URL: https://bhquan.site/sitemap.xml
  - Bao gom: trang chu, trang about, trang lien he, trang catalog, tat ca du an published, tat ca san pham published
  - Tu dong cap nhat khi co du an/san pham moi duoc publish
  - Format XML chuan theo sitemap protocol
  - lastmod, changefreq, priority cho moi URL
  - Cache sitemap 1 gio, regenerate khi co thay doi
  - API: GET /sitemap.xml (server-side generate)
- **Design ref:** N/A (ky thuat)

---

### C4.2 JSON-LD Structured Data

- **Feature ID:** C4.2
- **Priority:** P0
- **Description:** JSON-LD structured data cho cac trang quan trong.
- **User story:** As a SEO manager, I want to co structured data chuan, so that Google hien thi rich snippets cho website.
- **Acceptance criteria:**
  - Trang chu: @type=LocalBusiness voi name, address, phone, email, openingHours, image
  - Trang du an: @type=Article voi headline, description, image, datePublished, author
  - Trang san pham: @type=Product voi name, description, image, material
  - Breadcrumb: @type=BreadcrumbList tren moi trang co breadcrumb
  - Validate: khong co loi tren Google Rich Results Test
  - SSR: render JSON-LD trong <script type="application/ld+json"> phia server
- **Design ref:** N/A (ky thuat)

---

### C4.3 Open Graph & Twitter Cards

- **Feature ID:** C4.3
- **Priority:** P0
- **Description:** Meta tags Open Graph va Twitter Card cho moi trang.
- **User story:** As a marketer, I want to khi share link tren Facebook/Zalo hien thi hinh anh va mo ta dep, so that tang ty le click tu mang xa hoi.
- **Acceptance criteria:**
  - OG tags: og:title, og:description, og:image (1200x630px), og:url, og:type, og:site_name
  - Twitter: twitter:card=summary_large_image, twitter:title, twitter:description, twitter:image
  - Moi trang co meta rieng (trang chu, du an, san pham, v.v.)
  - OG image: tu dong resize ve 1200x630 tu hinh goc
  - Fallback: neu trang khong co hinh rieng, dung default OG image tu Settings (B8.2)
  - SSR: render meta tags phia server de bot doc duoc
- **Design ref:** N/A (ky thuat)

---

### C4.4 Canonical URLs

- **Feature ID:** C4.4
- **Priority:** P1
- **Description:** Canonical URL cho moi trang de tranh duplicate content.
- **User story:** As a SEO manager, I want to moi trang co canonical URL duy nhat, so that Google khong phat website vi noi dung trung lap.
- **Acceptance criteria:**
  - Moi trang co <link rel="canonical" href="https://bhquan.site/[path]">
  - Canonical URL luon la phien ban khong co query string (tru pagination)
  - Luon dung HTTPS va domain chinh (bhquan.site)
  - Trang pagination: canonical tro ve trang 1 hoac self-referencing (tuy chien luoc)
  - SSR: render trong <head> phia server
- **Design ref:** N/A (ky thuat)

---

### C4.5 Robots.txt

- **Feature ID:** C4.5
- **Priority:** P1
- **Description:** File robots.txt cau hinh cho phep/chan bot crawl.
- **User story:** As a SEO manager, I want to kiem soat bot crawl nhung gi, so that admin panel va API khong bi index.
- **Acceptance criteria:**
  - URL: https://bhquan.site/robots.txt
  - Allow: / (cho phep crawl toan bo public)
  - Disallow: /admin, /api, /preview
  - Sitemap: https://bhquan.site/sitemap.xml
  - Khong chan CSS/JS (can thiet cho rendering)
  - Static file, serve tu Nginx/Express
- **Design ref:** N/A (ky thuat)

---

## C5. Cache & Performance

---

### C5.1 Nginx Micro-cache

- **Feature ID:** C5.1
- **Priority:** P1
- **Description:** Nginx micro-cache 1 giay cho public API de giam tai server.
- **User story:** As a developer, I want to public API duoc cache 1 giay, so that server chiu duoc nhieu request dong thoi ma khong qua tai.
- **Acceptance criteria:**
  - Cache 1 giay cho GET requests tren /api/public/*
  - Bypass cache cho POST/PUT/DELETE
  - Bypass cache khi co Authorization header
  - Cache key: method + URI + query string
  - Stale-while-revalidate: serve cache cu trong khi refresh
  - Cau hinh trong nginx.conf
- **Design ref:** N/A (ky thuat)

---

### C5.2 Redis Cache

- **Feature ID:** C5.2
- **Priority:** P1
- **Description:** Redis cache cho cac query nang (danh sach du an, san pham, page builder config).
- **User story:** As a developer, I want to cache ket qua query nang, so that response time nhanh va giam tai MySQL.
- **Acceptance criteria:**
  - Cache cac endpoint: GET /api/projects (TTL 5 phut), GET /api/products (TTL 5 phut), GET /api/page-builder/config (TTL 10 phut)
  - Invalidate cache khi co thay doi tu admin (create/update/delete)
  - Cache key: "api:{path}:{queryHash}"
  - Redis 7, connection pool
  - Fallback: neu Redis loi, query truc tiep MySQL (khong crash)
  - Monitor: log cache hit/miss ratio
- **Design ref:** N/A (ky thuat)

---

### C5.3 ISR (Incremental Static Regeneration)

- **Feature ID:** C5.3
- **Priority:** P2
- **Description:** Revalidate trang khi admin chinh sua noi dung.
- **User story:** As a admin, I want to thay doi noi dung duoc cap nhat tren website ngay lap tuc, so that khach hang luon thay thong tin moi nhat.
- **Acceptance criteria:**
  - Khi admin save thay doi (project, page builder), goi revalidatePath tuong ung
  - Target: noi dung moi xuat hien tren public website trong 5 giay sau khi save
  - Khong can deploy lai hoac restart server
  - Ap dung cho: trang chu, trang du an, trang catalog
  - Implementation: invalidate Redis cache + Nginx cache purge
- **Design ref:** N/A (ky thuat)

---

### C5.4 Image Optimization

- **Feature ID:** C5.4
- **Priority:** P0
- **Description:** Toi uu hinh anh voi WebP, lazy loading, responsive images.
- **User story:** As a developer, I want to hinh anh duoc toi uu tu dong, so that website dat diem PageSpeed Insights 90+.
- **Acceptance criteria:**
  - Tat ca hinh anh chuyen sang WebP (fallback JPEG cho trinh duyet cu)
  - Lazy loading: loading="lazy" cho hinh ngoai viewport, loading="eager" cho above-the-fold
  - Responsive: srcset voi cac kich thuoc 768px, 1024px, 2048px
  - Placeholder: blur placeholder (LQIP) khi hinh dang tai
  - Width va height attributes de tranh CLS (Cumulative Layout Shift)
  - CDN: serve tu Cloudflare R2 public bucket voi cache headers
- **Design ref:** N/A (ky thuat)

---

## C6. Security

---

### C6.1 Rate Limiting

- **Feature ID:** C6.1
- **Priority:** P0
- **Description:** Rate limiting cho API de chong abuse.
- **User story:** As a developer, I want to gioi han so request, so that he thong khong bi tan cong brute force hoac DDoS.
- **Acceptance criteria:**
  - Global: 100 requests/phut/IP cho public API
  - Auth endpoints (/api/auth/*): 10 requests/phut/IP
  - Upload endpoint: 20 requests/phut/user
  - Consultation submit: 3 requests/gio/IP
  - Response 429 Too Many Requests khi vuot gioi han
  - Header: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - Dung Redis de luu counter (ho tro nhieu instance)
- **Design ref:** N/A (ky thuat)

---

### C6.2 XSS Prevention

- **Feature ID:** C6.2
- **Priority:** P0
- **Description:** Chong tan cong XSS qua DOMPurify cho rich text content.
- **User story:** As a developer, I want to moi noi dung rich text duoc sanitize, so that khong co ma doc thuc thi tren trinh duyet nguoi dung.
- **Acceptance criteria:**
  - DOMPurify: sanitize moi HTML content tu rich text editor truoc khi luu DB
  - Cho phep: b, i, u, a, p, h1-h6, ul, ol, li, img, br, strong, em
  - Chan: script, iframe, style, on* attributes, javascript: URLs
  - Ap dung ca khi render (client-side) va khi luu (server-side)
  - Test: thu inject <script>alert(1)</script> vao moi field text
- **Design ref:** N/A (ky thuat)

---

### C6.3 CORS Whitelist

- **Feature ID:** C6.3
- **Priority:** P0
- **Description:** Cau hinh CORS chi cho phep request tu domain hop le.
- **User story:** As a developer, I want to chi domain cua toi moi goi duoc API, so that khong ai co the goi API tu website khac.
- **Acceptance criteria:**
  - Allowed origins: https://bhquan.site, http://localhost:5173 (dev), http://localhost:4000 (dev)
  - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
  - Allowed headers: Content-Type, Authorization
  - Credentials: true (cho HttpOnly cookies)
  - Preflight cache: max-age 86400 (1 ngay)
  - Block: moi origin khong trong whitelist tra ve 403
- **Design ref:** N/A (ky thuat)

---

### C6.4 Helmet.js Headers

- **Feature ID:** C6.4
- **Priority:** P1
- **Description:** Bao mat HTTP headers qua Helmet.js.
- **User story:** As a developer, I want to co day du security headers, so that website duoc bao ve khoi cac tan cong pho bien.
- **Acceptance criteria:**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY (chan iframe)
  - X-XSS-Protection: 0 (deprecated, dung CSP thay the)
  - Content-Security-Policy: default-src 'self', img-src 'self' cdn.bhquan.site, script-src 'self'
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Referrer-Policy: strict-origin-when-cross-origin
  - Cau hinh qua Helmet.js middleware trong Express
- **Design ref:** N/A (ky thuat)

---

## C7. Health & Monitoring

---

### C7.1 Health Endpoint

- **Feature ID:** C7.1
- **Priority:** P0
- **Description:** Endpoint kiem tra trang thai he thong.
- **User story:** As a DevOps, I want to co endpoint health check, so that toi monitor he thong va phat hien loi som.
- **Acceptance criteria:**
  - Endpoint: GET /api/health
  - Response 200: { status: "ok", uptime: 12345, db: "connected", redis: "connected", timestamp: "2026-03-27T..." }
  - Response 503: { status: "error", db: "disconnected", ... } neu bat ky service nao loi
  - Kiem tra: MySQL connection, Redis connection, R2 reachable
  - Thoi gian response < 500ms
  - Khong can authentication
  - Dung cho: monitoring tool, deploy health check, load balancer
- **Design ref:** N/A (ky thuat)

---

### C7.2 Structured Logging

- **Feature ID:** C7.2
- **Priority:** P0
- **Description:** Pino structured logging voi RequestID cho moi request.
- **User story:** As a developer, I want to moi log co RequestID va format JSON, so that toi trace duoc loi va debug nhanh.
- **Acceptance criteria:**
  - Logger: Pino (JSON format)
  - RequestID: tu dong generate ULID cho moi request, dinh kem vao moi log line
  - Log levels: error, warn, info, debug
  - Log moi request: method, path, status, duration, requestId
  - KHONG log: request body chua password/token, response body, file contents
  - Log rotation: giu 7 ngay, nen file cu
  - Output: stdout (cho Docker/PM2 capture)
  - Response header: X-Request-ID de client co the bao requestId khi report bug
- **Design ref:** N/A (ky thuat)

---

# =============================================
# TONG HOP PRIORITY
# =============================================

## P0 — Must Have (MVP)

| ID | Feature | Module |
|---|---|---|
| A1.1 | Glassmorphic Top Navigation | Public |
| A1.2 | Mobile Bottom Navigation | Public |
| A1.4 | Footer | Public |
| A2.1 | Hero Section | Public |
| A2.2 | About Section | Public |
| A2.3 | Featured Projects | Public |
| A2.6 | Consultation CTA Form | Public |
| A3.1 | Material Filter Sidebar | Public |
| A3.2 | Mobile Filter Bottom Sheet | Public |
| A3.4 | Product Grid | Public |
| A3.7 | Pagination | Public |
| A4.1 | Project Hero | Public |
| A4.2 | Project Info | Public |
| A4.3 | Image Gallery | Public |
| A4.6 | SEO | Public |
| A5.1 | Product Images | Public |
| A5.2 | Product Info | Public |
| A5.5 | Consultation CTA | Public |
| A7.1 | Contact Form | Public |
| A7.3 | Contact Info | Public |
| B1.1 | Login Page | Admin |
| B1.3 | Session Management | Admin |
| B2.1 | KPI Metrics Cards | Admin |
| B2.2 | Admin Sidebar | Admin |
| B2.4 | Recent Consultations | Admin |
| B3.1 | Project Table | Admin |
| B3.2 | CRUD Operations | Admin |
| B3.3 | Status Flow | Admin |
| B3.4 | Category System | Admin |
| B3.5 | Image Gallery Manager | Admin |
| B4.1 | Consultation Table | Admin |
| B4.2 | Status Workflow | Admin |
| B4.4 | Real-time Alert | Admin |
| B5.1 | Edit Mode Toggle | Admin |
| B5.2 | Editable Blocks | Admin |
| B5.3 | Hero Editor | Admin |
| B5.7 | Save/Cancel | Admin |
| B7.1 | Admin List | Admin |
| B7.2 | Create/Edit Admin | Admin |
| C1.1 | Upload Endpoint | System |
| C1.2 | Image Processing Job | System |
| C1.3 | R2 Storage | System |
| C2.1 | Email Job | System |
| C3.1 | Socket.io Rooms | System |
| C3.2 | Socket Events | System |
| C4.1 | Dynamic Sitemap | System |
| C4.2 | JSON-LD Structured Data | System |
| C4.3 | Open Graph & Twitter Cards | System |
| C5.4 | Image Optimization | System |
| C6.1 | Rate Limiting | System |
| C6.2 | XSS Prevention | System |
| C6.3 | CORS Whitelist | System |
| C7.1 | Health Endpoint | System |
| C7.2 | Structured Logging | System |

## P1 — Should Have

| ID | Feature | Module |
|---|---|---|
| A1.3 | Floating Action Widgets | Public |
| A1.5 | Breadcrumb | Public |
| A2.4 | Material Samples | Public |
| A2.5 | Testimonials | Public |
| A2.7 | Stats Counter | Public |
| A3.3 | Horizontal Filter Chips | Public |
| A3.5 | Product Card Interactions | Public |
| A3.6 | Product Count | Public |
| A4.4 | Related Projects | Public |
| A4.7 | Breadcrumb | Public |
| A5.3 | Material Specs | Public |
| A5.4 | Related Products | Public |
| A6.1 | Company Story | Public |
| A6.5 | Warranty Policy | Public |
| A8.1 | Search Input | Public |
| A8.2 | Results List | Public |
| A8.3 | No Results State | Public |
| A9.1 | 404 Page | Public |
| A9.2 | 500 Page | Public |
| B1.2 | Forgot Password | Admin |
| B2.3 | Quick Actions | Admin |
| B2.6 | Activity Feed | Admin |
| B2.7 | Global Search | Admin |
| B2.8 | Notification Bell | Admin |
| B3.6 | SEO Fields | Admin |
| B3.7 | Search & Filter | Admin |
| B3.8 | Pagination | Admin |
| B4.3 | Search & Date Filter | Admin |
| B4.5 | Email Auto-reply | Admin |
| B5.4 | Section Editors | Admin |
| B5.6 | Preview Mode | Admin |
| B6.1 | Traffic Overview | Admin |
| B6.2 | Bot Filtering | Admin |
| B6.4 | Device Breakdown | Admin |
| B6.5 | Top Pages | Admin |
| B7.3 | Role Management | Admin |
| B7.4 | Delete Admin | Admin |
| B8.1 | Site Settings | Admin |
| B8.2 | SEO Defaults | Admin |
| C2.2 | Email Templates | System |
| C4.4 | Canonical URLs | System |
| C4.5 | Robots.txt | System |
| C5.1 | Nginx Micro-cache | System |
| C5.2 | Redis Cache | System |
| C6.4 | Helmet.js Headers | System |

## P2 — Nice to Have

| ID | Feature | Module |
|---|---|---|
| A3.8 | Material Samples Section | Public |
| A4.5 | Social Sharing | Public |
| A6.2 | Facility Showcase | Public |
| A6.3 | Stats Counter (About) | Public |
| A6.4 | Quality Commitment | Public |
| A7.2 | Map | Public |
| A7.4 | Social Links | Public |
| B2.5 | Top Performing Project | Admin |
| B5.5 | Add/Remove Sections | Admin |
| B6.3 | Admin IP Exclusion | Admin |
| B6.6 | Traffic Sources | Admin |
| B8.3 | Email Templates | Admin |
| C5.3 | ISR | System |

---

# =============================================
# BUSINESS RULES TONG HOP
# =============================================

1. **Authentication:** Chi admin moi truy cap duoc /admin/*. JWT access token 60 phut, refresh token 7 ngay HttpOnly cookie.
2. **Rate Limiting:** Login 5 lan sai -> khoa 30 phut. Consultation submit 3 lan/gio/IP. API 100 req/phut/IP.
3. **Image Processing:** Upload toi da 10MB, chi JPEG/PNG/WebP. Tu dong resize + WebP + strip EXIF qua BullMQ.
4. **Content Flow:** Du an Draft khong hien thi tren public. Chi Published moi index boi Google.
5. **Consultation Flow:** New -> Contacted -> Scheduled -> Completed. Khong quay nguoc trang thai.
6. **SEO:** Moi trang co unique title, description, OG image, canonical URL, JSON-LD. Sitemap tu dong cap nhat.
7. **Real-time:** Admin nhan thong bao ngay khi co consultation moi qua Socket.io.
8. **Data:** ULID cho tat ca primary keys. Validate ULID truoc khi query DB.
9. **Security:** DOMPurify cho rich text, Helmet.js headers, CORS whitelist, khong log sensitive data.
10. **Performance:** Target PageSpeed 90+ Mobile. WebP images, lazy loading, Redis cache, Nginx micro-cache.
11. **Email:** Tu dong gui email xac nhan cho khach hang va thong bao cho admin khi co consultation moi.
12. **Storage:** Cloudflare R2 -- private bucket cho originals, public bucket cho thumbnails/previews.
13. **Responsive:** Mobile-first design. 3 breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop).
14. **Accessibility:** Touch target toi thieu 44x44px, aria-labels, keyboard navigation, focus states.

---

> **BA_DONE** -- Tai lieu nay la nguon tham chieu chinh thuc cho Agent_SA, Agent_Designer, Agent_Task_Planner, va tat ca agents khac trong workflow.
