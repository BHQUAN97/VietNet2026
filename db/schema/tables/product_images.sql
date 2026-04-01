CREATE TABLE IF NOT EXISTS `product_images` (
  `id` CHAR(26) NOT NULL,
  `product_id` CHAR(26) NOT NULL,
  `media_id` CHAR(26) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `caption` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_product_images_product_id` (`product_id`),
  KEY `IDX_product_images_media_id` (`media_id`),
  CONSTRAINT `FK_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_product_images_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
