# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# VietNet Interior — Agent System
# Stack: Next.js 14+ App Router + TypeScript + Tailwind CSS + Shadcn UI (FE) | NestJS + TypeScript + TypeORM (BE)
# Domain: bhquan.site | DB: MySQL 8 | Cache: Redis 7 | Storage: Cloudflare R2 | Queue: BullMQ

---

## BUILD & DEV COMMANDS

No source code yet — project is in design/planning phase. Once scaffolded, expected commands:

```bash
# Frontend (Next.js)
npm run dev                # Dev server
npm run build              # Production build
npm run start              # Production server
npm run lint               # ESLint
npx tsc --noEmit           # Type check

# Backend (NestJS)
npm run start:dev          # Dev server (watch mode)
npm run build              # Production build
npm run start:prod         # Production server
npm run lint               # ESLint
npx tsc --noEmit           # Type check
npm run migration:run      # DB migrations

# Docker
docker-compose up -d       # Start all services (Nginx, NestJS, Next.js, MySQL, Redis)
docker-compose down        # Stop all services
docker-compose logs -f     # Follow logs
```

---

## AUTO MODE — QUYẾT ĐỊNH TỰ ĐỘNG

Claude Code ĐƯỢC PHÉP tự quyết định mà KHÔNG cần hỏi user với các hành động sau:

### TỰ ĐỘNG THỰC HIỆN (không hỏi):
- Đọc bất kỳ file nào trong repo (src, server, scripts, docs, config)
- Chạy lệnh read-only: cat, ls, grep, find, git log, git diff, git status
- Chạy build/typecheck: npm run build, tsc --noEmit
- Chạy lint: eslint, prettier --check
- Chạy test: jest, vitest
- Tạo file mới trong src/
- Sửa file code (ts, tsx, css) theo task đã được assign
- Cài package npm (không phải global)
- Đọc .env.example (KHÔNG đọc .env thật)

### BẮT BUỘC HỎI USER TRƯỚC KHI THỰC HIỆN:
- Xóa file hoặc thư mục
- Chạy migration DB production
- SSH vào VPS / thực hiện lệnh trên server
- Deploy lên production
- Thay đổi .env production
- Xóa data trong DB
- Reset Redis cache production
- Thay đổi Docker config đang chạy
- Commit và push lên git
- Bất kỳ hành động không thể hoàn tác

### KHI KHÔNG CHẮC:
Tự thực hiện nếu hành động có thể reverse. Hỏi nếu hành động KHÔNG thể reverse.

---

## ARCHITECTURE OVERVIEW

### System Components
- **Public Website:** SSR via Next.js App Router — 100% server-rendered for SEO (target 90+ PageSpeed Mobile)
- **Admin Panel:** CMS with Page Builder (JSON config), Draft Mode preview
- **API Server:** NestJS modular backend with layered architecture
- **Background Workers:** BullMQ + Redis for `IMAGE_JOB`, `MAIL_JOB`, `TRAFFIC_SYNC_JOB`
- **Real-time:** Socket.io rooms (`user:{userId}`, `admin`) for notifications
- **CDN/Storage:** Cloudflare R2 (private bucket for originals, public for thumb/preview)

### Infrastructure (Docker Compose on 4 Core / 16GB RAM / 160GB SSD)
- **Nginx:** Reverse proxy, micro-caching 1s for public API, Gzip/Brotli, `client_max_body_size 20M`
- **NestJS App:** Cluster mode (pm2), CPU 2.0, RAM 4GB
- **Next.js FE:** SSR mode, CPU 1.0, RAM 4GB
- **MySQL 8:** `innodb_buffer_pool_size=4G`
- **Redis:** Cache layer + BullMQ queue + Socket.io adapter + Analytics counters

### Database Conventions
- ULID for all primary keys (validate before querying)
- Soft delete via `deleted_at` on all tables
- Auto-audit: `created_by/at`, `updated_by/at` via NestJS Interceptor
- 100% parameterized queries — no string concatenation
- Transactions required for multi-table writes
- DB changes only via code migrations

### Auth & Security
- JWT access token 60min + refresh token 7 days (HttpOnly cookies)
- RBAC guards: `requireAuth`, `requireAdmin`, `requirePlan`
- Rate limiting: Login 5 fails/10min → 30-min IP block; Contact form 1 req/min per IP
- DOMPurify for HTML editor content (XSS prevention)
- CORS: only whitelisted domains; Helmet.js for security headers

---

## BACKEND CODE RULES (NestJS)

1. **Layered Responsibility:** Controller → Service → Repository → Entity
2. **Interface-first:** Define interfaces before implementing classes
3. **Template Method:** Base CRUD service with hooks: `beforeSave` → `validate` → `saveData` → `afterSave`
4. **DI via Factory:** Centralized dependency registration at Module level
5. **Global Filter:** Single exception filter — consistent `{ success, data, message, meta }` response format
6. **Structured Logging:** Pino with 5 levels + RequestID for Docker debugging
7. **Slim Controller:** One endpoint = one service call, no business logic in controllers
8. **Strict DTO:** `class-validator` validation at entry point
9. **Guard-Clause:** Check errors and throw early at method start
10. **Background Jobs:** Never process images/mail inline — use BullMQ workers
11. **Media Pipeline:** Upload → BullMQ → Sharp (resize 2048px desktop / 768px mobile, WebP 80%, strip EXIF) → R2
12. **Performance:** Cache heavy queries in Redis; avoid N+1 (use JOIN or batch)
13. **ThrottlerModule:** Protect `POST /contact` and login endpoints

---

## FRONTEND CODE RULES (Next.js)

1. **SSR-first:** 100% server-rendered public pages for Google indexing
2. **Adaptive Image:** `next/image` with auto WebP, `alt` text from project names
3. **Dynamic SEO:** Metadata + Open Graph + `canonical` tag + JSON-LD Schema per page
4. **ISR Revalidate:** `revalidatePath()` / `revalidateTag()` when admin edits content
5. **Token Refresh:** Axios interceptor handling race conditions on token expiry
6. **Popup Registry:** Centralized Modal/Drawer manager with lazy loading (Drawer on mobile, Modal on desktop)
7. **URL State:** Filters and search in URL search params
8. **Optimistic UI:** Update UI before API responds for perceived speed
9. **Draft Mode:** Next.js Draft Mode for admin page builder preview
10. **No hardcoded colors/spacing** — use design tokens from CSS custom properties
11. **Loading/Error/Empty states required** for every data-fetching component

---

## DESIGN SYSTEM — "The Curated Atelier"

Premium interior design aesthetic. Reference: nlhome.vn

### Core Palette
- Primary `#553722` — headers, brand signals
- Primary Container `#6F4E37` — "VietNet Brown", hero CTAs
- Surface `#FCF9F7` — warm gallery white (never pure `#FFFFFF`)
- On-background `#1B1C1B` — text color (never pure `#000000`)

### Typography
- **Display/Headline:** Noto Serif (architectural, commanding)
- **Body/Title/Label:** Manrope (clean, modern)
- Wide letter-spacing on labels, tight tracking on display — "high-fashion" rhythm

### Key Design Rules
- **No-Line Rule:** 1px solid borders PROHIBITED. Use tonal background shifts for sectioning
- **Surface Hierarchy:** Nested depth via `surface` → `surface-container-low` → `surface-container-highest`
- **Glassmorphism:** Semi-transparent surfaces with `backdrop-blur` 12-20px for nav/floating elements
- **Ambient Shadows:** Blur ≥24px, opacity 4-8%, brown-tinted (not grey)
- **Ghost Border:** If border needed for a11y, use `outline-variant` at 10% opacity max
- **No divider lines in cards/lists** — use vertical whitespace or tonal shifts
- **No harsh corners** — minimum `sm` or `md` border-radius
- **Breathing Room:** When in doubt, add more whitespace

---

## AGENT WORKFLOW — 4 GIAI ĐOẠN BẮT BUỘC

```
PHASE 1: DESIGN     → PHASE 2: BUILD     → PHASE 3: TEST      → PHASE 4: DEPLOY
BA → SA → Designer  → TaskPlan → Dev     → DevLead → QC        → DevOps
         ↑ GATE 1 ↑            ↑ GATE 2 ↑          ↑ GATE 3 ↑
```

**GATE 1:** `DESIGN_APPROVED` — SA + Designer phải output xong trước khi Dev code
**GATE 2:** `DEVLEAD_APPROVED` — DevLead review xong trước khi QC test
**GATE 3:** `QC_PASSED` — QC pass hết trước khi DevOps deploy

**Không được nhảy GATE. Không được gộp phase. Không được bỏ bước.**

---

### PHASE 1: DESIGN (BẮT BUỘC TRƯỚC KHI CODE)

**Agent_BA** → Phân tích yêu cầu → emit `BA_DONE`
- Use cases, business rules, acceptance criteria

**Agent_SA** (sau BA_DONE) → Thiết kế API + DB → emit `SA_DONE`
- API endpoints (method, path, request, response)
- DB schema changes (tables, columns, indexes)
- System flow, technical risks

**Agent_Designer** (sau SA_DONE) → emit `DESIGN_APPROVED`
1. Design Tokens — check/create `/src/assets/tokens.css`
2. Component Spec — states, props, responsive (375px / 768px / 1280px), a11y
3. Screen Flow

**DỪNG sau PHASE 1. Hiển thị output. Chờ user confirm.**

---

### PHASE 2: BUILD

**Agent_Task_Planner** (sau DESIGN_APPROVED) → emit `TASK_PLAN`
```
FE Tasks: [F-001], [F-002]...
BE Tasks: [B-001], [B-002]...
Parallel vs Sequential dependencies
```

**Agent_Develop_FE** — chỉ làm task trong TASK_PLAN, dùng design tokens, emit `FE_TASK_DONE [F-XXX]`
**Agent_Develop_BE** — chỉ làm task trong TASK_PLAN, emit `BE_TASK_DONE [B-XXX]`

---

### PHASE 3: TEST

**Agent_DevLead (GATE 2)** — sau toàn bộ task done, review checklist:

BE Checklist:
- [ ] Layered architecture (Controller → Service → Repository)
- [ ] class-validator DTO validation at entry
- [ ] Guard-clause error checking
- [ ] Auth middleware correct (`requireAuth`, `requireAdmin`, `requirePlan`)
- [ ] No sensitive data in logs, no stack traces to client
- [ ] No N+1 queries; ULID validated before DB query
- [ ] Business logic matches BA acceptance criteria

FE Checklist:
- [ ] Loading/Error/Empty states on every data component
- [ ] No hardcoded colors/spacing — design tokens only
- [ ] Props fully typed
- [ ] No `console.log` in production code
- [ ] Null checks before accessing nested objects
- [ ] Responsive at 375px / 768px / 1280px

Output: `DEVLEAD_APPROVED` or `DEVLEAD_REJECTED` (with specific issues → Dev sửa → review lại)

**Agent_QC_API (GATE 3)** — sau DEVLEAD_APPROVED, test thực tế 4 cases per endpoint:
1. Happy path → 200
2. No auth token → 401
3. Missing required fields → 400
4. Wrong role/permission → 403

**Agent_QC_UI (GATE 3)** — chạy song song với QC_API:
- Responsive test: 375px, 768px, 1280px (no horizontal scroll, touch targets ≥44px)
- UX states: loading, error, empty, disabled, form validation
- Use case walkthrough matching BA acceptance criteria

---

### PHASE 4: DEPLOY

**Agent_DevOps** — CHỈ chạy khi có đủ `DEVLEAD_APPROVED` + `QC_API_PASSED` + `QC_UI_PASSED`

Pre-deploy: `npm run build` (FE+BE), no TS errors, .env check
Post-deploy: health check `curl https://bhquan.site/api/health`, verify logs 2 min

---

### CƠ CHẾ QUAY LẠI

| Tình huống | Quay về |
|---|---|
| BA miss nghiệp vụ | Agent_BA |
| SA sai API spec | Agent_SA |
| Designer thiếu responsive spec | Agent_Designer |
| Task plan sai phụ thuộc | Agent_Task_Planner |
| DEVLEAD_REJECTED | Dev (FE/BE) → DevLead review lại |
| QC_API_BUG | Agent_Develop_BE → QC_API test lại |
| QC_UI_BUG | Agent_Develop_FE → QC_UI test lại |
| Deploy fail do code | Dev → full test lại |
| Deploy fail do môi trường | Agent_DevOps tự xử lý |

---

## LESSONS LEARNED

File: `/docs/lessons-learned.md` — cập nhật sau mỗi bug:
```
[BUG-XXX] [Date]
Phase found: QC_API / QC_UI / Production
Root cause: ...
Pattern tránh: ...
Checklist bổ sung: ...
```

## KEY DOCUMENTATION FILES

- `02_MASTER_ARCH_RULES.md` — 28 BE + 20 FE architecture rules
- `DESIGN.md` — Full design system ("Curated Atelier")
- `MISA_Design_System_Full.md` — Extended MISA design standards
- `VIETNET_MASTER_BLUEPRINT.md` — Master blueprint v2.1
- `INFRA_OPS_DOCKER.md` — Docker & infrastructure setup
- `SECURITY_RULES.md` — Security standards
- `IMPLEMENTATION_PLAN.md` — 6-stage roadmap (6 weeks)
- `AGENT_PROMPT.md` — Agent workflow prompt template
- `DESIGN/` — Figma design exports (mobile + web)
