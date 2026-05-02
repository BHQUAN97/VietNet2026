-- Them cot scheduled_publish_at cho articles, projects, products
-- Tuong duong TypeORM migration: 1776510000000-AddScheduledPublishAt
-- Cron worker quet: scheduled_publish_at <= NOW() AND status='draft' -> auto publish
-- Idempotent: IF NOT EXISTS (MySQL 8.0+)

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS `IDX_articles_scheduled_publish_at`
  ON `articles` (`scheduled_publish_at`);

ALTER TABLE `projects`
  ADD COLUMN IF NOT EXISTS `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS `IDX_projects_scheduled_publish_at`
  ON `projects` (`scheduled_publish_at`);

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `scheduled_publish_at` TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS `IDX_products_scheduled_publish_at`
  ON `products` (`scheduled_publish_at`);
