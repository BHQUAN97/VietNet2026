-- ============================================================
-- Table: refresh_tokens
-- Description: Stores hashed refresh tokens for JWT session management.
--              Token rotation: old token revoked on refresh, new token issued.
-- Ref: B1.3 Session Management, C6 Security
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,
  token_hash        VARCHAR(255) NOT NULL,                     -- SHA-256 hash of refresh token
  expires_at        DATETIME NOT NULL,
  revoked_at        DATETIME NULL,                             -- NULL = active, set when revoked
  ip_address        VARCHAR(45) NOT NULL,                      -- IPv4 or IPv6
  user_agent        TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_refresh_tokens_token_hash (token_hash),
  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires (expires_at),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
