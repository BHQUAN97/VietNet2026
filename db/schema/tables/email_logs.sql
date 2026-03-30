-- ============================================================
-- Table: email_logs
-- Description: Records every email attempt (never logs email body content).
--              Supports retry with exponential backoff (max 3 retries).
-- Ref: C2.1 Email Job, B4.5 Email Auto-reply
-- ============================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  type              VARCHAR(50) NOT NULL,                      -- 'consultation_confirmation', 'consultation_notification', 'password_reset'
  to_email          VARCHAR(255) NOT NULL,
  subject           VARCHAR(255) NOT NULL,
  status            ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
  error_message     TEXT NULL,                                  -- error details if failed
  retry_count       TINYINT UNSIGNED NOT NULL DEFAULT 0,       -- max 3 retries
  sent_at           DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_logs_type (type),
  INDEX idx_email_logs_status (status),
  INDEX idx_email_logs_created (created_at),
  INDEX idx_email_logs_to (to_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
