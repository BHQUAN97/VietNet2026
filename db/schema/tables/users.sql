-- ============================================================
-- Table: users
-- Description: Admin and editor user accounts for VietNet Interior CMS.
--              Supports login, session management, and user management.
-- Ref: B1.1 Login, B1.2 Forgot Password, B1.3 Session Management, B7.1-B7.4 User Management
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,                     -- bcrypt, min cost 12
  name              VARCHAR(100) NOT NULL,
  role              ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
  avatar_url        VARCHAR(500) NULL,
  last_login_at     DATETIME NULL,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,             -- soft disable without delete
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,

  UNIQUE INDEX uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_is_active (is_active),
  INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
