CREATE TABLE IF NOT EXISTS `page_views` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `page_path` VARCHAR(500) NOT NULL,
  `visitor_ip` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  `referrer` VARCHAR(500) NULL DEFAULT NULL,
  `device_type` ENUM('desktop','mobile','tablet') NULL DEFAULT NULL,
  `is_bot` TINYINT(1) NOT NULL DEFAULT 0,
  `session_id` VARCHAR(100) NULL DEFAULT NULL,
  `viewed_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`, `viewed_at`),
  KEY `IDX_page_views_page_path` (`page_path`(191)),
  KEY `IDX_page_views_viewed_at` (`viewed_at`),
  KEY `IDX_page_views_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (UNIX_TIMESTAMP(`viewed_at`)) (
  PARTITION p2026_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2026-04-01')),
  PARTITION p2026_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2026-07-01')),
  PARTITION p2026_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2026-10-01')),
  PARTITION p2026_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2027-01-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
