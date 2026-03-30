-- ============================================================
-- Table: project_gallery
-- Description: Junction table linking projects to media images.
--              Supports drag-and-drop reordering via display_order.
-- Ref: A4.3 Image Gallery, B3.5 Image Gallery Manager
-- ============================================================

CREATE TABLE IF NOT EXISTS project_gallery (
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
