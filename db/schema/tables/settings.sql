CREATE TABLE IF NOT EXISTS `settings` (
  `id` CHAR(26) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_group` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(26) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_settings_key` (`setting_key`),
  KEY `IDX_settings_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
