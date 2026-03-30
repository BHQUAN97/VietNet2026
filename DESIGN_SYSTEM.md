# DESIGN SYSTEM -- "The Curated Atelier" V3.0

> VietNet Interior | Premium Editorial Aesthetic
> Reference: nlhome.vn

---

## 1. CREATIVE NORTH STAR

"The Curated Atelier" is VietNet Interior's creative identity. Every digital surface must feel like a high-end editorial spread -- intentional, sophisticated, and deeply tactile.

The system is built on four principles:

- **Intentional Asymmetry.** Break the corporate grid. Use architectural layouts where elements are offset, staggered, and deliberately unbalanced to create visual intrigue. In the prototypes, project cards in desktop grids use `md:mt-12` offsets to stagger columns. Mobile product grids use `-mt-8` and `mt-8` to create a masonry-like cadence.

- **Editorial Feel.** Pair an authoritative serif (Noto Serif) with a precise sans-serif (Manrope) to create a dialogue between tradition and innovation. Headlines command attention; body text recedes. Labels are always uppercase with exaggerated tracking, functioning like captions in a design magazine.

- **Breathing Room.** Generous whitespace is non-negotiable. Sections use `py-32` on desktop, `py-16` to `py-20` on mobile. When in doubt, add more space. High-end design thrives on the luxury of emptiness.

- **Photography as Hero.** The system fails without professional-grade imagery. Images are the primary structural element -- they fill containers edge to edge, bleed through glassmorphic layers, and anchor every layout. UI components exist to frame and support the photography, never to compete with it.

---

## 2. COLOR SYSTEM

### Core Palette

All colors follow Material Design 3 naming conventions and are defined as Tailwind extended colors in the shared config.

| Token | Hex | Usage |
|:---|:---|:---|
| `primary` | `#553722` | Authoritative moments: high-level headers, brand signals, text on light surfaces |
| `primary-container` | `#6F4E37` | "VietNet Brown" -- hero CTAs, primary interaction surfaces, active nav items, badges |
| `on-primary` | `#FFFFFF` | Text/icons on primary surfaces |
| `on-primary-container` | `#EEC1A4` | Text/icons on primary-container surfaces |
| `secondary` | `#6D5B4F` | Supporting text, material category labels |
| `secondary-container` | `#F7DECF` | Secondary interaction surfaces |
| `on-secondary-container` | `#736155` | Text on secondary-container |
| `tertiary` | `#24434B` | Accent for admin/utility elements |
| `tertiary-container` | `#3C5A63` | Admin accent surfaces, promotional blocks, report generation cards |
| `on-tertiary-container` | `#B0D0DB` | Text/icons on tertiary-container |
| `surface` | `#FCF9F7` | Primary page background -- warm "gallery white" |
| `surface-bright` | `#FCF9F7` | Alias for surface; used in hero overlays for text |
| `surface-dim` | `#DCD9D8` | Dimmed surface for pressed/hover states |
| `surface-container-lowest` | `#FFFFFF` | Highest prominence cards, table backgrounds, input fills |
| `surface-container-low` | `#F6F3F1` | Secondary sections, large content blocks, table header rows |
| `surface-container` | `#F0EDEB` | Mid-level container backgrounds, product image placeholder bg |
| `surface-container-high` | `#EAE8E6` | Inactive filter chips, contact form section bg |
| `surface-container-highest` | `#E5E2E0` | Maximum depth containers |
| `surface-variant` | `#E5E2E0` | Alternative surface for visual variation |
| `on-surface` | `#1B1C1B` | Primary text color -- warm near-black, never pure `#000000` |
| `on-surface-variant` | `#50453E` | Secondary text, descriptions, metadata |
| `on-background` | `#1B1C1B` | Body text on background surfaces |
| `outline` | `#82746D` | Structural outlines, search input placeholder icons |
| `outline-variant` | `#D4C3BA` | Ghost borders at reduced opacity (10-30%) |
| `surface-tint` | `#79573F` | Hover glow tint for primary buttons |
| `inverse-surface` | `#30302F` | Dark surface for inverted contexts (footer) |
| `inverse-on-surface` | `#F3F0EE` | Text on inverse surfaces |
| `inverse-primary` | `#EABDA0` | Primary color for dark contexts |
| `primary-fixed` | `#FFDCC6` | Fixed primary tone for always-light contexts |
| `primary-fixed-dim` | `#EABDA0` | Dimmed fixed primary |
| `error` | `#BA1A1A` | Error states, negative metrics |
| `error-container` | `#FFDAD6` | Error background surfaces |
| `on-error` | `#FFFFFF` | Text on error surfaces |
| `on-error-container` | `#93000A` | Text on error-container |

**Status colors used in admin tables:**

| Status | Background | Text |
|:---|:---|:---|
| Scheduled / Active | `bg-green-50` | `text-green-700` |
| Pending | `bg-amber-50` | `text-amber-700` |
| Completed / Neutral | `bg-surface-container-high` | `text-on-surface-variant` |
| Negative metric | `bg-error/5` | `text-error` |
| Positive metric | `bg-green-50` | `text-green-600` |

### Rules

**No-Line Rule.** 1px solid borders are prohibited for sectioning content. Boundaries must be defined through background color shifts. A content block using `surface-container-low` sits on a `surface` background; the tonal shift provides a sophisticated edge that a line never could. The only permitted border-like element is a gradient divider: `h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent`.

**Surface Hierarchy.** Treat the UI as stacked sheets of linen paper. Nest surfaces to create depth: place a `surface-container-lowest` card on a `surface-container-low` section on a `surface` page background.

**Glass and Gradient.** Floating elements use glassmorphism. Main CTAs may use a linear gradient from `primary` to `primary-container` for three-dimensional polish.

**Never use pure `#FFFFFF` or `#000000`.** Use `surface-container-lowest` (`#FFFFFF`) only for card fills and input backgrounds where maximum contrast is needed. For text, use `on-surface` (`#1B1C1B`) or `on-background` (`#1B1C1B`).

---

## 3. TYPOGRAPHY

### Font Families

| Family | Role | Weights Used | Google Fonts Import |
|:---|:---|:---|:---|
| **Noto Serif** | Display, Headline | 400, 700 | `Noto+Serif:wght@400;700` |
| **Manrope** | Title, Body, Label | 300, 400, 500, 600, 700, 800 | `Manrope:wght@300;400;500;600;700;800` |
| **Material Symbols Outlined** | Icons | 100-700 variable, FILL 0-1 | `Material+Symbols+Outlined:wght,FILL@100..700,0..1` |

Tailwind font family config:
```
fontFamily: {
  "headline": ["Noto Serif"],
  "body": ["Manrope"],
  "label": ["Manrope"]
}
```

### Scale

| Token | Font Family | Size | Weight | Letter-Spacing | Usage |
|:---|:---|:---|:---|:---|:---|
| `display-lg` | Noto Serif | 3.5rem (56px) | 700 bold | `tracking-tight` | Page hero titles, dashboard headings |
| `display-md` | Noto Serif | 2.5rem-3rem | 700 bold | `tracking-tight` | Major section headers |
| `headline-lg` | Noto Serif | 2rem-2.5rem (text-4xl/5xl) | 700 bold | `tracking-tight` | Section titles on desktop |
| `headline-md` | Noto Serif | 1.75rem (text-2xl/3xl) | 700 bold | default | Section titles, card headings |
| `headline-sm` | Noto Serif | 1.25rem (text-xl) | 700 bold | default | Sub-section titles, admin card headings |
| `title-lg` | Manrope | 1.375rem (text-xl) | 600-700 | default | Card titles, product names (desktop) |
| `title-md` | Manrope | 1rem (text-sm/base) | 600-700 | default | Product names (mobile), table cell text |
| `body-lg` | Manrope | 1.125rem (text-lg) | 400-500 | default | Paragraphs, descriptions |
| `body-md` | Manrope | 1rem (text-base) | 400 | default | Standard body text |
| `body-sm` | Manrope | 0.875rem (text-sm) | 400-500 | default | Secondary descriptions, table data |
| `label-lg` | Manrope | 0.75rem (text-xs) | 700 bold | `tracking-widest` / `tracking-[0.2em]` | Navigation labels, filter labels, section overlines -- always uppercase |
| `label-md` | Manrope | 0.625rem (text-[10px]) | 700 bold | `tracking-widest` | Stat labels, table headers, metadata -- always uppercase |
| `label-sm` | Manrope | 0.6rem (text-[0.6rem/0.65rem]) | 700 bold | `tracking-[0.2em]` | Micro labels, overlines -- always uppercase |

### Identity Gap

The system creates a signature "high-fashion" typographic rhythm through contrasting letter-spacing:

- **Display/Headline tokens:** Tight tracking (`tracking-tight` / `tracking-tighter`) -- creates density and authority.
- **Label tokens:** Wide tracking (`tracking-widest` / `tracking-[0.2em]` / `tracking-[0.3em]`) -- creates airiness and editorial refinement. Labels are always uppercase.

This contrast between compressed headlines and expanded labels is a core brand identifier. It must be maintained consistently.

---

## 4. SPACING AND LAYOUT

### Grid System

- **Max-width:** `max-w-[1920px]` for full-bleed desktop layouts, `max-w-7xl` (80rem) for content-constrained sections, `max-w-lg` (32rem) for mobile single-column content.
- **Desktop grid:** 12-column grid using Tailwind `grid-cols-12` with `col-span-*` for asymmetric column allocation. Common splits: 5/7 (text/images), 4/4/4 (equal cards), 8/4 (table/sidebar).
- **Product grid (desktop):** `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` with `gap-10`.
- **Product grid (mobile):** `grid-cols-2 gap-4`.
- **Asymmetric layouts encouraged:** Stagger grid items with margin offsets (`mt-8`, `-mt-8`, `md:mt-12`, `pt-12`) to break uniform grid appearance.
- **Bento grids:** Used for admin dashboard quick actions and stats. Mix card heights and visual weights across grid cells.

### Breakpoints

| Name | Tailwind Prefix | Minimum Width | Layout Behavior |
|:---|:---|:---|:---|
| Mobile | (default) | 0px | Single column, stacked vertical, bottom nav |
| Tablet | `md:` | 768px | 2-column grids, desktop nav appears, side filters hidden |
| Desktop | `lg:` | 1024px | Multi-column layouts, side filters visible, sidebar nav (admin) |
| Wide | `xl:` | 1280px | 3-column product grids, expanded content areas |
| Ultra-wide | `2xl:` | 1536px | Max-width container constraint applied |

### Spacing Scale

The prototypes use standard Tailwind spacing consistently:

| Token | Value | Common Usage |
|:---|:---|:---|
| `p-4` / `px-4` | 1rem | Mobile content padding, grid gap (mobile) |
| `p-6` / `px-6` | 1.5rem | Card padding, mobile section padding, sidebar padding |
| `p-8` / `px-8` | 2rem | Desktop content padding, section padding |
| `p-10` | 2.5rem | Admin main content area padding |
| `p-12` / `px-12` | 3rem | Testimonial card padding, footer padding |
| `py-12` | 3rem | Mobile section vertical spacing |
| `py-16` | 4rem | Standard section vertical spacing |
| `py-20` | 5rem | Breathing-room sections (testimonials) |
| `py-32` | 8rem | Major section vertical spacing on desktop |
| `gap-4` | 1rem | Tight grid gaps (mobile cards) |
| `gap-6` | 1.5rem | Standard grid gaps |
| `gap-8` | 2rem | Comfortable grid gaps |
| `gap-10` | 2.5rem | Product card grid gaps (desktop) |
| `gap-12` | 3rem | Testimonial grid gaps |
| `gap-16` | 4rem | Large content section gaps |
| `mb-4` to `mb-16` | 1rem-4rem | Vertical rhythm between elements |
| `space-y-2` | 0.5rem | Navigation item spacing |
| `space-y-4` | 1rem | Form field spacing, footer link spacing |
| `space-y-12` | 3rem | Major content block spacing |

### Border Radius Scale

Custom Tailwind border radius config (overrides defaults):

```
borderRadius: {
  "DEFAULT": "0.125rem",  // 2px -- minimum, rarely used
  "lg": "0.25rem",        // 4px -- subtle rounding
  "xl": "0.5rem",         // 8px -- standard card/image rounding
  "full": "0.75rem"       // 12px -- buttons, pills, prominent elements
}
```

Additional rounding used via Tailwind classes:
- `rounded-xl` (0.5rem): Product images, standard cards, input fields, buttons
- `rounded-2xl` (1rem): Promotional blocks, testimonial cards, table containers
- `rounded-full`: Avatar images, circular icon buttons, filter pills, pagination dots
- `rounded-lg`: Sidebar nav items, bottom nav active indicator, glassmorphic info overlays

---

## 5. ELEVATION AND DEPTH

### Layering Principle

Convey importance through light and layering, not structural rigidity. Place a `surface-container-lowest` card on a `surface-container-low` section on a `surface` background. This creates natural "lift" that mimics how light hits different materials in an interior space.

The depth stack, from back to front:
1. `surface` -- page background
2. `surface-container-low` -- section backgrounds
3. `surface-container` -- mid-level containers
4. `surface-container-high` -- elevated sections (contact forms)
5. `surface-container-lowest` -- highest prominence (cards, tables, inputs)

### Ambient Shadows

Shadows must be extra-diffused and brown-tinted. Never use design tool shadow presets or generic grey shadows.

| Usage | Shadow Definition | Notes |
|:---|:---|:---|
| Subtle card lift | `shadow-sm` | Standard Tailwind, used on stat cards and table containers |
| Prominent card | `shadow-lg` | Used on glassmorphic overlays within images |
| Hero CTA | `shadow-xl shadow-primary/20` | Brown-tinted directional shadow |
| Admin action card | `shadow-xl` | Strong elevation for primary action cards |
| Testimonial cards | `shadow-[0_24px_48px_rgba(85,55,34,0.06)]` | Custom ambient shadow -- 48px blur, 6% opacity, brown-tinted |
| Bottom nav | `shadow-[0_-4px_24px_rgba(85,55,34,0.06)]` | Upward ambient shadow for fixed bottom elements |
| Full hero | `shadow-2xl` | Maximum standard shadow for hero imagery |

Rules:
- Blur must be 24px or higher for ambient shadows
- Opacity must be between 4% and 8%
- Shadow color must be brown-tinted (`rgba(85,55,34,...)`) rather than grey
- Never use `shadow-md` or default Tailwind presets in isolation

### Ghost Border

When a border is required for accessibility or structural clarity:

- Use `outline-variant` at 10-30% opacity: `border border-outline-variant/20` or `border-[#6F4E37]/10`
- 100% opaque borders are strictly forbidden
- The gradient divider is preferred over any solid border: `h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent`
- Admin sidebar uses `border-r border-[#6F4E37]/10`
- Table row dividers use `divide-y divide-outline-variant/10`

### Glassmorphism

Semi-transparent surface color combined with backdrop blur. Used for navigation, floating overlays, and mobile menus.

| Element | Background | Blur | Additional |
|:---|:---|:---|:---|
| Top nav bar | `bg-[#FCF9F7]/80` | `backdrop-blur-xl` (24px) | `shadow-sm` |
| Bottom nav bar | `bg-[#FCF9F7]/90` | `backdrop-blur-md` (12px) | Upward shadow |
| Image info overlay | `bg-white/90` | `backdrop-blur-md` | `shadow-lg`, `rounded-lg` |
| Hero label badge | `bg-primary-container/30` | `backdrop-blur-md` | `border border-white/10`, `rounded-full` |
| Cart button on product | `bg-surface-container-lowest/90` | `backdrop-blur` (8px default) | `shadow-lg`, `rounded-full` |
| "New" badge (alt style) | `bg-white/90` | `backdrop-blur` | `rounded-md` |

---

## 6. COMPONENT SPECIFICATIONS

### Navigation

**Desktop Top Nav:**
- Fixed position, full width, `z-50`
- Glassmorphic: `bg-[#FCF9F7]/80 backdrop-blur-xl shadow-sm`
- Content: brand name (Noto Serif, `text-2xl font-bold tracking-tighter text-[#553722]`), horizontal nav links (Noto Serif, `text-sm uppercase tracking-wide`), utility icons (shopping cart, account)
- Active link: `text-[#6F4E37] border-b-2 border-[#6F4E37] pb-1`
- Inactive link: `text-[#553722]/70 hover:text-[#553722] transition-colors`
- Container: `max-w-screen-2xl mx-auto`, `px-8 py-4`
- Nav links hidden on mobile: `hidden md:flex`

**Mobile Top Nav:**
- Fixed position, `z-50`, same glassmorphic treatment
- Simplified: hamburger menu icon + brand name on left, cart + account icons on right
- `px-6 py-4`

**Mobile Bottom Nav:**
- Fixed bottom, full width, `z-50`
- Background: `bg-[#FCF9F7]/90 backdrop-blur-md` or solid `bg-[#FCF9F7]` with `rounded-t-3xl`
- Shadow: `shadow-[0_-4px_24px_rgba(85,55,34,0.06)]`
- 5 items: Home, Projects, Catalog, Consult, Menu
- Each item: vertical stack of Material Symbol icon + label (`text-[10px] font-bold uppercase tracking-widest`)
- Active state: `text-[#6F4E37] bg-[#6F4E37]/5 rounded-xl px-3 py-1`, icon uses `FILL 1` variant
- Inactive state: `text-[#553722]/50`
- Touch feedback: `active:bg-[#6F4E37]/10 transition-transform active:scale-90`
- Safe area padding: `pb-6` or `pb-safe`

**Admin Sidebar:**
- Fixed left, `w-64`, full height
- Background: `bg-[#FCF9F7]`
- Border: `border-r border-[#6F4E37]/10`
- Brand header: Noto Serif, `text-xl font-bold text-[#553722]` with subtitle label
- Nav items: `px-4 py-3`, `text-sm font-semibold`
- Active item: `bg-[#6F4E37] text-white rounded-lg shadow-lg`
- Inactive item: `text-[#553722]/60 hover:bg-[#6F4E37]/5 hover:text-[#553722] hover:translate-x-1 transition-all duration-200`
- Bottom: user avatar (rounded-full, 40x40) + name + role
- Primary action button at bottom: `bg-primary-container text-white rounded-xl font-bold text-xs uppercase tracking-widest`

### Buttons

**Primary:**
- `bg-primary-container text-white px-8 py-4 rounded-xl font-semibold`
- Alternative: `bg-primary text-on-primary` for full-width form submissions
- Hover: `hover:opacity-90 transition-all`
- Active/touch: `active:scale-95 transition-transform` or `active:scale-[0.98]`
- Hero variant adds: `shadow-xl shadow-primary/20`
- Full-width variant: `w-full py-4 font-bold uppercase tracking-widest text-xs`

**Secondary / Ghost:**
- `bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-primary`
- Hover: `hover:bg-primary hover:text-white transition-all`
- Alternative: `border border-outline-variant/30 rounded-lg text-primary hover:bg-surface-container-low`

**Text/Link Button:**
- `text-primary font-bold flex items-center gap-2`
- With arrow: includes `material-symbols-outlined arrow_forward`
- Hover: `group hover:gap-4 transition-all` (arrow moves) or `underline-offset-8 hover:underline`

**Filter Chip:**
- Active: `bg-primary-container text-white rounded-xl px-5 py-2 text-xs font-bold`
- Inactive: `bg-surface-container-high text-on-surface-variant rounded-xl px-5 py-2 text-xs font-medium hover:bg-surface-container-highest`

**Icon Button (Circular):**
- `w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors`
- Cart on product card: `w-10 h-10 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-lg active:scale-90`

### Cards

**General rules:**
- No divider lines. Separate items with whitespace (`spacing-8` / `spacing-10`) or tonal background shifts.
- Images fill container to rounded edge (`rounded-xl`, 0.5rem).
- Hover: `group-hover:scale-105` or `group-hover:scale-110` with `transition-transform duration-700`.

**Product Card (Desktop Catalog):**
- Image: `aspect-[4/5]` ratio, `overflow-hidden rounded-xl bg-surface-container-low`
- Image hover overlay: `bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity`
- Material tag: `text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold`
- Title: `text-xl font-headline font-bold text-primary group-hover:text-primary-container transition-colors`
- Link: `text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-transparent group-hover:border-primary`

**Product Card (Mobile Catalog):**
- Image: `aspect-[3/4]` ratio (taller for mobile), `rounded-xl bg-surface-container-low`
- "New" badge: `bg-primary-container text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest` -- positioned `absolute top-3 left-3`
- Cart button: floating circular button `absolute bottom-3 right-3`
- Title: `font-headline text-sm font-bold text-primary`
- Price: `text-xs font-bold text-on-surface-variant`
- Star rating: Material Symbol `star` with `FILL 1`, `text-primary`

**Project Card (Desktop Featured):**
- Full-bleed image, `h-[500px]` or aspect-ratio based
- Gradient overlay: `bg-gradient-to-t from-primary/90 via-primary/20 to-transparent`
- Overlay opacity transition: `opacity-60 group-hover:opacity-80`
- Text container: absolute positioned at bottom, `p-8`, slides up on hover `translate-y-4 group-hover:translate-y-0`
- Category label: `text-surface-bright/70 font-label text-[10px] tracking-[0.2em] uppercase`
- Title: `text-surface-bright font-headline text-2xl font-bold`
- Description: hidden by default, fades in on hover `text-surface-bright/0 group-hover:text-surface-bright/80 transition-opacity duration-500`

**Project Card (Mobile Featured):**
- `aspect-[4/5]` image ratio
- Info overlay at bottom: glassmorphic `bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg`
- Category label + title inside overlay
- Arrow icon for navigation cue

**Stat Card:**
- `bg-surface-container-lowest p-6 rounded-xl shadow-sm`
- Metric: `text-3xl font-bold text-primary`
- Label: `text-[10px] font-bold uppercase tracking-widest text-outline` or `text-on-surface-variant`
- Change badge: `text-[10px] font-bold px-1.5 py-0.5 rounded` with green/red/neutral bg

**Testimonial Card:**
- `bg-surface-container-lowest p-12 rounded-2xl shadow-[0_24px_48px_rgba(85,55,34,0.06)]`
- Quote icon: `material-symbols-outlined text-primary/20 text-6xl` absolute positioned
- Star rating row using filled star icons
- Quote text: `text-xl leading-relaxed italic text-on-surface-variant`
- Author: avatar circle + name (bold, primary) + role (text-sm, on-surface-variant)

### Tables (Admin)

- Container: `bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden`
- No visible borders between cells
- Header row: `bg-surface-container-low`
- Header text: `text-[10px] font-bold uppercase tracking-widest text-outline`
- Cell padding: `px-6 py-4`
- Row hover: `hover:bg-surface-container-low transition-colors cursor-pointer`
- Row dividers: `divide-y divide-outline-variant/10` (near-invisible)
- Status badges: `inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase`
  - Scheduled: `bg-green-50 text-green-700`
  - Pending: `bg-amber-50 text-amber-700`
  - Completed: `bg-surface-container-high text-on-surface-variant`
- Avatar initials: `w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center`

### Forms

- Input fill: `bg-surface` or `bg-surface-container-lowest` with `border-none rounded-xl p-4`
- Focus: `focus:ring-2 focus:ring-primary-container` or `focus:ring-1 focus:ring-primary/20`
- No outline on focus: `outline-none`
- Transition: `transition-shadow`
- Touch target: minimum 44px height (`py-4` on mobile inputs)
- Search input (admin): `bg-surface-container-lowest rounded-full pl-10 pr-4 py-2 text-sm` with search icon positioned `absolute left-3`

### Project Overlay

In featured project sections, text labels sit inside the image container using a semi-transparent overlay:
- Desktop: `bg-gradient-to-t from-primary/90 via-primary/20 to-transparent` covering the full image
- Mobile: `bg-white/90 backdrop-blur-md` card positioned `absolute bottom-4 left-4 right-4`
- Text inside maintains legibility while keeping focus on the photography
- Subtle overlay on all project images: `bg-primary-container/10` persistent tint

### Floating Action Widgets

Positioned fixed on the right side, above the bottom nav on mobile:
- Container: `fixed right-4 bottom-24 flex flex-col gap-4 z-40`
- Zalo: `w-12 h-12 bg-blue-500 rounded-full shadow-lg text-white`
- Messenger: `w-12 h-12 bg-[#0084FF] rounded-full shadow-lg text-white`
- Phone (largest): `w-14 h-14 bg-primary-container rounded-full shadow-2xl text-white border-4 border-white`
- All use filled icon variant: `font-variation-settings: 'FILL' 1`
- Animation: custom pulse keyframes, 3s infinite, staggered with `animation-delay`:
```css
@keyframes custom-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.vibrate-widget {
  animation: custom-pulse 3s infinite ease-in-out;
}
```
- Mobile only -- hide on desktop viewports

### Footer

- Background: `bg-[#553722] text-[#FCF9F7]`
- Brand name: Noto Serif, `text-2xl font-bold tracking-tighter`
- Description: `text-white/70 text-sm`
- Section headings: `font-bold uppercase tracking-widest text-xs text-white/40`
- Links: `text-white/70 hover:text-white transition-colors`
- Social icons: `w-8 h-8 rounded-full border border-white/20 hover:bg-white/10`
- Bottom bar: `border-t border-white/10`, copyright in `text-[10px] text-[#FCF9F7]/50`
- Mobile: `pb-32` to clear bottom nav

---

## 7. RESPONSIVE PATTERNS

### Mobile (Default, < 768px)

- **Layout:** Single column, vertically stacked. `max-w-lg mx-auto` or `max-w-md mx-auto` for content constraint.
- **Content padding:** `px-4` to `px-6`.
- **Navigation:** Fixed top header (glassmorphic, simplified) + fixed bottom nav (5 items).
- **Product grids:** `grid-cols-2 gap-4`. Images use `aspect-[3/4]` (taller than desktop).
- **Horizontal scroll:** Used for filter chips and material samples. `flex overflow-x-auto gap-3` with hidden scrollbar (`no-scrollbar` class).
- **Drawer navigation:** Use drawer/sheet pattern for expanded menus, not modal overlays.
- **Touch-friendly spacing:** All interactive elements minimum 44px touch target. Buttons use `py-4`, nav items use `py-3`.
- **Hero:** Full-width image, `h-[751px]` or viewport height. Text overlay at bottom with `p-8`.
- **Typography reduction:** Display sizes reduce to `text-3xl` to `text-4xl`. Headlines reduce to `text-2xl`.
- **Body min-height:** `min-height: max(884px, 100dvh)` ensures full coverage.
- **Floating widgets visible:** Zalo, Messenger, Phone buttons in bottom-right corner.

### Tablet (md: 768px+)

- **Navigation:** Desktop nav links appear (`hidden md:flex`). Bottom nav may persist or disappear.
- **Product grids:** `md:grid-cols-2`.
- **Content grids:** `md:grid-cols-2` for testimonials, footer columns.
- **Admin:** Quick action cards use `md:col-span-4` within 12-column grid.
- **Typography:** Headlines scale up to `md:text-5xl`, `md:text-7xl` for hero.

### Desktop (lg: 1024px+)

- **Layout:** Multi-column grids. `max-w-7xl mx-auto` for content.
- **Admin sidebar:** `w-64` fixed left, main content offset with `ml-64`.
- **Filter sidebar:** `hidden lg:flex`, sticky positioning `sticky top-24`.
- **Content grids:** `lg:grid-cols-12` with asymmetric column spans (5/7, 8/4).
- **Product grids:** Up to `xl:grid-cols-3` on wide screens.
- **Section spacing:** Generous `py-32 px-8`.
- **Hover interactions:** Scale transforms, opacity transitions, color shifts, translate animations.
- **Typography:** Full display sizes. `lg:text-8xl` for hero headlines.
- **Project cards:** `h-[500px]` with full gradient overlays and reveal-on-hover descriptions.

---

## 8. INTERACTION PATTERNS

### Hover Effects

| Element | Effect | Duration |
|:---|:---|:---|
| Product/project images | `scale-105` to `scale-110` | `duration-500` to `duration-700` |
| Nav links | Color transition from `/70` to full opacity | `transition-colors` (150ms default) |
| Icon buttons | `opacity-80` | `duration-300` |
| Sidebar nav items | `translate-x-1` + background color | `duration-200` |
| Card titles | Color shift to `primary-container` | `transition-colors` |
| Text links | Underline appears or gap widens | `transition-all` |
| Project overlay | Overlay opacity increases, text translates up | `transition-opacity`, `transition-transform` |

### Transitions

- Standard interactive: `transition-all duration-300`
- Image scale: `transition-transform duration-500` to `duration-700`
- Color changes: `transition-colors` (default 150ms)
- Opacity: `transition-opacity duration-300` to `duration-500`
- Reveal animations: `duration-500` for text appearing on hover

### Scroll Animations

- Fade-in on scroll via Framer Motion (implement in Vue with intersection observer or motion library)
- Horizontal snap-scroll for project carousels and material sample strips

### Touch Interactions (Mobile)

- Tap feedback: `active:scale-95` or `active:scale-90` on buttons
- Bottom nav: `active:bg-[#6F4E37]/10 active:scale-90`

### Material Symbols Icon Config

Default icon settings applied globally:
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

For filled icons (active nav, star ratings): override with `font-variation-settings: 'FILL' 1;`

---

## 9. DO'S AND DON'TS

### Do

- **Add more whitespace when in doubt.** High-end design thrives on the luxury of space. Use `py-32` on desktop sections, `py-16` minimum on mobile.
- **Use asymmetric alignment.** Align a headline to the left and sub-description offset to the right of a 12-column grid. Stagger grid items with margin offsets.
- **Prioritize image quality.** This system fails without professional-grade photography. Images must be the hero of every page.
- **Use brown-tinted ambient shadows.** All shadows use `rgba(85,55,34,...)` at 4-8% opacity with 24px+ blur.
- **Maintain the Identity Gap.** Tight tracking on headlines, wide tracking on labels. This contrast is a core brand signal.
- **Use surface nesting for depth.** Layer surfaces from background to foreground using the tonal hierarchy.
- **Use gradient dividers** (`via-primary/10`) instead of solid lines when visual separation is needed.
- **Keep icons outlined by default.** Only use filled variants for active/selected states.

### Don't

- **Don't use pure #000000 or #FFFFFF for text or backgrounds.** Use `on-surface` (#1B1C1B) and `surface` (#FCF9F7).
- **Don't use harsh corners.** Every element needs at minimum `rounded` (2px). Cards and buttons use `rounded-xl` (8px) or larger.
- **Don't use standard drop shadows.** Avoid grey-tinted or design-tool-preset shadows. Always craft brown-tinted ambient shadows.
- **Don't use 1px solid borders** for sectioning. Use tonal shifts and whitespace. Ghost borders (10-30% opacity) are acceptable only for structural clarity.
- **Don't use divider lines in cards or lists.** Separate items with whitespace or background color changes.
- **Don't use generic icon libraries.** Use Material Symbols Outlined exclusively with the defined font-variation-settings.
- **Don't hardcode colors.** Always reference the Tailwind color tokens. No inline hex values except where Tailwind config references are not available.
- **Don't ignore mobile bottom nav safe areas.** Always account for `pb-safe` or equivalent bottom padding to avoid content behind the fixed bottom nav.
