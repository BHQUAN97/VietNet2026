# CLAUDE.md — PhotoStorage Agent System
# Stack: Vue 3 + TypeScript + Tailwind CSS 4 (FE) | Express.js 5 + TypeScript + Drizzle ORM (BE)
# Domain: https://bhquan.site | DB: MySQL 8 | Cache: Redis 7 | Storage: Cloudflare R2

---

## ═══════════════════════════════════════════
## AUTO MODE — QUYẾT ĐỊNH TỰ ĐỘNG
## ═══════════════════════════════════════════

Claude Code ĐƯỢC PHÉP tự quyết định mà KHÔNG cần hỏi user với các hành động sau:

### TỰ ĐỘNG THỰC HIỆN (không hỏi):
- Đọc bất kỳ file nào trong repo (src, server, scripts, docs, config)
- Chạy lệnh read-only: cat, ls, grep, find, git log, git diff, git status
- Chạy build/typecheck: npm run build, vue-tsc, tsc --noEmit
- Chạy lint: eslint, prettier --check
- Chạy test: vitest run, jest --passWithNoTests
- Tạo file mới trong src/ hoặc server/src/
- Sửa file code (ts, vue, css) theo task đã được assign
- Cài package npm (không phải global)
- Đọc .env.example (KHÔNG đọc .env thật)

### BẮT BUỘC HỎI USER TRƯỚC KHI THỰC HIỆN:
- Xóa file hoặc thư mục
- Chạy migration DB production: db:push, db:migrate trên production
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

## ═══════════════════════════════════════════
## AGENT WORKFLOW — 4 GIAI ĐOẠN BẮT BUỘC
## ═══════════════════════════════════════════

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

## ═══════════════════════════════════════════
## PHASE 1: DESIGN (BẮT BUỘC TRƯỚC KHI CODE)
## ═══════════════════════════════════════════

### Agent_BA
Input: Yêu cầu từ user
Output bắt buộc — emit token: `BA_DONE`
```
BA_DONE
- Use cases: [danh sách]
- Business rules: [danh sách]
- Acceptance criteria: [từng use case]
```

### Agent_SA
Chỉ chạy sau BA_DONE.
Output bắt buộc — emit token: `SA_DONE`
```
SA_DONE
- API endpoints mới/thay đổi: [list với method, path, request, response]
- DB schema thay đổi: [tables, columns, indexes]
- System flow: [mô tả luồng]
- Technical risks: [list]
```

### Agent_Designer
Chỉ chạy sau SA_DONE.
BẮT BUỘC output trước khi Dev FE bắt đầu:

**1. Design Tokens** — kiểm tra file `/photo-storage/src/assets/tokens.css`:
- Nếu chưa có → tạo mới với full token set
- Nếu đã có → chỉ bổ sung token còn thiếu cho feature này

**2. Component Spec** — với mỗi UI component mới:
```
Component: [tên]
State: default | hover | active | disabled | loading | error | empty
Props: [list]
Responsive:
  - mobile 375px: [mô tả layout]
  - tablet 768px: [mô tả layout]
  - desktop 1280px: [mô tả layout]
Accessibility: aria-label, role, keyboard nav
```

**3. Screen Flow** — mô tả flow màn hình người dùng

Output bắt buộc — emit token: `DESIGN_APPROVED`
```
DESIGN_APPROVED
- Tokens file: [created/updated]
- Components specced: [list]
- Responsive breakpoints: defined
→ Dev FE và Dev BE được phép bắt đầu
```

---

## ═══════════════════════════════════════════
## PHASE 2: BUILD
## ═══════════════════════════════════════════

### Agent_Task_Planner
Chỉ chạy sau DESIGN_APPROVED.

Output bắt buộc:
```
TASK_PLAN
FE Tasks:
  [F-001] Tên task — estimate: Xh
  [F-002] ...
BE Tasks:
  [B-001] Tên task — estimate: Xh
  [B-002] ...
Parallel: F-001 || B-001 (chạy song song được)
Sequential: F-002 → sau B-001 xong
```

### Agent_Develop_FE
- Chỉ làm task được assign trong TASK_PLAN
- Không được làm ngoài scope task
- BẮT BUỘC dùng tokens từ `/src/assets/tokens.css` — không hardcode màu/spacing
- BẮT BUỘC dùng pattern từ phần "FE CODE STANDARDS" bên dưới
- Với mỗi task xong: emit `FE_TASK_DONE [F-XXX]`

### Agent_Develop_BE
- Chỉ làm task được assign trong TASK_PLAN
- Không được làm ngoài scope task
- BẮT BUỘC dùng `asyncHandler` wrapper — không viết try/catch inline
- BẮT BUỘC dùng `ok()` / `fail()` response helpers
- Với mỗi task xong: emit `BE_TASK_DONE [B-XXX]`

---

## ═══════════════════════════════════════════
## PHASE 3: TEST — GATE 2 + GATE 3
## ═══════════════════════════════════════════

### Agent_DevLead (GATE 2)
Chạy sau khi TOÀN BỘ task trong TASK_PLAN done.

**CHECKLIST — phải check từng mục, không được skip:**

#### BE Checklist:
- [ ] Mọi route dùng `asyncHandler` wrapper
- [ ] Mọi response dùng `ok()` / `fail()` helper
- [ ] Input đã validate qua `validate.ts` utils
- [ ] Không access `req.body.x` trực tiếp mà không check null
- [ ] Auth middleware đúng chỗ (requireAuth, requireAdmin, requirePlan)
- [ ] Không log sensitive data (password, token, credit card)
- [ ] Error message không expose stack trace ra client
- [ ] Business logic khớp với BA acceptance criteria (dẫn ref cụ thể)
- [ ] Không có N+1 query (dùng JOIN hoặc batch)
- [ ] ULID được validate trước khi query DB

#### FE Checklist:
- [ ] Dùng `useApi` composable — không gọi axios trực tiếp
- [ ] Loading state hiển thị khi gọi API
- [ ] Error state hiển thị khi API fail
- [ ] Empty state có message rõ ràng
- [ ] Không hardcode màu/spacing — dùng design tokens
- [ ] Props có type annotation đầy đủ
- [ ] Không có `console.log` trong production code
- [ ] `v-if` null check trước khi access nested object

#### Output — CHỈ ĐƯỢC 1 TRONG 2:

```
DEVLEAD_APPROVED
Tasks reviewed: [list]
Notes: [nhận xét]
→ Chuyển sang QC
```

hoặc:

```
DEVLEAD_REJECTED
Failed:
  [B-001]: asyncHandler thiếu ở route POST /images — dùng try/catch inline
  [F-002]: hardcode color #ff0000 ở line 45 — dùng var(--color-error)
→ Quay lại Dev sửa → DevLead review lại
```

---

### Agent_QC_API (GATE 3 — phần 1)
Chỉ chạy sau DEVLEAD_APPROVED.
**Gọi API thực tế — không đọc code.**

Với mỗi endpoint mới trong scope, test đủ 4 case:

```bash
# Case 1: Happy path
curl -X POST http://localhost:4000/api/[endpoint] \
  -H "Authorization: Bearer [valid_token]" \
  -H "Content-Type: application/json" \
  -d '[valid_body]'
# Expected: 200, { success: true, data: {...} }

# Case 2: Không có token
curl -X POST http://localhost:4000/api/[endpoint]
# Expected: 401, { success: false, message: "..." }

# Case 3: Thiếu required field
curl -X POST http://localhost:4000/api/[endpoint] \
  -H "Authorization: Bearer [valid_token]" \
  -d '{}'
# Expected: 400, { success: false, message: "..." }

# Case 4: Sai role/permission
curl -X POST http://localhost:4000/api/[endpoint] \
  -H "Authorization: Bearer [user_token_not_admin]"
# Expected: 403
```

Output:
```
QC_API_PASSED
Endpoints: [list]
Test cases: X/X passed
```
hoặc:
```
QC_API_BUG [B-XXX]
Endpoint: POST /api/...
Case: Thiếu required field
Input: { title: null }
Expected: 400
Actual: 500 Internal Server Error
→ Assign về BE
```

---

### Agent_QC_UI (GATE 3 — phần 2)
Chạy song song với QC_API.

**Test responsive thực tế — không phải estimate:**

Mở browser dev tools, resize theo từng breakpoint:

#### Mobile 375px:
- [ ] Không có horizontal scroll
- [ ] Text không bị overflow/cắt
- [ ] Button/link đủ touch target tối thiểu 44px
- [ ] Modal/drawer hiển thị đúng
- [ ] Form input không bị che bởi keyboard

#### Tablet 768px:
- [ ] Layout chuyển đổi đúng (1 col → 2 col nếu có)
- [ ] Navigation hiển thị đúng

#### Desktop 1280px:
- [ ] Không có nội dung quá rộng không có max-width
- [ ] Sidebar hiển thị đúng nếu có

**Test UX states:**
- [ ] Loading spinner/skeleton hiển thị khi fetch
- [ ] Error toast/message khi API fail
- [ ] Empty state khi không có data
- [ ] Disabled state của button khi đang submit
- [ ] Form validation message rõ ràng (không phải console error)

**Test theo use case từ BA:**
- [ ] Chạy từng use case step by step như user thật
- [ ] Verify kết quả khớp với acceptance criteria

Output:
```
QC_UI_PASSED
Breakpoints: 375px ✓ | 768px ✓ | 1280px ✓
Use cases: X/X passed
```
hoặc:
```
QC_UI_BUG [F-XXX]
Screen: Dashboard - Album list
Breakpoint: 375px
Issue: Album title bị overflow, không có text-overflow: ellipsis
Screenshot note: [mô tả vị trí]
→ Assign về FE
```

---

## ═══════════════════════════════════════════
## PHASE 4: DEPLOY
## ═══════════════════════════════════════════

### Agent_DevOps
**CHỈ chạy khi có ĐỦ cả 3:**
- `DEVLEAD_APPROVED`
- `QC_API_PASSED`
- `QC_UI_PASSED`

Nếu thiếu bất kỳ token nào → DỪNG, báo lỗi workflow, không deploy.

**Checklist trước khi SSH vào VPS:**
- [ ] Build local thành công: `npm run build` (FE) + `tsc --noEmit` (BE)
- [ ] Không có TypeScript error
- [ ] .env production có đủ biến (so với .env.example)

**Sau khi deploy:**
- [ ] Health check: `curl https://bhquan.site/api/health`
- [ ] Test 1 happy path thực tế trên production
- [ ] Kiểm tra logs 2 phút đầu không có error

Output:
```
DEPLOYMENT_SUCCESS
Version: [git commit hash]
Deploy time: [timestamp]
Health check: OK
```
hoặc:
```
DEPLOYMENT_FAILED
Stage: [build/upload/migrate/restart]
Error: [log cụ thể]
Action: [rollback/fix]
→ Không xóa backup cũ cho đến khi fix xong
```

---

## ═══════════════════════════════════════════
## CƠ CHẾ QUAY LẠI — KHÔNG ĐƯỢC BỎ QUA
## ═══════════════════════════════════════════

| Tình huống | Quay về |
|---|---|
| BA miss nghiệp vụ | Agent_BA |
| SA sai API spec | Agent_SA |
| Designer thiếu responsive spec | Agent_Designer |
| Task plan sai phụ thuộc | Agent_Task_Planner |
| DEVLEAD_REJECTED | Dev (đúng FE hoặc BE) → DevLead review lại |
| QC_API_BUG | Agent_Develop_BE → QC_API test lại |
| QC_UI_BUG | Agent_Develop_FE → QC_UI test lại |
| Deploy fail do code | Agent_Develop_BE/FE → full test lại |
| Deploy fail do môi trường | Agent_DevOps tự xử lý |

---

### Architecture Notes
- ULID cho tất cả primary keys
- JWT access token 60min + refresh token 7 days (HttpOnly cookies)
- R2 private bucket (originals) + public bucket (thumb/preview)
- BullMQ + Redis cho async image processing
- Socket.io rooms: `user:{userId}`, `admin`
- Manual payment flow: bank transfer → admin approve

---

## ═══════════════════════════════════════════
## LESSONS LEARNED — CẬP NHẬT SAU MỖI BUG
## ═══════════════════════════════════════════

File: `/docs/lessons-learned.md`
Format:
```
[BUG-XXX] [Date]
Phase found: QC_API / QC_UI / Production
Root cause: ...
Pattern tránh: ...
Checklist bổ sung: ...
```

Sau mỗi sprint, Agent_Document tổng hợp lessons → update checklist liên quan.
