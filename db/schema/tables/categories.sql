-- ============================================================
-- Table: categories
-- Description: Hierarchical categories for projects and products.
--              Self-referential parent_id allows one level of nesting (max depth 2).
-- Ref: B3.4 Category System, A3.1 Material Filter
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
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
