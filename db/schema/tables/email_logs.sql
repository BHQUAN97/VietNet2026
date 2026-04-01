CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` CHAR(26) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `to_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  `error_message` TEXT NULL DEFAULT NULL,
  `retry_count` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_email_logs_status` (`status`),
  KEY `IDX_email_logs_type` (`type`),
  KEY `IDX_email_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
