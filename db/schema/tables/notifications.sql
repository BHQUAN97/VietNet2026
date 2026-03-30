-- ============================================================
-- Table: notifications
-- Description: Per-user notification inbox for admin events.
--              Created server-side and broadcast via Socket.io to admin room.
-- Ref: B2.8 Notification Bell
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  user_id           VARCHAR(26) NOT NULL,                      -- recipient admin user
  type              VARCHAR(50) NOT NULL,                      -- 'new_consultation', 'project_published', 'system_error'
  title             VARCHAR(255) NOT NULL,
  body              TEXT NULL,
  link              VARCHAR(500) NULL,                         -- URL to navigate on click
  is_read           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notifications_user_read (user_id, is_read),
  INDEX idx_notifications_user_created (user_id, created_at),

  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
