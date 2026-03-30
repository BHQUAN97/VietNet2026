# Lessons Learned — VietNet Interior

---

[BUG-001] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: sanitizeHtml() used naive regex-based filtering, bypassable by mutation XSS
Pattern: Always use whitelist-based HTML sanitizer; regex is never sufficient for XSS prevention
Checklist: FE sanitizer must block on* handlers, javascript:/data:/vbscript: URLs, style attributes

[BUG-002] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: findByIdSafe() in users.service.ts did not check deleted_at IS NULL
Pattern: Every "find by ID" method must include soft-delete filter
Checklist: BE service findById/findByIdSafe must include `deleted_at: IsNull()` condition

[BUG-003] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: Products controller contained business logic (image_ids extraction + updateImages)
Pattern: Controllers must ONLY delegate to service — no business logic
Checklist: BE controller methods should be max 3-5 lines: validate → service call → return

[BUG-004] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: Global exception filter logged stack traces in production
Pattern: Stack traces expose internal paths; only log in development
Checklist: BE global filter must check NODE_ENV before logging stack

[BUG-005] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: Pages service accepted arbitrary JSON config without schema validation
Pattern: All JSON columns must be validated against expected schema before save
Checklist: BE service must validate JSON structure (required fields, types) before DB write

[BUG-006] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: Notification gateway used magic strings 'admin'/'super_admin' instead of UserRole enum
Pattern: Always use enum constants, never magic strings for role checks
Checklist: BE role checks must reference UserRole enum, not string literals

[BUG-007] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: ULID validation inconsistent across services
Pattern: Every service method that accepts an ID parameter must validate ULID format first
Checklist: BE services must call validateUlid() before any DB query with user-supplied ID

[BUG-008] [2026-03-28]
Phase found: Phase 3 Re-Review (GATE 2 DevLead)
Root cause: Image upload had no dimension limit, allowing DOS via huge pixel images
Pattern: Always validate both file size AND image dimensions on upload
Checklist: BE media upload must check max dimensions (10000x10000) via sharp metadata

[BUG-009] [2026-03-28]
Phase found: Phase 3 Re-Review (QC_UI)
Root cause: Touch targets on GlassNav, NotificationBell, AdminSidebar were < 44px
Pattern: All interactive elements must have minimum 44x44px touch target
Checklist: FE buttons/links must include min-h-[44px] min-w-[44px]

[BUG-010] [2026-03-28]
Phase found: Phase 3 Re-Review (QC_UI)
Root cause: Section components (FeaturedProjects, LatestArticles, Testimonials) returned null on empty data
Pattern: Never return null for empty state; always show meaningful fallback UI
Checklist: FE data components must render loading, error, AND empty states

[BUG-011] [2026-03-28]
Phase found: Phase 3 Re-Review (QC_UI)
Root cause: Design system violations — 1px borders, pure #FFFFFF, shadow-sm instead of shadow-ambient
Pattern: Strictly follow design tokens; no hardcoded colors, borders, or shadows
Checklist: FE must use design token classes only (shadow-ambient-*, bg-surface-*, no border-*)

[BUG-012] [2026-03-28]
Phase found: Phase 3 Re-Review (MCP WebSearch)
Root cause: Redis maxmemory-policy was allkeys-lru, which causes BullMQ key eviction
Pattern: BullMQ requires noeviction policy; manage TTL manually for cache keys
Checklist: Docker Redis must use --maxmemory-policy noeviction when BullMQ is in use

[BUG-013] [2026-03-28]
Phase found: Phase 3 Re-Review (MCP WebSearch)
Root cause: BullMQ connection missing maxRetriesPerRequest: null for worker resilience
Pattern: BullMQ workers need unlimited retries to survive Redis reconnections
Checklist: BE BullModule.forRoot connection must set maxRetriesPerRequest: null
