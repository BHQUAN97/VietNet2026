# 06. Page Builder

> Module: B5 (Page Builder) | Features: B5.1-B5.7
> Priority: P0 | Status: Spec Done

---

## Summary

He thong cho phep admin tuy chinh noi dung va layout trang chu truc quan, khong can code. Homepage duoc cau hinh bang JSON config voi cac section types (hero, about, featured projects, materials, testimonials, CTA form, stats). Ho tro draft/publish workflow, auto-save, version history (5 versions), va rollback. Admin xem truoc qua Next.js Draft Mode truoc khi publish.

---

## Workflow

### Edit Mode
```
Admin vao Edit Mode:
  → [1] Load draft config: GET /api/pages/homepage/draft
  → [2] Toolbar hien thi: Edit Triggers tren moi section
  → [3] Admin chinh sua:
      - Keo tha sap xep sections (drag-and-drop)
      - Toggle visible/hidden tung section
      - Edit noi dung: text, hinh anh, links
      - Them section moi tu template list
  → [4] Auto-save: PUT /api/pages/homepage moi 30 giay
```

### Preview (Draft Mode)
```
Admin click "Preview":
  → [1] Activate Next.js Draft Mode (set cookie)
  → [2] Redirect trang chu voi banner "PREVIEW MODE"
  → [3] Homepage render tu config_draft (thay vi config_published)
  → [4] Admin kiem tra ket qua
  → [5] Exit preview: xoa Draft Mode cookie
```

### Publish Flow
```
Admin click "Publish":
  → [1] Save snapshot config_published hien tai vao history
  → [2] Xoa history cu nhat neu > 5 versions
  → [3] Copy config_draft → config_published
  → [4] Increment version number
  → [5] Invalidate Redis cache: DEL cache:homepage:config
  → [6] Tra 200 { version: newVersion }
```

### Rollback
```
Admin chon version cu:
  → [1] Load config_snapshot tu page_config_history
  → [2] Copy vao config_draft
  → [3] Admin review va publish lai
```

---

## Giai phap chi tiet

### API Endpoints (5 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/pages/homepage` | @Public | Config published (cached) |
| GET | `/api/pages/homepage/draft` | @Admin | Config draft |
| PUT | `/api/pages/homepage` | @Admin | Save draft (auto-save) |
| POST | `/api/pages/homepage/publish` | @Admin | Publish draft → live |
| GET | `/api/pages/homepage/sections` | @Admin | List section types co san |

### Section Types

| Type | Mo ta | Config chinh |
|------|-------|-------------|
| `hero` | Full-viewport hero banner | image_url, headline, description, 2 CTAs, stats |
| `about` | Gioi thieu cong ty | headline, content (HTML), image_url, stats |
| `featured_projects` | Grid du an noi bat | headline, project_ids (max 6) |
| `materials` | Mau vat lieu | headline, items: [name, image, filter_slug] |
| `testimonials` | Danh gia khach hang | headline, items: [content, author, rating] |
| `cta_form` | Form tu van | headline, description, background_image |
| `stats` | Counter animation | items: [label, value, suffix] |
| `custom_html` | HTML tu do | content (sanitized) |

### JSON Config Structure

```json
{
  "sections": [
    {
      "id": "unique-id",
      "type": "hero",
      "order": 0,
      "visible": true,
      "config": {
        "image_url": "...",
        "headline": "Crafting Silent Elegance.",
        "cta_primary": { "text": "Kham Pha Du An", "url": "/projects" },
        "stats": [{ "label": "Du an", "value": "500+" }]
      }
    }
  ]
}
```

### DB Tables

**page_configs:**
- id, page_slug (unique: 'homepage', 'about', 'contact')
- config_draft (JSON) — luon up-to-date voi admin edits
- config_published (JSON) — chi thay doi khi publish
- version (INT), published_at, published_by

**page_config_history:**
- id, page_config_id (FK), config_snapshot (JSON)
- version, published_at, published_by
- Giu toi da 5 versions/page

### Caching

```
cache:homepage:config  → TTL 600s (10 min)
Invalidate khi: publish action
```

### Conflict Handling

- Optimistic locking: check `version` truoc khi save
- Neu 2 admin edit cung luc → admin thu 2 nhan 409 Conflict
- Socket.io event khi co nguoi bat dau editing

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- CMS module (projects, products) da hoan thanh — Page Builder reference project_ids
- Media module da hoan thanh — image picker cho hero, about sections
- Next.js Draft Mode API routes da co

### File Structure

```
backend/src/modules/pages/
├── pages.module.ts
├── pages.service.ts             # CRUD config, publish, version history
├── pages.controller.ts          # 5 endpoints
├── entities/
│   ├── page-config.entity.ts    # page_slug, config_draft, config_published, version
│   └── page-config-history.entity.ts  # snapshots
└── dto/
    ├── update-page-config.dto.ts # sections: Array<SectionDto>
    └── section.dto.ts            # type, order, visible, config

frontend/src/
├── app/(public)/page.tsx        # Homepage — render tu config_published
├── app/admin/pages/page.tsx     # Page builder editor
├── components/admin/
│   ├── PageBuilder.tsx           # Main editor container
│   ├── SectionEditor.tsx         # Per-section edit panel
│   ├── SectionRenderer.tsx       # Render section by type
│   ├── DragDropSections.tsx      # Sortable section list
│   └── HeroEditor.tsx, AboutEditor.tsx, ...  # Section-specific editors
├── components/public/
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── FeaturedProjects.tsx
│   ├── MaterialSamples.tsx
│   ├── Testimonials.tsx
│   ├── CTAForm.tsx
│   └── StatsCounter.tsx
└── app/api/draft/
    ├── enable/route.ts           # Set Draft Mode cookie
    └── disable/route.ts          # Clear Draft Mode
```

### Thu tu implement (Backend)

**Buoc 1: Entities**
```
page-config.entity.ts:
  - page_slug: VARCHAR(100), UNIQUE (e.g., 'homepage')
  - config_draft: JSON — luon up-to-date voi admin edits
  - config_published: JSON — chi thay doi khi publish
  - version: INT UNSIGNED, default 1
  - published_at, published_by (FK users)
  - updated_at, updated_by

page-config-history.entity.ts:
  - page_config_id (FK, CASCADE)
  - config_snapshot: JSON
  - version: INT
  - published_at, published_by
```

**Buoc 2: Pages Service**
```typescript
@Injectable()
export class PagesService {
  // getPublished(pageSlug):
  //   1. Check Redis cache:homepage:config
  //   2. Neu miss: SELECT config_published FROM page_configs WHERE page_slug = ?
  //   3. Cache vao Redis TTL 600s
  //   4. Return parsed JSON

  // getDraft(pageSlug): SELECT config_draft (no cache, admin only)

  // saveDraft(pageSlug, sections, userId):
  //   1. Validate JSON structure (type, order, visible, config required)
  //   2. UPDATE config_draft, updated_by, updated_at

  // publish(pageSlug, userId):
  //   1. BEGIN TRANSACTION
  //   2. SELECT current config_published → save to page_config_history
  //   3. DELETE oldest history neu count > 5 (giu max 5)
  //   4. UPDATE: config_published = config_draft, version++, published_at, published_by
  //   5. COMMIT
  //   6. Invalidate Redis: DEL cache:homepage:config
  //   7. Call Next.js revalidate: POST /api/revalidate?secret=XXX&path=/

  // getHistory(pageSlug): SELECT history ORDER BY version DESC LIMIT 5
  // rollback(pageSlug, versionId): Copy config_snapshot → config_draft
}
```

**Buoc 3: Controller**
```
GET /pages/homepage: @Public() → getPublished (cached)
GET /pages/homepage/draft: @AdminOnly() → getDraft
PUT /pages/homepage: @AdminOnly() → saveDraft (auto-save moi 30s)
POST /pages/homepage/publish: @AdminOnly() → publish
GET /pages/homepage/sections: @AdminOnly() → available section types
```

### Frontend Implementation

**Homepage rendering (Public):**
```typescript
// app/(public)/page.tsx
export default async function HomePage() {
  const config = await serverFetch('/pages/homepage');  // SSR
  return (
    <main>
      {config.sections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(section => (
          <SectionRenderer key={section.id} section={section} />
        ))}
    </main>
  );
}

// SectionRenderer.tsx — switch by type
function SectionRenderer({ section }) {
  switch (section.type) {
    case 'hero': return <HeroSection config={section.config} />;
    case 'about': return <AboutSection config={section.config} />;
    case 'featured_projects': return <FeaturedProjects config={section.config} />;
    // ...
  }
}
```

**Page Builder (Admin):**
```
/admin/pages/page.tsx:
  1. Load draft: GET /pages/homepage/draft
  2. Render DragDropSections:
     - @dnd-kit/sortable cho drag-drop sections
     - Moi section: toggle visible, click to edit
  3. Click section → SectionEditor opens (drawer/modal)
     - HeroEditor: upload image, edit headline, CTAs
     - FeaturedProjectsEditor: pick projects (max 6)
     - TestimonialsEditor: add/remove testimonial cards
  4. Auto-save: useEffect + setTimeout 30s → PUT /pages/homepage
  5. Preview button: redirect to /?draft=true (Next.js Draft Mode)
  6. Publish button: POST /pages/homepage/publish → toast "Published v{X}"
```

**Draft Mode:**
```typescript
// app/api/draft/enable/route.ts
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.DRAFT_SECRET) return Response.json({ error: 'Invalid' }, { status: 401 });
  const draft = await import('next/headers').then(m => m.draftMode());
  draft.enable();
  return Response.redirect(new URL('/', req.url));
}

// Homepage checks draftMode():
const { isEnabled } = draftMode();
const endpoint = isEnabled ? '/pages/homepage/draft' : '/pages/homepage';
```

### Testing Checklist

- [ ] Save draft → config_draft updated, khong anh huong published
- [ ] Publish → config_published = config_draft, version++, cache invalidated
- [ ] History: max 5 versions luu, cu nhat bi xoa
- [ ] Rollback: copy snapshot → draft → admin review va publish lai
- [ ] Public homepage: render tu config_published (cached)
- [ ] Draft Mode: render tu config_draft, banner "PREVIEW"
- [ ] Auto-save: PUT moi 30s khi co thay doi
- [ ] Reorder sections: drag-drop update order field
