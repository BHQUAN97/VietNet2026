-- ============================================================
-- Table: product_images
-- Description: Junction table linking products to media images.
--              Supports primary image flag and display ordering.
-- Ref: A5.1 Product Images
-- ============================================================

CREATE TABLE IF NOT EXISTS product_images (
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
