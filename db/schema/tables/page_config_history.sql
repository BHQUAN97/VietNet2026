CREATE TABLE IF NOT EXISTS `page_config_history` (
  `id` CHAR(26) NOT NULL,
  `page_config_id` CHAR(26) NOT NULL,
  `config_snapshot` JSON NOT NULL,
  `version` INT UNSIGNED NOT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `published_by` CHAR(26) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_page_config_history_page_config_id` (`page_config_id`),
  KEY `IDX_page_config_history_version` (`version`),
  CONSTRAINT `FK_page_config_history_page` FOREIGN KEY (`page_config_id`) REFERENCES `page_configs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_page_config_history_publisher` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
