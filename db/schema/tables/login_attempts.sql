-- ============================================================
-- Table: login_attempts
-- Description: Tracks login attempts for rate limiting and brute-force protection.
--              5 failed attempts in 10 minutes = lock 30 minutes.
-- Ref: B1.1 Login (rate limiting), C6.1 Rate Limiting
-- ============================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id                BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- high volume, not ULID
  ip_address        VARCHAR(45) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  success           TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_login_attempts_ip_at (ip_address, attempted_at),
  INDEX idx_login_attempts_email_at (email, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
