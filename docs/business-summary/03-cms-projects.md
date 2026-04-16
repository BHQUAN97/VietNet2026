# 03. CMS — Projects & Categories

> Module: A4 (Project Detail) + B3 (Project Mgmt) + Categories
> Priority: P0 | Status: Spec Done

---

## Summary

He thong quan ly du an noi that (portfolio). Admin tao/sua/xoa du an voi workflow Draft → Published. Moi du an co gallery anh, thong tin ky thuat (phong cach, vat lieu, dien tich), va SEO metadata. Public website hien thi du an da published voi SSR cho SEO. Ho tro filter theo category (Residential, Commercial, Hospitality), featured projects tren homepage, va related projects.

---

## Workflow

### Project CRUD (Admin)
```
Tao du an moi:
  → [1] Auth: requireAuth (admin hoac editor)
  → [2] Validate body (title required)
  → [3] Auto-generate slug tu title (strip Vietnamese diacritics)
  → [4] Check slug uniqueness
  → [5] Generate ref_code: "VN-{year}-{seq}"
  → [6] INSERT projects (status='draft', created_by)
  → [7] Neu co gallery images: batch INSERT project_gallery
  → [8] Invalidate cache: DEL cache:projects:list:*
```

### Publish Flow
```
Admin click "Publish":
  → [1] UPDATE status='published', published_at = COALESCE(published_at, NOW())
  → [2] Invalidate caches: projects list, project detail, sitemap, homepage
  → [3] Create notification cho admins
  → [4] Socket.io emit 'project_published' → admin room
```

### Gallery Management
```
Them anh: POST /api/projects/:id/gallery (media_id, alt, order)
Sap xep: PUT /api/projects/:id/gallery/reorder (drag-and-drop)
Xoa anh: DELETE /api/projects/:id/gallery/:imageId (chi xoa association, giu media)
```

### Public View
```
User truy cap /projects/[slug]:
  → SSR render voi Next.js App Router
  → Fetch project detail + gallery tu API
  → Hien thi: Hero image, info, gallery lightbox, related projects
  → SEO: meta tags, OG, JSON-LD, canonical URL
```

---

## Giai phap chi tiet

### API Endpoints — Projects (10 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/projects` | @Public | List published (pagination, filter, search) |
| GET | `/api/projects/:id` | @Public | Detail voi gallery |
| GET | `/api/projects/slug/:slug` | @Public | Detail theo slug (SEO) |
| GET | `/api/projects/featured` | @Public | Featured projects cho homepage (max 6) |
| GET | `/api/projects/related/:id` | @Public | Du an lien quan (same category) |
| POST | `/api/projects` | @Admin | Tao moi |
| PUT | `/api/projects/:id` | @Admin | Cap nhat |
| DELETE | `/api/projects/:id` | @Admin | Soft delete |
| POST | `/api/projects/:id/gallery` | @Admin | Them anh |
| PUT | `/api/projects/:id/gallery/reorder` | @Admin | Sap xep gallery |

### API Endpoints — Categories (4 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/categories` | @Public | List categories (voi project_count) |
| POST | `/api/categories` | @Admin | Tao category |
| PUT | `/api/categories/:id` | @Admin | Cap nhat |
| DELETE | `/api/categories/:id` | @Admin | Soft delete (409 neu co projects) |

### DB Tables

**projects:**
- id, title, slug (unique), description, content (rich HTML)
- category_id (FK), style, materials (JSON array), area, location, year_completed
- cover_image_id (FK → media), status (draft/published), is_featured, view_count
- SEO: seo_title, seo_description, og_image_id
- Audit: created_at, updated_at, deleted_at, created_by, updated_by
- Indexes: slug unique, category, status, is_featured, FULLTEXT(title, description)

**project_gallery:** (junction table)
- id, project_id (FK), media_id (FK), display_order, caption
- Unique: project_id + media_id
- ON DELETE CASCADE ca 2 phia

**categories:**
- id, name, slug, description, type (project/product), parent_id (self-ref, max depth 2)
- display_order, is_active
- Unique: slug + type (cho phep cung slug khac type)

### Default Categories (Seed)

| Name | Slug | Type |
|------|------|------|
| Residential | residential | project |
| Commercial | commercial | project |
| Hospitality | hospitality | project |

### Caching Strategy

```
cache:projects:list:{queryHash}  → TTL 300s (5 min)
cache:project:{slug}             → TTL 600s (10 min)
cache:categories:{type}          → TTL 300s (5 min)
```

Invalidate khi: create/update/delete project hoac category.

### Public Features

- **Featured Projects**: max 6, is_featured=true, sort by featured_order
- **Related Projects**: same category > same style > random published
- **Filter**: by category slug, style, search (FULLTEXT)
- **Pagination**: default 12/page, max 50
- **SEO**: title tag, meta description, OG tags, JSON-LD Article, canonical URL

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth module + Media module da hoan thanh
- BaseService va PublishableService da co trong common/base/

### File Structure

```
backend/src/modules/projects/
├── projects.module.ts
├── projects.service.ts          # Extends PublishableService<Project>
├── projects.controller.ts       # Public + Admin endpoints
├── categories.service.ts        # CRUD categories
├── categories.controller.ts
├── entities/
│   ├── project.entity.ts        # title, slug, content, style, materials, area, status...
│   ├── category.entity.ts       # name, slug, type(project/product), parent_id
│   └── project-gallery.entity.ts # project_id, media_id, display_order, caption
├── dto/
│   ├── create-project.dto.ts    # @IsNotEmpty title, @IsOptional description...
│   ├── update-project.dto.ts    # PartialType(CreateProjectDto)
│   ├── query-project.dto.ts     # extends PaginationDto + category, style, q filters
│   ├── create-category.dto.ts
│   └── gallery.dto.ts           # images: Array<{ media_id, alt, order }>
└── search.service.ts            # Full-text search (MATCH AGAINST)

frontend/src/app/
├── (public)/projects/
│   ├── page.tsx                 # SSR list, filter by category
│   └── [slug]/page.tsx          # SSR detail, gallery, related
├── admin/projects/
│   ├── page.tsx                 # Admin list (useAdminCrud)
│   └── editor/page.tsx          # Create/edit form + GalleryEditor
```

### Thu tu implement (Backend)

**Buoc 1: Entities**
```
project.entity.ts:
  - Ke thua pattern tu products.entity.ts (da co)
  - Them: style, materials (JSON), area, location, year_completed, duration
  - Them: ref_code (auto-gen "VN-{year}-{seq}")
  - Relations: @ManyToOne category, @ManyToOne coverImage (media)
  - Relations: @OneToMany gallery (project_gallery)

category.entity.ts:
  - type: @Column({ type: 'enum', enum: ['project', 'product'] })
  - parent_id: @ManyToOne(() => Category, { nullable: true })
  - Unique: slug + type

project-gallery.entity.ts:
  - @ManyToOne project (CASCADE), @ManyToOne media (CASCADE)
  - display_order, caption
  - Unique: project_id + media_id
```

**Buoc 2: Projects Service**
```typescript
@Injectable()
export class ProjectsService extends PublishableService<Project> {
  protected readonly slugSourceField = 'title';
  protected readonly queryAlias = 'p';
  protected readonly defaultRelations = ['category', 'coverImage'];
  protected readonly detailRelations = ['category', 'coverImage', 'gallery', 'gallery.media'];
  protected readonly sortAllowlist = {
    created_at: 'p.created_at',
    title: 'p.title',
    display_order: 'p.display_order',
  };

  // Override beforeSave: sanitizeHtml(content), validateCategory, generateRefCode
  // findFeatured(limit=6): WHERE is_featured=true AND status='published'
  // findRelated(id, limit=3): same category > same style > random
  // manageGallery(projectId, images[]): sync project_gallery via MediaAssociation
  // reorderGallery(projectId, order[]): UPDATE display_order
}
```

**Buoc 3: Controller**
```
Public routes (@Public):
  GET /projects         → findPublished(query) + pagination
  GET /projects/:id     → findOne (chi published)
  GET /projects/slug/:slug → findPublishedBySlug
  GET /projects/featured → findFeatured(limit)
  GET /projects/related/:id → findRelated(id, limit)

Admin routes (@AdminOnly):
  POST /projects        → create (status='draft')
  PUT /projects/:id     → update
  DELETE /projects/:id  → softDelete
  POST /projects/:id/gallery → addGalleryImages
  PUT /projects/:id/gallery/reorder → reorderGallery
  DELETE /projects/:id/gallery/:imageId → removeGalleryImage
```

**Buoc 4: Categories**
```
- CategoriesService extends BaseService<Category>
- findByType(type): WHERE type=? AND deleted_at IS NULL
- Them project_count computed field: COUNT published projects
- DELETE: check khong cho xoa neu co published projects (throw 409)
- Seed defaults: Residential, Commercial, Hospitality
```

**Buoc 5: Cache Invalidation**
```typescript
// Trong afterSave / afterDelete hooks:
async afterSave(entity: Project) {
  await this.redis.del('cache:projects:list:*');  // pattern delete
  await this.redis.del(`cache:project:${entity.slug}`);
  await this.redis.del('cache:sitemap');
  if (entity.is_featured) await this.redis.del('cache:homepage:config');
}
```

### Frontend Implementation

**Public pages (SSR):**
```
/projects/page.tsx:
  - generateMetadata(): title, description, OG
  - fetch server-side: GET /projects?status=published&category=X&page=1
  - Filter UI: category buttons/chips
  - Grid: 3 col desktop, 2 col mobile
  - Pagination component

/projects/[slug]/page.tsx:
  - generateMetadata(): dynamic tu project data
  - fetch: GET /projects/slug/{slug}
  - Sections: Hero image, Project info, Gallery (lightbox), Related projects
  - JSON-LD: @type=Article
  - SEO: canonical, OG, twitter card
```

**Admin pages:**
```
/admin/projects/page.tsx:
  - useAdminCrud<Project>({ endpoint: '/projects' })
  - Table: thumbnail, title, category, status, actions
  - Filters: category dropdown, status dropdown, search

/admin/projects/editor/page.tsx:
  - Form: title, slug (auto-gen), rich text editor (TipTap), category select
  - GalleryEditor component (drag-drop)
  - SEO fields: seo_title, seo_description, og_image picker
  - Buttons: Save Draft, Publish, Preview
```

### Testing Checklist

- [ ] Create project → auto-slug, auto-ref_code, status='draft'
- [ ] Slug duplicate → 409
- [ ] Publish → published_at set, cache invalidated
- [ ] Public API: chi tra published projects
- [ ] Gallery: add, reorder (display_order), remove
- [ ] Related: same category > same style > random
- [ ] Featured: max 6, is_featured=true
- [ ] SSR render: meta tags dung, JSON-LD dung
- [ ] Delete category co projects → 409
