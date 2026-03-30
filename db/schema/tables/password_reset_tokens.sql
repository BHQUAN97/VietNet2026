-- ============================================================
-- Table: password_reset_tokens
-- Description: Single-use password reset tokens with 1-hour expiry.
--              Token hash stored (SHA-256), raw token sent via email only.
-- Ref: B1.2 Forgot Password
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,
  token_hash        VARCHAR(255) NOT NULL,                     -- SHA-256 hash
  expires_at        DATETIME NOT NULL,                         -- 1 hour from creation
  used_at           DATETIME NULL,                             -- set when token is consumed
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_password_reset_token_hash (token_hash),
  INDEX idx_password_reset_user (user_id),
  INDEX idx_password_reset_expires (expires_at),

  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
