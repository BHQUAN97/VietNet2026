import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Initial schema migration — tao tat ca 19 tables cho VietNet Interior
 * ULID (char 26) lam primary key, soft delete qua deleted_at,
 * auto-audit qua created_by/updated_by
 */
export class InitialSchema1711929600000 implements MigrationInterface {
  name = 'InitialSchema1711929600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. users ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` char(26) NOT NULL,
        \`full_name\` varchar(100) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`phone\` varchar(20) NULL,
        \`avatar_url\` varchar(500) NULL,
        \`role\` enum('super_admin','admin','editor','viewer') NOT NULL DEFAULT 'viewer',
        \`status\` enum('active','inactive','banned') NOT NULL DEFAULT 'active',
        \`refresh_token_hash\` varchar(255) NULL,
        \`last_login_at\` timestamp NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`created_by\` char(26) NULL,
        \`updated_by\` char(26) NULL,
        \`deleted_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 2. refresh_tokens ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`refresh_tokens\` (
        \`id\` char(26) NOT NULL,
        \`user_id\` char(26) NOT NULL,
        \`token_hash\` varchar(255) NOT NULL,
        \`expires_at\` timestamp NOT NULL,
        \`revoked_at\` timestamp NULL,
        \`ip_address\` varchar(45) NOT NULL,
        \`user_agent\` text NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_refresh_tokens_user_id\` (\`user_id\`),
        CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 3. login_attempts ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`login_attempts\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`ip_address\` varchar(45) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`success\` tinyint NOT NULL,
        \`attempted_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_login_attempts_ip\` (\`ip_address\`, \`attempted_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 4. password_reset_tokens ──────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
        \`id\` char(26) NOT NULL,
        \`user_id\` char(26) NOT NULL,
        \`token_hash\` varchar(255) NOT NULL,
        \`expires_at\` timestamp NOT NULL,
        \`used_at\` timestamp NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_password_reset_user\` (\`user_id\`),
        CONSTRAINT \`FK_password_reset_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 5. media ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`media\` (
        \`id\` char(26) NOT NULL,
        \`original_filename\` varchar(255) NOT NULL,
        \`mime_type\` varchar(50) NOT NULL,
        \`file_size\` int unsigned NOT NULL,
        \`original_url\` varchar(500) NOT NULL,
        \`thumbnail_url\` varchar(500) NULL,
        \`preview_url\` varchar(500) NULL,
        \`width\` int unsigned NULL,
        \`height\` int unsigned NULL,
        \`alt_text\` varchar(255) NULL,
        \`blurhash\` varchar(100) NULL,
        \`processing_status\` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
        \`processing_error\` text NULL,
        \`uploaded_by\` char(26) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_media_uploaded_by\` (\`uploaded_by\`),
        CONSTRAINT \`FK_media_uploader\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 6. categories ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` char(26) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`slug\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`type\` enum('project','product') NOT NULL,
        \`parent_id\` char(26) NULL,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`created_by\` char(26) NULL,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_categories_slug_type\` (\`slug\`, \`type\`),
        KEY \`IDX_categories_parent\` (\`parent_id\`),
        CONSTRAINT \`FK_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 7. projects ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` char(26) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`content\` text NULL,
        \`category_id\` char(26) NULL,
        \`style\` varchar(100) NULL,
        \`materials\` json NULL,
        \`area\` varchar(50) NULL,
        \`duration\` varchar(50) NULL,
        \`location\` varchar(255) NULL,
        \`year_completed\` smallint NULL,
        \`cover_image_id\` char(26) NULL,
        \`status\` enum('draft','published') NOT NULL DEFAULT 'draft',
        \`published_at\` timestamp NULL,
        \`is_featured\` tinyint NOT NULL DEFAULT 0,
        \`view_count\` int unsigned NOT NULL DEFAULT 0,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`ref_code\` varchar(20) NULL,
        \`seo_title\` varchar(255) NULL,
        \`seo_description\` varchar(500) NULL,
        \`og_image_id\` char(26) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`created_by\` char(26) NULL,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_projects_slug\` (\`slug\`),
        KEY \`IDX_projects_category\` (\`category_id\`),
        KEY \`IDX_projects_status\` (\`status\`),
        KEY \`IDX_projects_featured\` (\`is_featured\`),
        CONSTRAINT \`FK_projects_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_projects_cover_image\` FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_projects_og_image\` FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 8. project_gallery ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`project_gallery\` (
        \`id\` char(26) NOT NULL,
        \`project_id\` char(26) NOT NULL,
        \`media_id\` char(26) NOT NULL,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`caption\` varchar(255) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_project_gallery_project\` (\`project_id\`),
        CONSTRAINT \`FK_project_gallery_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_project_gallery_media\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 9. products ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` char(26) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`slug\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`category_id\` char(26) NULL,
        \`material_type\` varchar(100) NULL,
        \`finish\` varchar(100) NULL,
        \`dimensions\` json NULL,
        \`price_range\` varchar(100) NULL,
        \`cover_image_id\` char(26) NULL,
        \`status\` enum('draft','published') NOT NULL DEFAULT 'draft',
        \`published_at\` timestamp NULL,
        \`is_new\` tinyint NOT NULL DEFAULT 0,
        \`is_featured\` tinyint NOT NULL DEFAULT 0,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`seo_title\` varchar(255) NULL,
        \`seo_description\` varchar(500) NULL,
        \`og_image_id\` char(26) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`created_by\` char(26) NULL,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_products_slug\` (\`slug\`),
        KEY \`IDX_products_category\` (\`category_id\`),
        KEY \`IDX_products_status\` (\`status\`),
        CONSTRAINT \`FK_products_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_products_cover_image\` FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_products_og_image\` FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 10. product_images ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`product_images\` (
        \`id\` char(26) NOT NULL,
        \`product_id\` char(26) NOT NULL,
        \`media_id\` char(26) NOT NULL,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`is_primary\` tinyint NOT NULL DEFAULT 0,
        \`caption\` varchar(255) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_product_images_product\` (\`product_id\`),
        CONSTRAINT \`FK_product_images_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_product_images_media\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 11. articles ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`articles\` (
        \`id\` char(26) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(255) NOT NULL,
        \`excerpt\` varchar(500) NULL,
        \`content\` text NULL,
        \`category_id\` char(26) NULL,
        \`cover_image_id\` char(26) NULL,
        \`status\` enum('draft','published') NOT NULL DEFAULT 'draft',
        \`published_at\` timestamp NULL,
        \`is_featured\` tinyint NOT NULL DEFAULT 0,
        \`view_count\` int unsigned NOT NULL DEFAULT 0,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`seo_title\` varchar(255) NULL,
        \`seo_description\` varchar(500) NULL,
        \`og_image_id\` char(26) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`created_by\` char(26) NULL,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_articles_slug\` (\`slug\`),
        KEY \`IDX_articles_category\` (\`category_id\`),
        KEY \`IDX_articles_status\` (\`status\`),
        CONSTRAINT \`FK_articles_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_articles_cover_image\` FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_articles_og_image\` FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 12. consultations ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`consultations\` (
        \`id\` char(26) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(20) NULL,
        \`project_type\` enum('residential','commercial','hospitality','renovation','other') NULL,
        \`area\` varchar(50) NULL,
        \`budget_range\` varchar(100) NULL,
        \`message\` text NOT NULL,
        \`product_id\` char(26) NULL,
        \`status\` enum('new','contacted','scheduled','completed','cancelled') NOT NULL DEFAULT 'new',
        \`assigned_to\` char(26) NULL,
        \`notes\` text NULL,
        \`status_changed_at\` timestamp NULL,
        \`status_changed_by\` char(26) NULL,
        \`ip_address\` varchar(45) NULL,
        \`user_agent\` text NULL,
        \`source\` varchar(50) NULL,
        \`honeypot\` varchar(255) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_consultations_status\` (\`status\`),
        KEY \`IDX_consultations_assigned\` (\`assigned_to\`),
        CONSTRAINT \`FK_consultations_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`),
        CONSTRAINT \`FK_consultations_assignee\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 13. page_configs ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`page_configs\` (
        \`id\` char(26) NOT NULL,
        \`page_slug\` varchar(100) NOT NULL,
        \`config_draft\` json NULL,
        \`config_published\` json NULL,
        \`version\` int unsigned NOT NULL DEFAULT 0,
        \`published_at\` timestamp NULL,
        \`published_by\` char(26) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_page_configs_slug\` (\`page_slug\`),
        CONSTRAINT \`FK_page_configs_publisher\` FOREIGN KEY (\`published_by\`) REFERENCES \`users\` (\`id\`),
        CONSTRAINT \`FK_page_configs_updater\` FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 14. page_config_history ───────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`page_config_history\` (
        \`id\` char(26) NOT NULL,
        \`page_config_id\` char(26) NOT NULL,
        \`config_snapshot\` json NOT NULL,
        \`version\` int unsigned NOT NULL,
        \`published_at\` timestamp NULL,
        \`published_by\` char(26) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_page_config_history_config\` (\`page_config_id\`),
        CONSTRAINT \`FK_page_config_history_config\` FOREIGN KEY (\`page_config_id\`) REFERENCES \`page_configs\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_page_config_history_publisher\` FOREIGN KEY (\`published_by\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 15. settings ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`settings\` (
        \`id\` char(26) NOT NULL,
        \`setting_key\` varchar(100) NOT NULL,
        \`setting_value\` text NOT NULL,
        \`setting_group\` varchar(50) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`updated_by\` char(26) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_settings_key\` (\`setting_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 16. notifications ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` char(26) NOT NULL,
        \`user_id\` char(26) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`body\` text NULL,
        \`link\` varchar(500) NULL,
        \`is_read\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_notifications_user\` (\`user_id\`),
        KEY \`IDX_notifications_read\` (\`is_read\`),
        CONSTRAINT \`FK_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 17. email_logs ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`email_logs\` (
        \`id\` char(26) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`to_email\` varchar(255) NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`status\` enum('queued','sent','failed') NOT NULL DEFAULT 'queued',
        \`error_message\` text NULL,
        \`retry_count\` tinyint unsigned NOT NULL DEFAULT 0,
        \`sent_at\` timestamp NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_email_logs_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 18. page_views ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`page_views\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`page_path\` varchar(500) NOT NULL,
        \`visitor_ip\` varchar(45) NOT NULL,
        \`user_agent\` text NULL,
        \`referrer\` varchar(500) NULL,
        \`device_type\` enum('desktop','mobile','tablet') NULL,
        \`is_bot\` tinyint NOT NULL DEFAULT 0,
        \`session_id\` varchar(100) NULL,
        \`viewed_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_page_views_path_date\` (\`page_path\`(191), \`viewed_at\`),
        KEY \`IDX_page_views_session\` (\`session_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── 19. page_view_daily ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`page_view_daily\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`page_path\` varchar(500) NOT NULL,
        \`view_date\` date NOT NULL,
        \`total_views\` int unsigned NOT NULL DEFAULT 0,
        \`unique_visitors\` int unsigned NOT NULL DEFAULT 0,
        \`mobile_views\` int unsigned NOT NULL DEFAULT 0,
        \`desktop_views\` int unsigned NOT NULL DEFAULT 0,
        \`tablet_views\` int unsigned NOT NULL DEFAULT 0,
        \`bot_views\` int unsigned NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_page_view_daily_path_date\` (\`page_path\`(191), \`view_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order to respect FK constraints
    await queryRunner.query('DROP TABLE IF EXISTS `page_view_daily`')
    await queryRunner.query('DROP TABLE IF EXISTS `page_views`')
    await queryRunner.query('DROP TABLE IF EXISTS `email_logs`')
    await queryRunner.query('DROP TABLE IF EXISTS `notifications`')
    await queryRunner.query('DROP TABLE IF EXISTS `page_config_history`')
    await queryRunner.query('DROP TABLE IF EXISTS `page_configs`')
    await queryRunner.query('DROP TABLE IF EXISTS `consultations`')
    await queryRunner.query('DROP TABLE IF EXISTS `product_images`')
    await queryRunner.query('DROP TABLE IF EXISTS `products`')
    await queryRunner.query('DROP TABLE IF EXISTS `project_gallery`')
    await queryRunner.query('DROP TABLE IF EXISTS `projects`')
    await queryRunner.query('DROP TABLE IF EXISTS `articles`')
    await queryRunner.query('DROP TABLE IF EXISTS `categories`')
    await queryRunner.query('DROP TABLE IF EXISTS `media`')
    await queryRunner.query('DROP TABLE IF EXISTS `password_reset_tokens`')
    await queryRunner.query('DROP TABLE IF EXISTS `login_attempts`')
    await queryRunner.query('DROP TABLE IF EXISTS `refresh_tokens`')
    await queryRunner.query('DROP TABLE IF EXISTS `settings`')
    await queryRunner.query('DROP TABLE IF EXISTS `users`')
  }
}
