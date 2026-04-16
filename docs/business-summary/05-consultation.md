# 05. Consultation Management

> Module: A2.6 (CTA Form) + A7 (Contact) + B4 (Consultation Mgmt) + C2 (Email)
> Priority: P0 | Status: Spec Done

---

## Summary

He thong tiep nhan va quan ly yeu cau tu van tu khach hang. Khach hang gui form tu trang chu, trang lien he, hoac trang chi tiet san pham. He thong tu dong: (1) luu vao DB, (2) gui email xac nhan cho khach, (3) gui thong bao cho admin, (4) thong bao real-time qua Socket.io. Admin quan ly trang thai theo workflow: New → Contacted → Scheduled → Completed.

---

## Workflow

### Submission Flow (Public)
```
Khach hang dien form va submit:
  → [1] Validate: name (required), email (required), project_type
  → [2] Check honeypot: neu non-empty → bot → silent accept, khong luu
  → [3] Check rate limit (Redis): 1 req/min, 3 req/hour per IP
      - Vuot: tra 429 "Vui long doi truoc khi gui tiep"
  → [4] Check bot: user-agent match bot patterns → silent discard
  → [5] INSERT INTO consultations (status: 'new', source: page)
  → [6] Async (khong block):
      - Enqueue MAIL_JOB: consultation_confirmation → email khach
      - Enqueue MAIL_JOB: consultation_admin_notification → email admin
  → [7] Real-time:
      - Create notification records cho all admins
      - Socket.io emit 'consultation:new' → admin room
  → [8] Tra 201 { ref_code: "VN-2026-001" }
```

### Status Management (Admin)
```
Admin cap nhat trang thai:
  → [1] Validate transition: chi cho phep tien len
      - new → contacted → scheduled → completed
      - KHONG cho lui (tru super admin)
  → [2] UPDATE status, ghi note + changed_by + changed_at
  → [3] Socket.io emit 'consultation:status' → admin room
```

### Email Flow (Background)
```
MAIL_JOB Worker:
  → [1] Load email template tu settings (DB)
  → [2] Replace placeholders: {{name}}, {{ref_code}}, {{project_type}}
  → [3] Send via Resend API
  → [4] Log success/failure
  → Retry: 3 attempts, exponential backoff (2s, 8s, 32s)
  → Failure: log error, KHONG thong bao user (form da accepted)
```

---

## Giai phap chi tiet

### API Endpoints (5 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| POST | `/api/consultations` | @Public | Gui yeu cau tu van |
| GET | `/api/consultations` | @Admin | List (filter status, date, search) |
| GET | `/api/consultations/:id` | @Admin | Chi tiet voi status history |
| PUT | `/api/consultations/:id/status` | @Admin | Cap nhat trang thai |
| DELETE | `/api/consultations/:id` | @Admin | Soft delete |

### Form Fields (Public)

| Field | Type | Required | Mo ta |
|-------|------|----------|-------|
| name | string | Yes | Ho ten, max 100 chars |
| email | string | Yes | Email hop le |
| phone | string | No | So dien thoai VN |
| project_type | enum | Yes | residential, commercial, hospitality, renovation, other |
| area | number | No | Dien tich (m2) |
| budget_range | string | No | 100-300, 300-500, 500-1000, 1000+ (trieu VND) |
| message | string | No | Tin nhan, max 2000 chars |
| product_id | ULID | No | Tu trang product detail |
| source_page | string | No | Trang gui form |
| honeypot | string | No | Hidden field, phai empty |

### Status Workflow

```
  [NEW] ──→ [CONTACTED] ──→ [SCHEDULED] ──→ [COMPLETED]
    │                                            
    └──→ [CANCELLED] (admin huy)
```

- Chi tien len, KHONG lui (tru super admin override)
- Moi thay doi ghi: status, note, changed_by, changed_at

### DB Table: consultations

- id (ULID), name, email, phone, project_type (ENUM)
- area, budget_range, message, product_id (FK optional)
- status (ENUM: new, contacted, scheduled, completed, cancelled)
- assigned_to (FK → users), notes (admin internal)
- ip_address, user_agent, source, honeypot
- Anti-spam: rate limit via Redis

### Email Templates (Configurable)

| Template | Trigger | Placeholders |
|----------|---------|-------------|
| consultation_confirmation | Gui cho khach | {{name}}, {{ref_code}}, {{project_type}} |
| consultation_admin_notification | Gui cho admin | {{name}}, {{email}}, {{project_type}}, {{message}} |

### Anti-Spam Measures

1. **Honeypot field**: hidden input, bot dien vao → silent discard
2. **Rate limit**: Redis `rate:consultation:{ip}` — 3 req/hour
3. **Bot detection**: User-Agent check against known bot patterns
4. **Validation**: class-validator DTOs, whitelist: true

### Real-time Notifications

- Socket.io event `consultation:new` → admin room
- Payload: { id, ref_code, name, project_type, created_at }
- Admin Panel: notification bell badge cap nhat
- Optional: notification sound (configurable in settings)

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth module, BullMQ mail queue, Socket.io gateway da hoan thanh
- Resend API key: RESEND_API_KEY

### File Structure

```
backend/src/modules/consultations/
├── consultations.module.ts
├── consultations.service.ts
├── consultations.controller.ts
├── entities/
│   └── consultation.entity.ts
└── dto/
    ├── create-consultation.dto.ts  # Public form, @IsNotEmpty name, @IsEmail
    ├── update-status.dto.ts        # status enum, note optional
    └── query-consultation.dto.ts   # status, from, to, q, pagination

backend/src/common/services/
├── mail.service.ts              # Resend API wrapper
└── mail-queue.service.ts        # Enqueue MAIL_JOB

backend/src/queues/
└── mail.processor.ts            # Process email jobs

frontend/src/
├── components/forms/ConsultationForm.tsx  # Public form component
├── app/(public)/contact/page.tsx         # Contact page voi form
└── app/admin/consultations/page.tsx      # Admin list + status management
```

### Thu tu implement (Backend)

**Buoc 1: Consultation Entity**
```
consultation.entity.ts:
  - id (ULID), name, email, phone, project_type (ENUM)
  - area, budget_range, message (TEXT)
  - product_id (FK → products, nullable) — tu product detail page
  - status: ENUM('new','contacted','scheduled','completed','cancelled')
  - assigned_to (FK → users), notes (admin internal)
  - Anti-spam: ip_address, user_agent, source, honeypot
  - status_changed_at, status_changed_by (FK → users)
  - ref_code: VARCHAR(20) — auto-gen "VN-{year}-{seq}"
```

**Buoc 2: Consultation Service**
```typescript
@Injectable()
export class ConsultationsService {
  // create(dto, ip, userAgent):
  //   1. Check honeypot → neu non-empty: return fake success (silent discard)
  //   2. Check rate limit: Redis GET rate:consultation:{ip}
  //      - >= 3: throw TooManyRequestsException
  //      - INCR + TTL 3600s
  //   3. Check bot: match user_agent vs bot patterns
  //   4. Generate ref_code: "VN-2026-{padded_seq}"
  //   5. INSERT consultation
  //   6. Async: enqueue 2 MAIL_JOBs (confirmation + admin notification)
  //   7. Create notification records cho all admins
  //   8. Socket.io emit 'consultation:new' → admin room
  //   9. Return { id, ref_code }

  // updateStatus(id, status, note, adminId):
  //   1. Validate transition: VALID_TRANSITIONS map
  //      const VALID = { new: ['contacted'], contacted: ['scheduled'], scheduled: ['completed'] }
  //   2. Neu transition khong hop le → throw BadRequest
  //   3. UPDATE consultation: status, status_changed_at, status_changed_by, notes
  //   4. Socket.io emit 'consultation:status' → admin room

  // findAll(query): pagination, filter status/date/search
}
```

**Buoc 3: Mail Service + Processor**
```typescript
// mail.service.ts — Resend API wrapper
@Injectable()
export class MailService {
  private resend: Resend;
  constructor() { this.resend = new Resend(process.env.RESEND_API_KEY); }

  async send(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: 'VietNet Interior <noreply@bhquan.site>',
      to, subject, html,
    });
  }
}

// mail-queue.service.ts — Enqueue helper
@Injectable()
export class MailQueueService {
  constructor(@InjectQueue('email') private mailQueue: Queue) {}

  async enqueue(type: string, to: string, data: Record<string, any>) {
    await this.mailQueue.add(type, { type, to, data }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}

// mail.processor.ts — Worker
@Processor('email')
export class MailProcessor extends WorkerHost {
  async process(job: Job) {
    const { type, to, data } = job.data;
    // 1. Load template tu settings DB
    // 2. Replace placeholders {{name}}, {{ref_code}}...
    // 3. Send via MailService
    // 4. Log to email_logs table
  }
}
```

**Buoc 4: Controller**
```
POST /consultations: @Public(), @Throttle(1, 60)
  - Extract ip tu req, user_agent tu headers
  - Call service.create(dto, ip, ua)

GET /consultations: @AdminOnly(), pagination + filters
GET /consultations/:id: @AdminOnly()
PUT /consultations/:id/status: @AdminOnly()
DELETE /consultations/:id: @AdminOnly()
```

### Frontend Implementation

**ConsultationForm.tsx (Public):**
```
- Fields: name*, email*, phone, project_type* (dropdown), area, budget_range, message
- Honeypot: <input type="hidden" name="honeypot" /> (CSS hidden, non-empty = bot)
- product_id: hidden field (khi tu product detail)
- source_page: auto-detect tu pathname
- Validation: Zod schema, inline error messages
- Submit: POST /consultations
- Success: toast "Yeu cau da duoc gui. Chung toi se lien he trong 24h."
- Error 429: toast "Vui long doi truoc khi gui tiep"
```

**Admin page:**
```
/admin/consultations/page.tsx:
  - useAdminList + custom status update
  - Table: ref_code, name, email, project_type, status (badge), created_at
  - Filters: status dropdown, date range, search
  - Click row: modal/drawer voi full detail + status history
  - Status update: dropdown → confirm → PUT /consultations/:id/status
```

### Testing Checklist

- [ ] Submit form → 201, ref_code returned
- [ ] Honeypot non-empty → 201 nhung khong luu (silent discard)
- [ ] Rate limit: 4th request trong 1h → 429
- [ ] Email confirmation gui cho khach (check BullMQ)
- [ ] Email notification gui cho admin
- [ ] Socket.io: admin nhan 'consultation:new' real-time
- [ ] Status transition: new→contacted OK, contacted→new FAIL
- [ ] tu product detail: product_id duoc prefill
