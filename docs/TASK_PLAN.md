# TASK_PLAN -- VietNet Interior Development
> Status: Stage 1-2 COMPLETED | Stages 3-6 PENDING
> Updated: 2026-03-27

## STAGE 1: CORE & INFRA -- COMPLETED

### FE Tasks (Completed)
- [x] [F-001] Scaffold Next.js 14+ (App Router, TS, Tailwind, Shadcn)
- [x] [F-002] Integrate design tokens (tokens.css, tailwind.config.ts, fonts)
- [x] [F-003] Create base layout (RootLayout, metadata, font loading)
- [x] [F-004] Create GlassNav component
- [x] [F-005] Create Footer component
- [x] [F-006] Create BottomNav component (mobile)
- [x] [F-007] Create PageContainer component
- [x] [F-008] Create Button component (all variants)

### BE Tasks (Completed)
- [x] [B-001] Scaffold NestJS project (TS, modular structure)
- [x] [B-002] Setup TypeORM + MySQL connection config
- [x] [B-003] Setup Redis connection config
- [x] [B-004] Create Global Exception Filter + Response Wrapper
- [x] [B-005] Create BaseService with Template Method pattern
- [x] [B-006] Setup Pino structured logging
- [x] [B-007] Create Health check endpoint
- [x] [B-008] Setup BullMQ queue infrastructure

### INFRA Tasks (Completed)
- [x] [I-001] Create Docker Compose (5 services)
- [x] [I-002] Create Nginx config (reverse proxy, micro-cache, gzip)
- [x] [I-003] Create .env.example files
- [x] [I-004] Create Dockerfiles (production + dev)

## STAGE 2: MEDIA & IDENTITY -- COMPLETED

### BE Tasks (Completed)
- [x] [B-009] Implement Auth Module -- login, refresh, logout, me endpoints
- [x] [B-010] Implement JWT strategy + guards (requireAuth, requireAdmin, @Roles)
- [x] [B-011] Implement rate limiting for login (5 fails/10min -> 30min lock)
- [x] [B-012] Create User entity + CRUD operations (admin-only, soft delete)
- [x] [B-013] Implement Media Module -- upload endpoint with validation
- [x] [B-014] Implement IMAGE_JOB worker (Sharp resize, WebP, EXIF strip)
- [x] [B-015] Setup R2 storage client (upload/download/signed URLs)
- [x] [B-016] Implement MAIL_JOB worker (Resend API)
- [x] [B-017] Create all TypeORM entities (18 tables from SA_DB_SCHEMA)

### FE Tasks (Completed)
- [x] [F-009] Create Admin Login page with form (functional with auth)
- [x] [F-010] Implement auth state management (AuthContext, AuthGuard, token refresh)
- [x] [F-011] Create Contact page with consultation form (honeypot, validation)
- [x] [F-012] Create admin User Management page (table, CRUD modal, search)

## STAGE 3: CMS CORE & SEO -- PENDING

### BE Tasks
- [ ] [B-018] Implement Categories Module (CRUD + seed data)
- [ ] [B-019] Implement Projects Module (CRUD with gallery, SEO fields)
- [ ] [B-020] Implement Products Module (CRUD with images, material filter)
- [ ] [B-021] Implement Consultations Module (submit, status workflow, Socket.io)
- [ ] [B-022] Implement Search endpoint (cross-project + product search)
- [ ] [B-023] Implement SEO endpoints (sitemap.xml, robots.txt)
- [ ] [B-024] Implement Analytics pageview recording (Redis INCR)

### FE Tasks
- [ ] [F-013] Create Homepage with all sections (Hero, About, Projects, Materials, Testimonials, CTA)
- [ ] [F-014] Create Project listing page with grid
- [ ] [F-015] Create Project detail page (gallery, lightbox, related)
- [ ] [F-016] Create Product catalog page (filter sidebar, grid, pagination)
- [ ] [F-017] Create Product detail page
- [ ] [F-018] Create About page
- [ ] [F-019] Create Search results page
- [ ] [F-020] Create Admin Projects management page (table, CRUD)
- [ ] [F-021] Create Admin Consultations management page
- [ ] [F-022] Implement dynamic SEO metadata for all pages
- [ ] [F-023] Create 404 and error pages (styled)

### Dependencies
- F-013 depends on B-019 (project API)
- F-014/F-015 depends on B-019
- F-016/F-017 depends on B-020
- F-020 depends on B-019
- F-021 depends on B-021

## STAGE 4: PAGE BUILDER & PREVIEW -- PENDING

### BE Tasks
- [ ] [B-025] Implement Page Builder API (draft, publish, history)
- [ ] [B-026] Implement revalidation webhook for ISR

### FE Tasks
- [ ] [F-024] Create Page Builder edit mode (editable blocks, edit triggers)
- [ ] [F-025] Create Admin toolbar (save/cancel)
- [ ] [F-026] Implement Next.js Draft Mode for preview
- [ ] [F-027] Create section editors (Hero, About, Portfolio, Materials)
- [ ] [F-028] Implement auto-save (30s debounce)

## STAGE 5: REAL-TIME & ANALYTICS -- PENDING

### BE Tasks
- [ ] [B-027] Implement Socket.io server (rooms, auth middleware)
- [ ] [B-028] Implement TRAFFIC_SYNC_JOB (Redis -> MySQL)
- [ ] [B-029] Implement Analytics API (overview, traffic, top-pages, devices, sources)
- [ ] [B-030] Implement Notifications Module (CRUD, mark read)
- [ ] [B-031] Implement Settings Module (CRUD by group)

### FE Tasks
- [ ] [F-029] Create Admin Analytics dashboard (charts, tables)
- [ ] [F-030] Implement NotificationBell with real-time Socket.io
- [ ] [F-031] Create Admin Settings page (3 tabs)
- [ ] [F-032] Create FloatingActionWidget (Zalo, Messenger, Phone)
- [ ] [F-033] Implement real-time consultation alerts

## STAGE 6: MAINTENANCE & OPTIMIZATION -- PENDING

### Tasks
- [ ] [M-001] Configure log rotation (Docker max-size)
- [ ] [M-002] Create MySQL backup script
- [ ] [M-003] Stress test and identify bottlenecks
- [ ] [M-004] Optimize PageSpeed (target 90+ mobile)
- [ ] [M-005] Security audit (CORS, rate limiting, headers)
- [ ] [M-006] Create deployment CI/CD pipeline (GitHub Actions)

## SUMMARY

| Stage | FE Tasks | BE Tasks | Infra | Total | Status |
|---|---|---|---|---|---|
| 1: Core & Infra | 8 | 8 | 4 | 20 | COMPLETED |
| 2: Media & Identity | 4 | 9 | 0 | 13 | COMPLETED |
| 3: CMS & SEO | 11 | 7 | 0 | 18 | PENDING |
| 4: Page Builder | 5 | 2 | 0 | 7 | PENDING |
| 5: Real-time | 5 | 5 | 0 | 10 | PENDING |
| 6: Maintenance | 0 | 0 | 6 | 6 | PENDING |
| **TOTAL** | **33** | **31** | **10** | **74** | **Stage 1 Done** |
