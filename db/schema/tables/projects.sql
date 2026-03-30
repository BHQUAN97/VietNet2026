-- ============================================================
-- Table: projects
-- Description: Interior design project portfolio entries.
--              Supports draft/published workflow, SEO fields, and featured projects.
-- Ref: A4 Project Detail, B3.1-B3.8 Project Management, A2.3 Featured Projects
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
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
