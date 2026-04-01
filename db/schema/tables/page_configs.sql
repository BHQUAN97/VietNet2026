CREATE TABLE IF NOT EXISTS `page_configs` (
  `id` CHAR(26) NOT NULL,
  `page_slug` VARCHAR(100) NOT NULL,
  `config_draft` JSON NULL DEFAULT NULL,
  `config_published` JSON NULL DEFAULT NULL,
  `version` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `published_by` CHAR(26) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(26) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_page_configs_page_slug` (`page_slug`),
  CONSTRAINT `FK_page_configs_publisher` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_page_configs_updater` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
