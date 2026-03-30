# DBO RULES -- Database Operations Agent
> VietNet Interior | MySQL 8.0

---

## 1. ROLE

Agent_DBO is responsible for:
- Writing and reviewing all database schema changes
- Creating idempotent changelog scripts
- Managing seed data
- Ensuring all SQL is safe to run multiple times

---

## 2. DIRECTORY STRUCTURE

```
db/
├── schema/
│   ├── tables/          <- 1 file per table (CREATE TABLE IF NOT EXISTS)
│   └── init.sql         <- Master file that sources all tables in FK order
├── data/                <- Seed data scripts (INSERT ... ON DUPLICATE KEY UPDATE)
└── changelog/           <- Versioned migration scripts (idempotent)
```

---

## 3. FILE NAMING

### schema/tables/
- One file per table: `{tablename}.sql`
- Example: `users.sql`, `projects.sql`, `page_views.sql`

### data/
- Seed data by table: `{tablename}.sql`
- Example: `categories.sql`, `settings.sql`

### changelog/
- Versioned: `V{NNN}__{description}.sql`
- Examples:
  - `V001__add_storage_backend_columns.sql`
  - `V002__create_notifications_table.sql`
  - `V003__add_index_consultations_status.sql`
- Double underscore `__` separates version from description
- Description uses snake_case
- Version numbers are sequential, never reused

---

## 4. IDEMPOTENT RULES -- CRITICAL

ALL changelog scripts MUST be safe to run multiple times. Use these patterns:

### 4.1 CREATE TABLE

```sql
CREATE TABLE IF NOT EXISTS tablename (...);
```

### 4.2 ADD COLUMN (check if not exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'email'
        ),
        'SELECT 1;',
        'ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.3 MODIFY COLUMN (check if exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'email'
        ),
        'ALTER TABLE users MODIFY COLUMN email VARCHAR(500) DEFAULT NULL;',
        'SELECT 1;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.4 DROP COLUMN (check if exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'email'
        ),
        'ALTER TABLE users DROP COLUMN email;',
        'SELECT 1;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.5 ADD INDEX (check if not exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND INDEX_NAME = 'idx_users_email'
        ),
        'SELECT 1;',
        'ALTER TABLE users ADD INDEX idx_users_email (email);'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.6 DROP INDEX (check if exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND INDEX_NAME = 'idx_users_email'
        ),
        'ALTER TABLE users DROP INDEX idx_users_email;',
        'SELECT 1;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.7 ADD FOREIGN KEY (check if not exists)

```sql
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'projects'
              AND CONSTRAINT_NAME = 'fk_projects_category'
        ),
        'SELECT 1;',
        'ALTER TABLE projects ADD CONSTRAINT fk_projects_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### 4.8 INSERT DATA (idempotent)

```sql
INSERT INTO categories (id, name, slug, type, display_order, is_active)
VALUES ('01ABC...', 'Residential', 'residential', 'project', 1, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
```

### 4.9 CREATE OR REPLACE PROCEDURE

```sql
DROP PROCEDURE IF EXISTS sp_cleanup_expired_tokens;
DELIMITER //
CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW() AND revoked_at IS NOT NULL;
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;
```

---

## 5. CHANGELOG HEADER TEMPLATE

Every changelog file MUST start with this header:

```sql
-- ============================================================
-- Changelog: V{NNN}__{description}.sql
-- Date: YYYY-MM-DD
-- Author: Agent_DBO
-- Description: [What this migration does]
-- Affected tables: [list of tables]
-- Idempotent: YES (safe to run multiple times)
-- ============================================================
```

---

## 6. REVIEW CHECKLIST

Agent_DBO must verify before approving any schema change:

- [ ] Script is idempotent (uses IF EXISTS / IF NOT EXISTS patterns)
- [ ] Uses parameterized pattern (PREPARE/EXECUTE/DEALLOCATE) for ALTER operations
- [ ] VARCHAR lengths are explicit and reasonable
- [ ] New columns have DEFAULT values where appropriate
- [ ] New indexes follow naming convention: `idx_{table}_{column}`
- [ ] Foreign keys follow naming convention: `fk_{table}_{referenced_table}` or `fk_{table}_{purpose}`
- [ ] No data loss: DROP COLUMN only after confirming data migration
- [ ] Charset is utf8mb4 with utf8mb4_unicode_ci collation
- [ ] No raw DELETE/UPDATE without WHERE clause
- [ ] Seed data uses ON DUPLICATE KEY UPDATE pattern
- [ ] File is in correct directory (schema vs data vs changelog)
- [ ] File naming follows convention
- [ ] Header comment is present and accurate

---

## 7. PROHIBITED ACTIONS

- NEVER run DROP TABLE on production without explicit user confirmation
- NEVER run TRUNCATE on any table
- NEVER ALTER TABLE with data loss without backup verification
- NEVER write non-idempotent scripts in changelog/
- NEVER modify existing changelog files (create new version instead)
- NEVER store passwords or secrets in seed data files (use placeholders)

---

## 8. RUNNING MIGRATIONS

### Development

```bash
# Run all schema tables
mysql -u root -p vietnet < db/schema/init.sql

# Run specific changelog
mysql -u root -p vietnet < db/changelog/V001__add_storage_backend_columns.sql

# Run seed data
mysql -u root -p vietnet < db/data/categories.sql
mysql -u root -p vietnet < db/data/settings.sql
```

### Production -- REQUIRES USER CONFIRMATION

```bash
# Always backup first
mysqldump -u root -p vietnet > backup_$(date +%Y%m%d_%H%M%S).sql

# Then run migration
mysql -u root -p vietnet < db/changelog/V{NNN}__description.sql
```
