-- ============================================================
-- Changelog: V002__create_app_logs.sql
-- Date: 2026-04-02
-- Author: Claude
-- Description: Create app_logs table (missing from V001 initial schema)
-- Affected tables: app_logs
-- Idempotent: YES
-- ============================================================

SET @stmt = 'SELECT 1';

SET @exists = (SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'app_logs');

SET @stmt = IF(@exists = 0,
  'CREATE TABLE `app_logs` (
    `id` CHAR(26) NOT NULL,
    `level` ENUM(''error'',''warn'',''info'',''debug'',''trace'') NOT NULL DEFAULT ''info'',
    `message` VARCHAR(500) NOT NULL,
    `stack_trace` TEXT NULL DEFAULT NULL,
    `endpoint` VARCHAR(255) NULL DEFAULT NULL,
    `status_code` SMALLINT NULL DEFAULT NULL,
    `ip` VARCHAR(45) NULL DEFAULT NULL,
    `user_id` CHAR(26) NULL DEFAULT NULL,
    `user_agent` VARCHAR(500) NULL DEFAULT NULL,
    `context` JSON NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `IDX_app_logs_level` (`level`),
    KEY `IDX_app_logs_created_at` (`created_at`),
    KEY `IDX_app_logs_level_created_at` (`level`, `created_at`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''app_logs already exists'' AS changelog_status');

PREPARE dynamic_stmt FROM @stmt;
EXECUTE dynamic_stmt;
DEALLOCATE PREPARE dynamic_stmt;
