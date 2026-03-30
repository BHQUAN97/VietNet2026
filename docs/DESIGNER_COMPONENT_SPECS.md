# DESIGNER COMPONENT SPECS -- VietNet Interior

> Design System: "The Curated Atelier" V3.0
> Framework: Next.js 14+ (React Server Components + Client Components)
> Version: 1.0 | Status: In Progress
> Date: 2026-03-27
> Author: Agent_Designer

---

## CONVENTIONS

- All components use Tailwind CSS utility classes referencing design tokens (never hardcode hex values).
- Colors follow Material Design 3 naming: `primary`, `primary-container`, `surface`, `on-surface`, etc.
- Typography: `font-headline` (Noto Serif) for display/headline, `font-body` (Manrope) for body, `font-label` (Manrope) for labels.
- Icons: Material Symbols Outlined exclusively. Default settings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`. Filled variant (`'FILL' 1`) only for active/selected states.
- Responsive: mobile-first (375px base, 768px md, 1024px lg, 1280px xl, 1536px 2xl).
- Accessibility: proper aria attributes, keyboard navigation, focus indicators via `focus:ring-2 focus:ring-primary-container`.
- All interactive components require: default, hover, active, focus, disabled states.
- No-Line Rule: no 1px solid borders for sectioning. Use tonal surface shifts or gradient dividers (`h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent`).
- Ghost borders only: `border border-outline-variant/20` when structural clarity is needed.
- Shadows: brown-tinted (`rgba(85,55,34,...)`) at 4-8% opacity, 24px+ blur. Never grey shadows.
- Border radius config: DEFAULT 2px, lg 4px, xl 8px (standard cards/buttons), full 12px. Use `rounded-xl` for cards, `rounded-2xl` for prominent containers, `rounded-full` for avatars/pills.

---

# LAYOUT COMPONENTS

---

## 1. Component: GlassNav

**File:** `src/components/layout/GlassNav.tsx`
**Type:** Client Component (scroll detection, mobile menu toggle)

### Description
Glassmorphic top navigation bar, fixed at viewport top. Contains brand name, horizontal nav links (desktop), utility icons (cart, account), and hamburger menu (mobile). Extracted from `vietnet_homepage_viewer_mode_desktop` and `vietnet_mobile_homepage_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `currentPath` | `string` | Yes | -- | Current route path for active link highlighting |
| `cartCount` | `number` | No | `0` | Number of items in cart, shown as badge |
| `isLoggedIn` | `boolean` | No | `false` | Whether user is authenticated |
| `onMenuToggle` | `() => void` | No | -- | Callback when mobile hamburger is tapped |
| `transparent` | `boolean` | No | `false` | If true, starts fully transparent and gains glass effect on scroll |

### States
| State | Visual Description |
|---|---|
| default | Glassmorphic bar: `bg-[#FCF9F7]/80 backdrop-blur-xl shadow-sm`. Brand left, links center-right, icons right. |
| scrolled | Same as default; if `transparent` was true, transitions from `bg-transparent` to glassmorphic on scroll. |
| hover (link) | Inactive link transitions from `text-primary/70` to `text-primary`. |
| active (link) | `text-primary-container border-b-2 border-primary-container pb-1`. |
| mobile | Hamburger icon replaces text links. Brand + hamburger left, cart + account right. Height `h-16`, padding `px-6 py-4`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Fixed top, `h-16 px-6`. Hamburger menu icon + brand name left, cart + account icons right. Nav links hidden. |
| 768px (md) | Nav links appear: `hidden md:flex items-center space-x-8`. Hamburger hidden. `px-8 py-4`. |
| 1280px (xl) | Same as md with wider spacing. `max-w-screen-2xl mx-auto`. |

### Tailwind Classes (key)
```
Container: fixed top-0 w-full z-50 bg-[#FCF9F7]/80 backdrop-blur-xl shadow-sm
Inner: flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto
Brand: text-2xl font-bold tracking-tighter text-primary font-headline
Active link: text-primary-container border-b-2 border-primary-container pb-1 font-headline text-sm uppercase tracking-wide
Inactive link: text-primary/70 hover:text-primary transition-colors font-headline text-sm uppercase tracking-wide
Icon button: hover:opacity-80 transition-opacity duration-300
Cart badge: absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] text-white
```

### Accessibility
- `role="navigation"`, `aria-label="Main navigation"`
- Nav links use semantic `<a>` or `<Link>` elements
- Active link: `aria-current="page"`
- Hamburger: `aria-expanded`, `aria-controls="mobile-menu"`
- Cart badge: `aria-label="Cart, X items"`
- Skip-to-content link hidden visually but accessible via keyboard

---

## 2. Component: BottomNav

**File:** `src/components/layout/BottomNav.tsx`
**Type:** Client Component (active tab tracking)

### Description
Fixed bottom navigation for mobile viewports. 5 tabs with Material Symbol icons and uppercase labels. Extracted from `vietnet_mobile_homepage_c_gi_h_ng` and `vietnet_mobile_catalog_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `currentPath` | `string` | Yes | -- | Current route for active tab |
| `items` | `NavItem[]` | No | Default 5 tabs | Array of `{ icon: string, filledIcon?: string, label: string, href: string }` |

### States
| State | Visual Description |
|---|---|
| default | 5 tab items evenly distributed, `h-20`, solid or glassmorphic background. |
| active tab | `text-primary-container bg-primary-container/10 rounded-xl px-3 py-1`. Icon uses `FILL 1` variant. |
| inactive tab | `text-on-surface/50`. Icon uses `FILL 0`. |
| pressed | `active:scale-90 transition-transform active:bg-primary-container/10`. |
| hidden | Entirely hidden on `md:` and above via `md:hidden`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Fixed bottom, full width, `h-20 pb-safe px-4`. 5 items `flex justify-around items-center`. |
| 768px (md) | `hidden`. Desktop uses GlassNav instead. |
| 1280px (xl) | `hidden`. |

### Tailwind Classes (key)
```
Container: fixed bottom-0 w-full z-50 bg-surface rounded-t-3xl shadow-[0_-4px_24px_rgba(85,55,34,0.06)] h-20 pb-safe px-4 flex justify-around items-center md:hidden
Active item: flex flex-col items-center justify-center text-primary-container bg-primary-container/10 rounded-xl px-3 py-1
Inactive item: flex flex-col items-center justify-center text-on-surface/50 hover:text-primary
Label: font-body text-[10px] uppercase tracking-[0.1em] font-medium mt-1
Touch: active:scale-90 transition-transform
```

### Accessibility
- `role="navigation"`, `aria-label="Bottom navigation"`
- Each tab: `role="link"`, active tab has `aria-current="page"`
- Touch targets: minimum 44x44px per item (ensured by `h-20` container and item padding)

---

## 3. Component: AdminSidebar

**File:** `src/components/layout/AdminSidebar.tsx`
**Type:** Client Component (collapse toggle, active route tracking)

### Description
Fixed left sidebar for admin panel. 256px wide, full height, with brand header, navigation items, primary action button, and user avatar. Extracted from `vietnet_admin_dashboard_desktop` and `vietnet_mobile_admin_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `currentPath` | `string` | Yes | -- | Current route for active nav highlighting |
| `user` | `{ name: string, role: string, avatarUrl?: string }` | Yes | -- | Logged-in admin user info |
| `navItems` | `SidebarNavItem[]` | Yes | -- | Array of `{ icon: string, label: string, href: string, badge?: number }` |
| `isCollapsed` | `boolean` | No | `false` | Whether sidebar is collapsed (mobile) |
| `onCollapse` | `(collapsed: boolean) => void` | No | -- | Collapse toggle callback |
| `primaryAction` | `{ label: string, href: string }` | No | -- | Primary CTA button at bottom |

### States
| State | Visual Description |
|---|---|
| default | `w-64` fixed left, full height. Brand header top, nav items middle, user avatar bottom. |
| active nav item | `bg-primary-container text-white rounded-lg shadow-lg`. |
| inactive nav item | `text-primary/60 hover:bg-primary-container/5 hover:text-primary hover:translate-x-1 transition-all duration-200`. |
| collapsed (mobile) | Sidebar slides off-screen to left. Overlay `bg-on-background/20 backdrop-blur-sm` covers content. |
| expanded (mobile) | Sidebar slides in from left as drawer, `w-80`, `shadow-2xl`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Hidden by default. Triggered via hamburger menu as slide-in drawer over content. |
| 768px (md) | Same as mobile -- drawer behavior. |
| 1024px (lg) | Fixed visible sidebar, `w-64`. Main content offsets with `ml-64`. |
| 1280px (xl) | Same as lg. |

### Tailwind Classes (key)
```
Container: h-screen w-64 border-r border-primary-container/10 bg-surface flex flex-col p-6 space-y-4 fixed left-0 top-0 z-50 overflow-y-auto
Brand: text-xl font-headline font-bold text-primary
Subtitle: text-[10px] font-label font-bold uppercase tracking-widest text-primary/60
Active item: flex items-center space-x-3 px-4 py-3 bg-primary-container text-white rounded-lg shadow-lg transition-all duration-200
Inactive item: flex items-center space-x-3 px-4 py-3 text-primary/60 hover:bg-primary-container/5 hover:text-primary transition-all duration-200 hover:translate-x-1
Primary action: w-full py-3 bg-primary-container text-white rounded-xl font-label font-bold text-xs uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity
User section: pt-8 mt-auto flex items-center space-x-3 border-t border-primary-container/10
Avatar: w-10 h-10 rounded-full object-cover border border-primary-container/20
```

### Accessibility
- `role="navigation"`, `aria-label="Admin sidebar"`
- Active item: `aria-current="page"`
- Collapsible: `aria-expanded` on toggle button
- Mobile drawer: focus trap when open, `Escape` key closes
- Skip nav link for keyboard users

---

## 4. Component: Footer

**File:** `src/components/layout/Footer.tsx`
**Type:** Server Component

### Description
3-column footer with brand info, navigation links, legal links, social icons, and copyright line. Dark brown background. Extracted from `vietnet_homepage_viewer_mode_desktop` and `vietnet_mobile_homepage_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `brandName` | `string` | No | `"VietNet Interior"` | Brand display name |
| `description` | `string` | No | -- | Short brand description |
| `navLinks` | `{ label: string, href: string }[]` | No | Default links | Footer navigation links |
| `legalLinks` | `{ label: string, href: string }[]` | No | Default legal | Privacy, Terms links |
| `socialLinks` | `{ platform: string, href: string, icon: string }[]` | No | -- | Social media links |
| `showNewsletter` | `boolean` | No | `false` | Whether to show newsletter signup |

### States
| State | Visual Description |
|---|---|
| default | Dark brown background, light text. 3 columns on desktop. |
| hover (link) | `text-white/70 hover:text-white transition-colors`. |
| hover (social icon) | `hover:bg-white/10 transition-colors`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Single column, stacked. Brand top, links middle, legal bottom. `px-6 py-12 pb-32` (clears bottom nav). Text centered. |
| 768px (md) | `grid-cols-2`. Brand takes full width top row, links split into 2 columns. |
| 1280px (xl) | `grid-cols-3`. Brand left, nav links center, legal right. `px-12 py-16`. |

### Tailwind Classes (key)
```
Container: bg-primary text-surface-bright
Inner: max-w-7xl mx-auto
Brand: font-headline text-2xl font-bold tracking-tighter
Description: text-white/70 text-sm
Section heading: font-bold uppercase tracking-widest text-xs text-white/40
Link: text-white/70 hover:text-white transition-colors
Social icon: w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center
Copyright: text-[10px] text-surface-bright/50
Bottom divider: border-t border-white/10
Mobile padding: pb-32 (to clear BottomNav)
```

### Accessibility
- `role="contentinfo"`
- Social links: `aria-label="Visit us on [platform]"`
- Newsletter form: proper `<label>` associations

---

## 5. Component: Breadcrumb

**File:** `src/components/layout/Breadcrumb.tsx`
**Type:** Server Component

### Description
Breadcrumb navigation trail displayed on catalog and detail pages. Uses ">" separator. Supports truncation on mobile.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `items` | `{ label: string, href?: string }[]` | Yes | -- | Breadcrumb segments. Last item has no `href` (current page). |
| `maxItems` | `number` | No | `4` | Max items before truncation on mobile |

### States
| State | Visual Description |
|---|---|
| default | Horizontal trail: `Home > Category > Current Page`. |
| hover (link) | Underline appears on hoverable segments. |
| truncated | On mobile when items exceed `maxItems`: `... > Parent > Current`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `px-4 py-3`. Truncate middle items if > maxItems. `text-xs`. |
| 768px (md) | `px-6 py-4`. Full trail visible. `text-sm`. |
| 1280px (xl) | `px-8 py-4`. Same as md. |

### Tailwind Classes (key)
```
Container: flex items-center gap-2 text-sm text-on-surface-variant
Separator: text-outline/50
Link segment: text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-colors
Current segment: text-primary font-semibold
Truncation: text-on-surface-variant
```

### Accessibility
- `nav` element with `aria-label="Breadcrumb"`
- `<ol>` with `<li>` for each segment
- Current page: `aria-current="page"`
- Structured data: JSON-LD `BreadcrumbList` schema

---

## 6. Component: PageContainer

**File:** `src/components/layout/PageContainer.tsx`
**Type:** Server Component

### Description
Max-width content wrapper that constrains page content and applies consistent horizontal padding. Two variants: full-bleed (1920px) and content-constrained (1280px/80rem).

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | `"full" | "content" | "narrow"` | No | `"content"` | `full` = 1920px, `content` = 80rem, `narrow` = 32rem |
| `className` | `string` | No | -- | Additional CSS classes |
| `as` | `ElementType` | No | `"div"` | HTML element to render as |
| `children` | `ReactNode` | Yes | -- | Page content |

### States
| State | Visual Description |
|---|---|
| default | Centered container with max-width constraint and responsive padding. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `px-4` for content/narrow, `px-0` for full. |
| 768px (md) | `px-6` for content, `px-4` for full. |
| 1280px (xl) | `px-8` for content. `max-w-screen-2xl mx-auto` for full. `max-w-7xl mx-auto` for content. |

### Tailwind Classes (key)
```
Full: max-w-[1920px] mx-auto px-0 md:px-4 xl:px-8
Content: max-w-7xl mx-auto px-4 md:px-6 xl:px-8
Narrow: max-w-lg mx-auto px-4 md:px-6
```

---

# BUTTON COMPONENTS

---

## 7. Component: Button

**File:** `src/components/buttons/Button.tsx`
**Type:** Client Component

### Description
Multi-variant button component. Supports primary, secondary, ghost, danger, and text variants. Sizes sm, md, lg. Extracted from all prototype files.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | `"primary" | "secondary" | "ghost" | "danger" | "text"` | No | `"primary"` | Visual variant |
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | Button size |
| `fullWidth` | `boolean` | No | `false` | Whether button fills parent width |
| `icon` | `string` | No | -- | Material Symbol icon name (leading) |
| `iconRight` | `string` | No | -- | Material Symbol icon name (trailing) |
| `loading` | `boolean` | No | `false` | Show spinner and disable interaction |
| `disabled` | `boolean` | No | `false` | Disabled state |
| `href` | `string` | No | -- | If provided, renders as `<a>` / `<Link>` |
| `uppercase` | `boolean` | No | `false` | Uppercase text with wide tracking |
| `children` | `ReactNode` | Yes | -- | Button label |
| `onClick` | `(e: MouseEvent) => void` | No | -- | Click handler |

### States
| State | Visual Description |
|---|---|
| default (primary) | `bg-primary-container text-white px-8 py-4 rounded-xl font-semibold`. |
| hover (primary) | `hover:opacity-90 transition-all`. |
| active (primary) | `active:scale-95 transition-transform` or `active:scale-[0.98]`. |
| focus (primary) | `focus:ring-2 focus:ring-primary-container focus:ring-offset-2 outline-none`. |
| disabled | `opacity-50 cursor-not-allowed pointer-events-none`. |
| loading | Spinner replaces or appears next to text. `pointer-events-none opacity-80`. |
| default (secondary) | `bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-primary`. |
| hover (secondary) | `hover:bg-primary hover:text-white transition-all`. |
| default (ghost) | `border border-outline-variant/30 rounded-lg text-primary bg-transparent`. |
| hover (ghost) | `hover:bg-surface-container-low transition-all`. |
| default (danger) | `bg-error text-on-error rounded-xl`. |
| hover (danger) | `hover:bg-error/90 transition-all`. |
| default (text) | `text-primary font-bold flex items-center gap-2 bg-transparent`. |
| hover (text) | `group hover:gap-4 transition-all` (arrow moves) or `underline-offset-8 hover:underline`. |

### Size variants
| Size | Padding | Font | Min Height |
|---|---|---|---|
| `sm` | `px-4 py-2` | `text-xs` | 32px |
| `md` | `px-8 py-3` | `text-sm` | 44px |
| `lg` | `px-10 py-4` | `text-base` | 52px |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width variant common on mobile. Touch target minimum 44px. `py-4` on mobile forms. |
| 768px (md) | Auto width. Side-by-side button pairs with `flex gap-4`. |
| 1280px (xl) | Hero variant adds `shadow-xl shadow-primary/20`. |

### Tailwind Classes (key)
```
Primary: bg-primary-container text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all
Primary hero: + shadow-xl shadow-primary/20
Secondary: bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-primary hover:bg-primary hover:text-white transition-all
Ghost: border border-outline-variant/30 rounded-lg text-primary hover:bg-surface-container-low
Danger: bg-error text-on-error rounded-xl hover:bg-error/90
Text: text-primary font-bold flex items-center gap-2
Full width: w-full py-4 font-bold uppercase tracking-widest text-xs
Disabled: opacity-50 cursor-not-allowed
```

### Accessibility
- Renders as `<button>` by default, `<a>` when `href` provided
- `aria-disabled="true"` when disabled (not just `disabled` attribute)
- Loading: `aria-busy="true"`, screen reader announces "Loading"
- Icon-only: requires `aria-label`
- Keyboard: `Enter` and `Space` activate

---

## 8. Component: IconButton

**File:** `src/components/buttons/IconButton.tsx`
**Type:** Client Component

### Description
Circular icon-only button. Used for nav utility icons, cart buttons on product cards, table row actions.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon` | `string` | Yes | -- | Material Symbol icon name |
| `variant` | `"default" | "filled" | "glass" | "outlined"` | No | `"default"` | Visual variant |
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | `sm`=32px, `md`=40px, `lg`=48px |
| `label` | `string` | Yes | -- | Accessible label (aria-label) |
| `badge` | `number` | No | -- | Notification count badge |
| `filled` | `boolean` | No | `false` | Use FILL 1 icon variant |
| `disabled` | `boolean` | No | `false` | Disabled state |
| `onClick` | `(e: MouseEvent) => void` | No | -- | Click handler |

### States
| State | Visual Description |
|---|---|
| default | `w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary`. |
| hover | `hover:bg-surface-container-high transition-colors`. |
| active | `active:scale-90 transition-transform`. |
| focus | `focus:ring-2 focus:ring-primary-container outline-none`. |
| disabled | `opacity-40 cursor-not-allowed`. |
| glass variant | `bg-surface-container-lowest/90 backdrop-blur-md shadow-lg rounded-full`. |
| filled variant | `bg-primary-container text-white`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Minimum 44px touch target. Use `size="md"` or `"lg"` on mobile. |
| 768px (md) | `size="sm"` acceptable for toolbar contexts. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Default: w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors
Glass: w-10 h-10 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-lg
Badge: absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] text-white
```

---

## 9. Component: FloatingActionWidget

**File:** `src/components/buttons/FloatingActionWidget.tsx`
**Type:** Client Component

### Description
Fixed-position floating action buttons for quick contact: Zalo, Messenger, Phone. Stacked vertically on the right side with pulse animation. Extracted from `vietnet_mobile_homepage_c_gi_h_ng` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `zaloUrl` | `string` | No | -- | Zalo chat deep link |
| `messengerUrl` | `string` | No | -- | Facebook Messenger link |
| `phoneNumber` | `string` | No | -- | Phone number for `tel:` link |
| `visible` | `boolean` | No | `true` | Show/hide the widget |
| `position` | `"right" | "left"` | No | `"right"` | Side of screen |

### States
| State | Visual Description |
|---|---|
| default | 3 circular buttons stacked vertically with `gap-4`. Pulse animation runs continuously on 3s cycle. |
| hover | `hover:scale-110 transition-transform`. Vibrate animation on hover. |
| active | `active:scale-95`. |
| hidden | `opacity-0 pointer-events-none transition-opacity`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `fixed right-6 bottom-24 flex flex-col gap-4 z-40`. Above BottomNav. All 3 buttons visible. |
| 768px (md) | `bottom-8`. May reduce to phone button only. |
| 1280px (xl) | Optional visibility -- can be hidden or collapsed on desktop. |

### Tailwind Classes (key)
```
Container: fixed right-6 bottom-24 flex flex-col gap-4 z-40
Messenger: w-12 h-12 bg-white text-primary rounded-full shadow-xl flex items-center justify-center
Zalo: w-12 h-12 bg-[#0068FF] text-white rounded-full shadow-xl flex items-center justify-center
Phone: w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center ring-4 ring-primary/10
Animation: animation: custom-pulse 3s infinite ease-in-out (scale 1 -> 1.05 -> 1)
Hover: transition-transform hover:scale-110
```

### Custom CSS
```css
@keyframes custom-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Accessibility
- Each button: `aria-label="Contact via [platform]"` or `aria-label="Call [number]"`
- Reduced motion: `prefers-reduced-motion: reduce` disables pulse animation
- Phone: uses `<a href="tel:...">` for native dialing

---

# CARD COMPONENTS

---

## 10. Component: ProjectCard

**File:** `src/components/cards/ProjectCard.tsx`
**Type:** Client Component (hover interactions)

### Description
Project showcase card with full-bleed image, gradient overlay, category label, title, and description that reveals on hover. Desktop uses tall fixed height with overlay; mobile uses glassmorphic info card. Extracted from `vietnet_homepage_viewer_mode_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | Yes | -- | Project title |
| `category` | `string` | Yes | -- | Category label (e.g., "Residential / 2023") |
| `description` | `string` | No | -- | Short description, revealed on hover (desktop) |
| `imageUrl` | `string` | Yes | -- | Project cover image URL |
| `imageAlt` | `string` | Yes | -- | Image alt text |
| `href` | `string` | Yes | -- | Link to project detail page |
| `featured` | `boolean` | No | `false` | If true, uses larger height and more prominent styling |
| `staggerOffset` | `boolean` | No | `false` | Apply `md:mt-12` for asymmetric grid staggering |

### States
| State | Visual Description |
|---|---|
| default (desktop) | Image fills container, gradient overlay at 60% opacity. Title and category visible at bottom. |
| hover (desktop) | Image scales to 110%, overlay increases to 80%, text container translates up, description fades in. |
| default (mobile) | `aspect-[4/5]` image. Glassmorphic info card at bottom: `bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg`. |
| focus | `ring-2 ring-primary-container ring-offset-2 outline-none` on the card link. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `aspect-[4/5]` image, glassmorphic overlay card at bottom. `min-w-[85vw]` in horizontal scroll. |
| 768px (md) | Grid item, `h-[400px]`. Gradient overlay style. `staggerOffset` adds `md:mt-12`. |
| 1280px (xl) | `h-[500px]`. Full gradient overlay with hover description reveal. |

### Tailwind Classes (key)
```
Container (desktop): group relative overflow-hidden rounded-xl bg-surface h-[500px]
Image: absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110
Gradient: absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity
Text container: absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform
Category: text-surface-bright/70 font-label text-[10px] tracking-[0.2em] uppercase mb-2
Title: text-surface-bright font-headline text-2xl font-bold mb-4
Description: text-surface-bright/0 group-hover:text-surface-bright/80 transition-opacity text-sm leading-relaxed duration-500

Mobile overlay: absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg
```

---

## 11. Component: ProductCard

**File:** `src/components/cards/ProductCard.tsx`
**Type:** Client Component (hover interactions)

### Description
Product catalog card for kitchen cabinets and other products. Desktop uses 4:5 aspect ratio; mobile uses 3:4 (taller). Includes material tag, title, price, optional "New" badge, and action button. Extracted from `vietnet_mobile_catalog_c_gi_h_ng` and `danh_m_c_s_n_ph_m_t_b_p` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | Yes | -- | Product name |
| `material` | `string` | Yes | -- | Material category (e.g., "Industrial Wood") |
| `imageUrl` | `string` | Yes | -- | Product image URL |
| `imageAlt` | `string` | Yes | -- | Image alt text |
| `href` | `string` | Yes | -- | Link to product detail |
| `price` | `string` | No | -- | Formatted price string |
| `isNew` | `boolean` | No | `false` | Show "New" badge |
| `rating` | `number` | No | -- | Star rating 1-5 |
| `onAddToCart` | `() => void` | No | -- | Cart action callback |

### States
| State | Visual Description |
|---|---|
| default | Image with rounded corners, title below, material tag, action button. |
| hover | Image scales 105% over 500ms. Title color shifts to `primary-container`. Hover overlay `bg-primary/10` fades in. |
| focus | Card link receives `ring-2 ring-primary-container`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `aspect-[3/4]` image. 2-column grid `grid-cols-2 gap-4`. Masonry offset with `-mt-8` / `mt-8`. "New" badge top-left. Cart button bottom-right. |
| 768px (md) | `grid-cols-2 gap-8`. |
| 1280px (xl) | `aspect-[4/5]`. `grid-cols-3 gap-10`. Hover overlay visible. |

### Tailwind Classes (key)
```
Container: group flex flex-col gap-3
Image wrapper: relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-xl bg-surface-container
Image: w-full h-full object-cover group-hover:scale-105 transition-transform duration-500
Hover overlay (desktop): absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity
New badge: absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[0.6rem] font-bold uppercase text-primary tracking-tighter
OR: absolute top-3 left-3 bg-primary-container text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest
Material tag: text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold
Title (desktop): text-xl font-headline font-bold text-primary group-hover:text-primary-container transition-colors
Title (mobile): text-sm font-headline font-bold text-primary leading-tight
Price: text-xs font-bold text-on-surface-variant
Action button: w-full py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all
Cart button (mobile): absolute bottom-3 right-3 w-10 h-10 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center
```

---

## 12. Component: MetricCard

**File:** `src/components/cards/MetricCard.tsx`
**Type:** Server Component

### Description
KPI dashboard card displaying a metric value, label, and optional trend indicator. Used in admin dashboard bento grids. Extracted from `vietnet_admin_dashboard_desktop` and `vietnet_mobile_admin_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | Yes | -- | Metric label (uppercase) |
| `value` | `string | number` | Yes | -- | Metric value to display |
| `trend` | `{ value: string, direction: "up" | "down" | "stable" }` | No | -- | Trend badge info |
| `icon` | `string` | No | -- | Optional Material Symbol icon |
| `variant` | `"default" | "primary" | "highlight"` | No | `"default"` | Background variant |
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | Card size for grid spanning |

### States
| State | Visual Description |
|---|---|
| default | `bg-surface-container-lowest p-6 rounded-xl shadow-sm`. Value in `text-3xl font-bold text-primary`. |
| primary variant | `bg-primary-container text-white`. Value and label in white. |
| highlight variant | `bg-surface-container-low`. Larger with decorative gradient in corner. |
| trend up | Badge: `text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded`. |
| trend down | Badge: `text-[10px] text-error font-bold bg-error/5 px-1.5 py-0.5 rounded`. |
| trend stable | Badge: `text-[10px] text-primary/50 font-bold bg-primary/5 px-1.5 py-0.5 rounded`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `grid-cols-2 gap-4`. Size `lg` spans `col-span-2`. Compact padding `p-5`. |
| 768px (md) | `md:grid-cols-4 gap-6`. |
| 1280px (xl) | Same as md with more breathing room. |

### Tailwind Classes (key)
```
Container: bg-surface-container-lowest p-6 rounded-xl shadow-sm
Label: text-[10px] font-label font-bold uppercase tracking-widest text-outline
Value: text-3xl font-bold text-primary font-headline
Trend up: text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded
Trend down: text-[10px] text-error font-bold bg-error/5 px-1.5 py-0.5 rounded
Primary variant: bg-primary-container p-5 rounded-2xl text-white
Large: col-span-2 p-6 rounded-2xl h-32
```

---

## 13. Component: TestimonialCard

**File:** `src/components/cards/TestimonialCard.tsx`
**Type:** Server Component

### Description
Customer testimonial with quote icon, star rating, quote text, and author info (avatar + name + role). Extracted from `vietnet_homepage_viewer_mode_desktop` and `vietnet_mobile_homepage_c_gi_h_ng` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `quote` | `string` | Yes | -- | Testimonial text |
| `authorName` | `string` | Yes | -- | Author display name |
| `authorRole` | `string` | No | -- | Author role/title |
| `authorAvatar` | `string` | No | -- | Avatar image URL |
| `authorInitials` | `string` | No | -- | Fallback initials when no avatar |
| `rating` | `number` | No | `5` | Star rating 1-5 |

### States
| State | Visual Description |
|---|---|
| default (desktop) | Large padded card with quote icon, stars, italic quote, author row. Custom ambient shadow. |
| default (mobile) | Centered single testimonial with circular avatar, optional ring decoration. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width. `p-10 rounded-3xl`. Centered text. Avatar with `ring-4 ring-white shadow-md`. |
| 768px (md) | `grid-cols-2 gap-12`. Side-by-side cards. |
| 1280px (xl) | `p-12 rounded-2xl`. Quote icon large and absolute positioned. |

### Tailwind Classes (key)
```
Container (desktop): bg-surface-container-lowest p-12 rounded-2xl shadow-[0_24px_48px_rgba(85,55,34,0.06)] relative
Quote icon: material-symbols-outlined text-primary/20 text-6xl absolute top-8 right-8
Stars: flex gap-1 mb-6 text-primary (each star: font-variation-settings: 'FILL' 1)
Quote text: text-xl leading-relaxed italic text-on-surface-variant mb-8
Author row: flex items-center gap-4
Avatar circle: w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-bold
Author name: font-bold text-primary
Author role: text-on-surface-variant text-sm

Mobile variant:
Container: bg-surface-container-highest/30 p-10 rounded-3xl text-center border border-white/40
Avatar: w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md
```

---

## 14. Component: QuickActionCard

**File:** `src/components/cards/QuickActionCard.tsx`
**Type:** Client Component

### Description
Admin dashboard action card used in quick action grid. Supports primary (colored), secondary (bordered), and accent (tertiary) variants. Features large icon and descriptive text. Extracted from `vietnet_admin_dashboard_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | Yes | -- | Action title |
| `subtitle` | `string` | No | -- | Supporting text |
| `icon` | `string` | Yes | -- | Material Symbol icon name |
| `variant` | `"primary" | "secondary" | "accent"` | No | `"secondary"` | Color variant |
| `href` | `string` | Yes | -- | Navigation target |
| `onClick` | `() => void` | No | -- | Click handler |

### States
| State | Visual Description |
|---|---|
| default (primary) | `bg-primary-container text-white p-6 rounded-xl h-40 shadow-xl`. Large background icon at 10% opacity. |
| default (secondary) | `bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl h-40 shadow-sm`. |
| default (accent) | `bg-tertiary-container text-on-tertiary-container p-6 rounded-xl h-40 shadow-sm`. |
| hover (primary) | Background icon scales 110%. |
| hover (secondary) | `hover:bg-surface-container-low transition-colors`. |
| hover (accent) | `hover:opacity-90 transition-opacity`. |
| active | `active:scale-95 transition-transform`. |
| focus | `focus:ring-2 focus:ring-primary-container`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width stacked. `flex items-center justify-between px-6 py-4 rounded-xl`. |
| 768px (md) | `grid-cols-12`. Each card: `md:col-span-4 h-40`. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Primary: col-span-12 md:col-span-4 bg-primary-container p-6 rounded-xl text-white flex flex-col justify-between h-40 group cursor-pointer overflow-hidden relative shadow-xl
Background icon: absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-110 text-[120px]
Secondary: bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 flex flex-col justify-between h-40 hover:bg-surface-container-low transition-colors shadow-sm
Accent: bg-tertiary-container p-6 rounded-xl text-on-tertiary-container flex flex-col justify-between h-40 hover:opacity-90 transition-opacity shadow-sm
Mobile: flex items-center justify-between w-full bg-primary-container text-white px-6 py-4 rounded-xl shadow-lg active:scale-95 transition-transform
```

---

# FORM COMPONENTS

---

## 15. Component: Input

**File:** `src/components/forms/Input.tsx`
**Type:** Client Component

### Description
Text input field with label, optional helper text, and error state. Uses surface-container-lowest fill with ghost border on focus. Extracted from consultation form in `vietnet_homepage_viewer_mode_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | No | -- | Input label (uppercase tracking) |
| `placeholder` | `string` | No | -- | Placeholder text |
| `type` | `string` | No | `"text"` | Input type: text, email, tel, password, number |
| `value` | `string` | No | -- | Controlled value |
| `onChange` | `(value: string) => void` | No | -- | Change handler |
| `error` | `string` | No | -- | Error message |
| `helperText` | `string` | No | -- | Helper text below input |
| `required` | `boolean` | No | `false` | Required field indicator |
| `disabled` | `boolean` | No | `false` | Disabled state |
| `name` | `string` | No | -- | Form field name |
| `id` | `string` | No | auto-generated | Input ID |

### States
| State | Visual Description |
|---|---|
| default | `bg-surface-container-low border-none rounded-xl px-4 py-3`. Neutral fill. |
| focus | `focus:ring-2 focus:ring-primary-container/50 outline-none transition-shadow`. |
| error | `ring-2 ring-error/50`. Error text below in `text-error text-xs`. |
| disabled | `opacity-50 cursor-not-allowed bg-surface-container`. |
| filled | Same as default with value text in `text-on-surface`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width. `py-4` for touch-friendly 44px height. |
| 768px (md) | Can be in 2-column grid: `grid-cols-2 gap-6`. `py-3`. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Label: font-label text-[10px] tracking-widest text-on-surface-variant uppercase block mb-2
Input: w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container/50 outline-none transition-shadow text-on-surface font-body
Error text: text-error text-xs mt-1 font-medium
Helper text: text-on-surface-variant text-xs mt-1
Dark variant (on colored bg): bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/50
```

### Accessibility
- `<label>` associated via `htmlFor`/`id`
- Error: `aria-invalid="true"`, `aria-describedby` pointing to error message `id`
- Required: `aria-required="true"`, visual asterisk on label

---

## 16. Component: Textarea

**File:** `src/components/forms/Textarea.tsx`
**Type:** Client Component

### Description
Multi-line text input. Same styling conventions as Input but with configurable rows.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | No | -- | Textarea label |
| `placeholder` | `string` | No | -- | Placeholder text |
| `value` | `string` | No | -- | Controlled value |
| `onChange` | `(value: string) => void` | No | -- | Change handler |
| `rows` | `number` | No | `4` | Number of visible rows |
| `maxLength` | `number` | No | -- | Character limit |
| `error` | `string` | No | -- | Error message |
| `required` | `boolean` | No | `false` | Required field |
| `disabled` | `boolean` | No | `false` | Disabled state |
| `name` | `string` | No | -- | Form field name |

### States
| State | Visual Description |
|---|---|
| default | Same fill/border as Input. `resize-y`. |
| focus | `focus:ring-2 focus:ring-primary-container/50`. |
| error | `ring-2 ring-error/50`. |
| disabled | `opacity-50 cursor-not-allowed`. |
| character count | Counter at bottom-right: `text-xs text-on-surface-variant`. Turns `text-error` when near limit. |

### Tailwind Classes (key)
```
Textarea: w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container/50 outline-none transition-shadow resize-y min-h-[120px]
Character count: text-xs text-on-surface-variant text-right mt-1
```

---

## 17. Component: Select

**File:** `src/components/forms/Select.tsx`
**Type:** Client Component

### Description
Dropdown select field. Matches Input styling with custom dropdown icon.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | No | -- | Select label |
| `options` | `{ value: string, label: string }[]` | Yes | -- | Dropdown options |
| `value` | `string` | No | -- | Selected value |
| `onChange` | `(value: string) => void` | No | -- | Change handler |
| `placeholder` | `string` | No | `"Select..."` | Placeholder when no value |
| `error` | `string` | No | -- | Error message |
| `required` | `boolean` | No | `false` | Required field |
| `disabled` | `boolean` | No | `false` | Disabled state |
| `name` | `string` | No | -- | Form field name |

### States
| State | Visual Description |
|---|---|
| default | Same as Input with `appearance-none` and custom chevron icon. |
| open | Native dropdown opens. On mobile, uses native OS picker. |
| focus | `focus:ring-2 focus:ring-primary-container/50`. |
| error | `ring-2 ring-error/50`. |
| disabled | `opacity-50 cursor-not-allowed`. |

### Tailwind Classes (key)
```
Select: w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container/50 outline-none transition-shadow appearance-none
Chevron: absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline
Dark variant: bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white appearance-none
```

---

## 18. Component: SearchInput

**File:** `src/components/forms/SearchInput.tsx`
**Type:** Client Component

### Description
Search input with leading search icon and optional clear button. Used in admin dashboard toolbar. Extracted from `vietnet_admin_dashboard_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | `string` | No | `""` | Search query |
| `onChange` | `(value: string) => void` | No | -- | Change handler |
| `onSubmit` | `(value: string) => void` | No | -- | Submit handler (Enter key) |
| `placeholder` | `string` | No | `"Search..."` | Placeholder text |
| `variant` | `"default" | "rounded"` | No | `"rounded"` | Shape variant |
| `className` | `string` | No | -- | Additional classes |

### States
| State | Visual Description |
|---|---|
| default | Search icon left, input field, rounded pill shape. |
| focus | `focus:ring-1 focus:ring-primary/20`. |
| filled | Clear button (X icon) appears on right when value is non-empty. |
| loading | Spinner replaces search icon during search. |

### Tailwind Classes (key)
```
Container: relative group
Icon: absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined
Input: pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-full text-sm font-body focus:ring-1 focus:ring-primary/20 w-64 shadow-sm
Clear button: absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer
```

---

## 19. Component: FilterChip

**File:** `src/components/forms/FilterChip.tsx`
**Type:** Client Component

### Description
Horizontal scrollable filter tag used in catalog pages. Active/inactive toggle states. Extracted from `vietnet_mobile_catalog_c_gi_h_ng` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | Yes | -- | Chip text |
| `active` | `boolean` | No | `false` | Active/selected state |
| `onClick` | `() => void` | No | -- | Toggle handler |
| `icon` | `string` | No | -- | Optional leading icon |
| `count` | `number` | No | -- | Optional count badge |

### States
| State | Visual Description |
|---|---|
| active | `bg-primary-container text-white rounded-xl px-5 py-2 text-xs font-bold`. |
| inactive | `bg-surface-container-high text-on-surface-variant rounded-xl px-5 py-2 text-xs font-medium`. |
| hover (inactive) | `hover:bg-surface-container-highest transition-colors`. |
| focus | `focus:ring-2 focus:ring-primary-container outline-none`. |

### Container Pattern
```
Scroll container: flex overflow-x-auto gap-3 no-scrollbar pb-2
```

### Tailwind Classes (key)
```
Active: whitespace-nowrap px-5 py-2 rounded-xl bg-primary-container text-white text-xs font-bold transition-colors
Inactive: whitespace-nowrap px-5 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container-highest transition-colors
```

### Accessibility
- `role="button"`, `aria-pressed="true/false"`
- Container: `role="group"`, `aria-label="Filter options"`
- Keyboard: `Tab` to navigate, `Enter`/`Space` to toggle

---

## 20. Component: FilterBottomSheet

**File:** `src/components/forms/FilterBottomSheet.tsx`
**Type:** Client Component

### Description
Mobile-only bottom sheet for expanded filter options. Slides up from bottom with backdrop overlay. Contains filter groups and apply/reset buttons.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `isOpen` | `boolean` | Yes | -- | Open/closed state |
| `onClose` | `() => void` | Yes | -- | Close handler |
| `onApply` | `(filters: FilterState) => void` | Yes | -- | Apply handler |
| `onReset` | `() => void` | No | -- | Reset all filters |
| `filterGroups` | `FilterGroup[]` | Yes | -- | Array of `{ label: string, type: "chips" | "range" | "checkbox", options: Option[] }` |
| `activeFilters` | `FilterState` | No | -- | Currently active filters |

### States
| State | Visual Description |
|---|---|
| closed | Not rendered or `translate-y-full opacity-0`. |
| open | Slides up: `translate-y-0 opacity-100 transition-transform duration-300`. Backdrop `bg-on-surface/20 backdrop-blur-sm`. |
| scrollable | Content area scrolls independently when filters exceed viewport. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width, `max-h-[80vh]`, rounded top corners `rounded-t-3xl`. Bottom safe area padding. |
| 768px (md) | Still usable. May switch to side panel. |
| 1024px (lg) | Hidden. Desktop uses inline FilterChip bar or sticky sidebar filters. |

### Tailwind Classes (key)
```
Backdrop: fixed inset-0 z-50 bg-on-surface/20 backdrop-blur-sm
Sheet: fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto pb-safe
Handle: w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-6
Header: flex justify-between items-center px-6 mb-6
Title: font-headline text-xl font-bold text-primary
Reset: text-xs font-bold uppercase tracking-widest text-primary/60
Filter section: px-6 mb-6 space-y-3
Apply button: w-full py-4 bg-primary-container text-white rounded-xl font-bold uppercase tracking-widest mx-6 mb-6
```

### Accessibility
- `role="dialog"`, `aria-modal="true"`, `aria-label="Filter options"`
- Focus trap when open
- `Escape` key closes
- Handle: `role="button"`, `aria-label="Close filters"` for drag-to-close

---

# DATA DISPLAY COMPONENTS

---

## 21. Component: DataTable

**File:** `src/components/data/DataTable.tsx`
**Type:** Client Component (sorting, row interactions)

### Description
Admin data table with row hover effects, status badges, avatar initials, and action buttons. No visible cell borders -- uses tonal row dividers. Extracted from `vietnet_admin_dashboard_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `columns` | `Column[]` | Yes | -- | Array of `{ key: string, label: string, align?: "left" | "right" | "center", sortable?: boolean, width?: string }` |
| `data` | `Record<string, any>[]` | Yes | -- | Table row data |
| `onRowClick` | `(row: any) => void` | No | -- | Row click handler |
| `sortBy` | `string` | No | -- | Current sort column |
| `sortDir` | `"asc" | "desc"` | No | -- | Sort direction |
| `onSort` | `(column: string) => void` | No | -- | Sort handler |
| `loading` | `boolean` | No | `false` | Show skeleton rows |
| `emptyMessage` | `string` | No | `"No data found"` | Empty state message |
| `renderCell` | `(row: any, column: Column) => ReactNode` | No | -- | Custom cell renderer |

### States
| State | Visual Description |
|---|---|
| default | White container, header row with surface-container-low bg, near-invisible row dividers. |
| row hover | `hover:bg-surface-container-low transition-colors cursor-pointer`. |
| loading | Skeleton rows replace data rows. |
| empty | EmptyState component displayed. |
| sorted | Column header shows sort direction indicator. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Horizontal scroll with `overflow-x-auto`. Minimum column widths. |
| 768px (md) | Full table visible. |
| 1280px (xl) | `lg:col-span-2` when in grid layout. Actions column visible on hover. |

### Tailwind Classes (key)
```
Container: bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden
Table: w-full text-left border-collapse
Header row: bg-surface-container-low
Header cell: px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline
Body: divide-y divide-outline-variant/10
Data row: hover:bg-surface-container-low transition-colors group cursor-pointer
Data cell: px-6 py-4 text-sm text-on-surface-variant
Avatar cell: w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs
```

### Accessibility
- Semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- `<th scope="col">` for header cells
- Sortable columns: `aria-sort="ascending"` / `"descending"` / `"none"`
- Row click: `role="link"` or `tabindex="0"` with keyboard Enter support

---

## 22. Component: StatusBadge

**File:** `src/components/data/StatusBadge.tsx`
**Type:** Server Component

### Description
Inline status indicator badge used in tables and cards. Supports multiple semantic variants.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | `"scheduled" | "active" | "pending" | "completed" | "draft" | "new" | "error" | "published"` | Yes | -- | Status type |
| `label` | `string` | No | Auto from status | Display text (overrides default) |
| `size` | `"sm" | "md"` | No | `"md"` | Badge size |

### States
| State | Visual Description |
|---|---|
| scheduled / active / published | `bg-green-50 text-green-700`. |
| pending / draft | `bg-amber-50 text-amber-700`. |
| completed | `bg-surface-container-high text-on-surface-variant`. |
| new | `bg-blue-50 text-blue-700`. |
| error | `bg-error-container text-on-error-container`. |

### Tailwind Classes (key)
```
Base: inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase
Scheduled/Active: bg-green-50 text-green-700
Pending/Draft: bg-amber-50 text-amber-700
Completed: bg-surface-container-high text-on-surface-variant
New: bg-blue-50 text-blue-700
Error: bg-error-container text-on-error-container
```

---

## 23. Component: Avatar

**File:** `src/components/data/Avatar.tsx`
**Type:** Server Component

### Description
User avatar with image or initials fallback. Supports multiple sizes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `src` | `string` | No | -- | Image URL |
| `alt` | `string` | Yes | -- | Alt text |
| `initials` | `string` | No | -- | Fallback initials (1-2 chars) |
| `size` | `"xs" | "sm" | "md" | "lg" | "xl"` | No | `"md"` | Avatar size |
| `ring` | `boolean` | No | `false` | Show ring decoration |
| `status` | `"online" | "offline" | "busy"` | No | -- | Online status dot |

### Size Map
| Size | Dimensions | Text |
|---|---|---|
| `xs` | `w-6 h-6` | `text-[8px]` |
| `sm` | `w-8 h-8` | `text-xs` |
| `md` | `w-10 h-10` | `text-sm` |
| `lg` | `w-12 h-12` | `text-base` |
| `xl` | `w-16 h-16` | `text-lg` |

### States
| State | Visual Description |
|---|---|
| with image | `rounded-full object-cover` with optional `border border-primary-container/20`. |
| initials fallback | `rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold`. |
| with ring | Adds `ring-4 ring-white shadow-md`. |
| with status | Small dot positioned `absolute bottom-0 right-0`: green (online), gray (offline), red (busy). |

### Tailwind Classes (key)
```
Image: rounded-full object-cover border border-primary-container/20
Initials: rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold
Ring: ring-4 ring-white shadow-md
Status dot: absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
```

---

## 24. Component: Pagination

**File:** `src/components/data/Pagination.tsx`
**Type:** Client Component

### Description
Pagination with two modes: desktop (numbered pages) and mobile (dots + load more button). Extracted from `vietnet_mobile_catalog_c_gi_h_ng` and `danh_m_c_s_n_ph_m_t_b_p` prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `currentPage` | `number` | Yes | -- | Current active page |
| `totalPages` | `number` | Yes | -- | Total number of pages |
| `onPageChange` | `(page: number) => void` | Yes | -- | Page change handler |
| `onLoadMore` | `() => void` | No | -- | Load more handler (mobile) |
| `hasMore` | `boolean` | No | -- | Whether more items can be loaded |
| `loading` | `boolean` | No | `false` | Loading state for load-more button |

### States
| State | Visual Description |
|---|---|
| default (desktop) | Numbered page buttons with prev/next arrows. Active page highlighted. |
| default (mobile) | Dot indicators showing current page. "Load More" button below. |
| active page | `bg-primary text-white rounded-full`. |
| inactive page | `text-on-surface-variant hover:bg-surface-container-low rounded-full`. |
| loading | Load-more button shows spinner. |
| disabled nav | Prev/next disabled at first/last page. `opacity-50 cursor-not-allowed`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Dots: `flex gap-2`. Active dot `w-2 h-2 rounded-full bg-primary`, inactive `bg-outline-variant`. Load more: `px-10 py-4 bg-primary text-on-primary rounded-full`. |
| 768px (md) | Switch to numbered pagination. `flex items-center gap-2`. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Desktop container: flex items-center justify-center gap-2
Page button: w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium
Active: bg-primary text-on-primary
Inactive: text-on-surface-variant hover:bg-surface-container-low transition-colors
Nav arrow: w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low

Mobile dots: flex gap-2 justify-center
Active dot: w-2 h-2 rounded-full bg-primary
Inactive dot: w-2 h-2 rounded-full bg-outline-variant
Load more: px-10 py-4 bg-primary text-on-primary text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all
```

---

## 25. Component: StarRating

**File:** `src/components/data/StarRating.tsx`
**Type:** Server Component

### Description
5-star rating display using Material Symbols filled star icons. Read-only display only (no interaction).

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `rating` | `number` | Yes | -- | Rating value 0-5 (supports half stars) |
| `maxStars` | `number` | No | `5` | Maximum stars |
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | Star icon size |
| `color` | `"primary" | "amber"` | No | `"primary"` | Star color token |

### States
| State | Visual Description |
|---|---|
| filled star | Material Symbol `star` with `FILL 1`, color `text-primary`. |
| empty star | Material Symbol `star` with `FILL 0`, color `text-outline-variant`. |
| half star | Clipped filled star (CSS clip-path). |

### Tailwind Classes (key)
```
Container: flex gap-1 text-primary
Filled star: material-symbols-outlined (font-variation-settings: 'FILL' 1)
Empty star: material-symbols-outlined text-outline-variant
Size sm: text-sm
Size md: text-base (default icon size)
Size lg: text-xl
```

---

## 26. Component: StatCounter

**File:** `src/components/data/StatCounter.tsx`
**Type:** Client Component (animation)

### Description
Animated number counter used in About sections and stat displays. Counts from 0 to target value when scrolled into view.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | `number` | Yes | -- | Target number |
| `suffix` | `string` | No | -- | Suffix text (e.g., "+", "%", "k") |
| `prefix` | `string` | No | -- | Prefix text (e.g., "$") |
| `label` | `string` | Yes | -- | Descriptive label below number |
| `duration` | `number` | No | `2000` | Animation duration in ms |
| `animate` | `boolean` | No | `true` | Whether to animate on scroll |

### States
| State | Visual Description |
|---|---|
| before animation | Displays "0" or prefix + "0" + suffix. |
| animating | Number counts up with easing. |
| complete | Final value displayed. |

### Tailwind Classes (key)
```
Value: text-3xl font-headline font-bold text-primary
Label: font-label text-[10px] tracking-widest text-on-surface-variant uppercase
Container: flex flex-col
```

### Accessibility
- `aria-live="polite"` on the value container
- `prefers-reduced-motion`: skip animation, show final value immediately

---

# FEEDBACK COMPONENTS

---

## 27. Component: Toast

**File:** `src/components/feedback/Toast.tsx`
**Type:** Client Component

### Description
Notification toast that slides in from top-right (desktop) or top-center (mobile). Auto-dismisses after configurable duration.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | `string` | Yes | -- | Toast message |
| `type` | `"success" | "error" | "warning" | "info"` | No | `"info"` | Toast variant |
| `duration` | `number` | No | `5000` | Auto-dismiss duration in ms (0 = manual) |
| `onDismiss` | `() => void` | No | -- | Dismiss callback |
| `action` | `{ label: string, onClick: () => void }` | No | -- | Optional action button |

### States
| State | Visual Description |
|---|---|
| entering | Slides in from top: `translate-y-[-100%] -> translate-y-0`. |
| visible | Fully visible with icon, message, optional action, close button. |
| exiting | Fades and slides out: `opacity-0 translate-y-[-100%]`. |
| success | Green accent: leading checkmark icon, `border-l-4 border-green-500`. |
| error | Red accent: leading error icon, `border-l-4 border-error`. |
| warning | Amber accent: leading warning icon, `border-l-4 border-amber-500`. |
| info | Primary accent: leading info icon, `border-l-4 border-primary-container`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width with `mx-4`. Top of screen. |
| 768px (md) | `max-w-sm`. Top-right corner. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Container: fixed top-4 right-4 z-[100] max-w-sm bg-surface-container-lowest rounded-xl shadow-xl p-4 flex items-start gap-3 transition-all duration-300
Success: border-l-4 border-green-500
Error: border-l-4 border-error
Warning: border-l-4 border-amber-500
Info: border-l-4 border-primary-container
Close: text-on-surface-variant hover:text-on-surface cursor-pointer
```

### Accessibility
- `role="alert"`, `aria-live="assertive"` for errors, `aria-live="polite"` for others
- Close button: `aria-label="Dismiss notification"`
- Auto-dismiss pauses on hover/focus

---

## 28. Component: Skeleton

**File:** `src/components/feedback/Skeleton.tsx`
**Type:** Server Component

### Description
Loading placeholder that mimics the shape of content being loaded. Supports card, table row, and text variants.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | `"card" | "table-row" | "text" | "avatar" | "image" | "metric"` | No | `"text"` | Shape variant |
| `lines` | `number` | No | `3` | Number of text lines (for `text` variant) |
| `className` | `string` | No | -- | Additional classes |
| `count` | `number` | No | `1` | Number of skeleton items to render |

### States
| State | Visual Description |
|---|---|
| loading | Pulsing animation: `animate-pulse bg-surface-container/80 rounded`. |

### Variant Details
| Variant | Shape |
|---|---|
| `text` | Multiple horizontal bars of varying width (100%, 80%, 60%). |
| `card` | Rectangular image placeholder + 2-3 text bars. |
| `table-row` | Row of cells matching table column layout. |
| `avatar` | Circle placeholder. |
| `image` | Rectangular placeholder with aspect ratio. |
| `metric` | Small card with number bar + label bar. |

### Tailwind Classes (key)
```
Base: animate-pulse bg-surface-container rounded
Text line: h-4 rounded mb-2 (last line: w-3/4)
Card image: aspect-[4/5] rounded-xl mb-4
Card title: h-5 w-3/4 rounded mb-2
Card subtitle: h-4 w-1/2 rounded
Avatar: w-10 h-10 rounded-full
Table cell: h-4 rounded
Metric value: h-8 w-24 rounded mb-2
Metric label: h-3 w-16 rounded
```

---

## 29. Component: EmptyState

**File:** `src/components/feedback/EmptyState.tsx`
**Type:** Server Component

### Description
Displayed when a list, table, or grid has no data. Shows an illustration/icon, title, description, and optional action button.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon` | `string` | No | `"inbox"` | Material Symbol icon |
| `title` | `string` | Yes | -- | Empty state heading |
| `description` | `string` | No | -- | Explanatory text |
| `action` | `{ label: string, onClick: () => void, href?: string }` | No | -- | CTA button |
| `illustration` | `ReactNode` | No | -- | Custom illustration component |

### States
| State | Visual Description |
|---|---|
| default | Centered layout: large muted icon, title, description text, optional action button. |

### Tailwind Classes (key)
```
Container: flex flex-col items-center justify-center py-16 px-8 text-center
Icon: material-symbols-outlined text-6xl text-outline-variant/40 mb-4
Title: font-headline text-xl font-bold text-primary mb-2
Description: text-on-surface-variant text-sm max-w-md mb-6
Action: (uses Button component with variant="primary")
```

---

## 30. Component: ErrorState

**File:** `src/components/feedback/ErrorState.tsx`
**Type:** Client Component

### Description
Error message display with retry action. Used when API calls fail or pages encounter errors.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | No | `"Something went wrong"` | Error heading |
| `message` | `string` | No | -- | Error description |
| `onRetry` | `() => void` | No | -- | Retry callback |
| `retryLabel` | `string` | No | `"Try Again"` | Retry button text |
| `icon` | `string` | No | `"error_outline"` | Material Symbol icon |

### States
| State | Visual Description |
|---|---|
| default | Centered layout: error icon in `text-error`, title, message, retry button. |
| retrying | Retry button shows loading state. |

### Tailwind Classes (key)
```
Container: flex flex-col items-center justify-center py-16 px-8 text-center
Icon: material-symbols-outlined text-6xl text-error/40 mb-4
Title: font-headline text-xl font-bold text-primary mb-2
Message: text-on-surface-variant text-sm max-w-md mb-6
Retry: (uses Button component with variant="secondary")
```

---

## 31. Component: Spinner

**File:** `src/components/feedback/Spinner.tsx`
**Type:** Server Component

### Description
Circular loading spinner. Used inline in buttons, as page-level loading, or within components.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | Spinner size |
| `color` | `"primary" | "white" | "current"` | No | `"primary"` | Spinner color |
| `label` | `string` | No | `"Loading"` | Screen reader text |

### Size Map
| Size | Dimensions |
|---|---|
| `sm` | `w-4 h-4` |
| `md` | `w-8 h-8` |
| `lg` | `w-12 h-12` |

### Tailwind Classes (key)
```
Spinner: animate-spin rounded-full border-2 border-current border-t-transparent
Primary: text-primary-container
White: text-white
Current: text-current (inherits parent color)
```

### Accessibility
- `role="status"`, `aria-label` with provided label
- Visually hidden `<span>` with "Loading" text for screen readers

---

# MEDIA COMPONENTS

---

## 32. Component: ImageGallery

**File:** `src/components/media/ImageGallery.tsx`
**Type:** Client Component (lightbox interaction)

### Description
Responsive image grid with lightbox modal on click. Supports masonry-like layout with varying aspect ratios. Used on project detail and product detail pages.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `images` | `{ src: string, alt: string, width?: number, height?: number }[]` | Yes | -- | Array of images |
| `columns` | `number` | No | `3` | Number of columns on desktop |
| `gap` | `"sm" | "md" | "lg"` | No | `"md"` | Gap between images |
| `aspectRatio` | `"auto" | "square" | "4/5" | "3/4" | "16/9"` | No | `"auto"` | Forced aspect ratio |
| `enableLightbox` | `boolean` | No | `true` | Enable click-to-enlarge |

### States
| State | Visual Description |
|---|---|
| default | Grid of images with rounded corners and hover effect. |
| hover (image) | `scale-105 transition-transform duration-500`. |
| lightbox open | Full-screen modal with image, prev/next arrows, close button. Glassmorphic backdrop. |
| lightbox navigation | Slide transition between images. |
| loading (image) | Skeleton placeholder until image loads. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `grid-cols-1` or `grid-cols-2 gap-4`. |
| 768px (md) | `grid-cols-2 gap-6`. |
| 1280px (xl) | `grid-cols-3 gap-8` or as specified by `columns` prop. |

### Tailwind Classes (key)
```
Grid: grid gap-4 md:gap-6 xl:gap-8
Image container: overflow-hidden rounded-xl bg-surface-container group cursor-pointer
Image: w-full h-full object-cover group-hover:scale-105 transition-transform duration-500
Lightbox backdrop: fixed inset-0 z-[100] bg-on-surface/80 backdrop-blur-md flex items-center justify-center
Lightbox image: max-w-[90vw] max-h-[90vh] object-contain rounded-xl
Nav arrow: w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20
Close: absolute top-4 right-4 text-white hover:opacity-80
```

### Accessibility
- Images: proper `alt` text
- Lightbox: focus trap, `Escape` to close, arrow keys for navigation
- `role="dialog"`, `aria-modal="true"`, `aria-label="Image gallery"`

---

## 33. Component: MaterialSwatch

**File:** `src/components/media/MaterialSwatch.tsx`
**Type:** Client Component

### Description
Circular material sample image used in horizontal scroll strips for material selection/display.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `imageUrl` | `string` | Yes | -- | Material sample image |
| `label` | `string` | Yes | -- | Material name |
| `active` | `boolean` | No | `false` | Selected state |
| `onClick` | `() => void` | No | -- | Selection handler |
| `size` | `"sm" | "md" | "lg"` | No | `"md"` | Swatch size |

### Size Map
| Size | Dimensions |
|---|---|
| `sm` | `w-12 h-12` |
| `md` | `w-16 h-16` |
| `lg` | `w-20 h-20` |

### States
| State | Visual Description |
|---|---|
| default | Circular image with subtle border. Label below. |
| active | `ring-2 ring-primary-container ring-offset-2`. Label in `font-bold text-primary`. |
| hover | `scale-110 transition-transform`. |
| focus | `ring-2 ring-primary-container outline-none`. |

### Tailwind Classes (key)
```
Image: rounded-full object-cover border border-outline-variant/20
Active ring: ring-2 ring-primary-container ring-offset-2
Label: text-[10px] font-label uppercase tracking-widest text-on-surface-variant text-center mt-2
Active label: text-primary font-bold
Container scroll: flex overflow-x-auto gap-4 no-scrollbar
```

---

## 34. Component: HeroSection

**File:** `src/components/media/HeroSection.tsx`
**Type:** Server Component (or Client if scroll-dependent)

### Description
Full-width hero section with background image, gradient overlay, headline, subtitle, CTA buttons, and optional stats bar. Extracted from both desktop and mobile homepage prototypes.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `imageUrl` | `string` | Yes | -- | Background image URL |
| `imageAlt` | `string` | Yes | -- | Background image alt |
| `headline` | `string` | Yes | -- | Main headline text |
| `subtitle` | `string` | No | -- | Subtitle paragraph |
| `overline` | `string` | No | -- | Small label above headline |
| `primaryCta` | `{ label: string, href: string }` | No | -- | Primary CTA button |
| `secondaryCta` | `{ label: string, href: string }` | No | -- | Secondary CTA button |
| `stats` | `{ value: string, label: string }[]` | No | -- | Stats bar items |
| `height` | `"full" | "tall" | "medium"` | No | `"full"` | Hero height: `h-screen`, `h-[751px]`, `h-[500px]` |
| `alignment` | `"center" | "left" | "bottom-left"` | No | `"center"` | Text alignment |
| `overlayStyle` | `"gradient-up" | "gradient-right" | "tint"` | No | `"gradient-up"` | Overlay type |

### States
| State | Visual Description |
|---|---|
| default (desktop) | Full viewport height, centered text, gradient overlay from bottom, 2 CTA buttons. |
| default (mobile) | `h-[751px]`, bottom-left text alignment, single CTA, `p-8`. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | `h-[751px]`. Text bottom-left `p-8`. Single CTA. Headline `text-4xl`. Overline `text-xs`. |
| 768px (md) | Headline scales to `md:text-7xl`. Both CTAs show `flex-row gap-6`. |
| 1280px (xl) | `h-screen`. Headline `lg:text-8xl`. Centered text. `max-w-4xl mx-auto`. |

### Tailwind Classes (key)
```
Container: relative h-screen w-full overflow-hidden flex items-center justify-center
Image: absolute inset-0 w-full h-full object-cover scale-105
Tint overlay: absolute inset-0 bg-primary/20 mix-blend-multiply
Gradient overlay: absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent
Text container: relative z-10 text-center px-4 max-w-4xl
Overline badge: inline-block font-label text-xs tracking-[0.3em] text-surface-bright uppercase mb-6 bg-primary-container/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10
Headline: font-headline text-5xl md:text-7xl lg:text-8xl text-surface-bright font-bold leading-[1.1] tracking-tight
Subtitle: font-body text-lg md:text-xl text-surface-bright/90 max-w-2xl mx-auto leading-relaxed
Primary CTA: bg-primary-container text-on-primary-container px-10 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 shadow-xl shadow-primary/20
Secondary CTA: text-surface-bright font-semibold flex items-center gap-2 group underline-offset-8 hover:underline
```

---

# OVERLAY COMPONENTS

---

## 35. Component: Modal

**File:** `src/components/overlay/Modal.tsx`
**Type:** Client Component

### Description
Desktop modal dialog with glassmorphic backdrop. Centers content with configurable width.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `isOpen` | `boolean` | Yes | -- | Open/closed state |
| `onClose` | `() => void` | Yes | -- | Close handler |
| `title` | `string` | No | -- | Modal title |
| `size` | `"sm" | "md" | "lg" | "xl" | "full"` | No | `"md"` | Modal width |
| `closeOnBackdrop` | `boolean` | No | `true` | Close when clicking backdrop |
| `showCloseButton` | `boolean` | No | `true` | Show X close button |
| `children` | `ReactNode` | Yes | -- | Modal content |
| `footer` | `ReactNode` | No | -- | Footer with action buttons |

### Size Map
| Size | Max Width |
|---|---|
| `sm` | `max-w-sm` (384px) |
| `md` | `max-w-md` (448px) |
| `lg` | `max-w-lg` (512px) |
| `xl` | `max-w-2xl` (672px) |
| `full` | `max-w-[90vw]` |

### States
| State | Visual Description |
|---|---|
| closed | Not rendered. |
| opening | Backdrop fades in, modal scales from 95% to 100%: `transition-all duration-300`. |
| open | Glassmorphic backdrop, centered white modal with shadow. |
| closing | Reverse of opening animation. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full width `mx-4`, `max-h-[90vh]`, slides up from bottom. Rounded top corners. |
| 768px (md) | Centered with max-width. `rounded-2xl`. |
| 1280px (xl) | Same as md. |

### Tailwind Classes (key)
```
Backdrop: fixed inset-0 z-[90] bg-on-surface/30 backdrop-blur-sm flex items-center justify-center
Modal: bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
Header: flex justify-between items-center p-6 border-b border-outline-variant/10
Title: font-headline text-xl font-bold text-primary
Close: w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant
Body: p-6 overflow-y-auto flex-1
Footer: p-6 border-t border-outline-variant/10 flex justify-end gap-3
```

### Accessibility
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
- Focus trap when open
- `Escape` key closes
- Returns focus to trigger element on close
- Body scroll locked when open

---

## 36. Component: Drawer

**File:** `src/components/overlay/Drawer.tsx`
**Type:** Client Component

### Description
Slide-in panel from right or bottom. Used for mobile navigation, filter panels, and detail views.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `isOpen` | `boolean` | Yes | -- | Open/closed state |
| `onClose` | `() => void` | Yes | -- | Close handler |
| `side` | `"right" | "bottom" | "left"` | No | `"right"` | Slide direction |
| `title` | `string` | No | -- | Drawer title |
| `width` | `string` | No | `"w-80"` | Width (for left/right) |
| `children` | `ReactNode` | Yes | -- | Drawer content |

### States
| State | Visual Description |
|---|---|
| closed | Off-screen: `translate-x-full` (right) or `translate-y-full` (bottom). |
| open | Slides in: `translate-x-0` / `translate-y-0`. Backdrop overlay visible. |

### Responsive
| Breakpoint | Layout |
|---|---|
| 375px (base) | Full height for side drawers. Bottom drawer: `max-h-[80vh] rounded-t-3xl`. |
| 768px (md) | Side drawers: `w-80`. Bottom drawer: `max-w-lg mx-auto`. |
| 1280px (xl) | May not be needed on desktop (use Modal instead). |

### Tailwind Classes (key)
```
Backdrop: fixed inset-0 z-[60] bg-on-background/20 backdrop-blur-sm
Right drawer: fixed right-0 top-0 h-full z-[70] bg-surface shadow-2xl shadow-primary/10 transition-transform duration-300
Bottom drawer: fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-3xl shadow-2xl transition-transform duration-300
Header: px-6 py-4 flex justify-between items-center
Title: font-headline text-lg font-bold text-primary
Close: text-on-surface-variant hover:text-on-surface
```

### Accessibility
- `role="dialog"`, `aria-modal="true"`
- Focus trap when open
- `Escape` key closes
- Swipe gesture support for mobile (bottom drawer)

---

## 37. Component: ConfirmDialog

**File:** `src/components/overlay/ConfirmDialog.tsx`
**Type:** Client Component

### Description
Confirmation dialog for destructive or important actions. Built on top of Modal component.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `isOpen` | `boolean` | Yes | -- | Open/closed state |
| `onConfirm` | `() => void` | Yes | -- | Confirm action handler |
| `onCancel` | `() => void` | Yes | -- | Cancel/close handler |
| `title` | `string` | Yes | -- | Dialog title |
| `message` | `string` | Yes | -- | Confirmation message |
| `confirmLabel` | `string` | No | `"Confirm"` | Confirm button text |
| `cancelLabel` | `string` | No | `"Cancel"` | Cancel button text |
| `variant` | `"danger" | "warning" | "info"` | No | `"danger"` | Determines confirm button style |
| `loading` | `boolean` | No | `false` | Loading state on confirm button |

### States
| State | Visual Description |
|---|---|
| open | Small centered modal (`max-w-sm`) with icon, title, message, two buttons. |
| danger | Confirm button uses `bg-error text-on-error`. Warning icon in `text-error`. |
| warning | Confirm button uses `bg-amber-500 text-white`. |
| info | Confirm button uses `bg-primary-container text-white`. |
| confirming | Confirm button shows spinner, disabled. Cancel still available. |

### Tailwind Classes (key)
```
Container: (uses Modal size="sm")
Icon: material-symbols-outlined text-4xl text-error mb-4 mx-auto
Title: font-headline text-lg font-bold text-primary text-center mb-2
Message: text-on-surface-variant text-sm text-center mb-6
Button row: flex gap-3 w-full
Cancel: flex-1 py-3 bg-surface-container-low rounded-xl font-semibold text-primary hover:bg-surface-container transition-colors
Confirm (danger): flex-1 py-3 bg-error text-on-error rounded-xl font-semibold hover:bg-error/90 transition-colors
```

### Accessibility
- `role="alertdialog"`, `aria-describedby` pointing to message
- Focus starts on cancel button (safe default)
- `Escape` triggers cancel

---

# ADMIN COMPONENTS

---

## 38. Component: EditBlock

**File:** `src/components/admin/EditBlock.tsx`
**Type:** Client Component

### Description
Page builder editable section wrapper. Shows dashed outline and edit trigger button when in edit mode. Extracted from `vietnet_homepage_edit_mode_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `blockId` | `string` | Yes | -- | Unique block identifier |
| `blockType` | `"text" | "image" | "section" | "hero" | "gallery"` | Yes | -- | Type of editable content |
| `isEditMode` | `boolean` | Yes | -- | Whether edit mode is active |
| `onEdit` | `(blockId: string) => void` | Yes | -- | Edit trigger handler |
| `children` | `ReactNode` | Yes | -- | Block content |
| `label` | `string` | No | -- | Tooltip label for edit button |

### States
| State | Visual Description |
|---|---|
| view mode | No visual decoration. Renders children as-is. |
| edit mode | Dashed outline around content, edit trigger button at top-right corner. |
| hover (edit mode) | Outline becomes more prominent: `outline-[#6f4e37]` at higher opacity. |

### Tailwind Classes (key)
```
Edit mode wrapper: relative outline-2 outline-dashed outline-[#6f4e37] outline-offset-4
Edit trigger: absolute -top-3 -right-3 bg-primary-container text-white rounded-full p-1 flex items-center justify-center cursor-pointer z-40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-110 transition-transform
Edit icon: material-symbols-outlined text-sm
```

### Custom CSS
```css
.edit-block {
  position: relative;
  outline: 2px dashed #6f4e37;
  outline-offset: 4px;
}
.edit-trigger {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #6f4e37;
  color: white;
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 40;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Accessibility
- Edit trigger: `aria-label="Edit [blockType] block"`
- Tab-accessible in edit mode
- `role="region"` with `aria-label` describing the block content

---

## 39. Component: AdminToolbar

**File:** `src/components/admin/AdminToolbar.tsx`
**Type:** Client Component

### Description
Fixed top toolbar displayed when page builder is in edit mode. Contains mode indicator, cancel and save buttons. Extracted from `vietnet_homepage_edit_mode_desktop` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `pageName` | `string` | Yes | -- | Name of page being edited |
| `onSave` | `() => void` | Yes | -- | Save handler |
| `onCancel` | `() => void` | Yes | -- | Cancel handler |
| `isSaving` | `boolean` | No | `false` | Saving state |
| `hasChanges` | `boolean` | No | `false` | Whether unsaved changes exist |

### States
| State | Visual Description |
|---|---|
| default | Dark bar at very top of page, above GlassNav. Edit mode label + page name left, Cancel + Save buttons right. |
| saving | Save button shows spinner, disabled. Cancel still available. |
| has changes | Save button pulsates subtly or has accent indicator. |
| no changes | Save button appears muted/disabled. |

### Tailwind Classes (key)
```
Container: fixed top-0 left-0 w-full z-[100] bg-on-surface text-surface py-3 px-8 flex justify-between items-center shadow-xl
Mode indicator: flex items-center gap-4
Mode icon: material-symbols-outlined text-primary-fixed-dim
Mode label: font-label text-xs uppercase tracking-[0.2em] font-bold
Button group: flex items-center gap-3
Cancel: px-6 py-2 bg-surface/10 hover:bg-surface/20 transition-colors rounded-xl font-label text-xs uppercase tracking-widest
Save: px-6 py-2 bg-primary-container text-white hover:bg-primary transition-colors rounded-xl font-label text-xs uppercase tracking-widest shadow-lg
```

### Accessibility
- `role="toolbar"`, `aria-label="Page editor toolbar"`
- Save: `aria-busy="true"` when saving
- Keyboard: `Tab` navigates between buttons

---

## 40. Component: ActivityTimeline

**File:** `src/components/admin/ActivityTimeline.tsx`
**Type:** Server Component

### Description
Vertical timeline of recent admin activities. Each item has an icon node, title, description, and timestamp. Connected by a vertical line. Extracted from `vietnet_mobile_admin_c_gi_h_ng` prototype.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `items` | `ActivityItem[]` | Yes | -- | Array of `{ icon: string, title: string, description: string, timestamp: string, image?: string, iconFilled?: boolean }` |
| `maxItems` | `number` | No | -- | Limit visible items (show "View All" link) |
| `onViewAll` | `() => void` | No | -- | View all handler |

### States
| State | Visual Description |
|---|---|
| default | Vertical list with connected timeline line, icon nodes, and content. |
| with image | Activity item includes small image thumbnail next to content. |
| loading | Skeleton timeline items. |
| empty | EmptyState: "No recent activity". |

### Tailwind Classes (key)
```
Container: space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/30
Item: relative pl-10
Icon node: absolute left-0 top-1 w-6 h-6 rounded-full bg-surface flex items-center justify-center ring-4 ring-surface
Icon: material-symbols-outlined text-primary text-sm (font-variation-settings: 'FILL' 1 if iconFilled)
Title: text-sm font-bold text-on-surface
Description: text-xs text-on-surface-variant
Timestamp: text-[10px] text-outline mt-1 block
Thumbnail: w-12 h-12 rounded-lg object-cover
Header: flex justify-between items-end mb-6
Section title: text-sm font-label uppercase tracking-widest text-secondary font-bold
View all: text-xs text-primary font-bold underline underline-offset-4
```

---

## 41. Component: NotificationBell

**File:** `src/components/admin/NotificationBell.tsx`
**Type:** Client Component

### Description
Bell icon button with unread notification count badge. Opens a dropdown panel with notification list on click.

### Props
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `count` | `number` | No | `0` | Unread notification count |
| `notifications` | `Notification[]` | No | `[]` | Array of `{ id: string, title: string, message: string, timestamp: string, read: boolean, type: "info" | "warning" | "success" }` |
| `onNotificationClick` | `(id: string) => void` | No | -- | Notification item click handler |
| `onMarkAllRead` | `() => void` | No | -- | Mark all as read handler |
| `maxVisible` | `number` | No | `5` | Max notifications in dropdown |

### States
| State | Visual Description |
|---|---|
| default (no unread) | Bell icon without badge. |
| with unread | Red badge with count: `absolute -top-1 -right-1 bg-error text-white text-[10px] rounded-full w-4 h-4`. |
| dropdown open | Notification panel drops below bell. `bg-surface-container-lowest rounded-xl shadow-xl`. |
| hover | `hover:bg-surface-container-high transition-colors`. |

### Tailwind Classes (key)
```
Button: relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors
Badge: absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white font-bold
Dropdown: absolute top-12 right-0 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 overflow-hidden z-50
Header: flex justify-between items-center px-4 py-3 border-b border-outline-variant/10
Notification item: px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3
Unread indicator: w-2 h-2 rounded-full bg-primary-container flex-shrink-0 mt-2
Item title: text-sm font-semibold text-on-surface
Item message: text-xs text-on-surface-variant line-clamp-2
Item time: text-[10px] text-outline
```

### Accessibility
- Button: `aria-label="Notifications, X unread"`, `aria-expanded`, `aria-haspopup="true"`
- Dropdown: `role="menu"`, items `role="menuitem"`
- `Escape` closes dropdown
- Arrow keys navigate items

---

# APPENDIX: SHARED PATTERNS

---

## A. Horizontal Scroll Container

Used by FilterChip, MaterialSwatch, and mobile ProjectCard carousel.

```
flex overflow-x-auto gap-3 no-scrollbar snap-x snap-mandatory
```

Hide scrollbar CSS:
```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## B. Gradient Divider

Replacement for 1px borders between sections.

```
<div class="h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
```

---

## C. Section Overline Pattern

Used above section headings throughout the site.

```
<span class="font-label text-xs tracking-[0.2em] text-primary uppercase mb-4 block">Section Label</span>
<h2 class="font-headline text-4xl md:text-5xl text-primary font-bold">Section Title</h2>
```

---

## D. Asymmetric Grid Staggering

Used in product grids and project grids to break uniform appearance.

```
<div class="grid grid-cols-2 gap-4">
  <div class="group flex flex-col gap-3">...</div>
  <div class="group flex flex-col gap-3 mt-8">...</div>    <!-- offset down -->
  <div class="group flex flex-col gap-3 -mt-8">...</div>   <!-- offset up -->
  <div class="group flex flex-col gap-3">...</div>
</div>
```

Desktop variant with `md:mt-12` on alternating columns.

---

## E. Text Selection Styling

Applied globally via body class.

```
selection:bg-primary-container selection:text-white
```

---

## F. Material Symbols Default Config

Applied globally:
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}
```

Filled variant (active states, star ratings):
```css
font-variation-settings: 'FILL' 1;
```

---

## G. Body Min-Height (Mobile)

Ensures full-screen coverage:
```css
body {
  min-height: max(884px, 100dvh);
}
```

---

## H. Tailwind Color Config Reference

All components reference these extended colors in `tailwind.config.ts`:

```typescript
colors: {
  "primary": "#553722",
  "primary-container": "#6f4e37",
  "on-primary": "#ffffff",
  "on-primary-container": "#eec1a4",
  "secondary": "#6d5b4f",
  "secondary-container": "#f7decf",
  "on-secondary-container": "#736155",
  "tertiary": "#24434b",
  "tertiary-container": "#3c5a63",
  "on-tertiary-container": "#b0d0db",
  "surface": "#fcf9f7",
  "surface-bright": "#fcf9f7",
  "surface-dim": "#dcd9d8",
  "surface-container-lowest": "#ffffff",
  "surface-container-low": "#f6f3f1",
  "surface-container": "#f0edeb",
  "surface-container-high": "#eae8e6",
  "surface-container-highest": "#e5e2e0",
  "surface-variant": "#e5e2e0",
  "on-surface": "#1b1c1b",
  "on-surface-variant": "#50453e",
  "on-background": "#1b1c1b",
  "outline": "#82746d",
  "outline-variant": "#d4c3ba",
  "surface-tint": "#79573f",
  "inverse-surface": "#30302f",
  "inverse-on-surface": "#f3f0ee",
  "inverse-primary": "#eabda0",
  "primary-fixed": "#ffdcc6",
  "primary-fixed-dim": "#eabda0",
  "error": "#ba1a1a",
  "error-container": "#ffdad6",
  "on-error": "#ffffff",
  "on-error-container": "#93000a",
}
```

---

## I. Border Radius Config Reference

```typescript
borderRadius: {
  "DEFAULT": "0.125rem",  // 2px
  "lg": "0.25rem",        // 4px
  "xl": "0.5rem",         // 8px -- standard cards, buttons
  "full": "0.75rem",      // 12px -- pills, prominent elements
  // Additionally used via Tailwind: rounded-2xl (1rem), rounded-3xl (1.5rem), rounded-full (50%)
}
```

---

## J. Font Family Config Reference

```typescript
fontFamily: {
  "headline": ["Noto Serif"],
  "body": ["Manrope"],
  "label": ["Manrope"],
}
```

---

*End of Component Specifications. All 41 components documented.*
*This document is the single source of truth for Agent_Develop_FE implementation.*
