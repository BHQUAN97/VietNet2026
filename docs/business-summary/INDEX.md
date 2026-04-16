# VietNet Interior 2026 — Business Summary Index

> Tong hop nghiep vu he thong | 12 modules | 65 API endpoints | 18 DB tables
> Stack: Next.js 14 + NestJS + MySQL 8 + Redis 7 + Docker
> Domain: bhquan.site | Scale: 300 users/ngay, 5 admins

---

## Module Map

| # | Module | File | Priority | Endpoints | Tables | Mo ta ngan |
|---|--------|------|----------|-----------|--------|-----------|
| 01 | [Auth & Users](01-auth.md) | 01-auth.md | P0 | 11 | 4 | JWT login, RBAC, user management |
| 02 | [Media Pipeline](02-media.md) | 02-media.md | P0 | 4 | 1 | Upload → Sharp → R2 storage |
| 03 | [CMS Projects](03-cms-projects.md) | 03-cms-projects.md | P0 | 14 | 3 | Du an noi that + categories |
| 04 | [Product Catalog](04-catalog-products.md) | 04-catalog-products.md | P0 | 9 | 2 | Tu bep, filter vat lieu |
| 05 | [Consultation](05-consultation.md) | 05-consultation.md | P0 | 5 | 1 | Form tu van + email + realtime |
| 06 | [Page Builder](06-page-builder.md) | 06-page-builder.md | P0 | 5 | 2 | Homepage JSON config editor |
| 07 | [Analytics](07-analytics.md) | 07-analytics.md | P1 | 6 | 2 | Traffic tracking (Redis → MySQL) |
| 08 | [SEO Engine](08-seo-engine.md) | 08-seo-engine.md | P0 | 4 | 0 | Sitemap, meta tags, JSON-LD |
| 09 | [Realtime & Notifications](09-realtime-notifications.md) | 09-realtime-notifications.md | P1 | 3 | 1 | Socket.io + notification bell |
| 10 | [Settings](10-settings.md) | 10-settings.md | P1 | 6 | 1 | Site config, SEO, email templates |
| 11 | [Search](11-search.md) | 11-search.md | P1 | 1 | 0 | FULLTEXT search projects + products |
| 12 | [Infrastructure](12-infrastructure.md) | 12-infrastructure.md | P0 | 1 | 0 | Docker, Nginx, backup, monitoring |

---

## System Architecture Overview

```
                    Cloudflare CDN
                         |
                      Nginx (80/443)
                    /            \
              Next.js            NestJS API
           (SSR + ISR)        (REST + Socket.io)
                |                    |
                |              +-----+-----+
                |              |     |     |
                |           MySQL  Redis   R2
                |           (DB)  (Cache) (Storage)
                |                  |
                |              BullMQ Workers
                |              (Image, Mail, Analytics, Cleanup)
                |
           Public Website + Admin Panel
```

---

## Tong quan Nghiep vu

### A. Public Website (46 features)
Khach hang truy cap website xem du an noi that, duyet catalog tu bep, gui form tu van.
- **Homepage**: Hero, About, Featured Projects, Materials, Testimonials, CTA Form
- **Catalog**: Filter vat lieu (sidebar/chips/bottom sheet), product grid, pagination
- **Project Detail**: Hero image, info, gallery lightbox, related projects
- **Product Detail**: Gallery, specs, material info, consultation CTA
- **Search**: Full-text, mixed results (projects + products)
- **SEO**: SSR, sitemap, JSON-LD, OG tags, canonical

### B. Admin Panel (44 features)
Admin quan ly noi dung, tu van, analytics, cau hinh website.
- **Auth**: Login/logout, forgot password, session management
- **Dashboard**: KPIs, charts, recent consultations, notifications
- **CMS**: CRUD projects/products, gallery management, draft/publish
- **Consultation**: Status workflow, search, real-time alerts
- **Page Builder**: Edit mode, preview, publish, version history
- **Analytics**: Traffic charts, top pages, devices, sources
- **Settings**: Company info, social links, SEO, email templates

### C. System/Backend (22 features)
Infrastructure, security, background jobs.
- **Media**: Upload validation, Sharp processing, R2 storage
- **Email**: Resend API, BullMQ async, templates
- **Real-time**: Socket.io rooms, event broadcasting
- **SEO**: Sitemap, robots.txt, structured data
- **Cache**: Redis query cache, Nginx micro-cache, ISR
- **Security**: Rate limiting, DOMPurify, CORS, Helmet

---

## Background Jobs (BullMQ)

| Queue | Job | Schedule | Mo ta |
|-------|-----|----------|-------|
| image-processing | IMAGE_JOB | On upload | Resize + WebP + R2 |
| email | MAIL_JOB | On event | Send via Resend API |
| analytics | TRAFFIC_SYNC_JOB | */10 * * * * | Redis → MySQL sync |
| maintenance | CLEANUP_JOB | 0 3 * * * | Xoa media cu, clean orphans |

---

## Database Tables (18)

| # | Table | PK | Est. Rows/year |
|---|-------|----|---------------|
| 1 | users | ULID | < 20 |
| 2 | refresh_tokens | ULID | < 1,000 |
| 3 | login_attempts | BIGINT | < 10,000 |
| 4 | categories | ULID | < 50 |
| 5 | media | ULID | < 5,000 |
| 6 | projects | ULID | < 200 |
| 7 | project_gallery | ULID | < 2,000 |
| 8 | products | ULID | < 500 |
| 9 | product_images | ULID | < 3,000 |
| 10 | consultations | ULID | < 5,000 |
| 11 | page_configs | ULID | < 10 |
| 12 | page_config_history | ULID | < 50 |
| 13 | settings | ULID | < 30 |
| 14 | notifications | ULID | < 10,000 |
| 15 | page_views | BIGINT | < 1,000,000 |
| 16 | page_view_daily | BIGINT | < 20,000 |
| 17 | email_logs | ULID | < 10,000 |
| 18 | password_reset_tokens | ULID | < 100 |

---

## Implementation Roadmap (6 Stages)

| Stage | Tuan | Noi dung | Dependencies |
|-------|------|----------|-------------|
| 1 | W1 | Core & Infra (Docker, scaffold, health check) | — |
| 2 | W2 | Auth + Media Pipeline | Stage 1 |
| 3 | W3 | CMS (Projects, Products, Categories) + SEO | Stage 2 |
| 4 | W4 | Page Builder + Preview Mode + ISR | Stage 3 |
| 5 | W5 | Real-time + Analytics + Consultations | Stage 3 |
| 6 | W6 | Optimization + Product Catalog + Launch | Stage 4, 5 |

---

## Key Documents Reference

| Doc | Noi dung | Vi tri |
|-----|----------|--------|
| Constitution | Luat toi cao, tech stack, conventions | `.sdd/constitution.md` |
| BA Feature Spec | 112 features chi tiet | `docs/BA_FEATURE_SPEC.md` |
| BA Checklist | Trang thai tien do | `docs/BA_CHECKLIST.md` |
| API Spec | 65 endpoints, Socket.io, BullMQ | `docs/SA_API_SPEC.md` |
| DB Schema | 18 tables, Redis keys, flows | `docs/SA_DB_SCHEMA.md` |
| Design System | "Curated Atelier", tokens, components | `DESIGN_SYSTEM.md` |
| Security Rules | OWASP, auth, rate limit, headers | `SECURITY_RULES.md` |
| Implementation Plan | 6-stage roadmap | `IMPLEMENTATION_PLAN.md` |
| Infra & Docker | Docker compose, Nginx, backup | `INFRA_OPS_DOCKER.md` |
| Master Blueprint | Tong quan he thong v3.0 | `VIETNET_MASTER_BLUEPRINT.md` |
