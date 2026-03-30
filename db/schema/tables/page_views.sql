-- ============================================================
-- Table: page_views
-- Description: High-volume page view tracking with yearly partitioning.
--              Written by TRAFFIC_SYNC_JOB from Redis counters every 10 minutes.
-- Ref: B6.1-B6.6 Analytics (detailed records)
-- ============================================================

CREATE TABLE IF NOT EXISTS page_views (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- high volume, not ULID
  page_path         VARCHAR(500) NOT NULL,
  visitor_ip        VARCHAR(45) NOT NULL,
  user_agent        TEXT NULL,
  referrer          VARCHAR(500) NULL,
  device_type       ENUM('desktop', 'mobile', 'tablet') NULL,
  is_bot            TINYINT(1) NOT NULL DEFAULT 0,
  session_id        VARCHAR(100) NULL,
  viewed_at         DATETIME NOT NULL,

  INDEX idx_page_views_path_viewed (page_path(100), viewed_at),
  INDEX idx_page_views_viewed (viewed_at),
  INDEX idx_page_views_is_bot (is_bot),
  INDEX idx_page_views_device (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  PARTITION BY RANGE (YEAR(viewed_at)) (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
  );
