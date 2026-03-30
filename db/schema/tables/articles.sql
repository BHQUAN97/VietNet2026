CREATE TABLE IF NOT EXISTS articles (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL,
  excerpt           VARCHAR(500) NULL,                         -- short summary for cards/meta
  content           TEXT NULL,                                  -- rich HTML content, sanitized by DOMPurify
  category_id       VARCHAR(26) NULL,
  cover_image_id    VARCHAR(26) NULL,                          -- FK to media
  status            ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at      DATETIME NULL,
  is_featured       TINYINT(1) NOT NULL DEFAULT 0,
  view_count        INT UNSIGNED NOT NULL DEFAULT 0,
  display_order     INT NOT NULL DEFAULT 0,

  -- SEO fields
  seo_title         VARCHAR(255) NULL,
  seo_description   VARCHAR(500) NULL,
  og_image_id       VARCHAR(26) NULL,                          -- FK to media

  -- Audit
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,
  created_by        VARCHAR(26) NULL,
  updated_by        VARCHAR(26) NULL,

  UNIQUE INDEX uq_articles_slug (slug),
  INDEX idx_articles_category (category_id),
  INDEX idx_articles_status (status),
  INDEX idx_articles_is_featured (is_featured),
  INDEX idx_articles_published_at (published_at),
  INDEX idx_articles_display_order (display_order),
  INDEX idx_articles_deleted (deleted_at),

  CONSTRAINT fk_articles_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_cover_image
    FOREIGN KEY (cover_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_og_image
    FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
