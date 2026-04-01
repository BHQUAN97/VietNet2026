CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` CHAR(26) NOT NULL,
  `user_id` CHAR(26) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `revoked_at` TIMESTAMP NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_refresh_tokens_user_id` (`user_id`),
  KEY `IDX_refresh_tokens_expires_at` (`expires_at`),
  CONSTRAINT `FK_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
