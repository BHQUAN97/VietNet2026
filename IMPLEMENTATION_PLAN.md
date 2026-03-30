# IMPLEMENTATION ROADMAP V3.0

> 6 Stages | VietNet Interior
> Stack: Next.js 14+ | NestJS | MySQL 8 | Redis 7 | Docker Compose | Nginx | Cloudflare R2
> Last updated: 2026-03-27

---

## Stage 1: CORE AND INFRA (Week 1)

### Goal
Stand up the full development and production environment. Establish base project scaffolding with shared conventions.

### Tasks

**Infrastructure:**
- Docker Compose configuration with all 5 services: Nginx, NestJS, Next.js, MySQL 8, Redis 7.
- Nginx configuration: reverse proxy routing, Gzip and Brotli compression, micro-caching (1s TTL for public GET endpoints).
- Docker log rotation: `max-size: 50m`, `max-file: 5` on all services.
- MySQL configuration: `innodb_buffer_pool_size=4G`, `utf8mb4`, slow query log enabled.
- Redis configuration: `maxmemory 1gb`, `allkeys-lru` eviction, AOF persistence.

**Backend (NestJS):**
- Project scaffold with NestJS CLI.
- Global exception filter: catches all unhandled errors, returns standardized `{ success, message, statusCode }` response.
- Response wrapper utilities: `ok(data)` and `fail(message, statusCode)` helper functions.
- Pino logger integration with `requestId` on every log line.
- Base CRUD service: generic `findAll`, `findOne`, `create`, `update`, `softDelete` with ULID primary keys.
- TypeORM setup with MySQL 8 connection, migration configuration.
- Health check endpoint: `GET /api/health` returning database and Redis connection status.

**Frontend (Next.js):**
- Project scaffold with Next.js 14 App Router.
- Tailwind CSS 4 setup with Shadcn/UI component library.
- Global layout: header, footer, metadata defaults.
- Design tokens file (`tokens.css`): color palette, spacing scale, typography scale, border radius, shadow values.
- Base API client: fetch wrapper with error handling, base URL configuration, cookie forwarding for SSR.

**Database:**
- Initial schema design: `users`, `sessions` tables.
- First migration file generated and tested.
- Seed script for development data.

### Deliverables
- `docker-compose up -d` brings up all services with health checks passing.
- `GET /api/health` returns 200 with `{ status: "ok", database: "connected", redis: "connected" }`.
- Next.js renders the base layout at `http://localhost:3000`.

---

## Stage 2: MEDIA AND IDENTITY (Week 2)

### Goal
Authentication system and media processing pipeline.

### Tasks

**Auth Module:**
- User entity: ULID primary key, email, hashed password (bcrypt, cost 12), role (admin/user), status, timestamps.
- Login endpoint: validates credentials, issues JWT access token (60 min) and refresh token (7 days) in HttpOnly cookies.
- Refresh endpoint: rotates refresh token, invalidates old token.
- Logout endpoint: clears cookies, invalidates refresh token in database.
- RBAC guards: `@RequireAuth`, `@RequireAdmin`, `@RequirePlan`.
- Rate limiting on login: 5 failed attempts per 10 minutes, 30-minute IP block.

**Media Module:**
- Upload endpoint: accepts image files (JPEG, PNG, WebP, GIF), validates MIME type, extension, size (max 20MB), and dimensions.
- BullMQ `IMAGE_JOB` queue with Sharp processing pipeline:
  - Strip EXIF metadata.
  - Generate thumbnail (300x300, cover crop).
  - Generate preview (1200px wide, maintain aspect ratio).
  - Convert to WebP format.
  - Upload originals to R2 private bucket.
  - Upload processed versions to R2 public bucket.
- Job retry: 3 attempts with exponential backoff.
- Upload progress tracking via job events.

**Mail Service:**
- Resend API integration for transactional emails.
- BullMQ `MAIL_JOB` queue for async email delivery.
- Email templates: welcome, password reset, consultation confirmation.
- Retry: 3 attempts with 60-second delay between retries.

**User Management:**
- Admin CRUD for user accounts: list, create, update status, soft delete.
- User profile endpoint: view and update own profile.

### Deliverables
- Login/logout flow works end-to-end with cookie-based JWT.
- Image upload returns processed URLs within 5 seconds for a typical 5MB image.
- Admin can create and manage user accounts.

---

## Stage 3: CMS CORE AND SEO (Week 3)

### Goal
Content management system with full SEO optimization.

### Tasks

**Category Module:**
- Category entity: ULID, name, slug, description, parent_id (self-referencing for nested categories), sort_order, status, timestamps.
- CRUD endpoints with soft delete.
- Slug auto-generation from name (Vietnamese to ASCII transliteration).
- Nested category tree endpoint for navigation menus.

**Project Module:**
- Project entity: ULID, title, slug, description (rich text), category_id, featured_image_id, status (draft/published), published_at, SEO fields (meta_title, meta_description, og_image), timestamps.
- Gallery: many-to-many relation with media (ordered by sort_order).
- Materials: JSON field or related table for material specifications (name, description, image).
- CRUD with draft/publish workflow.
- List endpoint with pagination, filtering by category, and sorting.

**Article Module:**
- Article entity: same structure as Project but for blog/news content.
- CRUD with draft/publish workflow.
- Related articles suggestion (same category).

**SEO Engine:**
- Dynamic sitemap generation: `GET /sitemap.xml` listing all published projects, articles, and category pages.
- JSON-LD structured data: Organization (homepage), Article (blog posts), Product (projects).
- Open Graph meta tags: title, description, image, URL, type.
- Canonical URL on every page.
- Next.js `generateMetadata` function for each page type.
- Robots.txt serving via Next.js.

**Traffic Counter:**
- Redis `INCR` middleware on page view routes.
- Key pattern: `traffic:{page_slug}:{YYYY-MM-DD}`.
- Bot filtering: exclude requests from known bot User-Agents.
- Admin IP exclusion: do not count views from admin IP addresses.

### Deliverables
- Admin can create categories, projects with galleries, and articles.
- Every public page has correct Open Graph tags and JSON-LD.
- Sitemap auto-generates with all published content.
- Page view counts tracked in Redis.

---

## Stage 4: PAGE BUILDER AND PREVIEW (Week 4)

### Goal
Configurable homepage and admin preview capability.

### Tasks

**Page Builder:**
- Homepage configuration stored as JSON in the database.
- Section types: hero banner, featured projects grid, about us block, testimonials, contact CTA, latest articles.
- Each section has: `type`, `order`, `visible`, `config` (type-specific JSON).
- Admin API to reorder, show/hide, and configure each section.

**Admin Edit Mode UI:**
- Banner editor: upload image, set title, subtitle, CTA text, CTA link.
- Block editor: reorder sections via drag-and-drop, toggle visibility.
- Rich text editor for content blocks (with DOMPurify sanitization on save).
- Image picker that integrates with the Media Module.

**Preview Mode:**
- Next.js Draft Mode activation via token-based URL.
- Preview endpoint: `GET /api/preview?secret=TOKEN&slug=SLUG` sets the draft mode cookie and redirects.
- Draft content fetched from API when draft mode is active.
- Exit preview endpoint clears the draft mode cookie.
- Preview banner shown at the top of the page in draft mode.

**ISR (Incremental Static Regeneration):**
- Public pages use ISR with `revalidate` set per page type:
  - Homepage: 60 seconds.
  - Project detail: 3600 seconds (1 hour).
  - Article detail: 3600 seconds.
  - Category listing: 300 seconds (5 minutes).
- On-demand revalidation: `revalidatePath()` called from NestJS webhook when content is updated via admin.
- Webhook endpoint: `POST /api/revalidate` with shared secret.

### Deliverables
- Admin can configure homepage layout and content without code changes.
- Preview mode shows unpublished content to admin users.
- Published pages are statically generated and served from cache.

---

## Stage 5: REAL-TIME AND ANALYTICS (Week 5)

### Goal
Live notifications for admin and analytics dashboard.

### Tasks

**Socket.io Integration:**
- Socket.io server running inside the NestJS process.
- Redis adapter for pub/sub across pm2 cluster instances.
- Rooms: `admin` (all admin users), `user:{userId}` (per-user notifications).
- Events emitted to admin room:
  - `new_consultation`: when a visitor submits a contact/consultation form.
  - `page_view_spike`: when a page exceeds 100 views in 5 minutes.
- Authentication: Socket.io middleware validates JWT from the handshake cookie.

**Analytics Dashboard (Admin):**
- Page view statistics: daily, weekly, monthly aggregation.
- Device breakdown: desktop, tablet, mobile (parsed from User-Agent).
- Top pages by view count.
- Filter controls: date range, exclude bots, exclude admin IPs.
- Data source: MySQL (synced from Redis).

**Traffic Sync Job:**
- BullMQ `TRAFFIC_SYNC_JOB` runs every 10 minutes.
- Reads all `traffic:*` keys from Redis.
- Aggregates counts and inserts/updates rows in the `page_views` MySQL table.
- Clears synced Redis keys after successful database write.
- Job failure does not lose data (Redis keys persist until explicitly deleted).

**Consultation Management:**
- Consultation entity: ULID, name, phone, email, message, status (new/contacted/completed/spam), assigned_to, notes, timestamps.
- Admin table view: sortable, filterable by status, searchable by name/phone.
- Status update endpoint with optional admin notes.
- Real-time notification via Socket.io when new consultation is submitted.
- Email notification to admin via MAIL_JOB queue.

### Deliverables
- Admin receives real-time notification when a consultation form is submitted.
- Analytics dashboard shows page view trends with bot filtering.
- Traffic data persists in MySQL via the sync job.

---

## Stage 6: MAINTENANCE AND OPTIMIZATION (Week 6)

### Goal
Production hardening, performance optimization, and product catalog.

### Tasks

**Log and Storage Management:**
- Verify Docker log rotation is active on all containers (max-size 50MB, max-file 5).
- Set up cron job for MySQL backup: daily dump, 7-day local retention, remote upload via rclone.
- Disk usage monitoring script: alert if usage exceeds 80%.
- Docker image pruning: weekly cleanup of unused images.

**Stress Testing:**
- Load test with k6 or Artillery targeting key endpoints:
  - Homepage (SSR/ISR).
  - Project listing with pagination.
  - Image upload.
  - Login.
- Identify bottlenecks: slow database queries, memory leaks, connection pool exhaustion.
- Optimize based on results: add database indexes, adjust connection pool sizes, tune Redis cache TTLs.

**PageSpeed Optimization:**
- Target: Google PageSpeed Insights score 90+ on mobile.
- Actions:
  - Next.js Image component with WebP and responsive `srcSet`.
  - Critical CSS inlining via Next.js built-in optimization.
  - Font optimization: `next/font` with font-display swap.
  - Lazy loading for below-the-fold images and components.
  - Preconnect to R2 CDN domain.
  - Bundle analysis: identify and reduce large dependencies.
  - Lighthouse CI integration in GitHub Actions to track score regressions.

**Product Catalog (Kitchen Cabinets):**
- Product entity: ULID, name, slug, description, category_id, price_range, dimensions, materials (JSON), gallery (relation to media), status, SEO fields, timestamps.
- Material filter: frontend filter by material type (wood, laminate, acrylic, etc.).
- Product listing page with grid layout, pagination, and filter sidebar.
- Product detail page with image gallery, material specifications, and related products.
- Admin CRUD for products.

**Final Checklist Before Launch:**
- [ ] All security headers verified (run securityheaders.com scan).
- [ ] SSL certificate valid and HSTS enabled.
- [ ] Sitemap.xml accessible and submitted to Google Search Console.
- [ ] Robots.txt correctly configured.
- [ ] 404 page styled and functional.
- [ ] Favicon and Open Graph images set.
- [ ] Google Analytics or Plausible analytics integrated.
- [ ] Admin default password changed.
- [ ] Database backup tested with a restore dry run.
- [ ] Monitoring alerts configured for disk, memory, and error rate.

### Deliverables
- Production system handles expected traffic without performance degradation.
- PageSpeed score meets the 90+ mobile target.
- Product catalog live with filtering capability.
- Backup and monitoring systems operational.

---

## Dependencies Between Stages

```
Stage 1 (Infra) -----> Stage 2 (Auth + Media) -----> Stage 3 (CMS + SEO)
                                                          |
                                                          v
                        Stage 5 (Real-time) <------- Stage 4 (Page Builder)
                            |
                            v
                        Stage 6 (Optimization)
```

- Stage 2 depends on Stage 1 (Docker environment, database, base scaffold).
- Stage 3 depends on Stage 2 (auth guards for admin endpoints, media module for galleries).
- Stage 4 depends on Stage 3 (content entities exist for page builder to reference).
- Stage 5 depends on Stage 3 (traffic counter data in Redis, consultation entity).
- Stage 6 can begin partially in parallel with Stage 5 (log rotation, backup setup).
