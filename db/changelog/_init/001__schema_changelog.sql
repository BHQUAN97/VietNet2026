-- ============================================================
-- Schema changelog tracking table
-- Tao tu dong boi CI/CD — KHONG xoa hoac sua file nay
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_changelog (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    version     VARCHAR(20) NOT NULL COMMENT 'VD: 1.0.0, 1.1.0',
    filename    VARCHAR(255) NOT NULL COMMENT 'VD: 001__add_column.sql',
    description VARCHAR(255) NOT NULL DEFAULT '',
    applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_by  VARCHAR(50) NOT NULL DEFAULT 'ci' COMMENT 'ci hoac manual',
    checksum    VARCHAR(64) NULL COMMENT 'SHA256 cua file SQL',
    execution_ms INT NULL COMMENT 'Thoi gian chay (ms)',
    UNIQUE KEY uq_version_file (version, filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '[OK] schema_changelog table ready' AS result;
