# MISSING SCREEN SPECIFICATIONS
> Status: Chua co design | Priority: Can bo sung truoc khi dev
> Design System: "The Curated Atelier" — DESIGN_SYSTEM.md

Tai lieu nay cung cap thong so thiet ke chi tiet cho 11 man hinh chua co trong thu muc DESIGN/.
Agent_Designer su dung tai lieu nay de tao mockup ma khong can hoi them thong tin.

### Design System Reference

- **Colors:** Primary `#553722`, Primary Container `#6F4E37`, Surface `#FCF9F7`, On-Background `#1B1C1B`
- **Fonts:** Noto Serif (display/headline), Manrope (body/label)
- **Icons:** Material Symbols Outlined
- **Borders:** Khong dung 1px borders — chi dung tonal shifts de tao ranh gioi
- **Glassmorphism:** Semi-transparent surface + backdrop-blur 12px-20px cho floating elements
- **Shadows:** Ambient shadows, blur >= 24px, opacity 4%-8%, brown-tinted (khong dung grey)
- **Ghost Border:** outline-variant tai 10% opacity khi can thiet cho accessibility
- **Buttons:** Primary = rounded-xl, primary-container bg, white text. Secondary = transparent bg, ghost border 20% opacity
- **Input Fields:** surface-container-lowest fill, outline-variant ghost border, focus = primary tai 50% opacity
- **Responsive Breakpoints:** 375px (mobile), 768px (tablet), 1280px (desktop)
- **Spacing:** Su dung spacing scale tu design system (spacing-8, spacing-10 cho phan cach)
- **Corner Radius:** Luon co radius toi thieu sm hoac md — khong bao gio dung sharp corners
- **Text Color:** Khong dung pure black #000000 — dung on-background #1B1C1B

### Component Library Reference

Cac component chung duoc tham chieu trong tai lieu nay:

| Component | Mo ta | Tailwind Key Classes |
|---|---|---|
| `GlassNav` | Glassmorphic navigation bar (public) | `bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] fixed top-0 w-full z-[var(--z-fixed)]` |
| `AdminSidebar` | Admin sidebar navigation (fixed left) | `w-64 fixed left-0 h-screen bg-surface-container-low border-r border-outline-variant/10` |
| `Button` | Primary / Secondary / Ghost / Text variants | Primary: `bg-primary-container text-white px-8 py-4 rounded-xl font-semibold` |
| `IconButton` | Circular icon button | `w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low` |
| `Input` | Text / Email / Password / Tel input field | `bg-surface-container-lowest border border-outline-variant/10 rounded-lg h-12 px-4` |
| `Select` | Dropdown select with custom styling | Same as Input + `icon expand_more` right side |
| `Textarea` | Multi-line text input | Same as Input + `min-h-[120px] resize-y` |
| `Card` | Content card container | `bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-lg)]` |
| `Badge` | Status / category badge | `rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]` |
| `Modal` | Dialog overlay + content card | Overlay: `bg-on-background/60 backdrop-blur-[16px]` Card: `bg-surface-container-lowest rounded-xl max-w-md` |
| `Toast` | Notification toast (top-right) | `fixed top-4 right-4 z-[var(--z-toast)] rounded-lg shadow-xl p-4` |
| `Skeleton` | Loading placeholder | `bg-surface-container-low rounded-lg animate-pulse` |
| `DataTable` | Admin data table (no borders, tonal rows) | `w-full` headers: `text-label-md uppercase tracking-widest text-on-background/40` rows: `odd:bg-surface-container-low` |
| `Breadcrumb` | Navigation breadcrumb trail | `text-label-md font-label uppercase tracking-widest text-on-background/60` |
| `Pagination` | Page navigation controls | Current: `bg-primary-container text-white rounded-lg w-10 h-10` Other: `bg-surface-container-lowest rounded-lg w-10 h-10` |
| `Lightbox` | Full-screen image viewer with navigation | Overlay: `bg-on-background/80 backdrop-blur-[20px]` Nav: `w-12 h-12 bg-surface-container-highest/80 rounded-full` |
| `FilterChip` | Active/inactive filter chips | Active: `bg-primary-container text-white rounded-xl px-5 py-2` Inactive: `bg-surface-container-high rounded-xl` |
| `Accordion` | Collapsible content sections | `bg-surface-container-lowest rounded-lg` header: `p-5` icon: `expand_more rotate-180` |
| `DateRangePicker` | Date period selector dropdown | `bg-surface-container-lowest border border-outline-variant/10 rounded-lg h-10` |
| `RichTextEditor` | WYSIWYG editor for email templates | Toolbar: `bg-surface-container-low rounded-t-lg` Editor: `bg-surface-container-lowest min-h-[200px] p-4` |
| `FAB` | Floating action button (mobile) | `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-container text-white shadow-xl z-[var(--z-fixed)]` |

---

## SCREEN 1: PROJECT DETAIL PAGE (Public)

**ID:** A4
**Priority:** P0
**Can cho:** Stage 3 (CMS Core)
**Route:** `/du-an/:slug`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `/api/projects/slug/:slug` | GET | @Public | Load project detail by SEO slug |
| `/api/projects/:id/gallery` | GET | @Public | Load gallery images (sorted by order ASC) |
| `/api/projects/related/:id` | GET | @Public | Load 3 related projects (same category) |

**Response shape reference:** SA_API_SPEC.md — GROUP 2: PROJECTS
- Project data includes: `title`, `slug`, `description` (HTML), `category`, `style`, `materials`, `area`, `location`, `year_completed`, `cover_image`, `gallery[]`, `seo_title`, `seo_description`, `og_image_url`
- Gallery items: `{ id, media_id, thumbnail_url, desktop_url, alt, order }`
- Related projects: `{ id, title, slug, category, cover_image }`

### State Machine

```
INITIAL ──(route enter)──> LOADING
LOADING ──(API success)──> LOADED
LOADING ──(API 404)──> NOT_FOUND
LOADING ──(API error)──> ERROR
LOADED ──(click gallery img)──> LIGHTBOX_OPEN
LIGHTBOX_OPEN ──(close/escape)──> LOADED
LOADED ──(click related project)──> LOADING (new slug)
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING` | Skeleton: hero = `Skeleton` rectangle 16:9, title = 2-line `Skeleton`, specs card = 4-line `Skeleton`, gallery = 6 `Skeleton` rectangles | `Skeleton` |
| `LOADED` | Full content rendered, gallery interactive | `Breadcrumb`, `Card`, `Lightbox`, `Badge`, `IconButton` |
| `NOT_FOUND` | Centered error: icon `error_outline` 48px, title "Khong tim thay du an", body text, `Button` "Quay Lai" | `Button` (secondary) |
| `ERROR` | Same as NOT_FOUND but with retry option | `Button` (secondary) |
| `LIGHTBOX_OPEN` | `Lightbox` modal with navigation arrows, counter, keyboard support | `Lightbox` |
| `GALLERY_EMPTY` | Gallery section hidden entirely | -- |

### SEO Metadata

```typescript
// Dynamic <head> meta tags — set via useHead() composable
{
  title: project.seo_title || `${project.title} | VietNet Interior`,
  meta: [
    { name: 'description', content: project.seo_description || project.description.substring(0, 160) },
    { property: 'og:title', content: project.seo_title || project.title },
    { property: 'og:description', content: project.seo_description || project.description.substring(0, 200) },
    { property: 'og:image', content: project.og_image_url || project.cover_image?.desktop_url },
    { property: 'og:url', content: `https://bhquan.site/du-an/${project.slug}` },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: `https://bhquan.site/du-an/${project.slug}` },
  ],
  script: [
    // JSON-LD structured data
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: project.title,
        description: project.seo_description,
        image: project.og_image_url || project.cover_image?.desktop_url,
        author: { '@type': 'Organization', name: 'VietNet Interior' },
      }),
    },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Hero image | Fade in + subtle scale down on load | `animate-[fadeScaleIn_0.8s_ease-out]` from `scale-105 opacity-0` to `scale-100 opacity-100` |
| Breadcrumb | Fade in with delay | `animate-[fadeIn_0.5s_ease-out_0.3s_both]` |
| Content sections | Fade in + slide up on scroll (IntersectionObserver) | `opacity-0 translate-y-6` -> `opacity-100 translate-y-0 transition-all duration-700 ease-out` |
| Specs card | Slide in from right on scroll | `opacity-0 translate-x-6` -> `opacity-100 translate-x-0 transition-all duration-700 ease-out delay-200` |
| Gallery images | Staggered fade-in on scroll | Each item: `opacity-0 translate-y-4` -> `opacity-100 translate-y-0`, stagger `delay-[calc(index*100ms)]` |
| Gallery hover | Scale + shadow | `hover:scale-[1.02] transition-transform duration-300 hover:shadow-[var(--shadow-xl)]` |
| Lightbox open | Overlay fade in, image scale up | Overlay: `animate-[fadeIn_0.2s]` Image: `animate-[scaleIn_0.3s_ease-out]` |
| Lightbox nav | Crossfade between images | `transition-opacity duration-300` |
| Related cards | Fade in + slide up on scroll | Same as gallery images |

### Muc dich

Trang chi tiet du an — hien thi day du hinh anh, mo ta, thong so ky thuat, va gallery cua mot du an noi that. Day la trang quan trong nhat de khach hang danh gia nang luc thiet ke.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page container: max-w-[1280px] mx-auto px-6
```

**Hero Section:**
- Full-width hero image, aspect ratio 16:9, max-height 600px
- `w-full aspect-video max-h-[600px] object-cover`
- Gradient overlay tai bottom: `bg-gradient-to-t from-surface to-transparent h-[30%] absolute bottom-0 inset-x-0`
- Hero image su dung object-fit: cover, rounded: none (full bleed)

**Breadcrumb (ngay duoi hero):**
- Component: `Breadcrumb`
- Vi tri: `max-w-[1280px] mx-auto px-6 py-4`
- Format: Home > Cac Du An > [Project Name]
- Font: label-md, Manrope, uppercase, letter-spacing wide
- `text-[var(--text-label-md-size)] font-label uppercase tracking-[0.2em] text-on-background/60`
- Color: on-background tai 60% opacity, item cuoi cung tai 100%
- Separator: dau ">" voi spacing-2 hai ben

**Content Area — 2-column layout (8/4 grid, gap spacing-10):**
- `grid grid-cols-12 gap-10 max-w-[1280px] mx-auto px-6`

*Left Column (8 cols):*
- `col-span-8`
- Project title: `font-display text-[var(--text-display-lg-size)] font-bold tracking-[var(--text-display-lg-tracking)] leading-[var(--text-display-lg-leading)] text-on-background mb-4`
- Project subtitle/tagline (neu co): `font-headline text-[var(--text-headline-md-size)] text-on-background/70 mb-8`
- Description: `font-body text-[var(--text-body-lg-size)] leading-[1.75] text-on-background max-w-[720px]`
- Margin-bottom spacing-8 giua cac section

- **Materials List:**
  - Section title: `font-body text-[var(--text-title-lg-size)] font-semibold mb-4`
  - Danh sach material duoi dang horizontal pills/tags
  - Container: `flex flex-wrap gap-2`
  - Moi pill: Component `Badge` variant — `bg-surface-container-low rounded-lg px-2 py-1 text-[var(--text-label-md-size)] font-label text-on-background`

- **Design Style Tag:**
  - Hien thi ngay duoi materials list, margin-top spacing-4
  - Component: `Badge` — `bg-primary-container text-white rounded-xl px-2 py-1 text-[var(--text-label-md-size)] font-label uppercase mt-4`

*Right Column (4 cols):*
- `col-span-4`
- **Project Specs Card — sticky (top: spacing-8):**
  - Component: `Card` — `bg-surface-container-low rounded-xl p-6 shadow-[var(--shadow-lg)] sticky top-8`
  - Moi dong thong so:
    - `flex items-center gap-3 py-4`
    - Icon: `material-symbols-outlined text-[20px]` + Label: `text-[var(--text-label-md-size)] text-on-background/60` + Value: `text-[var(--text-body-lg-size)] text-on-background`
    - Cac dong: Dien Tich (square_foot), Phong Cach (palette), Thoi Gian (schedule), Vat Lieu Chinh (inventory_2)
    - Phan cach: `odd:bg-surface-container-lowest rounded-md px-3`

**Image Gallery Section (duoi content area, full container width):**
- Section title: `font-headline text-[var(--text-headline-md-size)] font-bold mb-6`
- Layout: `columns-3 gap-4` (masonry grid)
- Moi hinh: `rounded-lg object-cover break-inside-avoid mb-4`
- Hover: `hover:scale-[1.02] transition-transform duration-300 hover:shadow-[var(--shadow-xl)]`
- Click: mo `Lightbox` component

**Lightbox Modal:**
- Component: `Lightbox`
- Overlay: `fixed inset-0 bg-on-background/80 backdrop-blur-[20px] z-[var(--z-modal-backdrop)]`
- Image: `max-w-[90vw] max-h-[85vh] object-contain rounded-lg`
- Navigation: Component `IconButton` — `w-12 h-12 bg-surface-container-highest/80 rounded-full`
  - Vi tri: `absolute top-1/2 -translate-y-1/2 left-6` / `right-6`
- Close: `IconButton` — `absolute top-4 right-4 w-8 h-8 bg-surface-container-highest/80 rounded-full`
- Counter: "3 / 12" — `text-[var(--text-label-md-size)] text-white text-center mt-3`
- Keyboard: Arrow Left/Right de navigate, Escape de dong

**Related Projects Section:**
- Section title: `font-headline text-[var(--text-headline-md-size)] font-bold mt-16 mb-8`
- Layout: `grid grid-cols-3 gap-4`
- Moi card: Component `Card` project variant — image fill (`rounded-lg aspect-[4/3] object-cover`), text overlay `bg-primary-container/70 p-4`
- Card title: `font-body text-[var(--text-title-lg-size)] font-semibold text-white`

**Social Sharing Row:**
- Vi tri: `mt-8 flex gap-3`
- Icons: Component `IconButton` — `w-10 h-10 bg-surface-container-low rounded-full`
- Facebook, Zalo, Pinterest — icon size 20px
- `text-on-background/60 hover:text-primary transition-colors duration-200`

### Tablet Layout (768px)

- Hero: giu 16:9 nhung `max-h-[400px]`
- Content: `grid-cols-1` — specs card nam duoi title, truoc description
- Gallery: `columns-2 gap-4`
- Related projects: `grid-cols-2` (card thu 3 an)

### Mobile Layout (375px)

- Hero image: `w-full aspect-[4/3] object-cover` (crop tu 16:9)
- Breadcrumb: `text-[var(--text-label-sm-size)] overflow-x-auto whitespace-nowrap`
- Layout: `flex flex-col gap-6` — title, specs card (full-width), description, gallery (`columns-2 gap-2`), related projects (`flex overflow-x-auto snap-x snap-mandatory gap-4`), share buttons (`flex justify-center gap-3`)
- **Sticky Bottom CTA:**
  - `fixed bottom-0 inset-x-0 h-16 bg-surface-container-highest/90 backdrop-blur-[12px] z-[var(--z-fixed)] flex items-center justify-center px-4 pb-[env(safe-area-inset-bottom)]`
  - Button: Component `Button` primary — `bg-primary-container text-white rounded-xl w-full py-3`
  - Text: "Lien He Tu Van"
- Lightbox: full-screen, swipe left/right gestures, swipe down de dong

### States

| State | Mo ta |
|---|---|
| Loading | Skeleton: hero = surface-container-low rectangle 16:9, title = 2 dong skeleton, specs card = 4 dong skeleton, gallery = 6 rectangles |
| Error | Centered: icon error_outline (48px, on-background 40%), title "Khong tim thay du an" (headline-md), body text "Du an nay khong ton tai hoac da bi xoa" (body-lg), button "Quay Lai" (secondary style) |
| Gallery Empty | Section gallery an neu khong co hinh |
| Lightbox Loading | Spinner centered trong lightbox khi hinh dang tai |

### Accessibility

- Hero image: aria-label mo ta du an
- Gallery images: alt text tu CMS
- Lightbox: role="dialog", aria-modal="true", focus trap
- Breadcrumb: nav aria-label="breadcrumb"
- Keyboard: Tab order logic — breadcrumb > content > gallery > related > share

---

## SCREEN 2: PRODUCT DETAIL PAGE (Public)

**ID:** A5
**Priority:** P0
**Can cho:** Stage 3
**Route:** `/san-pham/:slug`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `/api/products/slug/:slug` | GET | @Public | Load product detail by SEO slug |
| `/api/products/:id/images` | GET | @Public | Load product images (sorted by order ASC) |
| `/api/products/related/:id` | GET | @Public | Load 4 related products (same material_type/category) |

**Response shape reference:** SA_API_SPEC.md — GROUP 4: PRODUCTS
- Product data includes: `name`, `slug`, `description` (HTML), `material_type`, `finish`, `dimensions` (`width`, `height`, `depth` in cm), `price_range`, `rating`, `is_new`, `category`, `material_specs` (`origin`, `durability_years`, `maintenance`, `available_colors[]`), `images[]`, `seo_title`, `seo_description`, `og_image_url`
- Product images: `{ id, media_id, thumbnail_url, desktop_url, alt, order }`
- Related products: `{ id, name, slug, material_type, price_range, is_new, cover_image }`

### State Machine

```
INITIAL ──(route enter)──> LOADING
LOADING ──(API success)──> LOADED
LOADING ──(API 404)──> NOT_FOUND
LOADING ──(API error)──> ERROR
LOADED ──(click main image)──> LIGHTBOX_OPEN
LOADED ──(click thumbnail)──> LOADED (swap main image, crossfade)
LOADED ──(click CTA "Yeu Cau Bao Gia")──> NAVIGATE to /lien-he with product_id
LIGHTBOX_OPEN ──(close/escape)──> LOADED
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING` | Main image `Skeleton` (4:5), 4 thumbnail `Skeleton`s, text skeletons | `Skeleton` |
| `LOADED` | Full product display, interactive thumbnails | `Breadcrumb`, `Card`, `Badge`, `Button`, `Accordion`, `Lightbox` |
| `NOT_FOUND` | "Khong tim thay san pham" — same pattern as Screen 1 error | `Button` (secondary) |
| `ERROR` | Network error with retry | `Button` (secondary) |
| `LIGHTBOX_OPEN` | Shared `Lightbox` component | `Lightbox` |
| `IMAGE_LOADING` | Shimmer animation on `bg-surface-container-low` | `Skeleton` |

### SEO Metadata

```typescript
{
  title: product.seo_title || `${product.name} | VietNet Interior`,
  meta: [
    { name: 'description', content: product.seo_description || product.description.substring(0, 160) },
    { property: 'og:title', content: product.seo_title || product.name },
    { property: 'og:description', content: product.seo_description || product.description.substring(0, 200) },
    { property: 'og:image', content: product.og_image_url || product.images?.[0]?.desktop_url },
    { property: 'og:url', content: `https://bhquan.site/san-pham/${product.slug}` },
    { property: 'og:type', content: 'product' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: `https://bhquan.site/san-pham/${product.slug}` },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.seo_description,
        image: product.og_image_url || product.images?.[0]?.desktop_url,
        brand: { '@type': 'Organization', name: 'VietNet Interior' },
        material: product.material_type,
      }),
    },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Main image | Fade in on load | `animate-[fadeIn_0.6s_ease-out]` |
| Thumbnail swap | Crossfade main image | `transition-opacity duration-200` |
| Content sections | Fade + slide up on scroll | `opacity-0 translate-y-6` -> `opacity-100 translate-y-0 transition-all duration-700` |
| Accordion expand | Height transition | `transition-[max-height] duration-300 ease-in-out overflow-hidden` |
| CTA button hover | Gradient shift + glow | `hover:bg-gradient-to-r hover:from-primary hover:to-primary-container hover:shadow-[0_0_20px_var(--color-surface-tint)/20]` |
| Related cards | Staggered fade-in on scroll | `delay-[calc(index*100ms)]` |
| Mobile carousel | Snap scroll with momentum | `scroll-snap-type-x mandatory` per-image `scroll-snap-align-start` |

### Muc dich

Trang chi tiet san pham — hien thi hinh anh san pham tu nhieu goc, thong so vat lieu, kich thuoc, va CTA yeu cau bao gia.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page container: max-w-[1280px] mx-auto px-6
Product grid: grid grid-cols-12 gap-10
Left column: col-span-7
Right column: col-span-5
```

**Breadcrumb:** Component `Breadcrumb` — Home > San Pham > [Category] > [Product Name] (cung style Screen 1)

**Product Section — 2-column layout (7/5 grid, gap spacing-10):**

*Left Column (7 cols):*
- **Main Image:**
  - `aspect-[4/5] rounded-lg object-cover bg-surface-container-low cursor-pointer`
  - Click: mo `Lightbox`
- **Thumbnail Strip (duoi main image, margin-top spacing-3):**
  - `flex gap-2 mt-3`
  - Moi thumbnail: `w-20 h-20 aspect-square rounded-md object-cover cursor-pointer`
  - Active thumbnail: `ring-2 ring-primary/50`
  - Hover: `opacity-80`
  - Click: swap main image voi animation crossfade 200ms

*Right Column (5 cols):*
- **Product Name:** `font-headline text-[var(--text-headline-md-size)] font-bold text-on-background mb-2`
- **Material Badge:** Component `Badge` — `inline-flex bg-surface-container-low rounded-lg px-1.5 text-[var(--text-label-md-size)] font-label`
- **Description:** `font-body text-[var(--text-body-lg-size)] leading-[1.75] mt-6 text-on-background`
- **Dimensions Table (margin-top spacing-8):**
  - Component: `Card` — `bg-surface-container-low rounded-xl p-6`
  - Title: `font-body text-[var(--text-title-lg-size)] font-semibold mb-4`
  - Rows: `py-3 odd:bg-surface-container-lowest rounded-md px-3`
  - Columns: Label `text-[var(--text-label-md-size)] text-on-background/60` | Value `text-[var(--text-body-lg-size)] text-on-background`
- **CTA Button (margin-top spacing-8):**
  - Component: `Button` primary — `w-full h-14 bg-primary-container text-white rounded-xl text-[var(--text-title-lg-size)] font-semibold`
  - Icon: request_quote truoc text
  - Hover: `hover:bg-gradient-to-r hover:from-primary hover:to-primary-container`

**Material Specifications Section (duoi product section, full-width, margin-top spacing-16):**
- Section title: `font-headline text-[var(--text-headline-md-size)] font-bold`
- **Collapsible Accordion:** Component `Accordion`
  - Moi item: `bg-surface-container-lowest rounded-lg mb-2`
  - Header: `font-body text-[var(--text-title-lg-size)] font-semibold p-5 flex items-center justify-between cursor-pointer`
  - Icon: `expand_more transition-transform duration-300` (rotate 180 khi mo)
  - Content: `text-[var(--text-body-lg-size)] leading-[1.75] px-5 pb-5`
  - Animation: `transition-[max-height] duration-300 ease-in-out`
  - Item dau tien mo san (default expanded)

**Related Products Section (margin-top spacing-16):**
- Section title: `font-headline text-[var(--text-headline-md-size)] font-bold mb-8`
- Layout: `grid grid-cols-4 gap-4`
- Card style: giong catalog page — image `aspect-[4/5] rounded-lg object-cover`, name `text-[var(--text-title-lg-size)] font-semibold`, material `text-[var(--text-label-md-size)] text-on-background/60`
- Hover: `hover:shadow-[var(--shadow-xl)] hover:scale-[1.01] transition-all duration-300`

### Tablet Layout (768px)

- Product section: `grid-cols-1` — images tren, info duoi
- Main image: `w-full aspect-[4/5]`
- Thumbnails: `flex overflow-x-auto gap-2`
- Related products: `grid-cols-2`

### Mobile Layout (375px)

- **Main Image:** `flex overflow-x-auto snap-x snap-mandatory` carousel voi dots indicator
  - Dots: `w-2 h-2 rounded-full` primary-container active, on-background/20 inactive
  - Swipe gesture: horizontal, snap to image
  - Khong hien thumbnail strip — chi carousel
- Stack: `flex flex-col gap-6` — name, material badge, description, dimensions card, specs accordion, CTA button
- **Sticky Bottom CTA:** tuong tu Screen 1 nhung text "Yeu Cau Bao Gia"
- Related products: `flex overflow-x-auto snap-x gap-4` — 2 cards visible + peek card thu 3

### States

| State | Mo ta |
|---|---|
| Loading | Main image skeleton (4:5), 4 thumbnail skeletons, text skeletons cho name + description |
| Error | "Khong tim thay san pham" — cung pattern voi Screen 1 error state |
| No Related Products | Section an |
| Image Loading | Shimmer animation tren surface-container-low background |

### Accessibility

- Main image: alt text tu CMS
- Thumbnails: aria-label "Hinh [so thu tu]", role="button"
- Carousel mobile: aria-roledescription="carousel", aria-label="Hinh anh san pham"
- Accordion: aria-expanded, aria-controls
- CTA button: aria-label "Yeu cau bao gia cho [ten san pham]"

---

## SCREEN 3: ABOUT PAGE (Public)

**ID:** A6
**Priority:** P1
**Can cho:** Stage 3
**Route:** `/ve-chung-toi`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `/api/settings` | GET | @Public (partial) | Load company info (name, address, phone, social_links) |

**Note:** About page content (story text, stats numbers, facility images) is largely static/hard-coded in the FE or managed via a CMS content block. The `/api/settings` endpoint provides company_name, address, phone, email, social_links for the contact info section. If a dedicated About content API is needed, it should be added to the SA spec.

### State Machine

```
INITIAL ──(route enter)──> LOADING
LOADING ──(settings loaded)──> LOADED
LOADING ──(API error)──> ERROR
LOADED ──(scroll to stats)──> STATS_ANIMATING
STATS_ANIMATING ──(count-up complete)──> LOADED
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING` | Hero `Skeleton`, text `Skeleton`s, stats = 4 `Skeleton` rectangles | `Skeleton` |
| `LOADED` | Full content, stats ready to animate on scroll | `Card`, `Button` |
| `STATS_ANIMATING` | Numbers count from 0 (2000ms ease-out, IntersectionObserver trigger) | -- |
| `ERROR` | "Khong the tai trang" with retry | `Button` (secondary) |
| `IMAGE_ERROR` | `bg-surface-container-low` placeholder with `broken_image` icon centered | -- |

### SEO Metadata

```typescript
{
  title: 'Ve Chung Toi | VietNet Interior - Thiet Ke Noi That Cao Cap',
  meta: [
    { name: 'description', content: 'VietNet Interior - Cong ty thiet ke va thi cong noi that cao cap. Hon X nam kinh nghiem, Y du an hoan thanh.' },
    { property: 'og:title', content: 'Ve Chung Toi | VietNet Interior' },
    { property: 'og:description', content: 'Kham pha cau chuyen, tam nhin va co so vat chat cua VietNet Interior.' },
    { property: 'og:image', content: '/images/about-og.jpg' },
    { property: 'og:url', content: 'https://bhquan.site/ve-chung-toi' },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: 'https://bhquan.site/ve-chung-toi' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VietNet Interior',
        url: 'https://bhquan.site',
        description: 'Cong ty thiet ke va thi cong noi that cao cap',
        address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh', addressCountry: 'VN' },
      }),
    },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Hero text overlay | Fade in + slide right | `animate-[fadeSlideRight_1s_ease-out]` from `opacity-0 -translate-x-8` |
| Company story section | Fade in on scroll (text left, image right staggered) | Text: `delay-0` Image: `delay-200` both `opacity-0 translate-y-6` -> `opacity-100 translate-y-0 duration-700` |
| Stats counter | Count-up from 0 on viewport entry | IntersectionObserver trigger, `requestAnimationFrame` count-up 2000ms ease-out |
| Facility images | Staggered fade-in | Each grid item: `delay-[calc(index*150ms)]` `opacity-0 scale-95` -> `opacity-100 scale-100 duration-500` |
| Facility hover | Caption overlay slide up | `opacity-0 translate-y-4` -> `group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300` |
| Quality cards | Staggered fade + slide up | `delay-[calc(index*200ms)]` `opacity-0 translate-y-8` -> visible |

### Muc dich

Gioi thieu cong ty — lich su, tam nhin, co so vat chat, va cam ket chat luong.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page container: max-w-[1280px] mx-auto px-6
Section spacing: py-16
Asymmetric grid: grid grid-cols-12 gap-10
```

**Hero Section:**
- `w-full aspect-[21/9] max-h-[500px] relative overflow-hidden`
- Full-width showroom/factory image, `object-cover`
- Gradient overlay: `absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent` (50% width)
- Text overlay: `absolute left-0 top-1/2 -translate-y-1/2 max-w-[600px] pl-6 lg:pl-[calc((100vw-1280px)/2+1.5rem)]`
  - Company name: `font-display text-[var(--text-display-lg-size)] font-bold text-white`
  - Tagline: `font-headline text-[var(--text-headline-md-size)] text-white/80 mt-2`

**Company Story Section (margin-top spacing-16):**
- `grid grid-cols-12 gap-10 mt-16`
- Left (5 cols): `col-span-5`
  - Section label: `text-[var(--text-label-md-size)] font-label uppercase text-primary tracking-[0.2em] mb-3`
  - Title: `font-headline text-[var(--text-headline-md-size)] font-bold mb-6`
  - Body: `font-body text-[var(--text-body-lg-size)] leading-[1.75] text-on-background`
  - Multiple paragraphs: `space-y-4`
- Right (7 cols): `col-span-7`
  - Image: `aspect-[3/4] rounded-lg object-cover shadow-[var(--shadow-xl)]`

**Stats Counter Section (margin-top spacing-16):**
- `bg-surface-container-low w-full py-12 mt-16`
- `max-w-[1000px] mx-auto grid grid-cols-4 gap-8 text-center`
- Moi metric:
  - Number: `font-display text-[var(--text-display-lg-size)] font-bold text-primary`
  - Suffix: `font-headline text-[var(--text-headline-md-size)] text-primary inline`
  - Label: `text-[var(--text-label-md-size)] font-label uppercase text-on-background/60 mt-2 tracking-[0.2em]`
  - Animated on scroll: count up tu 0, duration 2000ms, easing ease-out
  - Trigger: IntersectionObserver
- Metrics: So Nam Kinh Nghiem, Du An Hoan Thanh, Giai Thuong, Thanh Vien

**Facility Showcase Section (margin-top spacing-16):**
- Section label: `text-[var(--text-label-md-size)] font-label uppercase text-primary tracking-[0.2em]`
- Section title: `font-headline text-[var(--text-headline-md-size)] font-bold mb-8`
- Layout: `grid grid-cols-2 gap-4` (2x2 bento grid)
  - Moi image: `aspect-[4/3] rounded-lg object-cover relative overflow-hidden group`
  - Hover: overlay `absolute inset-0 bg-primary-container/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`
  - Caption: `text-[var(--text-label-md-size)] font-label text-white uppercase tracking-widest`

**Quality & Warranty Section (margin-top spacing-16, margin-bottom spacing-16):**
- `grid grid-cols-3 gap-6 mt-16 mb-16`
- Moi card: Component `Card` — `bg-surface-container-lowest rounded-xl p-8 shadow-[var(--shadow-sm)]`
  - Icon: `material-symbols-outlined text-[48px] text-primary mb-4`
  - Title: `font-body text-[var(--text-title-lg-size)] font-semibold mb-3`
  - Description: `font-body text-[var(--text-body-lg-size)] text-on-background/80 leading-[1.6]`
- Cards:
  1. Vat Lieu Chat Luong — icon: verified
  2. Tay Nghe Thu Cong — icon: precision_manufacturing
  3. Chinh Sach Bao Hanh — icon: shield

### Tablet Layout (768px)

- Hero: `aspect-video max-h-[400px]`, text overlay van left-aligned nhung `pl-8`
- Company Story: `grid-cols-1` — text truoc, image sau (full-width)
- Stats: `grid-cols-2 gap-6`
- Facility: `grid-cols-2` giu nguyen
- Quality cards: `flex flex-col gap-6`

### Mobile Layout (375px)

- Hero: `aspect-[4/3]`, text overlay centered, `text-center px-6`
  - Title: `text-[var(--text-headline-md-size)]` (nho hon display-lg)
- Tat ca sections `flex flex-col gap-8`
- Stats: `grid grid-cols-2 gap-4`, number `text-[var(--text-headline-md-size)]`
- Facility: `flex flex-col gap-4`, moi image `w-full aspect-[4/3]`
- Quality cards: `flex flex-col gap-4`

### States

| State | Mo ta |
|---|---|
| Loading | Hero skeleton, text skeletons, stats = 4 rectangles, images = grey placeholders |
| Stats animating | Numbers count tu 0 khi scroll vao view |
| Image error | Surface-container-low placeholder voi icon broken_image |

### Accessibility

- Hero image: role="img", aria-label mo ta showroom
- Stats: aria-label cho moi metric "X nam kinh nghiem"
- Facility images: alt text mo ta tung hinh
- Cards: semantic heading levels (h2 cho section, h3 cho card title)

---

## SCREEN 4: CONTACT PAGE (Public)

**ID:** A7
**Priority:** P0
**Can cho:** Stage 2
**Route:** `/lien-he`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `POST /api/consultations` | POST | @Public | Submit consultation request form |
| `GET /api/settings` | GET | @Public (partial) | Load company contact info (address, phone, email, social_links, showroom_hours) |

**POST /api/consultations request body:**
```typescript
{
  name: string;           // required, max 100 chars
  email: string;          // required, valid email
  phone?: string;         // optional, Vietnamese phone format
  project_type: string;   // required: 'interior-design' | 'apartment' | 'villa' | 'office' | 'townhouse' | 'other'
  message?: string;       // max 2000 chars
  source_page?: string;   // auto-filled: '/lien-he'
  honeypot?: string;      // hidden field, must be empty (bot trap)
}
```

**POST /api/consultations response 201:**
```typescript
{ success: true, data: { id: string, ref_code: string }, message: "..." }
```

**Rate limit:** 1 request/min per IP, 3 requests/hour per IP

### State Machine

```
INITIAL ──(route enter)──> LOADING_SETTINGS
LOADING_SETTINGS ──(settings loaded)──> FORM_DEFAULT
LOADING_SETTINGS ──(error)──> ERROR
FORM_DEFAULT ──(user types)──> FORM_EDITING
FORM_EDITING ──(blur field, invalid)──> FORM_FIELD_ERROR
FORM_EDITING ──(submit, invalid)──> FORM_VALIDATION_ERROR
FORM_EDITING ──(submit, valid)──> FORM_SUBMITTING
FORM_SUBMITTING ──(success 201)──> FORM_SUCCESS
FORM_SUBMITTING ──(error 400)──> FORM_VALIDATION_ERROR
FORM_SUBMITTING ──(error 429)──> FORM_RATE_LIMITED
FORM_SUBMITTING ──(network error)──> FORM_SUBMIT_ERROR
FORM_SUCCESS ──(click "Gui yeu cau khac")──> FORM_DEFAULT
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING_SETTINGS` | `Skeleton` for contact info cards | `Skeleton` |
| `FORM_DEFAULT` | All fields empty, placeholders visible | `Input`, `Select`, `Textarea`, `Button`, `Card` |
| `FORM_EDITING` | User entering data | `Input`, `Select`, `Textarea` |
| `FORM_FIELD_ERROR` | Red border + error message on invalid field | `Input` error variant |
| `FORM_VALIDATION_ERROR` | Multiple field errors shown simultaneously | `Input` error variant |
| `FORM_SUBMITTING` | Button disabled, spinner, text "Dang gui..." | `Button` loading variant |
| `FORM_SUCCESS` | Form replaced by success `Card`: icon `check_circle` 64px primary, title "Cam on ban!", body "Chung toi se lien he trong 24h", button "Gui yeu cau khac" | `Card`, `Button` |
| `FORM_SUBMIT_ERROR` | `Toast` notification (error) top-right: "Gui that bai, vui long thu lai" | `Toast` |
| `FORM_RATE_LIMITED` | `Toast` notification: "Vui long doi truoc khi gui yeu cau tiep theo" | `Toast` |
| `MAP_LOADING` | `Skeleton` shimmer in map area | `Skeleton` |

### SEO Metadata

```typescript
{
  title: 'Lien He Tu Van | VietNet Interior - Thiet Ke Noi That',
  meta: [
    { name: 'description', content: 'Lien he VietNet Interior de duoc tu van thiet ke noi that mien phi. Dia chi, so dien thoai, email va form lien he.' },
    { property: 'og:title', content: 'Lien He Tu Van | VietNet Interior' },
    { property: 'og:description', content: 'Tu van thiet ke noi that mien phi. Lien he ngay de bat dau du an cua ban.' },
    { property: 'og:image', content: '/images/contact-og.jpg' },
    { property: 'og:url', content: 'https://bhquan.site/lien-he' },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: 'https://bhquan.site/lien-he' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Lien He VietNet Interior',
        url: 'https://bhquan.site/lien-he',
        mainEntity: {
          '@type': 'Organization',
          name: 'VietNet Interior',
          telephone: settings.phone,
          email: settings.email,
          address: { '@type': 'PostalAddress', streetAddress: settings.address },
        },
      }),
    },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Page title | Fade in + slide down | `animate-[fadeSlideDown_0.6s_ease-out]` |
| Contact info cards | Staggered fade in from left | `delay-[calc(index*100ms)]` `opacity-0 -translate-x-4` -> visible `duration-500` |
| Form card | Fade in from right | `animate-[fadeSlideLeft_0.7s_ease-out_0.2s_both]` |
| Form field focus | Border color transition | `transition-colors duration-200` |
| Submit button hover | Gradient shift | `transition-all duration-300` |
| Success state | Scale up from center | `animate-[scaleIn_0.4s_ease-out]` from `scale-90 opacity-0` |
| Toast notification | Slide in from right | `animate-[slideInRight_0.3s_ease-out]` |
| Error shake | Card shake on wrong credentials | `animate-[shake_0.3s]` `translateX(+-4px)` 3 times |
| Map load | Fade in when iframe loads | `opacity-0` -> `opacity-100 transition-opacity duration-500` |

### Muc dich

Trang lien he — form tu van + thong tin lien lac + ban do. Day la diem chuyen doi chinh tu khach hang tiem nang.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page container: max-w-[1280px] mx-auto px-6
2-column layout: grid grid-cols-2 gap-10
Contact card: bg-surface-container-low rounded-xl p-5 flex items-start gap-3
Form card: bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-[var(--shadow-lg)]
```

**Page Title Section:**
- Title: `font-display text-[var(--text-display-lg-size)] font-bold text-center mb-4`
- Subtitle: `font-body text-[var(--text-body-lg-size)] text-on-background/60 text-center max-w-[600px] mx-auto mb-12`

**Main Content — 2-column layout (6/6 grid, gap spacing-10):**
- `grid grid-cols-2 gap-10`

*Left Column:*
- **Contact Info Cards:** `flex flex-col gap-4`
  - Moi card: Component `Card` variant — `bg-surface-container-low rounded-xl p-5 flex items-start gap-3 hover:shadow-[var(--shadow-md)] transition-shadow duration-200`
  - Icon: `material-symbols-outlined text-[24px] text-primary mt-0.5`
  - Cards:
    1. location_on — Dia chi (body-lg)
    2. phone — Dien thoai (`<a href="tel:...">`)
    3. email — Email (`<a href="mailto:...">`)
    4. schedule — Gio lam viec

- **Social Links Row:** `flex gap-3 mt-6`
  - Moi link: Component `IconButton` — `w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center hover:bg-primary-container hover:text-white transition-all duration-200`
  - Icons: Zalo, Facebook, Instagram — `w-6 h-6 text-on-background/60`

- **Embedded Map:** `mt-6 h-[400px] w-full rounded-xl shadow-[var(--shadow-sm)] overflow-hidden`
  - Google Maps iframe, `w-full h-full`
  - Loading: `Skeleton` placeholder

*Right Column:*
- **Consultation Form Card:** Component `Card` — `bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-[var(--shadow-lg)]`
  - Form title: `font-body text-[var(--text-title-lg-size)] font-semibold mb-6`

  - **Form Fields:** `flex flex-col gap-4`
    1. Ho va Ten (required): Component `Input` — icon person
    2. So Dien Thoai (required): Component `Input` — icon phone, type tel
    3. Email (optional): Component `Input` — icon email, type email
    4. Loai Du An: Component `Select` — icon expand_more
       - Options: Nha Pho, Can Ho, Biet Thu, Van Phong, Khac
    5. Noi Dung: Component `Textarea` — icon edit_note, `min-h-[120px] resize-y`
    6. Honeypot: `<input type="text" class="hidden" tabindex="-1" autocomplete="off" />`
    7. Submit: Component `Button` primary — `w-full h-[52px] bg-primary-container text-white rounded-xl` icon send

  - **Validation Messages:**
    - `text-[var(--color-error)] text-[var(--text-label-md-size)] mt-1 flex items-center gap-1`
    - Icon: `error_outline text-[16px]`
    - Input border: `border-[var(--color-error)]/50`

### Tablet Layout (768px)

- Van `grid-cols-2` nhung `gap-6`
- Map height: `h-[300px]`
- Form card padding: `p-6`

### Mobile Layout (375px)

- **Thu tu uu tien thay doi:** `flex flex-col gap-6` — Form TRUOC, contact info SAU, map CUOI CUNG
- Ly do: tren mobile, action (gui form) quan trong hon info
- Tat ca full-width
- Map: `h-[250px]`
- Social links: `justify-center`
- Form card: `shadow-none border border-outline-variant/10` (tiet kiem khong gian)

### States

| State | Mo ta |
|---|---|
| Form Default | Tat ca fields empty, placeholder visible |
| Field Focus | Border transition primary 50%, label color primary |
| Field Error | Border error color, error message hien duoi field |
| Field Valid | Icon check_circle (16px, green) hien ben phai input |
| Submitting | Button disabled, spinner thay icon send, text "Dang gui..." |
| Submit Success | Form thay bang success card: icon check_circle (64px, primary), title "Cam on ban!" (headline-md), body "Chung toi se lien he trong 24h" (body-lg), button "Gui yeu cau khac" de reset form |
| Submit Error | Toast notification (top-right, slide in): error background, white text, "Gui that bai, vui long thu lai", auto dismiss 5s |
| Map Loading | Surface-container-low voi shimmer animation |

### Accessibility

- Form: label + input lien ket qua htmlFor/id
- Required fields: aria-required="true"
- Error messages: aria-live="polite", lien ket qua aria-describedby
- Submit button: aria-label "Gui yeu cau tu van"
- Phone/email links: aria-label mo ta hanh dong
- Map iframe: title="Ban do vi tri showroom"

---

## SCREEN 5: SEARCH RESULTS PAGE (Public)

**ID:** A8
**Priority:** P1
**Can cho:** Stage 4
**Route:** `/tim-kiem?q=[query]`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `GET /api/search?q=...` | GET | @Public | Full-text search across projects and products |

**Query params:**
```typescript
{
  q: string;                              // required, min 2 chars
  type?: 'all' | 'projects' | 'products'; // default 'all'
  page?: number;                          // default 1
  limit?: number;                         // default 10 (5 per type when 'all'), max 50
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    projects: Array<{
      id: string; title: string; slug: string;
      description: string;       // truncated, <mark> around matched terms
      category: { name: string; slug: string; };
      cover_image: { thumbnail_url: string; } | null;
      type: 'project';
    }>;
    products: Array<{
      id: string; name: string; slug: string;
      description: string;
      material_type: string;
      cover_image: { thumbnail_url: string; } | null;
      type: 'product';
    }>;
    total_projects: number;
    total_products: number;
  },
  message: "OK"
}
```

### State Machine

```
INITIAL ──(route enter, no q param)──> EMPTY_QUERY
INITIAL ──(route enter, has q param)──> SEARCHING
EMPTY_QUERY ──(user types, debounce 300ms)──> SEARCHING
SEARCHING ──(API success, results > 0)──> RESULTS_LOADED
SEARCHING ──(API success, results == 0)──> NO_RESULTS
SEARCHING ──(API error)──> ERROR
RESULTS_LOADED ──(user types new query)──> SEARCHING
RESULTS_LOADED ──(click pagination)──> SEARCHING
NO_RESULTS ──(user types new query)──> SEARCHING
```

| State | UI Behavior | Components Used |
|---|---|---|
| `EMPTY_QUERY` | Search bar empty, no results section, optional "popular searches" suggestions | `Input` (search variant) |
| `SEARCHING` | `Skeleton`: 4 cards with image placeholder + text lines. Small spinner in search bar. | `Skeleton`, `Input` |
| `RESULTS_LOADED` | Mixed results list, pagination visible | `Card` (result variant), `Badge`, `Pagination` |
| `NO_RESULTS` | Centered: icon `search_off` 64px, title "Khong tim thay ket qua", body + button "Xem San Pham" | `Button` (secondary) |
| `ERROR` | "Loi tim kiem, vui long thu lai" + retry `Button` | `Button` |
| `TYPING` | Debounce 300ms, spinner in search bar while fetching | `Input` |

### SEO Metadata

```typescript
{
  title: query ? `Tim kiem: "${query}" | VietNet Interior` : 'Tim Kiem | VietNet Interior',
  meta: [
    { name: 'description', content: `Ket qua tim kiem cho "${query}" tren VietNet Interior - du an va san pham noi that.` },
    { name: 'robots', content: 'noindex, follow' },  // search results should not be indexed
  ],
  link: [
    { rel: 'canonical', href: `https://bhquan.site/tim-kiem?q=${encodeURIComponent(query)}` },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Search bar focus | Shadow glow appear | `transition-shadow duration-200` -> `shadow-[0_0_16px_var(--color-primary)/8]` |
| Results loading -> loaded | Fade in staggered | Each card: `opacity-0 translate-y-4` -> `opacity-100 translate-y-0 delay-[calc(index*80ms)] duration-500` |
| Query change | Results fade out/in | `transition-opacity duration-200` |
| No results icon | Gentle pulse | `animate-pulse` on `search_off` icon |
| Result card hover | Shadow + subtle lift | `hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200` |

### Muc dich

Hien thi ket qua tim kiem — gom ca du an va san pham, phan biet bang category badge.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page container: max-w-[800px] mx-auto px-6
Search input: max-w-[600px] mx-auto
Result card: flex gap-4 p-4 rounded-xl hover:shadow-[var(--shadow-md)]
```

**Search Bar Section (margin-top spacing-8, margin-bottom spacing-8):**
- `max-w-[600px] mx-auto mt-8 mb-8`
- Component: `Input` search variant — `bg-surface-container-lowest border border-outline-variant/10 rounded-xl h-14 px-4`
- Icon: `search` left 24px `text-on-background/40`
- Clear button: `w-5 h-5 text-on-background/40 hover:text-on-background` — chi hien khi co text
- Font: `text-[var(--text-body-lg-size)] font-body`
- Focus: `border-primary/50 shadow-[0_0_16px_var(--color-primary)/8]`
- Auto-focus khi load trang

**Results Count (margin-bottom spacing-6):**
- `text-[var(--text-body-lg-size)] text-on-background/60 mb-6`
- Query text: `font-semibold text-on-background`

**Results List (max-width 800px, centered):**
- `flex flex-col gap-4 max-w-[800px] mx-auto`

- **Result Card (project):**
  - `flex gap-4 p-4 rounded-xl cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow duration-200`
  - Image: `w-[200px] aspect-[4/3] rounded-lg object-cover flex-shrink-0`
  - Category badge: Component `Badge` — `bg-primary-container text-white rounded-md` text "Du An"
  - Title: `font-body text-[var(--text-title-lg-size)] font-semibold mt-2`
  - Excerpt: `text-[var(--text-body-lg-size)] text-on-background/60 line-clamp-2`

- **Result Card (product):**
  - Same layout nhung badge text "San Pham", image `aspect-square`

- **Pagination (margin-top spacing-8):**
  - Component: `Pagination`
  - `flex justify-center gap-2 mt-8`

### Tablet Layout (768px)

- Search bar: `max-w-[500px]`
- Results: same layout nhung image `w-[160px]`

### Mobile Layout (375px)

- Search bar: `w-full h-12`
- Result cards: `flex-col` — image `w-full aspect-video`, text duoi
- Pagination: chi hien prev/next + current page number

### States

| State | Mo ta |
|---|---|
| Initial (no query) | Search bar empty, khong hien results section, co the hien "popular searches" goi y |
| Loading | Skeleton: 4 cards voi image placeholder + text lines |
| No Results | Centered: icon search_off (64px, on-background 20%), title "Khong tim thay ket qua" (headline-md), body "Thu tu khoa khac hoac duyet danh muc san pham" (body-lg, on-background 60%), button "Xem San Pham" (secondary style) |
| Error | "Loi tim kiem, vui long thu lai" + retry button |
| Typing | Debounce 300ms truoc khi search, spinner nho trong search bar khi dang fetch |

### Accessibility

- Search input: role="searchbox", aria-label="Tim kiem du an va san pham"
- Results: role="list", moi card role="listitem"
- Pagination: nav aria-label="Phan trang", current page aria-current="page"
- Category badge: aria-label "Loai: Du An" hoac "Loai: San Pham"

---

## SCREEN 6: 404 PAGE (Public)

**ID:** A9.1
**Priority:** P1
**Route:** Bat ky URL khong ton tai

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| -- | -- | -- | Khong co API call. Trang hoan toan static. |

### State Machine

```
INITIAL ──(route not matched)──> RENDERED
RENDERED ──(click "Ve Trang Chu")──> NAVIGATE to /
```

| State | UI Behavior | Components Used |
|---|---|---|
| `RENDERED` | Static content, always visible. No loading state needed. | `Button` (primary) |

### SEO Metadata

```typescript
{
  title: '404 - Trang Khong Ton Tai | VietNet Interior',
  meta: [
    { name: 'description', content: 'Trang ban dang tim khong ton tai hoac da duoc di chuyen.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| "404" text | Fade in + scale from large | `animate-[fadeScaleDown_0.8s_ease-out]` from `scale-110 opacity-0` to `scale-100 opacity-100` |
| Subtitle + description | Fade in with delay | `animate-[fadeIn_0.6s_ease-out_0.3s_both]` |
| CTA button | Fade in with longer delay | `animate-[fadeIn_0.6s_ease-out_0.5s_both]` |
| Background (optional) | Slow subtle drift of blurred interior image | `animate-[slowDrift_20s_linear_infinite]` |

### Muc dich

Trang bao loi khi URL khong ton tai — giu nguoi dung o lai site thay vi roi di.

### Layout (tat ca breakpoints)

**Key Tailwind Classes:**
```
Page: min-h-screen flex items-center justify-center bg-surface
Content block: max-w-[480px] text-center px-6
```

**Container:**
- `min-h-screen flex items-center justify-center bg-surface relative`
- Optional: background image `absolute inset-0 blur-[40px] opacity-5 object-cover`

**Content Block (centered, max-width 480px, text-align center):**
- **"404":** `font-display text-primary text-[8rem] md:text-[5rem] font-bold leading-none`
- **Subtitle:** `font-headline text-[var(--text-headline-md-size)] text-on-background mt-4`
  - Text: "Trang khong ton tai"
- **Description:** `font-body text-[var(--text-body-lg-size)] text-on-background/60 mt-3 max-w-[360px] mx-auto`
  - Text: "Trang ban dang tim khong con ton tai hoac da duoc di chuyen. Vui long quay lai trang chu."
- **CTA Button (margin-top spacing-8):**
  - Component: `Button` primary — `bg-primary-container text-white rounded-xl h-12 px-8 inline-flex items-center gap-2`
  - Icon: home (truoc text)
  - Hover: `hover:bg-gradient-to-r hover:from-primary hover:to-primary-container`

### Mobile adjustments (375px)

- "404": `text-[5rem]`
- Container: `px-6`
- Button: `w-full`

### Accessibility

- Page title: "404 - Trang khong ton tai | VietNet"
- Main content: role="main", aria-label="Trang loi 404"
- Button: focus visible outline

---

## SCREEN 7: 500 ERROR PAGE (Public)

**ID:** A9.2
**Priority:** P2
**Route:** Khi server gap loi

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| -- | -- | -- | Khong co API call. Trang hoan toan static. Must be self-contained (no external API deps since server is down). |

### State Machine

```
INITIAL ──(server error caught)──> RENDERED
RENDERED ──(click "Thu Lai")──> RELOADING (window.location.reload())
RENDERED ──(click "Ve Trang Chu")──> NAVIGATE to /
RELOADING ──(success)──> NORMAL_PAGE
RELOADING ──(still error)──> RENDERED
```

| State | UI Behavior | Components Used |
|---|---|---|
| `RENDERED` | Static error content with two action buttons | `Button` (primary), `Button` (secondary) |

### SEO Metadata

```typescript
{
  title: '500 - Loi He Thong | VietNet Interior',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| "500" text | Same as 404 — fade in + scale | `animate-[fadeScaleDown_0.8s_ease-out]` |
| Subtitle + description | Fade in with delay | `animate-[fadeIn_0.6s_ease-out_0.3s_both]` |
| Buttons | Fade in staggered | `animate-[fadeIn_0.6s_ease-out_0.4s_both]` and `delay-500` |
| "Thu Lai" click | Button spinner while reloading | `animate-spin w-5 h-5` on refresh icon |

### Muc dich

Trang bao loi he thong — tran an nguoi dung va cho phep thu lai.

### Layout (tat ca breakpoints)

**Key Tailwind Classes:**
```
Page: min-h-screen flex items-center justify-center bg-surface
Content block: max-w-[480px] text-center px-6
Button row: flex gap-3 justify-center mt-8
```

**Giong hoan toan Screen 6 (404) voi nhung thay doi sau:**

- **"500"** thay vi "404" — `font-display text-primary text-[8rem] font-bold leading-none`
- **Subtitle:** "Loi he thong"
- **Description:** "Da xay ra loi khong mong muon. Vui long thu lai hoac lien he ho tro neu loi van tiep tuc."
- **Buttons (2 buttons, `flex gap-3 justify-center mt-8`):**
  1. "Thu Lai" — Component `Button` primary — `bg-primary-container text-white rounded-xl h-12 px-6 inline-flex items-center gap-2`
     - Icon: refresh
     - onClick: window.location.reload()
  2. "Ve Trang Chu" — Component `Button` secondary — `bg-transparent border border-outline-variant/20 text-on-background rounded-xl h-12 px-6 inline-flex items-center gap-2`
     - Icon: home
     - onClick: navigate to "/"

### Mobile adjustments

- `flex-col gap-3 w-full` — 2 buttons stack vertically, full-width

### Accessibility

- Page title: "500 - Loi he thong | VietNet"
- "Thu Lai" button: aria-label "Tai lai trang"

---

## SCREEN 8: ADMIN LOGIN PAGE

**ID:** B1.1
**Priority:** P0
**Can cho:** Stage 2
**Route:** `/admin/login`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `POST /api/auth/login` | POST | @Public | Authenticate admin user |
| `POST /api/auth/forgot-password` | POST | @Public | Send password reset email (from forgot password link) |

**POST /api/auth/login request body:**
```typescript
{
  email: string;       // required, valid email format
  password: string;    // required, min 8 chars
}
```

**Response 200:** Sets HttpOnly cookies (access_token 60min, refresh_token 7d), returns `{ success: true, data: { user: { id, name, email, role } } }`
**Response 401:** `{ success: false, message: "Invalid email or password" }`
**Response 429:** `{ success: false, message: "Too many login attempts. Try again in 30 minutes." }`

**Rate limit:** 5 failed attempts / 10 min per IP. After 5 failures, block 30 min.
**Headers:** `X-CSRF-Token` in response, `X-RateLimit-Remaining` for attempts left.

### State Machine

```
INITIAL ──(route enter)──> FORM_DEFAULT
FORM_DEFAULT ──(user types)──> FORM_EDITING
FORM_EDITING ──(submit)──> SUBMITTING
SUBMITTING ──(success 200)──> LOGIN_SUCCESS ──(redirect)──> /admin/dashboard
SUBMITTING ──(error 401)──> CREDENTIALS_ERROR
SUBMITTING ──(error 429)──> RATE_LIMITED
SUBMITTING ──(network error)──> NETWORK_ERROR
CREDENTIALS_ERROR ──(user types)──> FORM_EDITING
RATE_LIMITED ──(timer expires)──> FORM_DEFAULT
```

| State | UI Behavior | Components Used |
|---|---|---|
| `FORM_DEFAULT` | Form empty, placeholders visible | `Input`, `Button`, `Card` |
| `FORM_EDITING` | User entering credentials | `Input` |
| `SUBMITTING` | Button disabled, spinner, text "Dang dang nhap..." | `Button` loading variant |
| `LOGIN_SUCCESS` | Brief success indicator, then redirect to /admin/dashboard | -- |
| `CREDENTIALS_ERROR` | Error card appears above form: `bg-error-container rounded-lg p-3`, icon `error_outline` + "Sai email hoac mat khau". Card shakes `animate-[shake_0.3s]` | `Card` error variant |
| `RATE_LIMITED` | Form replaced by lock message: icon `lock` 48px, title "Tai khoan bi khoa", body text, countdown timer | -- |
| `NETWORK_ERROR` | `Toast` top-center: "Khong the ket noi may chu" | `Toast` |

### SEO Metadata

```typescript
{
  title: 'Dang Nhap | VietNet Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Trang dang nhap quan tri VietNet Interior' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Login card | Fade in + slide up from center | `animate-[fadeSlideUp_0.6s_ease-out]` from `opacity-0 translate-y-4` |
| Logo | Fade in with delay | `animate-[fadeIn_0.5s_ease-out_0.2s_both]` |
| Form fields | Staggered appearance | `delay-[calc(index*100ms)]` fade in |
| Error card | Shake animation | `animate-[shake_0.3s]` translateX +-4px, 3 times |
| Error card appear | Slide down | `animate-[slideDown_0.3s_ease-out]` |
| Submit button hover | Gradient shift | `transition-all duration-300` |
| Rate limit timer | Countdown number change | `transition-all duration-300` (smooth number update) |
| Background (optional) | Subtle gradient shift | `animate-[gradientShift_10s_ease_infinite]` |

### Muc dich

Dang nhap cho admin/editor — bao mat, don gian, chuyen nghiep.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Page: min-h-screen flex items-center justify-center bg-surface
Login card: max-w-[440px] w-full bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 shadow-[var(--shadow-xl)]
```

**Background:**
- `min-h-screen flex items-center justify-center bg-surface`
- Optional: `bg-gradient-to-br from-surface to-surface-container-low`

**Login Card (centered ca horizontal va vertical, max-width 440px):**
- `max-w-[440px] w-full bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 shadow-[var(--shadow-xl)]`

**Card Content:**
1. **Brand Logo:**
   - `mx-auto max-w-[160px] mb-8`
2. **Title:** `font-headline text-[var(--text-headline-md-size)] font-bold text-center mb-6`
3. **Email Input:** Component `Input` — icon email, autocomplete email
4. **Password Input (mt-4):** Component `Input` — icon lock
   - Eye toggle: Component `IconButton` inline — `w-8 h-8 rounded-full` icon visibility/visibility_off
   - Autocomplete: current-password
5. **Submit Button (mt-6):** Component `Button` primary — `w-full h-[52px] bg-primary-container text-white rounded-xl` icon login
6. **Forgot Password Link (mt-4):** `text-[var(--text-label-md-size)] font-label text-primary text-center cursor-pointer hover:underline`

### Tablet Layout (768px)

- Card max-width van 440px, centered

### Mobile Layout (375px)

- Card: `w-full mx-4 rounded-xl`
- Padding trong card: `p-6`
- Van centered vertically

### States

| State | Mo ta |
|---|---|
| Default | Form empty, placeholders visible |
| Field Focus | Ghost border -> primary 50%, label color primary |
| Loading (submitting) | Button disabled, spinner thay icon, text "Dang dang nhap..." |
| Error — Wrong Credentials | Error card xuat hien phia tren form (hoac duoi title): surface error background (nhe, red-tinted), rounded-lg, padding spacing-3, icon error_outline + text "Sai email hoac mat khau" (body-lg, error color). Card co shake animation nhe (translateX +-4px, 3 lan, 300ms) |
| Error — Rate Limited | Thay form bang message: icon lock (48px, on-background 40%), title "Tai khoan bi khoa" (headline-md), body "Qua nhieu lan dang nhap sai. Vui long thu lai sau 30 phut." (body-lg, on-background 60%), timer countdown (label-md, primary) |
| Error — Network | Toast: "Khong the ket noi may chu" (top-center) |

### Accessibility

- Form: role="form", aria-label="Form dang nhap"
- Email: aria-label="Dia chi email", aria-required="true"
- Password: aria-label="Mat khau", aria-required="true"
- Eye toggle: aria-label="Hien/An mat khau", role="button"
- Error message: role="alert", aria-live="assertive"
- Enter key: submit form
- Tab order: email -> password -> eye toggle -> submit -> forgot password

---

## SCREEN 9: ANALYTICS DASHBOARD (Admin)

**ID:** B6
**Priority:** P1
**Can cho:** Stage 5
**Route:** `/admin/analytics`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `GET /api/analytics/overview` | GET | @Admin | Dashboard KPI summary (visitors, conversion, inquiries) |
| `GET /api/analytics/traffic` | GET | @Admin | Traffic data over time for line chart |
| `GET /api/analytics/top-pages` | GET | @Admin | Top pages ranked by view count (table) |
| `GET /api/analytics/devices` | GET | @Admin | Device type breakdown (donut chart) |
| `GET /api/analytics/sources` | GET | @Admin | Traffic sources breakdown (bar chart) |

**All endpoints accept query param:** `period?: '7d' | '30d' | '90d'` (default '30d')

**Key response shapes:**
- Overview: `{ total_visitors, total_visitors_change, avg_session_duration, conversion_rate, total_inquiries, inquiries_change, total_projects, total_products, period }`
- Traffic: `{ labels: string[], page_views: number[], visitors: number[], previous_period?: {...} }`
- Top pages: `Array<{ path, title, views, unique_visitors, avg_time_on_page }>`
- Devices: `{ desktop: { count, percentage }, mobile: { count, percentage }, tablet: { count, percentage } }`
- Sources: `Array<{ source, visits, percentage }>`

### State Machine

```
INITIAL ──(route enter)──> LOADING
LOADING ──(all APIs success)──> LOADED
LOADING ──(any API error)──> PARTIAL_ERROR (show loaded charts, error on failed)
LOADED ──(change date range)──> DATE_CHANGING
DATE_CHANGING ──(all APIs success)──> LOADED
DATE_CHANGING ──(error)──> PARTIAL_ERROR
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING` | `Skeleton` cards for each chart area, pulsing animation | `Skeleton`, `AdminSidebar`, `DateRangePicker` |
| `LOADED` | All charts rendered with data | `AdminSidebar`, `DateRangePicker`, `Card`, `DataTable` |
| `NO_DATA` | Each card shows: icon `analytics` 48px, "Chua co du lieu", subtitle | `Card` |
| `ERROR` | Per-card error: "Khong the tai du lieu thong ke" + retry `Button` | `Button` |
| `DATE_CHANGING` | Charts `opacity-50 transition-opacity duration-300`, then fade back to full | -- |
| `PARTIAL_ERROR` | Some charts loaded, failed charts show error with retry | `Card`, `Button` |

### SEO Metadata

```typescript
{
  title: 'Thong Ke | VietNet Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Chart cards | Staggered fade in on load | `delay-[calc(index*100ms)]` `opacity-0 translate-y-4` -> visible `duration-500` |
| Line chart | Draw-in from left (SVG path animation) | `stroke-dasharray` + `stroke-dashoffset` animation 1.5s ease-out |
| Donut chart | Stroke-dasharray animation from 0 to value | `transition: stroke-dashoffset 1s ease-out` per segment |
| Bar chart | Width animation from 0 to value | `transition-[width] duration-700 ease-out` staggered per bar |
| Date range change | All charts: fade out/in | `opacity-0 transition-opacity duration-300` -> `opacity-100` |
| Data point hover | Tooltip appear | `opacity-0 scale-95` -> `opacity-100 scale-100 transition-all duration-150` |
| KPI numbers | Count-up animation | `requestAnimationFrame` count-up 800ms |
| Table rows | Staggered fade in | `delay-[calc(index*50ms)]` `opacity-0` -> `opacity-100 duration-300` |

### Muc dich

Dashboard thong ke — page views, devices, traffic sources, top pages. Giup admin hieu hieu qua website.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Layout: flex min-h-screen
Sidebar: Component AdminSidebar (w-64 fixed)
Main content: ml-64 flex-1 p-6
Chart card: bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-sm)]
Grid row 2: grid grid-cols-2 gap-6
Table: w-full (DataTable component)
```

**Admin Sidebar (chung cho tat ca trang admin):**
- Component: `AdminSidebar` — `w-64 fixed left-0 h-screen bg-surface-container-low border-r border-outline-variant/10`

**Header (trong main content area):**
- `flex items-center justify-between mb-6`
- Title: `font-headline text-[var(--text-headline-md-size)] font-bold`
- Date range picker: Component `DateRangePicker`
  - `bg-surface-container-lowest border border-outline-variant/10 rounded-lg h-10 px-3 flex items-center gap-2`
  - Icon: calendar_today (left), expand_more (right)
  - Options: "7 ngay qua", "30 ngay qua", "90 ngay qua"

**Row 1 (margin-top spacing-6):**
- **Line Chart — Page Views Over Time:**
  - Component: `Card` — `bg-surface-container-lowest rounded-xl p-6`
  - Height: `h-[400px]`
  - Chart title: `font-body text-[var(--text-title-lg-size)] font-semibold mb-4`
  - X-axis: `text-[var(--text-label-md-size)] text-on-background/40`
  - Y-axis: `text-[var(--text-label-md-size)] text-on-background/40`
  - Line: `stroke-primary-container stroke-2`
  - Fill area: `fill-primary-container/10`
  - Grid lines: `stroke-on-background/5`
  - Data points: `r-3 fill-primary-container stroke-white stroke-2`
  - Tooltip: `bg-surface-container-highest rounded-lg p-3 shadow-[var(--shadow-lg)]`

**Row 2 (margin-top spacing-6, `grid grid-cols-2 gap-6`):**

*Left — Donut Chart (Device Breakdown):*
- Component: `Card` — `bg-surface-container-lowest rounded-xl p-6`
- Chart title: `font-body text-[var(--text-title-lg-size)] font-semibold`
- Donut segments:
  - Mobile: `stroke-primary-container`
  - Desktop: `stroke-primary`
  - Tablet: `stroke-on-background/30`
- Legend: `flex gap-6 mt-4`
  - `w-3 h-3 rounded-full` + `text-[var(--text-label-md-size)]` + `text-[var(--text-body-lg-size)] font-bold`
- Center text: `font-headline text-[var(--text-headline-md-size)]`

*Right — Bar Chart (Traffic Sources):*
- Component: `Card` — `bg-surface-container-lowest rounded-xl p-6`
- Horizontal bars:
  - Bar: `bg-primary-container rounded-r-sm h-8`
  - Label: `text-[var(--text-body-lg-size)] font-body`
  - Value: `text-[var(--text-label-md-size)] text-on-background/60`
  - Gap: `space-y-3`
  - Background grid: `bg-on-background/5`

**Row 3 (margin-top spacing-6):**
- **Top Pages Table:**
  - Component: `Card` + `DataTable`
  - `bg-surface-container-lowest rounded-xl p-6`
  - Header row: `text-[var(--text-label-md-size)] font-label uppercase tracking-[0.2em] text-on-background/40`
  - Columns: # (rank), Trang (URL), Luot Xem, Thoi Gian TB, Ty Le Thoat
  - Data rows: `text-[var(--text-body-lg-size)]`
  - Alternating: `odd:bg-surface-container-low`
  - URL column: `text-primary truncate max-w-[300px]`
  - Max 10 rows

### Tablet Layout (768px)

- Sidebar: `w-16` icon-only hoac hamburger menu
- Main content: `ml-16`
- Row 2: `grid-cols-1`
- Table: `overflow-x-auto`

### Mobile Layout (375px)

- Sidebar: `hidden` hamburger menu icon goc tren trai
- Main content: `ml-0 p-4`
- Tat ca charts `flex flex-col gap-4`, full-width
- Table: `overflow-x-auto` horizontal scroll, `sticky left-0 bg-surface-container-lowest z-10` first column
- Date picker: `w-full`

### States

| State | Mo ta |
|---|---|
| Loading | Skeleton cards cho moi chart area, pulsing animation |
| No Data | Moi card hien: icon analytics (48px, on-background 20%), "Chua co du lieu" (body-lg), subtitle "Du lieu se hien thi khi website co luot truy cap" |
| Error | "Khong the tai du lieu thong ke" + retry button trong card |
| Date Change | Charts fade out/in (opacity transition 300ms) khi thay doi date range |

### Accessibility

- Charts: aria-label mo ta du lieu (VD: "Bieu do luot xem trang trong 30 ngay qua")
- Table: proper thead/tbody, scope="col" cho headers
- Date picker: aria-label="Chon khoang thoi gian", aria-expanded

---

## SCREEN 10: USER MANAGEMENT (Admin)

**ID:** B7
**Priority:** P1
**Can cho:** Stage 2
**Route:** `/admin/users`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `GET /api/users` | GET | @Admin | List admin/editor users with pagination |
| `POST /api/users` | POST | @Admin | Create new admin/editor user |
| `PUT /api/users/:id` | PUT | @Admin | Update user details (name, email, role) |
| `DELETE /api/users/:id` | DELETE | @Admin | Soft delete user (cannot delete self) |
| `PUT /api/users/:id/password` | PUT | @Admin | Change user password |

**GET /api/users query params:** `{ page?, limit?, role?: 'admin' | 'editor' }`

**GET response:** `{ success: true, data: Array<{ id, name, email, role, avatar_url, last_login_at, created_at }>, meta: { page, limit, total, totalPages } }`

**POST /api/users request:** `{ name, email, password, role: 'admin' | 'editor' }`
**POST response 201:** `{ success: true, data: { id, name, email, role, created_at } }`
**POST response 409:** `{ success: false, message: "Email already exists" }`

**PUT /api/users/:id request:** `{ name?, email?, role?, avatar_url? }`

**DELETE /api/users/:id response 400:** `{ success: false, message: "Cannot delete your own account" }`

### State Machine

```
INITIAL ──(route enter)──> LOADING
LOADING ──(API success)──> TABLE_LOADED
LOADING ──(API success, empty)──> TABLE_EMPTY
LOADING ──(API error)──> ERROR

TABLE_LOADED ──(click "Them Admin")──> ADD_MODAL_OPEN
TABLE_LOADED ──(click edit icon)──> EDIT_MODAL_OPEN
TABLE_LOADED ──(click delete icon)──> DELETE_CONFIRM_OPEN

ADD_MODAL_OPEN ──(submit success)──> TABLE_LOADED (refetch, toast success)
ADD_MODAL_OPEN ──(submit 409)──> ADD_MODAL_ERROR ("Email already exists")
ADD_MODAL_OPEN ──(cancel/close)──> TABLE_LOADED

EDIT_MODAL_OPEN ──(submit success)──> TABLE_LOADED (refetch, toast success)
EDIT_MODAL_OPEN ──(cancel/close)──> TABLE_LOADED

DELETE_CONFIRM_OPEN ──(confirm delete success)──> TABLE_LOADED (row fade out, toast)
DELETE_CONFIRM_OPEN ──(confirm delete 400)──> DELETE_ERROR ("Cannot delete own account")
DELETE_CONFIRM_OPEN ──(cancel)──> TABLE_LOADED
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING` | 5 `Skeleton` rows in table | `AdminSidebar`, `Skeleton`, `DataTable` |
| `TABLE_LOADED` | Full user table with hover actions | `AdminSidebar`, `DataTable`, `Badge`, `IconButton`, `Button` |
| `TABLE_EMPTY` | Centered: icon `group` 48px, "Chua co tai khoan nao", button "Them Admin" | `Button` |
| `ADD_MODAL_OPEN` | `Modal` with form: name, email, password (required), role dropdown | `Modal`, `Input`, `Select`, `Button` |
| `EDIT_MODAL_OPEN` | `Modal` with form: name, email, role, optional new password | `Modal`, `Input`, `Select`, `Button` |
| `DELETE_CONFIRM_OPEN` | `Modal` alert: warning icon, confirm text, "Huy"/"Xoa" buttons | `Modal` (alertdialog) |
| `SAVING` | Modal button: spinner + "Dang luu..." | `Button` loading |
| `SAVE_SUCCESS` | Modal closes, `Toast` success "Da luu tai khoan" 3s | `Toast` |
| `DELETE_SUCCESS` | Row fade-out `animate-[fadeOut_0.3s]`, `Toast` "Da xoa tai khoan" | `Toast` |
| `SAVE_ERROR` | Error message inside modal below form fields | -- |

### SEO Metadata

```typescript
{
  title: 'Quan Ly Tai Khoan | VietNet Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Table rows | Staggered fade in | `delay-[calc(index*50ms)]` `opacity-0` -> `opacity-100 duration-300` |
| Row hover actions | Fade in | `opacity-0 group-hover:opacity-100 transition-opacity duration-200` |
| Modal open | Overlay fade + card scale up | Overlay: `animate-[fadeIn_0.2s]` Card: `animate-[scaleIn_0.3s_ease-out]` |
| Modal close | Reverse | `animate-[fadeOut_0.2s]` + `animate-[scaleOut_0.2s]` |
| Delete row | Fade out + collapse height | `animate-[fadeOut_0.3s]` then `transition-[max-height] duration-300` |
| Toast | Slide in from right | `animate-[slideInRight_0.3s_ease-out]` auto-dismiss `animate-[slideOutRight_0.3s] delay-3000` |
| FAB (mobile) | Scale in on load | `animate-[scaleIn_0.3s_ease-out_0.5s_both]` |
| Mobile modal | Slide up from bottom | `animate-[slideUp_0.3s_ease-out]` |

### Muc dich

Quan ly tai khoan admin/editor — them, sua, xoa tai khoan nguoi dung he thong.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Layout: flex min-h-screen
Main content: ml-64 flex-1 p-6
Header: flex items-center justify-between mb-6
Table card: bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-sm)]
Modal overlay: fixed inset-0 bg-on-background/60 backdrop-blur-[16px] z-[var(--z-modal-backdrop)]
Modal card: bg-surface-container-lowest rounded-xl max-w-[480px] mx-auto p-8 shadow-[var(--shadow-xl)]
```

**Admin Sidebar:** Component `AdminSidebar` (chung nhu Screen 9)

**Header:**
- `flex items-center justify-between mb-6`
- Title: `font-headline text-[var(--text-headline-md-size)] font-bold`
- "Them Admin" button: Component `Button` primary — `bg-primary-container text-white rounded-xl h-11 px-6 inline-flex items-center gap-2`
  - Icon: person_add

**User Table (margin-top spacing-6):**
- Component: `DataTable` inside `Card`
- `bg-surface-container-lowest rounded-xl p-6`
- Header: `text-[var(--text-label-md-size)] font-label uppercase tracking-[0.2em] text-on-background/40`
- Columns:
  1. Avatar: `w-10 h-10 rounded-full object-cover bg-surface-container-low`
  2. Ho Ten: `text-[var(--text-body-lg-size)] font-semibold`
  3. Email: `text-[var(--text-body-lg-size)] text-on-background/60`
  4. Vai Tro: Component `Badge`
     - Admin: `bg-primary-container text-white rounded-md`
     - Editor: `bg-surface-container-low text-on-background rounded-md`
  5. Dang Nhap Cuoi: `text-[var(--text-body-lg-size)] text-on-background/40`
  6. Actions: `flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`
     - Edit: `IconButton` icon `edit` 20px
     - Delete: `IconButton` icon `delete` 20px `text-error`
- Row: `group py-4 odd:bg-surface-container-low rounded-md px-3`

**Edit Modal:** Component `Modal`
- Overlay: `fixed inset-0 bg-on-background/60 backdrop-blur-[16px] z-[var(--z-modal-backdrop)]`
- Card: `bg-surface-container-lowest rounded-xl max-w-[480px] mx-auto p-8 shadow-[var(--shadow-xl)]`
- Title: `font-headline text-[var(--text-headline-md-size)] font-bold mb-6`
- Fields: `flex flex-col gap-4` — Components `Input` (name, email), `Select` (role), `Input` password (optional)
- Buttons: `flex justify-end gap-3 mt-6`
  - "Huy" — `Button` secondary
  - "Luu" — `Button` primary
- Close: `IconButton` X `absolute top-4 right-4`

**Delete Confirmation Modal:** Component `Modal` (alertdialog)
- Card: `max-w-[400px]`
- Icon: `warning` 48px `text-error` centered
- Title: `font-body text-[var(--text-title-lg-size)] font-semibold text-center mt-4`
- Body: `text-[var(--text-body-lg-size)] text-on-background/60 text-center mt-2`
- Buttons: `flex justify-center gap-3 mt-6`
  - "Huy" — `Button` secondary
  - "Xoa" — `bg-error text-white rounded-xl`

**Add User Modal:** Giong Edit Modal nhung title "Them Tai Khoan Moi", password required, button "Them"

### Tablet Layout (768px)

- Table: giu nguyen nhung cot Last Login an
- Modals: `max-w-[90vw]`

### Mobile Layout (375px)

- **Card List thay vi table:**
  - `flex flex-col gap-3`
  - Moi user = 1 card: `bg-surface-container-lowest rounded-xl p-4`
  - Row 1: `flex items-center gap-3` — Avatar (48px) + Name `text-[var(--text-title-lg-size)]` + Badge
  - Row 2: Email `text-[var(--text-body-lg-size)] text-on-background/60`
  - Row 3: Last login `text-[var(--text-label-md-size)] text-on-background/40`
  - Actions: `absolute top-4 right-4 flex gap-2`
- Modals: `w-full mx-4 fixed bottom-0 inset-x-0 rounded-t-xl animate-[slideUp_0.3s]`
- "Them Admin": Component `FAB` — `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-container text-white shadow-xl z-[var(--z-fixed)]` icon person_add

### States

| State | Mo ta |
|---|---|
| Loading | Table: 5 skeleton rows |
| Empty | Centered: icon group (48px, on-background 20%), "Chua co tai khoan nao", button "Them Admin" |
| Saving (modal) | "Luu"/"Them" button: spinner, disabled, text "Dang luu..." |
| Delete Confirming | "Xoa" button: spinner, disabled |
| Save Success | Modal dong, toast success "Da luu tai khoan" (top-right, 3s auto dismiss) |
| Delete Success | Row fade out animation (300ms), toast "Da xoa tai khoan" |
| Save Error | Error message trong modal, duoi form fields |

### Accessibility

- Table: proper table semantics, scope="col" headers
- Modals: role="dialog", aria-modal="true", focus trap, Escape de dong
- Delete modal: role="alertdialog"
- Action buttons: aria-label "Chinh sua tai khoan [name]", "Xoa tai khoan [name]"
- FAB (mobile): aria-label "Them tai khoan moi"

---

## SCREEN 11: SETTINGS PAGE (Admin)

**ID:** B8
**Priority:** P1
**Can cho:** Stage 5
**Route:** `/admin/settings`

### Data Requirements

| API Endpoint | Method | Guard | Purpose |
|---|---|---|---|
| `GET /api/settings` | GET | @Admin | Load company info (name, address, phone, email, social_links, showroom_hours) |
| `PUT /api/settings` | PUT | @Admin | Update company info (partial update) |
| `GET /api/settings/seo` | GET | @Admin | Load SEO defaults (site_title, meta_description, og_image, GA ID, canonical, robots) |
| `PUT /api/settings/seo` | PUT | @Admin | Update SEO defaults |
| `GET /api/settings/email` | GET | @Admin | Load email templates (consultation confirmation, admin notification, password reset) |
| `PUT /api/settings/email` | PUT | @Admin | Update email templates |

**GET /api/settings response:**
```typescript
{
  company_name: string; address: string; phone: string; email: string;
  social_links: { zalo, facebook, instagram, youtube, messenger };
  showroom_hours: { weekday, saturday, sunday };
  notification_sound: boolean;
  admin_ip_whitelist: string[];
}
```

**GET /api/settings/seo response:**
```typescript
{
  site_title: string; default_meta_description: string;
  default_og_image_url: string | null;
  google_analytics_id: string | null;
  canonical_base_url: string; robots_txt_content: string;
}
```

**GET /api/settings/email response:**
```typescript
{
  consultation_confirmation: { subject: string; body_template: string; };
  consultation_admin_notification: { subject: string; body_template: string; };
  password_reset: { subject: string; body_template: string; };
}
```

### State Machine

```
INITIAL ──(route enter)──> LOADING_TAB1
LOADING_TAB1 ──(GET /api/settings success)──> TAB1_LOADED
LOADING_TAB1 ──(error)──> TAB1_ERROR

TAB1_LOADED ──(user edits field)──> TAB1_CHANGED
TAB1_CHANGED ──(submit)──> TAB1_SAVING
TAB1_SAVING ──(PUT success)──> TAB1_LOADED (toast success, button disabled again)
TAB1_SAVING ──(error)──> TAB1_SAVE_ERROR
TAB1_CHANGED ──(click other tab)──> CONFIRM_UNSAVED_DIALOG

-- Same pattern for TAB2 (SEO) and TAB3 (Email) --

TAB1_LOADED ──(click Tab 2)──> LOADING_TAB2
TAB1_LOADED ──(click Tab 3)──> LOADING_TAB3
TAB1_CHANGED ──(click Tab 2)──> CONFIRM_UNSAVED ──(discard)──> LOADING_TAB2
TAB1_CHANGED ──(click Tab 2)──> CONFIRM_UNSAVED ──(cancel)──> TAB1_CHANGED

LOADING_TAB2 ──(GET /api/settings/seo success)──> TAB2_LOADED
LOADING_TAB3 ──(GET /api/settings/email success)──> TAB3_LOADED
```

| State | UI Behavior | Components Used |
|---|---|---|
| `LOADING_TAB*` | `Skeleton` for 3-4 form fields | `AdminSidebar`, `Skeleton`, `Card` |
| `TAB*_LOADED` | Form fields populated, save button disabled | `Card`, `Input`, `Textarea`, `Button`, `RichTextEditor` |
| `TAB*_CHANGED` | Save button enabled. beforeunload warning. | `Button` (enabled) |
| `TAB*_SAVING` | Save button: spinner + "Dang luu...", disabled | `Button` loading |
| `TAB*_SAVE_SUCCESS` | `Toast` success "Da luu cai dat" 3s. Button back to disabled. | `Toast` |
| `TAB*_SAVE_ERROR` | `Toast` error "Luu that bai, vui long thu lai" | `Toast` |
| `CONFIRM_UNSAVED` | Browser confirm dialog: "Ban co thay doi chua luu. Roi khoi trang?" | -- |
| `OG_UPLOADING` | Progress bar on upload area | -- |
| `OG_UPLOAD_ERROR` | Error text: "Khong the tai hinh len. Dinh dang: JPG, PNG. Toi da 2MB" | -- |
| `TAB_SWITCHING` | Content fade `transition-opacity duration-200` | -- |

### SEO Metadata

```typescript
{
  title: 'Cai Dat | VietNet Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}
```

### Animations

| Element | Animation | Tailwind / CSS |
|---|---|---|
| Tab switch content | Crossfade | `opacity-0` -> `opacity-100 transition-opacity duration-200` |
| Tab indicator | Slide underline or background shift | `transition-all duration-200` |
| Form load | Staggered field fade in | `delay-[calc(index*80ms)]` `opacity-0 translate-y-2` -> visible `duration-400` |
| Save button enable | Pulse once to draw attention | `animate-[pulse_0.5s_ease-out]` when transitioning from disabled to enabled |
| Toast | Slide in from right | `animate-[slideInRight_0.3s_ease-out]` |
| OG image preview | Fade in after upload | `animate-[fadeIn_0.3s_ease-out]` |
| Upload progress | Width animation | `transition-[width] duration-300 ease-out` |
| Mobile save button | Slide up sticky | `animate-[slideUp_0.3s_ease-out]` when changes detected |

### Muc dich

Cai dat website — thong tin cong ty, SEO, email templates. Giup admin tu quan ly noi dung tinh ma khong can dev.

### Desktop Layout (1280px+)

**Key Tailwind Classes:**
```
Layout: flex min-h-screen
Main content: ml-64 flex-1 p-6
Tab bar: flex gap-1 mb-8
Active tab: bg-primary-container text-white rounded-lg px-3 py-2
Inactive tab: text-on-background/60 hover:bg-surface-container-low rounded-lg px-3 py-2
Form card: bg-surface-container-lowest rounded-xl p-8 shadow-[var(--shadow-sm)]
```

**Admin Sidebar:** Component `AdminSidebar` (chung nhu Screen 9)

**Header:**
- Title: `font-headline text-[var(--text-headline-md-size)] font-bold`

**Tab Navigation (margin-top spacing-6, margin-bottom spacing-8):**
- `flex gap-1 mt-6 mb-8`
- Moi tab: `px-3 py-2 rounded-lg text-[var(--text-label-md-size)] font-label uppercase tracking-[0.2em] cursor-pointer transition-colors duration-200`
- Active tab: `bg-primary-container text-white`
- Inactive tab: `text-on-background/60 hover:bg-surface-container-low`
- Tabs: "Thong Tin Chung" | "SEO" | "Email"

**Tab 1 — Thong Tin Chung:**
- Component: `Card` — `bg-surface-container-lowest rounded-xl p-8`
- Form fields: `flex flex-col gap-5`
  1. Ten Cong Ty: Component `Input` icon business
  2. Dia Chi: Component `Input` icon location_on
  3. So Dien Thoai: Component `Input` icon phone, type tel
  4. Email: Component `Input` icon email
  5. **Social Links Section (mt-4):**
     - Label: `font-body text-[var(--text-title-lg-size)] font-semibold mb-3`
     - Zalo URL: Component `Input` icon (custom Zalo SVG)
     - Facebook URL: Component `Input` icon (custom Facebook SVG)
  6. **Gio Lam Viec Section:**
     - Label: `font-body text-[var(--text-title-lg-size)] font-semibold mb-3`
     - Text input: Component `Input` placeholder "T2-T7: 8:00 - 17:30"
- Save button: `flex justify-end mt-6`
  - Component `Button` primary — `bg-primary-container text-white rounded-xl h-12 px-6 inline-flex items-center gap-2`
  - Icon: save
  - Disabled when no changes: `opacity-50 cursor-not-allowed`

**Tab 2 — SEO:**
- Component: `Card` — `bg-surface-container-lowest rounded-xl p-8`
- Form fields: `flex flex-col gap-5`
  1. **Meta Description Mac Dinh:**
     - Component: `Textarea` `h-[100px] resize-y`
     - Character count: `text-[var(--text-label-md-size)] text-on-background/40 text-right mt-1` — "120/160 ky tu"
     - Warning khi > 160: `text-warning`
  2. **Hinh OG Mac Dinh:**
     - Upload area: `border-2 border-dashed border-outline-variant/20 rounded-xl h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors`
     - Icon: `cloud_upload text-[48px] text-on-background/20`
     - Text: `text-[var(--text-body-lg-size)] text-on-background/40`
     - After upload: `relative` preview image `w-full h-full object-cover rounded-xl`, X button `absolute top-2 right-2`
     - Size note: `text-[var(--text-label-md-size)] text-on-background/40 mt-2` "1200 x 630px"
  3. **Google Analytics ID:**
     - Component: `Input` placeholder "G-XXXXXXXXXX"
     - Helper: `text-[var(--text-label-md-size)] text-on-background/40 mt-1`
- Save button: same style as Tab 1

**Tab 3 — Email:**
- Component: `Card` — `bg-surface-container-lowest rounded-xl p-8`
- Form fields: `flex flex-col gap-5`
  1. **Email Tu Dong Tra Loi:**
     - Label + description: `text-[var(--text-body-lg-size)] text-on-background/60 mb-2`
     - Component: `RichTextEditor`
       - Toolbar: `bg-surface-container-low rounded-t-lg p-2 border-b border-outline-variant/10`
       - Tools: Bold, Italic, Link, Bullet List, Numbered List
       - Editor: `bg-surface-container-lowest min-h-[200px] p-4 rounded-b-lg text-[var(--text-body-lg-size)] font-body`
  2. **Email Nhan Thong Bao:**
     - Component: `Input` placeholder "admin@vietnet.vn"
     - Helper: `text-[var(--text-label-md-size)] text-on-background/40 mt-1` "Cho phep nhieu email, phan cach bang dau phay"
- Save button: same style as Tab 1

### Tablet Layout (768px)

- Tabs: van horizontal, font nho hon neu can
- Form cards: `p-6`
- OG image upload area: `h-[160px]`

### Mobile Layout (375px)

- **Tabs:** `flex overflow-x-auto snap-x gap-2 scrollbar-hide`
  - Moi pill: `bg-surface-container-low rounded-full px-2.5 py-1.5 whitespace-nowrap snap-start flex-shrink-0`
  - Active: `bg-primary-container text-white`
- Form fields: `w-full flex flex-col gap-4`
- Save button: `fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-sm z-[var(--z-sticky)] border-t border-outline-variant/10` button `w-full`
- Rich text editor toolbar: `overflow-x-auto scrollbar-hide`
- OG upload: `h-[120px]`

### States

| State | Mo ta |
|---|---|
| Loading | Skeleton cho form fields (3-4 dong) |
| Unchanged | Save button disabled (opacity 50%), chi enable khi co thay doi |
| Changed (unsaved) | Save button enabled. Neu navigate away: confirm dialog "Ban co thay doi chua luu. Roi khoi trang?" |
| Saving | Button: spinner + "Dang luu...", disabled |
| Save Success | Toast: "Da luu cai dat" (top-right, success, 3s auto dismiss). Button quay lai disabled state |
| Save Error | Toast: "Luu that bai, vui long thu lai" (error) |
| OG Upload Progress | Progress bar tren upload area, percentage text |
| OG Upload Error | Error text duoi upload area, "Khong the tai hinh len. Dinh dang ho tro: JPG, PNG. Toi da 2MB" |
| Tab Switch | Content fade transition 200ms. Neu co unsaved changes: confirm dialog truoc khi chuyen tab |

### Accessibility

- Tabs: role="tablist", moi tab role="tab", aria-selected, aria-controls
- Tab panels: role="tabpanel", aria-labelledby
- Form fields: label/input lien ket
- Rich text editor: aria-label="Noi dung email tu dong tra loi"
- Upload area: role="button", aria-label="Tai hinh OG len"
- Unsaved changes: beforeunload event
- Keyboard: Tab/Shift+Tab navigate giua fields, Enter submit form

---

## DESIGN COMPLETION PRIORITY

| Priority | Man hinh | Can cho Stage | Do phuc tap |
|---|---|---|---|
| P0 | Admin Login (B1.1) | Stage 2 | Thap |
| P0 | Contact (A7) | Stage 2 | Trung binh |
| P0 | Project Detail (A4) | Stage 3 | Cao |
| P0 | Product Detail (A5) | Stage 3 | Cao |
| P1 | About (A6) | Stage 3 | Trung binh |
| P1 | Search Results (A8) | Stage 4 | Trung binh |
| P1 | 404 Page (A9.1) | Stage 3 | Thap |
| P1 | Analytics Dashboard (B6) | Stage 5 | Cao |
| P1 | User Management (B7) | Stage 2 | Trung binh |
| P1 | Settings (B8) | Stage 5 | Cao |
| P2 | 500 Error Page (A9.2) | Stage 6 | Thap |

### De xuat thu tu thiet ke

1. **Dot 1 (P0):** Login -> Contact -> Project Detail -> Product Detail
2. **Dot 2 (P1 - Stage 2-3):** User Management -> About -> 404
3. **Dot 3 (P1 - Stage 4-5):** Search Results -> Analytics Dashboard -> Settings
4. **Dot 4 (P2):** 500 Error Page

---

## LUU Y CHO AGENT_DESIGNER

1. **Tat ca man hinh phai tuan thu "The Curated Atelier" design system** — doc ky DESIGN_SYSTEM.md truoc khi bat dau
2. **Khong dung 1px borders** — chi dung tonal shifts va spacing de phan tach
3. **Khong dung pure black #000000** — luon dung on-background #1B1C1B
4. **Khong dung sharp corners** — moi element deu can radius toi thieu sm
5. **Ambient shadows** — blur >= 24px, brown-tinted, opacity 4-8%
6. **Photography la hero** — de khong gian tho cho hinh anh, khong chen qua nhieu UI elements
7. **Responsive la bat buoc** — moi man hinh phai co day du spec cho 375px, 768px, 1280px
8. **States la bat buoc** — moi man hinh phai co loading, error, empty states
9. **Accessibility la bat buoc** — aria labels, keyboard navigation, focus management
10. **Reuse components** — su dung lai cac pattern da co (cards, buttons, inputs, modals) de dam bao nhat quan
11. **Design tokens** — moi CSS value phai map ve token tu `/src/assets/tokens.css` — khong hardcode
12. **API integration** — moi screen spec phai reference dung API endpoint tu SA_API_SPEC.md
13. **State machines** — moi screen phai co full state machine diagram bao gom tat ca user flows
14. **Animations** — su dung subtle, purposeful animations — khong animation chi de trang tri
