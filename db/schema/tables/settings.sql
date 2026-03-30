-- ============================================================
-- Table: settings
-- Description: Key-value store for site-wide settings grouped by category.
--              Stores JSON string values for general, SEO, email, social, analytics config.
-- Ref: B8.1 Site Settings, B8.2 SEO Defaults, B8.3 Email Templates
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
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
