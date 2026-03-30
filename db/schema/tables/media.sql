-- ============================================================
-- Table: media
-- Description: Central media/image registry with R2 storage URLs.
--              Tracks async image processing pipeline (pending -> processing -> completed/failed).
-- Ref: C1.1 Upload, C1.2 Image Processing, C1.3 R2 Storage, B3.5 Image Gallery Manager
-- ============================================================

CREATE TABLE IF NOT EXISTS media (
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
