-- ============================================================
-- Table: page_config_history
-- Description: Version history for page configurations.
--              Keeps last 5 versions per page for rollback capability.
-- Ref: B5.7 Save/Cancel (rollback, keep 5 versions)
-- ============================================================

CREATE TABLE IF NOT EXISTS page_config_history (
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
