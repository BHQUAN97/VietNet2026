-- ============================================================
-- Table: page_view_daily
-- Description: Aggregated daily page view statistics.
--              Populated by TRAFFIC_SYNC_JOB via UPSERT pattern every 10 minutes.
--              Used for dashboard KPI queries and analytics charts.
-- Ref: B6.1 Traffic Overview, B6.4 Device Breakdown, B6.5 Top Pages
-- ============================================================

CREATE TABLE IF NOT EXISTS page_view_daily (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  page_path         VARCHAR(500) NOT NULL,
  view_date         DATE NOT NULL,
  total_views       INT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors   INT UNSIGNED NOT NULL DEFAULT 0,
  mobile_views      INT UNSIGNED NOT NULL DEFAULT 0,
  desktop_views     INT UNSIGNED NOT NULL DEFAULT 0,
  tablet_views      INT UNSIGNED NOT NULL DEFAULT 0,
  bot_views         INT UNSIGNED NOT NULL DEFAULT 0,

  UNIQUE INDEX uq_page_view_daily_path_date (page_path(100), view_date),
  INDEX idx_page_view_daily_date (view_date),
  INDEX idx_page_view_daily_views (total_views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
