# VietNet2026 ERD

> Source of truth: `backend/src/modules/*/entities/*.entity.ts`. ERD la derived view, update cung commit khi sua entity. Ref: CROSS-0007

**Tong**: 20 entities, 11 modules
**Last sync**: 2026-04-18

---

## Module: users

```mermaid
erDiagram
    users {
        char(26) id PK
        varchar full_name
        varchar email UK
        enum role
        enum status
    }
```

---

## Module: auth

```mermaid
erDiagram
    users {
        char(26) id PK
        varchar email UK
        enum role
    }
    refresh_tokens {
        char(26) id PK
        char(26) user_id FK
        varchar token_hash
        timestamp expires_at
        timestamp revoked_at
    }
    password_reset_tokens {
        char(26) id PK
        char(26) user_id FK
        varchar token_hash
        timestamp expires_at
        timestamp used_at
    }
    login_attempts {
        bigint id PK
        varchar ip_address
        varchar email
        tinyint success
        timestamp attempted_at
    }

    users ||--o{ refresh_tokens : "issues"
    users ||--o{ password_reset_tokens : "requests"
```

---

## Module: media

```mermaid
erDiagram
    users {
        char(26) id PK
    }
    media {
        char(26) id PK
        varchar original_filename
        varchar mime_type
        varchar original_url
        enum processing_status
        char(26) uploaded_by FK
    }

    users ||--o{ media : "uploads"
```

---

## Module: projects

```mermaid
erDiagram
    categories {
        char(26) id PK
        varchar name
        varchar slug
        enum type
        char(26) parent_id FK
    }
    projects {
        char(26) id PK
        varchar title
        varchar slug UK
        char(26) category_id FK
        char(26) cover_image_id FK
        char(26) og_image_id FK
        enum status
    }
    project_gallery {
        char(26) id PK
        char(26) project_id FK
        char(26) media_id FK
        int display_order
    }
    media {
        char(26) id PK
    }

    categories ||--o{ categories : "parent_of"
    categories ||--o{ projects : "categorizes"
    media ||--o{ projects : "cover_of"
    media ||--o{ projects : "og_of"
    projects ||--o{ project_gallery : "has"
    media ||--o{ project_gallery : "displayed_in"
```

---

## Module: products

```mermaid
erDiagram
    categories {
        char(26) id PK
        varchar slug
        enum type
    }
    products {
        char(26) id PK
        varchar name
        varchar slug UK
        char(26) category_id FK
        char(26) cover_image_id FK
        enum status
    }
    product_images {
        char(26) id PK
        char(26) product_id FK
        char(26) media_id FK
        tinyint is_primary
        int display_order
    }
    media {
        char(26) id PK
    }

    categories ||--o{ products : "categorizes"
    media ||--o{ products : "cover_of"
    media ||--o{ products : "og_of"
    products ||--o{ product_images : "has"
    media ||--o{ product_images : "displayed_in"
```

---

## Module: articles

```mermaid
erDiagram
    categories {
        char(26) id PK
        varchar slug
        enum type
    }
    articles {
        char(26) id PK
        varchar title
        varchar slug UK
        char(26) category_id FK
        char(26) cover_image_id FK
        enum status
    }
    media {
        char(26) id PK
    }

    categories ||--o{ articles : "categorizes"
    media ||--o{ articles : "cover_of"
    media ||--o{ articles : "og_of"
```

---

## Module: consultations

```mermaid
erDiagram
    consultations {
        char(26) id PK
        varchar name
        varchar email
        varchar phone
        enum project_type
        enum status
        char(26) product_id FK
        char(26) assigned_to FK
    }
    products {
        char(26) id PK
        varchar slug
    }
    users {
        char(26) id PK
        enum role
    }

    products ||--o{ consultations : "inquired_for"
    users ||--o{ consultations : "assigned_to"
```

---

## Module: pages

```mermaid
erDiagram
    page_configs {
        char(26) id PK
        varchar page_slug UK
        json config_draft
        json config_published
        int version
        char(26) updated_by FK
        char(26) published_by FK
    }
    page_config_history {
        char(26) id PK
        char(26) page_config_id FK
        json config_snapshot
        int version
        char(26) published_by FK
    }
    users {
        char(26) id PK
    }

    users ||--o{ page_configs : "publishes"
    users ||--o{ page_configs : "updates"
    page_configs ||--o{ page_config_history : "snapshots"
    users ||--o{ page_config_history : "published_by"
```

---

## Module: settings

```mermaid
erDiagram
    settings {
        char(26) id PK
        varchar setting_key UK
        text setting_value
        varchar setting_group
        char(26) updated_by
    }
```

---

## Module: notifications

```mermaid
erDiagram
    users {
        char(26) id PK
    }
    notifications {
        char(26) id PK
        char(26) user_id FK
        varchar type
        varchar title
        tinyint is_read
    }

    users ||--o{ notifications : "receives"
```

---

## Module: analytics

```mermaid
erDiagram
    page_views {
        bigint id PK
        varchar page_path
        varchar visitor_ip
        enum device_type
        tinyint is_bot
        timestamp viewed_at
    }
    page_view_daily {
        bigint id PK
        varchar page_path
        date view_date
        int total_views
        int unique_visitors
    }
    email_logs {
        char(26) id PK
        varchar to_email
        varchar subject
        enum status
        tinyint retry_count
    }

    page_views ||--o{ page_view_daily : "aggregated_into"
```

---

## Module: logs

```mermaid
erDiagram
    app_logs {
        char(26) id PK
        enum level
        varchar message
        varchar endpoint
        smallint status_code
        char(26) user_id
        json context
    }
```
