# SA_DB_SCHEMA -- Database Schema VietNet Interior

> **Version:** 1.0 | **Database:** MySQL 8.0 | **ORM:** TypeORM
> **Status:** SA_DONE
> **Ngay tao:** 2026-03-27
> **Tac gia:** Agent_SA
> **Reference:** BA_FEATURE_SPEC.md v1.0

---

## CONVENTIONS

| Convention | Rule |
|---|---|
| Primary key | `id` VARCHAR(26) -- ULID, generated server-side |
| Timestamps | `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP |
| Update tracking | `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |
| Soft delete | `deleted_at` DATETIME NULL -- NULL = active, NOT NULL = soft-deleted |
| Audit (create) | `created_by` VARCHAR(26) NULL -- FK to users.id, NULL for system/public actions |
| Audit (update) | `updated_by` VARCHAR(26) NULL -- FK to users.id |
| Strings | VARCHAR with explicit max length, never TEXT unless rich content |
| Rich content | TEXT type for HTML content, descriptions, notes |
| Boolean | TINYINT(1) -- 0 = false, 1 = true |
| Enum | ENUM type with explicit values, never magic strings |
| JSON | JSON type for flexible/nested data |
| Naming | snake_case for all columns and tables |
| Foreign keys | `{table_singular}_id` naming, e.g., `category_id`, `user_id` |
| Indexes | Prefix `idx_{table}_{column}` for single, `idx_{table}_{col1}_{col2}` for composite |
| Charset | utf8mb4 with utf8mb4_unicode_ci collation (Vietnamese support) |

---

## TABLE 1: users

Supports: B1.1 Login, B1.2 Forgot Password, B1.3 Session Management, B7.1-B7.4 User Management

```sql
CREATE TABLE users (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,                     -- bcrypt, min cost 12
  name              VARCHAR(100) NOT NULL,
  role              ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
  avatar_url        VARCHAR(500) NULL,
  last_login_at     DATETIME NULL,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,             -- soft disable without delete
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,

  UNIQUE INDEX uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_is_active (is_active),
  INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `password_hash`: bcrypt with cost factor 12. Never store plaintext.
- `role`: 'admin' has full access; 'editor' can only manage projects/products/consultations (ref B7.3).
- `is_active`: used for soft-disable by super admin (ref B7.4). User with `is_active=0` cannot login.
- `deleted_at`: soft delete. Queries MUST filter `WHERE deleted_at IS NULL` unless explicitly including deleted records.
- The first admin created during seed is the "super admin" and cannot be deleted (ref B7.4).

---

## TABLE 2: refresh_tokens

Supports: B1.3 Session Management, C6 Security

```sql
CREATE TABLE refresh_tokens (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,
  token_hash        VARCHAR(255) NOT NULL,                     -- SHA-256 hash of refresh token
  expires_at        DATETIME NOT NULL,
  revoked_at        DATETIME NULL,                             -- NULL = active, set when revoked
  ip_address        VARCHAR(45) NOT NULL,                      -- IPv4 or IPv6
  user_agent        TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_refresh_tokens_token_hash (token_hash),
  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires (expires_at),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Token rotation: on refresh, old token is revoked (`revoked_at` set) and new token issued.
- Expired or revoked tokens are cleaned up by a scheduled job (daily).
- `token_hash`: SHA-256 of the actual token value. Raw token is NEVER stored.

---

## TABLE 3: login_attempts

Supports: B1.1 Login (rate limiting), C6.1 Rate Limiting

```sql
CREATE TABLE login_attempts (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- high volume, not ULID
  ip_address        VARCHAR(45) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  success           TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_login_attempts_ip_at (ip_address, attempted_at),
  INDEX idx_login_attempts_email_at (email, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Used to enforce "5 failed attempts in 10 minutes = lock 30 minutes" (ref B1.1).
- Query: `SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND success = 0 AND attempted_at > NOW() - INTERVAL 10 MINUTE`.
- Old records (> 30 days) cleaned by scheduled job.

---

## TABLE 4: categories

Supports: B3.4 Category System, A3.1 Material Filter, product/project categorization

```sql
CREATE TABLE categories (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  name              VARCHAR(100) NOT NULL,
  slug              VARCHAR(100) NOT NULL,
  description       TEXT NULL,
  type              ENUM('project', 'product') NOT NULL,       -- separates project vs product categories
  parent_id         VARCHAR(26) NULL,                          -- self-referential FK for subcategories
  display_order     INT NOT NULL DEFAULT 0,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,
  created_by        VARCHAR(26) NULL,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_categories_slug_type (slug, type),
  INDEX idx_categories_type (type),
  INDEX idx_categories_parent (parent_id),
  INDEX idx_categories_display_order (display_order),
  INDEX idx_categories_deleted (deleted_at),

  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_categories_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_categories_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `type='project'`: Residential, Commercial, Hospitality (ref B3.4).
- `type='product'`: product material categories for kitchen cabinets.
- `parent_id`: allows one level of nesting (subcategories). Max depth = 2 enforced at application level.
- `slug` + `type` is unique: same slug can exist for different types (e.g., "modern" for both project and product).
- Default categories seeded on first deploy.

---

## TABLE 5: media

Supports: C1.1 Upload, C1.2 Image Processing, C1.3 R2 Storage, B3.5 Image Gallery Manager

```sql
CREATE TABLE media (
  id                    VARCHAR(26) NOT NULL PRIMARY KEY,      -- ULID
  original_filename     VARCHAR(255) NOT NULL,
  mime_type             VARCHAR(50) NOT NULL,                   -- image/jpeg, image/png, image/webp
  file_size             INT UNSIGNED NOT NULL,                  -- bytes, max ~10MB = 10485760
  original_url          VARCHAR(500) NOT NULL,                  -- R2 private bucket URL
  thumbnail_url         VARCHAR(500) NULL,                      -- R2 public bucket, 768px WebP
  preview_url           VARCHAR(500) NULL,                      -- R2 public bucket, 2048px WebP
  width                 INT UNSIGNED NULL,                      -- original image width in px
  height                INT UNSIGNED NULL,                      -- original image height in px
  alt_text              VARCHAR(255) NULL,                      -- accessibility + SEO
  blurhash              VARCHAR(100) NULL,                      -- blur placeholder hash for LQIP
  processing_status     ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  processing_error      TEXT NULL,                              -- error message if failed
  uploaded_by           VARCHAR(26) NOT NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  INDEX idx_media_processing_status (processing_status),
  INDEX idx_media_uploaded_by (uploaded_by),
  INDEX idx_media_created (created_at),
  INDEX idx_media_deleted (deleted_at),

  CONSTRAINT fk_media_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `original_url`: points to R2 private bucket. Access via signed URL (1hr expiry).
- `thumbnail_url` / `preview_url`: R2 public bucket, set by IMAGE_JOB worker after processing.
- `processing_status`: tracks the async image processing pipeline.
  - `pending` -> `processing` -> `completed` (or `failed`).
  - Frontend polls or receives Socket.io event `image_processed` (ref C3.2).
- `blurhash`: computed during IMAGE_JOB for blur-up loading (ref C5.4).
- R2 path structure: `/{year}/{month}/{ulid}/{variant}.webp` (ref C1.3).
- On delete: media record soft-deleted, R2 files cleaned by background job.

---

## TABLE 6: projects

Supports: A4 Project Detail, B3.1-B3.8 Project Management, A2.3 Featured Projects

```sql
CREATE TABLE projects (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL,
  description       TEXT NULL,                                  -- short description for cards/meta
  content           TEXT NULL,                                  -- rich HTML content, sanitized by DOMPurify
  category_id       VARCHAR(26) NULL,
  style             VARCHAR(100) NULL,                         -- "Modern", "Classic", "Minimalist", "Industrial"
  materials         JSON NULL,                                  -- ["Oak", "Marble", "Brass"] array
  area              VARCHAR(50) NULL,                           -- "120m2"
  duration          VARCHAR(50) NULL,                           -- "3 thang"
  location          VARCHAR(255) NULL,
  year_completed    SMALLINT UNSIGNED NULL,                     -- e.g., 2025
  cover_image_id    VARCHAR(26) NULL,                          -- FK to media, main display image
  status            ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at      DATETIME NULL,                             -- set when first published
  is_featured       TINYINT(1) NOT NULL DEFAULT 0,             -- show on homepage (ref A2.3)
  view_count        INT UNSIGNED NOT NULL DEFAULT 0,            -- incremented by analytics
  display_order     INT NOT NULL DEFAULT 0,                    -- manual ordering
  ref_code          VARCHAR(20) NULL,                          -- "VN-2024-001" format (ref B3.1)

  -- SEO fields (ref A4.6, B3.6)
  seo_title         VARCHAR(255) NULL,                         -- custom SEO title, fallback to title
  seo_description   VARCHAR(500) NULL,                         -- custom meta description
  og_image_id       VARCHAR(26) NULL,                          -- FK to media, OG share image

  -- Audit
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,
  created_by        VARCHAR(26) NULL,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_projects_slug (slug),
  INDEX idx_projects_category (category_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_is_featured (is_featured),
  INDEX idx_projects_published_at (published_at),
  INDEX idx_projects_display_order (display_order),
  INDEX idx_projects_deleted (deleted_at),
  INDEX idx_projects_status_featured (status, is_featured),
  INDEX idx_projects_ref_code (ref_code),

  CONSTRAINT fk_projects_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_cover_image
    FOREIGN KEY (cover_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_og_image
    FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `content`: rich HTML sanitized by DOMPurify on server before save (ref C6.2).
- `materials`: JSON array. Query with `JSON_CONTAINS(materials, '"Oak"')`.
- `status`: only 'published' projects visible on public website (ref B3.3).
- `published_at`: set to `NOW()` on first publish, not updated on republish.
- `is_featured`: max 6 featured projects enforced at application level (ref A2.3).
- `ref_code`: auto-generated format "VN-{year}-{seq}" for admin reference (ref B3.1).
- `slug`: auto-generated from title, Vietnamese diacritics stripped, validated unique (ref B3.6).
- Public API: `GET /api/projects?status=published&category={slug}&page=1&limit=9`.
- Admin API: `GET /api/admin/projects?q={keyword}&category={id}&status={status}&page=1&limit=10`.

---

## TABLE 7: project_gallery

Supports: A4.3 Image Gallery, B3.5 Image Gallery Manager

```sql
CREATE TABLE project_gallery (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  project_id        VARCHAR(26) NOT NULL,
  media_id          VARCHAR(26) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  caption           VARCHAR(255) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE INDEX uq_project_gallery_project_media (project_id, media_id),
  INDEX idx_project_gallery_project_order (project_id, display_order),
  INDEX idx_project_gallery_media (media_id),

  CONSTRAINT fk_project_gallery_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_gallery_media
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Junction table: many-to-many between projects and media.
- `display_order`: determines image sequence in gallery. Drag-and-drop reordering updates this field (ref B3.5).
- `project_id + media_id` unique: same image cannot appear twice in one project.
- ON DELETE CASCADE: deleting a project removes all gallery entries. Deleting a media record removes it from all galleries.
- The image with `display_order = 0` (or the lowest value) is typically the first shown. Cover image is stored separately in `projects.cover_image_id`.

---

## TABLE 8: products

Supports: A3.4 Product Grid, A5.1-A5.5 Product Detail, product catalog

```sql
CREATE TABLE products (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL,
  description       TEXT NULL,                                  -- rich HTML content
  category_id       VARCHAR(26) NULL,
  material_type     VARCHAR(100) NULL,                         -- "Industrial Wood", "Natural Wood", "Acrylic", "Melamine"
  finish            VARCHAR(100) NULL,                         -- "Matte", "High Gloss", "Textured"
  dimensions        JSON NULL,                                  -- { "width": 2400, "height": 900, "depth": 600, "unit": "mm" }
  price_range       VARCHAR(100) NULL,                         -- display text: "$3,900 - $7,400"
  cover_image_id    VARCHAR(26) NULL,
  status            ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at      DATETIME NULL,
  is_new            TINYINT(1) NOT NULL DEFAULT 0,             -- "NEW" badge on card (ref A3.5), auto-expire 30 days
  is_featured       TINYINT(1) NOT NULL DEFAULT 0,
  display_order     INT NOT NULL DEFAULT 0,

  -- SEO fields
  seo_title         VARCHAR(255) NULL,
  seo_description   VARCHAR(500) NULL,
  og_image_id       VARCHAR(26) NULL,

  -- Audit
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,
  created_by        VARCHAR(26) NULL,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_products_slug (slug),
  INDEX idx_products_category (category_id),
  INDEX idx_products_material_type (material_type),
  INDEX idx_products_finish (finish),
  INDEX idx_products_status (status),
  INDEX idx_products_is_new (is_new),
  INDEX idx_products_is_featured (is_featured),
  INDEX idx_products_display_order (display_order),
  INDEX idx_products_deleted (deleted_at),
  INDEX idx_products_status_material (status, material_type),

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_cover_image
    FOREIGN KEY (cover_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_og_image
    FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `material_type`: used for sidebar/chip filtering (ref A3.1, A3.3). Values managed via application config or categories.
- `dimensions`: JSON object. Frontend renders as "W x H x D mm". Nullable for products without fixed dimensions.
- `is_new`: set to 1 when created, application logic checks `created_at` -- if > 30 days, treat as not new regardless of flag (ref A3.5).
- Public API: `GET /api/products?material={type}&page=1&limit=9&sort=display_order`.

---

## TABLE 9: product_images

Supports: A5.1 Product Images

```sql
CREATE TABLE product_images (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  product_id        VARCHAR(26) NOT NULL,
  media_id          VARCHAR(26) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  is_primary        TINYINT(1) NOT NULL DEFAULT 0,             -- primary image shown first
  caption           VARCHAR(255) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE INDEX uq_product_images_product_media (product_id, media_id),
  INDEX idx_product_images_product_order (product_id, display_order),
  INDEX idx_product_images_media (media_id),

  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_images_media
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Same pattern as `project_gallery`.
- `is_primary`: only one image per product should have `is_primary=1`. Enforced at application level.
- Thumbnail gallery: click thumbnail changes main image (ref A5.1).

---

## TABLE 10: consultations

Supports: A2.6 Consultation CTA, A5.5 Product CTA, A7.1 Contact Form, B4.1-B4.5 Consultation Management

```sql
CREATE TABLE consultations (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(20) NULL,
  project_type      ENUM('residential', 'commercial', 'hospitality', 'renovation', 'other') NULL,
  area              VARCHAR(50) NULL,                          -- "120m2", from detailed form (ref A7.1)
  budget_range      VARCHAR(100) NULL,                         -- dropdown value from detailed form
  message           TEXT NULL,
  product_id        VARCHAR(26) NULL,                          -- FK if submitted from product detail page (ref A5.5)
  status            ENUM('new', 'contacted', 'scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
  assigned_to       VARCHAR(26) NULL,                          -- FK to users, admin handling this request
  notes             TEXT NULL,                                  -- admin internal notes
  status_changed_at DATETIME NULL,                             -- last status change timestamp
  status_changed_by VARCHAR(26) NULL,                          -- admin who changed status

  -- Anti-spam
  ip_address        VARCHAR(45) NOT NULL,                      -- for rate limiting (ref C6.1)
  user_agent        TEXT NULL,                                  -- for bot detection
  source            VARCHAR(50) NULL,                          -- 'homepage', 'contact', 'product_detail'
  honeypot          VARCHAR(255) NULL,                         -- hidden field, non-empty = bot (ref A7.1)

  -- Timestamps
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,

  INDEX idx_consultations_status (status),
  INDEX idx_consultations_created (created_at),
  INDEX idx_consultations_ip (ip_address),
  INDEX idx_consultations_email (email),
  INDEX idx_consultations_assigned (assigned_to),
  INDEX idx_consultations_product (product_id),
  INDEX idx_consultations_deleted (deleted_at),

  CONSTRAINT fk_consultations_assigned
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultations_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultations_status_by
    FOREIGN KEY (status_changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `project_type`: values differ slightly between homepage form (A2.6) and contact form (A7.1). Normalized to ENUM.
- `product_id`: set when consultation is initiated from a product detail page (ref A5.5), pre-filling "San pham: [ten]".
- `status` workflow: New -> Contacted -> Scheduled -> Completed. No reverse unless super admin (ref B4.2).
- `honeypot`: hidden form field. If non-empty, submission is from a bot and silently discarded (ref A7.1).
- `source`: tracks which page/form the request originated from.
- Rate limit: max 3 submissions per IP per hour (ref C6.1). Checked via Redis before DB insert.
- On create: enqueue MAIL_JOB for customer confirmation + admin notification (ref B4.5). Emit Socket.io `new_consultation` (ref B4.4).

---

## TABLE 11: page_configs

Supports: B5.1-B5.7 Page Builder

```sql
CREATE TABLE page_configs (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  page_slug         VARCHAR(100) NOT NULL,                     -- 'homepage', 'about', 'contact'
  config_draft      JSON NOT NULL,                             -- current draft version
  config_published  JSON NULL,                                 -- live published version
  version           INT UNSIGNED NOT NULL DEFAULT 1,           -- incremented on each publish
  published_at      DATETIME NULL,
  published_by      VARCHAR(26) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_page_configs_slug (page_slug),

  CONSTRAINT fk_page_configs_published_by
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_page_configs_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**JSON config structure example (homepage):**
```json
{
  "sections": [
    {
      "type": "hero",
      "order": 0,
      "visible": true,
      "config": {
        "imageId": "01HYX...",
        "headline": "Crafting Silent Elegance.",
        "description": "...",
        "cta1": { "text": "Kham Pha Du An", "url": "/projects" },
        "cta2": { "text": "Explore Catalog", "url": "/catalog" },
        "stats": [
          { "value": 500, "suffix": "+", "label": "Du an" },
          { "value": 12, "label": "Giai thuong" }
        ]
      }
    },
    {
      "type": "about",
      "order": 1,
      "visible": true,
      "config": { "headline": "...", "description": "...", "imageId": "...", "stats": [...] }
    },
    {
      "type": "featured_projects",
      "order": 2,
      "visible": true,
      "config": { "projectIds": ["01HYX...", "01HYY...", "01HYZ..."], "title": "Kiet Tac Thiet Ke" }
    },
    {
      "type": "materials",
      "order": 3,
      "visible": true,
      "config": { "items": [{ "name": "Oak", "imageId": "..." }, ...] }
    },
    {
      "type": "testimonials",
      "order": 4,
      "visible": true,
      "config": { "items": [{ "quote": "...", "author": "...", "role": "...", "rating": 5 }, ...] }
    },
    {
      "type": "cta_form",
      "order": 5,
      "visible": true,
      "config": { "headline": "Nhan Tu Van Mien Phi", "description": "..." }
    }
  ]
}
```

**Notes:**
- `config_draft`: always up-to-date with admin edits. Auto-saved every 30 seconds (ref B5.7).
- `config_published`: copied from `config_draft` on publish action (ref B5.6).
- Public website reads `config_published`. Admin preview reads `config_draft`.
- `version`: incremented on each publish for tracking.

---

## TABLE 12: page_config_history

Supports: B5.7 Save/Cancel (rollback, keep 5 versions)

```sql
CREATE TABLE page_config_history (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  page_config_id    VARCHAR(26) NOT NULL,
  config_snapshot   JSON NOT NULL,                             -- snapshot of config at publish time
  version           INT UNSIGNED NOT NULL,
  published_at      DATETIME NOT NULL,
  published_by      VARCHAR(26) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_page_config_history_config (page_config_id),
  INDEX idx_page_config_history_version (page_config_id, version),

  CONSTRAINT fk_page_config_history_config
    FOREIGN KEY (page_config_id) REFERENCES page_configs(id) ON DELETE CASCADE,
  CONSTRAINT fk_page_config_history_by
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- On each publish, a snapshot of the previous `config_published` is saved here.
- Application retains only the last 5 versions per page (oldest deleted when 6th is created).
- Rollback: admin can restore a previous version by copying `config_snapshot` back to `page_configs.config_draft`.

---

## TABLE 13: settings

Supports: B8.1 Site Settings, B8.2 SEO Defaults, B8.3 Email Templates

```sql
CREATE TABLE settings (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  setting_key       VARCHAR(100) NOT NULL,
  setting_value     TEXT NOT NULL,                             -- JSON string
  setting_group     VARCHAR(50) NOT NULL,                      -- 'general', 'seo', 'email', 'social', 'analytics'
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_settings_key (setting_key),
  INDEX idx_settings_group (setting_group),

  CONSTRAINT fk_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Default settings seeded on first deploy:**

| setting_key | setting_group | setting_value (JSON) |
|---|---|---|
| `site_name` | general | `"VietNet Interior"` |
| `site_slogan` | general | `"Nghe Thuat Noi That Dang Cap & Tinh Te"` |
| `contact_address` | general | `"123 Nguyen Hue, Q1, TP.HCM"` |
| `contact_phone` | general | `"+84 28 1234 5678"` |
| `contact_email` | general | `"info@bhquan.site"` |
| `working_hours` | general | `{"weekday": "8:00 - 18:00", "saturday": "8:00 - 18:00", "sunday": "9:00 - 16:00"}` |
| `social_facebook` | social | `"https://facebook.com/vietnet"` |
| `social_zalo` | social | `"https://zalo.me/vietnet"` |
| `social_instagram` | social | `""` |
| `social_youtube` | social | `""` |
| `seo_title_template` | seo | `"{page} | VietNet Interior"` |
| `seo_default_description` | seo | `"VietNet Interior - Thiet ke noi that cao cap..."` |
| `seo_default_og_image_id` | seo | `null` |
| `seo_ga_id` | seo | `""` |
| `seo_gsc_meta` | seo | `""` |
| `email_consultation_confirm` | email | `"<html>...</html>"` |
| `email_admin_notification` | email | `"<html>...</html>"` |
| `analytics_excluded_ips` | analytics | `[]` |
| `analytics_bot_patterns` | analytics | `["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"]` |
| `notification_sound` | general | `true` |

---

## TABLE 14: notifications

Supports: B2.8 Notification Bell

```sql
CREATE TABLE notifications (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,                      -- recipient admin user
  type              VARCHAR(50) NOT NULL,                      -- 'new_consultation', 'project_published', 'system_error'
  title             VARCHAR(255) NOT NULL,
  body              TEXT NULL,
  link              VARCHAR(500) NULL,                         -- URL to navigate on click
  is_read           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notifications_user_read (user_id, is_read),
  INDEX idx_notifications_user_created (user_id, created_at),

  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Created server-side when events occur (new consultation, project published, etc.).
- Broadcast to all admins via Socket.io room "admin", then persisted per-user.
- `is_read`: toggled via `PUT /api/admin/notifications/:id/read`.
- Cleanup: notifications older than 90 days deleted by scheduled job.

---

## TABLE 15: page_views

Supports: B6.1-B6.6 Analytics (detailed records)

```sql
CREATE TABLE page_views (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- high volume, not ULID
  page_path         VARCHAR(500) NOT NULL,
  visitor_ip        VARCHAR(45) NOT NULL,
  user_agent        TEXT NULL,
  referrer          VARCHAR(500) NULL,
  device_type       ENUM('desktop', 'mobile', 'tablet') NULL,
  is_bot            TINYINT(1) NOT NULL DEFAULT 0,
  session_id        VARCHAR(100) NULL,
  viewed_at         DATETIME NOT NULL,

  INDEX idx_page_views_path_viewed (page_path(100), viewed_at),
  INDEX idx_page_views_viewed (viewed_at),
  INDEX idx_page_views_is_bot (is_bot),
  INDEX idx_page_views_device (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  PARTITION BY RANGE (YEAR(viewed_at)) (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
  );
```

**Notes:**
- High-volume table. Uses BIGINT AUTO_INCREMENT PK instead of ULID for performance.
- Partitioned by year for query performance and easy archival (drop old partitions).
- Written by TRAFFIC_SYNC_JOB from Redis counters every 10 minutes (ref C5.2).
- `page_path` index limited to first 100 chars to keep index size manageable.
- `is_bot`: detected via user_agent analysis using bot pattern list from settings.
- `session_id`: optional, for unique visitor counting within sessions.

---

## TABLE 16: page_view_daily

Supports: B6.1 Traffic Overview, B6.4 Device Breakdown, B6.5 Top Pages (aggregated stats)

```sql
CREATE TABLE page_view_daily (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  page_path         VARCHAR(500) NOT NULL,
  view_date         DATE NOT NULL,
  total_views       INT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors   INT UNSIGNED NOT NULL DEFAULT 0,
  mobile_views      INT UNSIGNED NOT NULL DEFAULT 0,
  desktop_views     INT UNSIGNED NOT NULL DEFAULT 0,
  tablet_views      INT UNSIGNED NOT NULL DEFAULT 0,
  bot_views         INT UNSIGNED NOT NULL DEFAULT 0,

  UNIQUE INDEX uq_page_view_daily_path_date (page_path(100), view_date),
  INDEX idx_page_view_daily_date (view_date),
  INDEX idx_page_view_daily_views (total_views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Aggregated by TRAFFIC_SYNC_JOB (BullMQ cron, every 10 minutes).
- `UPSERT` pattern: `INSERT ... ON DUPLICATE KEY UPDATE total_views = total_views + ?`.
- Dashboard KPI queries use this table for fast reads (ref B2.1).
- `unique_visitors`: computed from Redis SET cardinality (`SCARD pageview:unique:{path}:{date}`).
- Query example for B6.1: `SELECT view_date, SUM(total_views) FROM page_view_daily WHERE view_date BETWEEN ? AND ? GROUP BY view_date ORDER BY view_date`.

---

## TABLE 17: email_logs

Supports: C2.1 Email Job, B4.5 Email Auto-reply

```sql
CREATE TABLE email_logs (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  type              VARCHAR(50) NOT NULL,                      -- 'consultation_confirmation', 'consultation_notification', 'password_reset'
  to_email          VARCHAR(255) NOT NULL,
  subject           VARCHAR(255) NOT NULL,
  status            ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
  error_message     TEXT NULL,                                  -- error details if failed
  retry_count       TINYINT UNSIGNED NOT NULL DEFAULT 0,       -- max 3 retries
  sent_at           DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_logs_type (type),
  INDEX idx_email_logs_status (status),
  INDEX idx_email_logs_created (created_at),
  INDEX idx_email_logs_to (to_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Records every email attempt. NEVER logs email body content (ref C7.2).
- `retry_count`: incremented on each retry. Max 3 retries with exponential backoff 1s/4s/16s (ref C2.1).
- `status` flow: queued -> sent (or failed after 3 retries).
- Dead letter: emails with `status='failed'` and `retry_count=3` are in dead letter state.
- Cleanup: logs older than 90 days deleted by scheduled job.

---

## TABLE 18: password_reset_tokens

Supports: B1.2 Forgot Password

```sql
CREATE TABLE password_reset_tokens (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,
  token_hash        VARCHAR(255) NOT NULL,                     -- SHA-256 hash
  expires_at        DATETIME NOT NULL,                         -- 1 hour from creation
  used_at           DATETIME NULL,                             -- set when token is consumed
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_password_reset_token_hash (token_hash),
  INDEX idx_password_reset_user (user_id),
  INDEX idx_password_reset_expires (expires_at),

  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- Token expires after 1 hour (ref B1.2).
- Single-use: `used_at` set when password is successfully reset. Token cannot be reused.
- Previous unused tokens for the same user are invalidated when a new reset is requested.
- `token_hash`: SHA-256 of the URL token. Raw token sent via email, never stored.

---

## ENTITY RELATIONSHIP DIAGRAM (Text)

```
users -----+---- projects (created_by, updated_by)
           |---- products (created_by, updated_by)
           |---- categories (created_by, updated_by)
           |---- media (uploaded_by)
           |---- consultations (assigned_to, status_changed_by)
           |---- page_configs (published_by, updated_by)
           |---- settings (updated_by)
           |---- refresh_tokens (user_id) -------- 1:N
           |---- login_attempts (email) ----------- 1:N (logical, no FK)
           |---- notifications (user_id) ---------- 1:N
           |---- password_reset_tokens (user_id) -- 1:N
           +---- page_config_history (published_by)

categories ---+---- projects (category_id) --------- 1:N
              |---- products (category_id) --------- 1:N
              +---- categories (parent_id) --------- self-ref 1:N

media --------+---- projects (cover_image_id) ------ N:1
              |---- projects (og_image_id) --------- N:1
              |---- products (cover_image_id) ------ N:1
              |---- products (og_image_id) --------- N:1
              |---- project_gallery (media_id) ----- N:M via junction
              +---- product_images (media_id) ------ N:M via junction

projects ---- project_gallery ---- media           (M:N junction)
products ---- product_images ----- media           (M:N junction)

consultations ---- products (product_id) ---------- N:1 (optional)
```

**Cardinality Summary:**

| Relationship | Type | Note |
|---|---|---|
| users -> projects | 1:N | via created_by/updated_by |
| users -> refresh_tokens | 1:N | multiple devices/sessions |
| users -> notifications | 1:N | per-user notification inbox |
| categories -> categories | 1:N | self-ref, max depth 2 |
| categories -> projects | 1:N | one category per project |
| categories -> products | 1:N | one category per product |
| projects -> project_gallery | 1:N | one project, many gallery items |
| project_gallery -> media | N:1 | each gallery item links one media |
| products -> product_images | 1:N | one product, many images |
| product_images -> media | N:1 | each image item links one media |
| consultations -> products | N:1 | optional, from product page |
| page_configs -> page_config_history | 1:N | version history |

---

## REDIS KEYS STRUCTURE

### Page View Counters (ref C5.2, B6.1)
```
pageview:{path}:{YYYY-MM-DD}                -- STRING (INCR), daily page view count
                                             -- TTL: 48 hours (processed by TRAFFIC_SYNC_JOB)
pageview:unique:{path}:{YYYY-MM-DD}          -- SET of visitor IPs, for unique count
                                             -- TTL: 48 hours
```

### Rate Limiting (ref C6.1)
```
rate:login:{ip}                              -- STRING (INCR), login attempt counter
                                             -- TTL: 600s (10 minutes)
rate:login:lock:{ip}                         -- STRING, exists = IP is locked out
                                             -- TTL: 1800s (30 minutes)
rate:consultation:{ip}                       -- STRING (INCR), consultation submit counter
                                             -- TTL: 3600s (1 hour), max value 3
rate:api:global:{ip}                         -- STRING (INCR), global API rate limit
                                             -- TTL: 60s (1 minute), max value 100
rate:upload:{userId}                         -- STRING (INCR), upload rate limit
                                             -- TTL: 60s, max value 20
```

### Cache (ref C5.2)
```
cache:projects:list:{queryHash}              -- STRING (JSON), cached project list response
                                             -- TTL: 300s (5 minutes)
cache:products:list:{queryHash}              -- STRING (JSON), cached product list response
                                             -- TTL: 300s (5 minutes)
cache:project:{slug}                         -- STRING (JSON), cached single project
                                             -- TTL: 600s (10 minutes)
cache:product:{slug}                         -- STRING (JSON), cached single product
                                             -- TTL: 600s (10 minutes)
cache:homepage:config                        -- STRING (JSON), cached published homepage config
                                             -- TTL: 600s (10 minutes)
cache:categories:{type}                      -- STRING (JSON), cached category list
                                             -- TTL: 300s (5 minutes)
cache:settings:{group}                       -- STRING (JSON), cached settings by group
                                             -- TTL: 300s (5 minutes)
cache:sitemap                                -- STRING (XML), cached sitemap.xml
                                             -- TTL: 3600s (1 hour)
```

### Cache Invalidation Pattern
```
-- On project create/update/delete:
DEL cache:projects:list:*                    -- pattern delete all project list caches
DEL cache:project:{slug}
DEL cache:sitemap
DEL cache:homepage:config                    -- in case featured projects changed

-- On product create/update/delete:
DEL cache:products:list:*
DEL cache:product:{slug}
DEL cache:sitemap

-- On category change:
DEL cache:categories:*

-- On page builder publish:
DEL cache:homepage:config

-- On settings change:
DEL cache:settings:{group}
```

### Session & Real-time (ref C3.1)
```
session:{userId}                             -- STRING, Socket.io session tracking
                                             -- TTL: 86400s (24 hours)
                                             -- Value: { socketId, connectedAt, ip }
```

### BullMQ Queues (ref C1.2, C2.1)
```
bull:image-queue:*                           -- BullMQ managed keys for image processing
bull:mail-queue:*                            -- BullMQ managed keys for email sending
bull:traffic-sync:*                          -- BullMQ managed keys for traffic aggregation cron
```

---

## SYSTEM FLOW DIAGRAMS

### Flow 1: Consultation Submission (ref A2.6, A7.1, B4.4, B4.5)

```
Client: User submits consultation form
  |
  v
POST /api/consultations
  |
  +-- [1] Validate request body (name, email, phone, project_type, message)
  |     - Zod schema validation
  |     - Check honeypot field: if non-empty, return 200 (silent discard)
  |
  +-- [2] Check rate limit
  |     - Redis GET rate:consultation:{ip}
  |     - If >= 3: return 429 Too Many Requests
  |     - Else: Redis INCR rate:consultation:{ip} (TTL 3600s)
  |
  +-- [3] Detect bot
  |     - Check user_agent against bot patterns from settings
  |     - If bot: return 200 (silent discard)
  |
  +-- [4] Save to DB
  |     - INSERT INTO consultations (status: 'new', source: req.body.source)
  |     - Return consultation.id
  |
  +-- [5] Async jobs (non-blocking)
  |     - Enqueue MAIL_JOB: consultation_confirmation -> customer email
  |     - Enqueue MAIL_JOB: consultation_notification -> all admin emails
  |
  +-- [6] Real-time notification
  |     - Create notification records for all active admins
  |     - Socket.io emit to room "admin": event "new_consultation"
  |       payload: { id, name, projectType, createdAt }
  |
  +-- [7] Response
        - Return 201 { success: true, message: "Yeu cau da duoc gui" }
```

### Flow 2: Image Upload & Processing (ref C1.1, C1.2, C1.3)

```
Client: Admin uploads image via form
  |
  v
POST /api/admin/upload (multipart/form-data)
  |
  +-- [1] Auth middleware: requireAuth
  |
  +-- [2] Multer middleware
  |     - Check MIME type: image/jpeg, image/png, image/webp
  |     - Check file size: max 10MB
  |     - Check file signature (magic bytes) matches extension
  |     - If invalid: return 400
  |
  +-- [3] Upload original to R2 private bucket
  |     - Path: /{year}/{month}/{ulid}/original.{ext}
  |     - Generate signed URL (1hr expiry)
  |
  +-- [4] Save media record
  |     - INSERT INTO media (status: 'pending', original_url, uploaded_by)
  |
  +-- [5] Enqueue IMAGE_JOB
  |     - Payload: { mediaId, originalR2Key }
  |     - Return immediately
  |
  +-- [6] Response
        - Return 201 { success: true, data: { id, originalUrl, status: 'pending' } }

---

IMAGE_JOB Worker (BullMQ):
  |
  +-- [1] Update media status: 'processing'
  |
  +-- [2] Download original from R2
  |
  +-- [3] Sharp processing
  |     - Resize to 2048px width (preview), maintain aspect ratio
  |     - Resize to 768px width (thumbnail), maintain aspect ratio
  |     - Convert both to WebP quality 80%
  |     - Strip all EXIF metadata
  |     - Generate blurhash from thumbnail
  |     - Read dimensions (width, height)
  |
  +-- [4] Upload to R2 public bucket
  |     - /{year}/{month}/{ulid}/preview.webp
  |     - /{year}/{month}/{ulid}/thumbnail.webp
  |
  +-- [5] Update media record
  |     - SET preview_url, thumbnail_url, width, height, blurhash
  |     - SET processing_status = 'completed'
  |
  +-- [6] Socket.io emit: "image_processed"
        - Payload: { mediaId, thumbnailUrl, previewUrl }
        - Room: user:{uploadedBy}

  On failure (after 3 retries):
  +-- SET processing_status = 'failed', processing_error = error.message
  +-- Move to dead letter queue
```

### Flow 3: Page Builder Save & Publish (ref B5.1-B5.7)

```
=== SAVE DRAFT ===

Admin edits homepage sections in Edit Mode
  |
  v
PUT /api/admin/pages/:pageSlug
  |
  +-- [1] Auth: requireAuth, requireAdmin
  +-- [2] Validate JSON config structure
  +-- [3] UPDATE page_configs SET config_draft = ?, updated_by = ?, updated_at = NOW()
  +-- [4] Response: 200 { success: true }

Auto-save: triggered every 30 seconds if changes detected (client-side debounce).

=== PUBLISH ===

Admin clicks "Publish"
  |
  v
POST /api/admin/pages/:pageSlug/publish
  |
  +-- [1] Auth: requireAuth, requireAdmin
  |
  +-- [2] Save history snapshot
  |     - INSERT INTO page_config_history (config_snapshot = current config_published)
  |     - DELETE oldest history if count > 5
  |
  +-- [3] Publish
  |     - UPDATE page_configs SET
  |         config_published = config_draft,
  |         version = version + 1,
  |         published_at = NOW(),
  |         published_by = currentUser.id
  |
  +-- [4] Invalidate caches
  |     - Redis DEL cache:homepage:config
  |
  +-- [5] Response: 200 { success: true, version: newVersion }
```

### Flow 4: Traffic Analytics (ref B6.1-B6.6)

```
=== PAGE VIEW RECORDING ===

User visits any public page
  |
  v
POST /api/analytics/pageview
  |
  +-- [1] Parse request
  |     - Extract: page_path, ip, user_agent, referrer
  |     - Detect device_type from user_agent
  |
  +-- [2] Filter
  |     - Check bot: match user_agent against bot patterns -> set is_bot flag
  |     - Check excluded IPs: match against analytics_excluded_ips setting
  |     - If excluded IP: return 200 (no recording)
  |
  +-- [3] Record in Redis (fast, no DB write)
  |     - INCR pageview:{path}:{date}
  |     - SADD pageview:unique:{path}:{date} {ip}
  |     - INCR pageview:device:{device_type}:{date}
  |
  +-- [4] Response: 204 No Content

=== TRAFFIC_SYNC_JOB (BullMQ cron, every 10 minutes) ===

  +-- [1] SCAN Redis for keys matching pageview:*:{today}
  |
  +-- [2] For each path+date combination:
  |     - GET pageview:{path}:{date} -> total_views
  |     - SCARD pageview:unique:{path}:{date} -> unique_visitors
  |     - GET pageview:device:mobile:{date} -> mobile_views
  |     - GET pageview:device:desktop:{date} -> desktop_views
  |     - GET pageview:device:tablet:{date} -> tablet_views
  |
  +-- [3] UPSERT into page_view_daily
  |     - INSERT ... ON DUPLICATE KEY UPDATE
  |       total_views = ?, unique_visitors = ?, mobile_views = ?, ...
  |
  +-- [4] Optionally write detailed records to page_views table
  |     (for detailed analysis, can be disabled for performance)
  |
  +-- [5] Keys remain in Redis (TTL handles cleanup after 48h)
```

### Flow 5: Authentication (ref B1.1, B1.2, B1.3)

```
=== LOGIN ===

POST /api/auth/login { email, password }
  |
  +-- [1] Rate limit check
  |     - Redis GET rate:login:{ip}
  |     - If >= 10: return 429
  |     - Redis GET rate:login:lock:{ip}
  |     - If exists: return 423 Locked ("Tai khoan bi khoa 30 phut")
  |
  +-- [2] Find user
  |     - SELECT * FROM users WHERE email = ? AND deleted_at IS NULL
  |     - If not found: log attempt (success=0), return 401 generic message
  |     - If is_active = 0: return 401 generic message
  |
  +-- [3] Verify password
  |     - bcrypt.compare(password, user.password_hash)
  |     - If fail:
  |       - Redis INCR rate:login:{ip} (TTL 600s)
  |       - INSERT login_attempts (success=0)
  |       - Check consecutive failures for this email:
  |         if >= 5 in 10min: SET rate:login:lock:{ip} (TTL 1800s)
  |       - Return 401 { success: false, message: "Email hoac mat khau khong dung",
  |                       remainingAttempts: 5 - failCount }
  |
  +-- [4] Generate tokens
  |     - Access token: JWT { userId, role }, exp 60min
  |     - Refresh token: random 64-byte hex, exp 7 days
  |     - Hash refresh token (SHA-256)
  |     - INSERT INTO refresh_tokens (token_hash, expires_at, ip_address, user_agent)
  |
  +-- [5] Set cookies
  |     - Set-Cookie: refreshToken={token}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800
  |
  +-- [6] Update user
  |     - UPDATE users SET last_login_at = NOW()
  |     - INSERT login_attempts (success=1)
  |
  +-- [7] Response
        - 200 { success: true, data: { user: { id, name, email, role, avatarUrl }, accessToken } }

=== TOKEN REFRESH ===

POST /api/auth/refresh
  |
  +-- [1] Read refreshToken from cookie
  |     - If missing: return 401
  |
  +-- [2] Hash and lookup
  |     - SHA-256 hash the token
  |     - SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL
  |     - If not found or expired: return 401
  |
  +-- [3] Token rotation
  |     - Revoke old: UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?
  |     - Generate new refresh token
  |     - INSERT new refresh_tokens record
  |     - Generate new access token (JWT)
  |
  +-- [4] Set new cookie + return new access token
        - 200 { success: true, data: { accessToken } }

=== LOGOUT ===

POST /api/auth/logout
  |
  +-- [1] Read refreshToken from cookie
  +-- [2] Revoke: UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?
  +-- [3] Clear cookie: Set-Cookie: refreshToken=; Max-Age=0
  +-- [4] Clear Redis session: DEL session:{userId}
  +-- [5] Response: 200 { success: true }
```

### Flow 6: Project CRUD (ref B3.1-B3.8)

```
=== CREATE ===

POST /api/admin/projects
  |
  +-- [1] Auth: requireAuth (admin or editor)
  +-- [2] Validate body (title required, slug auto-gen if empty)
  +-- [3] Generate slug from title (strip Vietnamese diacritics, lowercase, dash-separated)
  +-- [4] Check slug uniqueness: SELECT id FROM projects WHERE slug = ? AND deleted_at IS NULL
  +-- [5] Generate ref_code: "VN-{year}-{next_seq}"
  +-- [6] INSERT INTO projects (status='draft', created_by=currentUser.id)
  +-- [7] If gallery images provided: INSERT INTO project_gallery (batch)
  +-- [8] Invalidate cache: DEL cache:projects:list:*
  +-- [9] Response: 201 { success: true, data: { id, slug } }

=== PUBLISH ===

PUT /api/admin/projects/:id/status { status: "published" }
  |
  +-- [1] Auth: requireAuth
  +-- [2] UPDATE projects SET status='published', published_at=COALESCE(published_at, NOW())
  +-- [3] Invalidate caches: DEL cache:projects:list:*, DEL cache:project:{slug}, DEL cache:sitemap
  +-- [4] Create notifications for admins
  +-- [5] Socket.io emit "project_published" to room "admin"
  +-- [6] Response: 200 { success: true }

=== DELETE (soft) ===

DELETE /api/admin/projects/:id
  |
  +-- [1] Auth: requireAuth
  +-- [2] Validate: confirm dialog data (for published projects, require title match)
  +-- [3] UPDATE projects SET deleted_at = NOW() WHERE id = ?
  +-- [4] Invalidate caches
  +-- [5] Response: 200 { success: true }
```

---

## SEED DATA

The following data MUST be seeded on first deployment:

### 1. Super Admin User
```sql
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
  (ULID(), 'admin@bhquan.site', '$2b$12$...', 'Super Admin', 'admin', 1);
```

### 2. Default Project Categories
```sql
INSERT INTO categories (id, name, slug, type, display_order, is_active) VALUES
  (ULID(), 'Residential',  'residential',  'project', 1, 1),
  (ULID(), 'Commercial',   'commercial',   'project', 2, 1),
  (ULID(), 'Hospitality',  'hospitality',  'project', 3, 1);
```

### 3. Default Product Categories
```sql
INSERT INTO categories (id, name, slug, type, display_order, is_active) VALUES
  (ULID(), 'Go Cong Nghiep',    'industrial-wood', 'product', 1, 1),
  (ULID(), 'Go Tu Nhien',       'natural-wood',    'product', 2, 1),
  (ULID(), 'Kinh Cuong Luc',    'glass-fronted',   'product', 3, 1),
  (ULID(), 'Acrylic',           'acrylic',         'product', 4, 1),
  (ULID(), 'Melamine',          'melamine',        'product', 5, 1);
```

### 4. Default Settings
All settings listed in TABLE 13 notes above.

### 5. Default Homepage Config
```sql
INSERT INTO page_configs (id, page_slug, config_draft, config_published) VALUES
  (ULID(), 'homepage', '{"sections": [...]}', '{"sections": [...]}');
```

---

## TECHNICAL RISKS & MITIGATIONS

| # | Risk | Impact | Probability | Mitigation |
|---|---|---|---|---|
| 1 | **Image processing memory** -- Sharp processing 4K images (20+ MP) can consume >500MB RAM per job | Server OOM crash | Medium | Limit concurrent IMAGE_JOBs to 2 via BullMQ concurrency. Set max file size 10MB. Sharp `sequentialRead` option. Monitor memory usage. |
| 2 | **Redis memory growth** -- Analytics counters and cache can grow unbounded | Redis OOM, data loss | Medium | TTL on all keys (max 48h for counters, 10min for cache). TRAFFIC_SYNC_JOB processes and TTL handles cleanup. Monitor Redis memory with `INFO memory`. Set `maxmemory-policy allkeys-lru`. |
| 3 | **N+1 query problem** -- Project list with gallery images, product list with images | Slow API response, DB overload | High | Use JOINs for list queries. Eager load relationships in TypeORM (`relations: ['coverImage', 'category']`). Never query gallery images in a loop. |
| 4 | **SQL injection via rich text** -- DOMPurify bypass or misconfiguration | Data breach, XSS | Low | DOMPurify sanitization on server before DB write (ref C6.2). Parameterized queries only (TypeORM handles this). Never interpolate user input into SQL. |
| 5 | **Rate limit bypass via IP spoofing** -- Attacker sends fake X-Forwarded-For headers | Brute force, spam | Medium | Trust only the first proxy IP from Cloudflare/Nginx `X-Real-IP` header. Configure trusted proxy list in Express. Never trust raw `X-Forwarded-For`. |
| 6 | **File upload abuse** -- Non-image files disguised with image extension | Malware storage, server exploit | Medium | Validate both MIME type AND file magic bytes (first few bytes). Reject mismatches. Process with Sharp immediately (Sharp will reject non-image files). Never serve originals directly. |
| 7 | **JWT token theft via XSS** -- If XSS exists, attacker can steal access token | Account takeover | Low | Access token in memory only (not localStorage). Refresh token in HttpOnly + Secure + SameSite=Strict cookie. CSP headers via Helmet.js (ref C6.4). DOMPurify for all user content. |
| 8 | **Socket.io unauthenticated connections** -- Attackers connecting without valid session | Information leak, resource abuse | Medium | JWT verification middleware on Socket.io handshake. Reject connections without valid token. Rate limit connection attempts per IP. |
| 9 | **Page views table growth** -- High-traffic site can generate millions of rows per month | Slow queries, storage cost | Medium | Table partitioned by year. Aggregate into `page_view_daily` for fast reads. Optional: only write detailed `page_views` for last 30 days, then purge. |
| 10 | **Concurrent page builder edits** -- Two admins editing same page simultaneously | Data overwrite, lost changes | Low | Optimistic locking via `version` column. On save, check `WHERE version = expectedVersion`. If conflict, return 409 and notify second admin. Socket.io event when someone starts editing. |

---

## SA_DONE

- **API endpoints:** Defined inline with each table and flow diagram
- **DB schema:** 18 tables with full SQL CREATE statements
- **Redis keys:** 5 categories (counters, rate limiting, cache, sessions, queues)
- **System flows:** 6 detailed flows (Consultation, Image Upload, Page Builder, Analytics, Auth, Project CRUD)
- **Technical risks:** 10 risks with impact assessment and mitigations
- **Seed data:** Super admin, default categories, default settings, homepage config

---

## APPENDIX: FULL TABLE LIST

| # | Table | PK Type | Purpose | Est. Rows (1yr) |
|---|---|---|---|---|
| 1 | users | ULID | Admin/editor accounts | < 20 |
| 2 | refresh_tokens | ULID | JWT refresh token tracking | < 1,000 |
| 3 | login_attempts | BIGINT | Auth rate limiting audit | < 10,000 |
| 4 | categories | ULID | Project + product categories | < 50 |
| 5 | media | ULID | Central image storage registry | < 5,000 |
| 6 | projects | ULID | Portfolio projects | < 200 |
| 7 | project_gallery | ULID | Project-image junction | < 2,000 |
| 8 | products | ULID | Kitchen cabinet products | < 500 |
| 9 | product_images | ULID | Product-image junction | < 3,000 |
| 10 | consultations | ULID | Customer consultation requests | < 5,000 |
| 11 | page_configs | ULID | Page builder JSON configs | < 10 |
| 12 | page_config_history | ULID | Page builder version history | < 50 |
| 13 | settings | ULID | Key-value site settings | < 30 |
| 14 | notifications | ULID | Admin notification inbox | < 10,000 |
| 15 | page_views | BIGINT | Detailed traffic analytics | < 1,000,000 |
| 16 | page_view_daily | BIGINT | Aggregated daily traffic | < 20,000 |
| 17 | email_logs | ULID | Email delivery tracking | < 10,000 |
| 18 | password_reset_tokens | ULID | Password reset flow | < 100 |
