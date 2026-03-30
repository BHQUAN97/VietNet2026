-- ============================================================
-- Table: consultations
-- Description: Customer consultation/contact form submissions.
--              Supports status workflow (new -> contacted -> scheduled -> completed),
--              anti-spam (honeypot, IP rate limiting), and admin assignment.
-- Ref: A2.6 Consultation CTA, A5.5 Product CTA, A7.1 Contact Form, B4.1-B4.5 Consultation Management
-- ============================================================

CREATE TABLE IF NOT EXISTS consultations (
  id                VARCHAR(26) NOT NULL PRIMARY KEY,          -- ULID
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(20) NULL,
  project_type      ENUM('residential', 'commercial', 'hospitality', 'renovation', 'other') NULL,
  area              VARCHAR(50) NULL,                          -- "120m2", from detailed form (ref A7.1)
  budget_range      VARCHAR(100) NULL,                         -- dropdown value from detailed form
  message           TEXT NULL,
  product_id        VARCHAR(26) NULL,                          -- FK if submitted from product detail page (ref A5.5)
  status            ENUM('new', 'contacted', 'scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
  assigned_to       VARCHAR(26) NULL,                          -- FK to users, admin handling this request
  notes             TEXT NULL,                                  -- admin internal notes
  status_changed_at DATETIME NULL,                             -- last status change timestamp
  status_changed_by VARCHAR(26) NULL,                          -- admin who changed status

  -- Anti-spam
  ip_address        VARCHAR(45) NOT NULL,                      -- for rate limiting (ref C6.1)
  user_agent        TEXT NULL,                                  -- for bot detection
  source            VARCHAR(50) NULL,                          -- 'homepage', 'contact', 'product_detail'
  honeypot          VARCHAR(255) NULL,                         -- hidden field, non-empty = bot (ref A7.1)

  -- Timestamps
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,

  INDEX idx_consultations_status (status),
  INDEX idx_consultations_created (created_at),
  INDEX idx_consultations_ip (ip_address),
  INDEX idx_consultations_email (email),
  INDEX idx_consultations_assigned (assigned_to),
  INDEX idx_consultations_product (product_id),
  INDEX idx_consultations_deleted (deleted_at),

  CONSTRAINT fk_consultations_assigned
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultations_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultations_status_by
    FOREIGN KEY (status_changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
