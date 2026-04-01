CREATE TABLE IF NOT EXISTS `page_view_daily` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `page_path` VARCHAR(500) NOT NULL,
  `view_date` DATE NOT NULL,
  `total_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `unique_visitors` INT UNSIGNED NOT NULL DEFAULT 0,
  `mobile_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `desktop_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `tablet_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `bot_views` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_page_view_daily_path_date` (`page_path`(191), `view_date`),
  KEY `IDX_page_view_daily_date` (`view_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
