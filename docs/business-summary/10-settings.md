# 10. Settings & Configuration

> Module: B8 (Settings) | Features: B8.1-B8.3
> Priority: P1 | Status: Spec Done

---

## Summary

He thong cau hinh toan cuc cho website. Admin quan ly: thong tin cong ty (dia chi, SDT, email), social links, gio lam viec, SEO defaults, email templates, va analytics config. Tat ca settings luu dang key-value trong DB, cached trong Redis. Thay doi settings tu dong invalidate cache.

---

## Workflow

### View/Update Settings
```
Admin vao Settings page:
  → [1] GET /api/settings → load tat ca settings
  → [2] Admin chinh sua form
  → [3] PUT /api/settings { partial update }
  → [4] Server update DB, invalidate Redis cache
  → [5] Tra 200 "Settings updated"
```

### SEO Settings
```
Admin vao SEO Settings:
  → [1] GET /api/settings/seo
  → [2] Chinh sua: site_title, meta_description, og_image, GA ID
  → [3] PUT /api/settings/seo
  → [4] Invalidate cache + tat ca page metadata
```

### Email Templates
```
Admin vao Email Templates:
  → [1] GET /api/settings/email
  → [2] Edit template HTML voi placeholders:
      - {{name}}, {{ref_code}}, {{project_type}}, {{reset_link}}
  → [3] PUT /api/settings/email
  → [4] Email moi gui se dung template cap nhat
```

---

## Giai phap chi tiet

### API Endpoints (6 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/settings` | @Admin | All settings |
| PUT | `/api/settings` | @Admin | Update general settings |
| GET | `/api/settings/seo` | @Admin | SEO defaults |
| PUT | `/api/settings/seo` | @Admin | Update SEO |
| GET | `/api/settings/email` | @Admin | Email templates |
| PUT | `/api/settings/email` | @Admin | Update templates |

### Settings Groups

**General:**
| Key | Default | Mo ta |
|-----|---------|-------|
| company_name | "VietNet Interior" | Ten cong ty |
| address | "123 Nguyen Hue, Q1" | Dia chi showroom |
| phone | "+84 28 1234 5678" | So dien thoai |
| email | "info@bhquan.site" | Email lien he |
| showroom_hours | { weekday, saturday, sunday } | Gio lam viec |
| notification_sound | true | Am thong bao |

**Social:**
| Key | Mo ta |
|-----|-------|
| social_facebook | Link Facebook page |
| social_zalo | Link Zalo chat |
| social_instagram | Link Instagram |
| social_youtube | Link YouTube |
| social_messenger | Link Messenger |

**SEO:**
| Key | Mo ta |
|-----|-------|
| seo_title_template | "{page} \| VietNet Interior" |
| seo_default_description | Meta description mac dinh |
| seo_default_og_image_id | OG image mac dinh |
| seo_ga_id | Google Analytics ID |
| seo_gsc_meta | Google Search Console verification |

**Email Templates:**
| Key | Placeholders |
|-----|-------------|
| email_consultation_confirm | {{name}}, {{ref_code}}, {{project_type}} |
| email_admin_notification | {{name}}, {{email}}, {{project_type}}, {{message}} |
| email_password_reset | {{name}}, {{reset_link}} |

**Analytics:**
| Key | Mo ta |
|-----|-------|
| analytics_excluded_ips | IP admin khong tinh traffic |
| analytics_bot_patterns | User-Agent patterns cua bot |

### DB Table: settings

- id (ULID), setting_key (unique), setting_value (TEXT/JSON)
- setting_group: general, seo, email, social, analytics
- updated_by, updated_at

### Caching

```
cache:settings:{group}  → TTL 300s (5 min)
```

Invalidate khi PUT /api/settings hoac /api/settings/*

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth module da hoan thanh
- Redis cho caching

### File Structure

```
backend/src/modules/settings/
├── settings.module.ts
├── settings.service.ts          # CRUD settings, grouped access
├── settings.controller.ts       # 6 endpoints (general, seo, email)
├── entities/
│   └── setting.entity.ts        # key-value: setting_key, setting_value (JSON), setting_group
└── dto/
    ├── update-settings.dto.ts
    ├── update-seo.dto.ts
    └── update-email.dto.ts

frontend/src/app/admin/settings/page.tsx  # Tabs: General | SEO | Email
```

### Thu tu implement (Backend)

**Buoc 1: Settings Service**
```typescript
@Injectable()
export class SettingsService {
  // getByGroup(group): SELECT WHERE setting_group = ? → parse JSON values → return object
  // getByKey(key): SELECT WHERE setting_key = ? → parse value
  // getCached(group): check Redis cache:settings:{group}, fallback DB
  // update(group, data): batch UPDATE tung key, invalidate cache
  // seed(): INSERT default settings neu chua co (idempotent, ON DUPLICATE KEY IGNORE)
}
```

**Buoc 2: Controller**
```
GET /settings: @AdminOnly() → getByGroup('general') + getByGroup('social')
PUT /settings: @AdminOnly() → update general + social
GET /settings/seo: @AdminOnly() → getByGroup('seo')
PUT /settings/seo: @AdminOnly() → update seo
GET /settings/email: @AdminOnly() → getByGroup('email')
PUT /settings/email: @AdminOnly() → update email
```

**Buoc 3: Seed Data (migration hoac seed script)**
```
INSERT ON DUPLICATE KEY IGNORE settings:
  - general: company_name, address, phone, email, working_hours, notification_sound
  - social: facebook, zalo, instagram, youtube, messenger
  - seo: title_template, default_description, og_image, ga_id, canonical_base_url
  - email: consultation_confirm, admin_notification, password_reset (HTML templates)
  - analytics: excluded_ips, bot_patterns
```

### Frontend Implementation

```
/admin/settings/page.tsx:
  - Tabs component: General | SEO | Email
  - General tab: company name, address, phone, email, hours, social links
  - SEO tab: title template, description, OG image picker, GA ID
  - Email tab: 3 template editors (consultation confirm, admin notif, password reset)
    - Rich text / HTML editor cho template body
    - Placeholder guide: {{name}}, {{ref_code}}, {{reset_link}}
  - Save button per tab → PUT /settings/{group}
  - Success toast "Settings updated"
```

### Testing Checklist

- [ ] Seed data: tat ca default settings duoc tao
- [ ] GET settings → tra grouped data dung
- [ ] PUT settings → update DB + invalidate cache
- [ ] Public pages su dung settings (footer phone, address, social links)
- [ ] Email templates: placeholders duoc replace dung khi gui
