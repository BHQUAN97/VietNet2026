CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(26) NOT NULL,
  `user_id` CHAR(26) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NULL DEFAULT NULL,
  `link` VARCHAR(500) NULL DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_notifications_user_id` (`user_id`),
  KEY `IDX_notifications_is_read` (`is_read`),
  KEY `IDX_notifications_created_at` (`created_at`),
  CONSTRAINT `FK_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
