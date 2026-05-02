-- Them cot scheduled_publish_at cho articles, projects, products
-- Tuong duong TypeORM migration: 1776510000000-AddScheduledPublishAt
-- Idempotent: kiem tra information_schema.COLUMNS truoc khi ALTER
-- MySQL 8.0 khong ho tro ALTER TABLE ADD COLUMN IF NOT EXISTS (chi MariaDB)
-- => dung PREPARE + EXECUTE de conditional DDL

-- === articles ===
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE table_schema = DATABASE() AND table_name = 'articles' AND column_name = 'scheduled_publish_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `articles` ADD COLUMN `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL',
  'SELECT 1 -- articles col exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
WHERE table_schema = DATABASE() AND table_name = 'articles' AND index_name = 'IDX_articles_scheduled_publish_at';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX `IDX_articles_scheduled_publish_at` ON `articles` (`scheduled_publish_at`)',
  'SELECT 1 -- articles idx exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- === projects ===
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE table_schema = DATABASE() AND table_name = 'projects' AND column_name = 'scheduled_publish_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `projects` ADD COLUMN `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL',
  'SELECT 1 -- projects col exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
WHERE table_schema = DATABASE() AND table_name = 'projects' AND index_name = 'IDX_projects_scheduled_publish_at';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX `IDX_projects_scheduled_publish_at` ON `projects` (`scheduled_publish_at`)',
  'SELECT 1 -- projects idx exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- === products ===
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'scheduled_publish_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `products` ADD COLUMN `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL',
  'SELECT 1 -- products col exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
WHERE table_schema = DATABASE() AND table_name = 'products' AND index_name = 'IDX_products_scheduled_publish_at';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX `IDX_products_scheduled_publish_at` ON `products` (`scheduled_publish_at`)',
  'SELECT 1 -- products idx exists');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
