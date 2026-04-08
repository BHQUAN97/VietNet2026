-- ============================================================
-- 1.0.0/003: Add 'article' and 'material' to categories.type enum
-- Date:   2026-04-08
-- Author: Claude
-- Fixes:  QueryFailedError: Data truncated for column 'type'
-- ============================================================

ALTER TABLE `categories`
  MODIFY COLUMN `type` ENUM('project','product','article','material') NOT NULL;

SELECT 'V003: categories.type enum updated' AS changelog_status;
