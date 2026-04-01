CREATE TABLE IF NOT EXISTS `project_gallery` (
  `id` CHAR(26) NOT NULL,
  `project_id` CHAR(26) NOT NULL,
  `media_id` CHAR(26) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `caption` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_project_gallery_project_id` (`project_id`),
  KEY `IDX_project_gallery_media_id` (`media_id`),
  CONSTRAINT `FK_project_gallery_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_project_gallery_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
