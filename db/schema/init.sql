-- ============================================================
-- VietNet Interior — Database Initialization
-- ============================================================
-- Run: mysql -u root -p vietnet < db/schema/init.sql
-- Order: respects foreign key dependencies
--
-- Tables: 19 total
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

-- 1. Independent tables (no foreign key dependencies)
SOURCE tables/users.sql;
SOURCE tables/login_attempts.sql;

-- 2. Tables depending on users only
SOURCE tables/refresh_tokens.sql;
SOURCE tables/password_reset_tokens.sql;

-- 3. Tables with self-ref + users dependency
SOURCE tables/categories.sql;

-- 4. Tables depending on users
SOURCE tables/media.sql;

-- 5. Tables depending on categories, media, users
SOURCE tables/projects.sql;

-- 6. Junction tables depending on projects + media
SOURCE tables/project_gallery.sql;

-- 7. Tables depending on categories, media, users
SOURCE tables/articles.sql;
SOURCE tables/products.sql;

-- 8. Junction tables depending on products + media
SOURCE tables/product_images.sql;

-- 9. Tables depending on users + products
SOURCE tables/consultations.sql;

-- 10. Tables depending on users only
SOURCE tables/page_configs.sql;

-- 11. Tables depending on page_configs + users
SOURCE tables/page_config_history.sql;

-- 12. Tables depending on users only
SOURCE tables/settings.sql;
SOURCE tables/notifications.sql;

-- 13. Independent analytics tables (no FK)
SOURCE tables/page_views.sql;
SOURCE tables/page_view_daily.sql;

-- 14. Independent logging tables (no FK)
SOURCE tables/email_logs.sql;
