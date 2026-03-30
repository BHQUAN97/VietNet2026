-- ============================================================
-- Table: page_configs
-- Description: Page builder configuration storage with draft/published workflow.
--              Stores JSON config for homepage, about, contact pages.
--              Auto-saved drafts every 30 seconds, published on explicit action.
-- Ref: B5.1-B5.7 Page Builder
-- ============================================================

CREATE TABLE IF NOT EXISTS page_configs (
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
