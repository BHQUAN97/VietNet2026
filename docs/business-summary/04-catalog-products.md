# 04. Product Catalog (Tu Bep)

> Module: A3 (Catalog) + A5 (Product Detail) + B3 (Product Mgmt)
> Priority: P0 | Status: Spec Done

---

## Summary

Danh muc san pham tu bep. Khach hang duyet, loc theo vat lieu (Go Cong Nghiep, Go Tu Nhien, Acrylic, Melamine, Kinh), xem chi tiet san pham voi gallery anh, thong so ky thuat, mau sac co san. Admin quan ly CRUD san pham voi draft/published workflow. Ho tro filter sidebar (desktop), bottom sheet + chips (mobile), pagination, va related products.

---

## Workflow

### Public — Browse Catalog
```
User vao /catalog:
  → [1] Load filter chips/sidebar: "All Materials", "Go Cong Nghiep", ...
  → [2] Fetch products: GET /api/products?material=&page=1&limit=9
  → [3] Hien thi grid: 3 col desktop, 2 col staggered mobile
  → [4] Click filter → URL update (?material=industrial-wood)
  → [5] Product count hien thi: "12 ITEMS"
  → [6] Pagination: page numbers (desktop), dots + "Load More" (mobile)
```

### Public — Product Detail
```
User click product card:
  → [1] Navigate to /catalog/[slug]
  → [2] Fetch: GET /api/products/slug/:slug
  → [3] Hien thi: Gallery (main + thumbnails), ten, vat lieu tag, mo ta
  → [4] Material specs: xuat xu, do ben, bao tri, color swatches
  → [5] CTA: "Yeu Cau Tu Van" → prefill consultation form voi product_id
  → [6] Related products: same material_type > same category
  → [7] SEO: meta, OG, JSON-LD
```

### Admin — Product CRUD
```
Tuong tu Project CRUD:
  → Create voi auto-slug, draft status
  → Add/remove product images
  → Publish/unpublish
  → Soft delete
```

---

## Giai phap chi tiet

### API Endpoints (9 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/products` | @Public | List (filter, pagination, search) |
| GET | `/api/products/:id` | @Public | Detail voi specs + images |
| GET | `/api/products/slug/:slug` | @Public | Detail theo slug |
| GET | `/api/products/related/:id` | @Public | San pham lien quan (max 8) |
| POST | `/api/products` | @Admin | Tao moi |
| PUT | `/api/products/:id` | @Admin | Cap nhat |
| DELETE | `/api/products/:id` | @Admin | Soft delete |
| POST | `/api/products/:id/images` | @Admin | Them anh |
| DELETE | `/api/products/:id/images/:imageId` | @Admin | Xoa anh |

### Filter Parameters

```
?material_type=industrial-wood   — Loc theo vat lieu
?finish=matte                    — Loc theo be mat
?category_id=xxx                 — Loc theo category
?sort=created_at&order=desc      — Sap xep
?q=tu+bep+go                     — Tim kiem (FULLTEXT)
?page=1&limit=9                  — Pagination
```

### Material Types (Default)

| Name | Slug | Mo ta |
|------|------|-------|
| Go Cong Nghiep | industrial-wood | MDF, HDF, Plywood |
| Go Tu Nhien | natural-wood | Oak, Walnut, Ash |
| Kinh Cuong Luc | glass-fronted | Mat kinh trong |
| Acrylic | acrylic | Bong, nhieu mau |
| Melamine | melamine | Chong tray, gia re |

### DB Table: products

| Column | Type | Mo ta |
|--------|------|-------|
| id | VARCHAR(26) | ULID |
| name, slug | VARCHAR(255) | Unique slug |
| description | TEXT | Rich HTML |
| material_type | VARCHAR(100) | Filter key |
| finish | VARCHAR(100) | Matte, High Gloss, Textured |
| dimensions | JSON | { width, height, depth, unit: "mm" } |
| price_range | VARCHAR(100) | Display text |
| status | ENUM | draft / published |
| is_new | TINYINT(1) | Badge "NEW" (auto-expire 30 ngay) |
| seo_title, seo_description | VARCHAR | SEO |

### product_images (junction table)
- product_id + media_id (unique)
- display_order, is_primary, caption
- ON DELETE CASCADE

### UX Chi tiet

**Desktop:**
- Sidebar filter ben trai (250px)
- Grid 3 col
- Page numbers: < 1 2 3 >
- Card hover: image zoom 1.05, transition 300ms

**Mobile:**
- Filter chips cuon ngang (snap)
- Bottom sheet khi tap "Filter & Sort"
- Grid 2 col staggered/masonry
- Dots indicator + "LOAD MORE ITEMS"
- Card: NEW badge, star rating, VIEW DETAILS button
- Touch target: 44x44px

### Caching

```
cache:products:list:{queryHash}  → TTL 300s
cache:product:{slug}             → TTL 600s
```

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth + Media + Categories da hoan thanh
- PublishableService pattern da co

### File Structure

```
backend/src/modules/products/
├── products.module.ts
├── products.service.ts          # Extends PublishableService<Product>
├── products.controller.ts
├── entities/
│   ├── product.entity.ts        # name, slug, material_type, finish, dimensions, price_range
│   └── product-image.entity.ts  # Junction: product_id, media_id, display_order, is_primary
└── dto/
    ├── create-product.dto.ts
    ├── update-product.dto.ts
    ├── query-product.dto.ts     # material_type, finish, category_id, q, pagination
    └── update-images.dto.ts

frontend/src/app/
├── (public)/catalog/
│   ├── page.tsx                 # Product list + filter
│   └── [slug]/page.tsx          # Product detail + specs + CTA
├── admin/products/page.tsx      # Admin product management
```

### Thu tu implement (Backend)

**Buoc 1: Product Entity**
```
product.entity.ts (da co trong codebase, can bo sung):
  - material_type: VARCHAR(100), INDEX
  - finish: VARCHAR(100)
  - dimensions: JSON { width, height, depth, unit }
  - price_range: VARCHAR(100)
  - is_new: TINYINT(1), default 0
  - Relation: @ManyToOne category, @ManyToOne coverImage
  - Relation: @OneToMany productImages
```

**Buoc 2: Products Service**
```typescript
@Injectable()
export class ProductsService extends PublishableService<Product> {
  protected readonly slugSourceField = 'name';
  protected readonly queryAlias = 'prod';
  protected readonly defaultRelations = ['category', 'coverImage'];
  protected readonly detailRelations = ['category', 'coverImage', 'images', 'images.media'];

  // findPublished: them filter material_type, finish
  // Override applyFilters: them material_type, finish, category_id
  // findRelated(id, limit): same material_type > same category > random
  // computed is_new: created_at > NOW() - 30 days (trong query hoac afterLoad)
}
```

**Buoc 3: Controller**
```
Public: GET /products, GET /products/:id, GET /products/slug/:slug, GET /products/related/:id
Admin: POST, PUT, DELETE, POST /:id/images, DELETE /:id/images/:imgId
```

### Frontend Implementation

**Catalog page (SSR, mobile-first):**
```
/catalog/page.tsx:
  - Desktop: sidebar filter (250px) + grid 3 col
  - Mobile: chips cuon ngang + grid 2 col staggered
  - Filter logic: URL search params (?material=industrial-wood&page=1)
  - "LOAD MORE" button (mobile) hoac page numbers (desktop)
  - Product count: "12 ITEMS"

Components can tao:
  - FilterSidebar.tsx (desktop, >= 1024px)
  - FilterBottomSheet.tsx (mobile, bottom sheet truot len)
  - FilterChips.tsx (mobile, horizontal scroll)
  - ProductCard.tsx (image, name, material tag, price, NEW badge, star)
  - ProductGrid.tsx (responsive 3/2/1 col)
```

**Product detail page (SSR):**
```
/catalog/[slug]/page.tsx:
  - Gallery: main image + thumbnails (click to switch)
  - Info: name, material tag, description (rich text)
  - Specs: origin, durability, maintenance, color swatches
  - CTA: "Yeu Cau Tu Van" → link /contact?product_id=xxx
  - Related products: grid 4 items
  - SEO: meta, OG, JSON-LD Product
```

### Testing Checklist

- [ ] Filter material_type → URL update, list filter dung
- [ ] Pagination: page numbers desktop, load more mobile
- [ ] Product detail: gallery click, specs render
- [ ] Related: same material > same category
- [ ] is_new: badge hien thi cho product < 30 ngay
- [ ] SSR: meta tags, JSON-LD Product
