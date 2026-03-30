-- ============================================================
-- Table: products
-- Description: Kitchen cabinet and interior product catalog.
--              Supports material filtering, draft/published workflow, and SEO.
-- Ref: A3.4 Product Grid, A5.1-A5.5 Product Detail
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
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
