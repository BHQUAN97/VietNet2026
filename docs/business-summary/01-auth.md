# 01. Authentication & User Management

> Module: B1 (Auth) + B7 (User Mgmt) + C6 (Security)
> Priority: P0 | Status: Spec Done

---

## Summary

He thong xac thuc va quan ly nguoi dung cho Admin Panel. Su dung JWT (access + refresh token) luu trong HttpOnly cookies. Ho tro 2 role: `admin` (full access) va `editor` (quan ly content). Bao gom login, logout, refresh token, forgot/reset password, va CRUD admin users.

---

## Workflow

### Login Flow
```
User nhap email + password
  → [1] Check rate limit (Redis: 5 fails/10min → lock 30 phut)
  → [2] Tim user trong DB (WHERE deleted_at IS NULL, is_active = 1)
  → [3] bcrypt.compare password (cost 12)
  → [4] Neu sai: INCR rate limit, log login_attempts, tra 401 generic
  → [5] Neu dung: Generate JWT access (60min) + refresh token (7d)
  → [6] Hash refresh token (SHA-256), luu vao DB
  → [7] Set HttpOnly cookies (Secure, SameSite=Strict)
  → [8] Update last_login_at, tra 200 + user info
```

### Token Refresh Flow
```
Cookie refresh_token gui len
  → [1] SHA-256 hash, lookup trong DB
  → [2] Check: chua revoke, chua expire
  → [3] Revoke token cu (SET revoked_at)
  → [4] Generate token moi (rotation)
  → [5] Tra access token moi + set cookie moi
```

### Forgot Password Flow
```
User gui email
  → [1] Rate limit: 3 req/hour/email
  → [2] Generate random 64-char token, hash SHA-256
  → [3] Luu vao password_reset_tokens (expire 1h, single-use)
  → [4] Gui email qua BullMQ MAIL_JOB → Resend API
  → [5] Luon tra 200 (khong reveal email co ton tai hay khong)
```

### Reset Password Flow
```
User click link trong email
  → [1] Validate token: ton tai, chua expire, chua used
  → [2] Hash password moi (bcrypt cost 12)
  → [3] Update user, mark token used_at
  → [4] Revoke tat ca refresh tokens cua user
```

---

## Giai phap chi tiet

### API Endpoints (6 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| POST | `/api/auth/login` | @Public | Dang nhap, tra JWT cookies |
| POST | `/api/auth/refresh` | @Public | Lam moi access token |
| POST | `/api/auth/logout` | @Auth | Xoa cookies, revoke token |
| POST | `/api/auth/forgot-password` | @Public | Gui email reset |
| POST | `/api/auth/reset-password` | @Public | Dat lai mat khau |
| GET | `/api/auth/me` | @Auth | Lay thong tin user hien tai |

### User Management (5 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/users` | @Admin | List admin/editor users |
| POST | `/api/users` | @Admin | Tao user moi |
| PUT | `/api/users/:id` | @Admin | Cap nhat user |
| DELETE | `/api/users/:id` | @Admin | Soft delete (khong cho xoa chinh minh) |
| PUT | `/api/users/:id/password` | @Admin | Doi mat khau |

### DB Tables

- **users**: id (ULID), email, password_hash, name, role (admin/editor), avatar_url, is_active, last_login_at, soft delete
- **refresh_tokens**: token_hash (SHA-256), user_id, expires_at, revoked_at, ip_address, user_agent
- **login_attempts**: ip_address, email, success, attempted_at (BIGINT PK cho high volume)
- **password_reset_tokens**: token_hash, user_id, expires_at, used_at

### Redis Keys

```
rate:login:{ip}              → INCR, TTL 600s (10 min)
rate:login:lock:{ip}         → exists = locked, TTL 1800s (30 min)
```

### Security Measures

- Password: bcrypt cost 12, min 8 chars, 1 uppercase, 1 number, 1 special
- JWT: HttpOnly + Secure + SameSite=Strict cookies
- Token rotation: refresh cu bi revoke khi dung
- Token theft detection: neu token da revoke duoc gui lai → revoke TAT CA tokens cua user
- Rate limit: 5 fails/10min per IP → lock 30 phut
- Login response: KHONG reveal field nao sai (chong email enumeration)
- Super admin: khong the bi xoa (user dau tien trong seed)

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Stage 1 (Core & Infra) da hoan thanh: Docker, MySQL, Redis, NestJS scaffold
- Packages can thiet: `@nestjs/passport`, `passport-jwt`, `bcrypt`, `crypto` (built-in), `@nestjs/throttler`

### File Structure (Backend)

```
backend/src/modules/auth/
├── auth.module.ts              # Import PassportModule, JwtModule, ThrottlerModule
├── auth.controller.ts          # 6 endpoints: login, refresh, logout, forgot/reset password, me
├── auth.service.ts             # Business logic: validateUser, generateTokens, refreshToken, revokeAll
├── strategies/
│   └── jwt.strategy.ts         # Passport JWT strategy, extract tu cookie
├── dto/
│   ├── login.dto.ts            # @IsEmail, @IsString @MinLength(8)
│   ├── forgot-password.dto.ts  # @IsEmail
│   └── reset-password.dto.ts   # @IsString token, @IsString @MinLength(8) new_password
├── entities/
│   ├── refresh-token.entity.ts # token_hash, user_id, expires_at, revoked_at, ip, ua
│   ├── login-attempt.entity.ts # ip, email, success, attempted_at (BIGINT PK)
│   └── password-reset-token.entity.ts
└── guards/
    # Su dung guards chung tu common/guards/

backend/src/modules/users/
├── users.module.ts
├── users.controller.ts         # 5 endpoints CRUD + change password
├── users.service.ts            # Extends BaseService<User>
├── entities/
│   └── user.entity.ts          # email, password_hash, name, role, is_active
└── dto/
    ├── create-user.dto.ts      # @IsEmail, @IsEnum(Role), password rules
    └── update-user.dto.ts      # Partial, OmitType password
```

### Thu tu implement (Backend)

**Buoc 1: Entities + Migration**
```
1. Tao user.entity.ts voi cac decorators TypeORM (@Entity, @Column, @Index)
   - role: @Column({ type: 'enum', enum: ['admin', 'editor'], default: 'editor' })
   - password_hash: @Column({ length: 255 }) — KHONG bao gio select default
   - is_active: @Column({ type: 'tinyint', default: 1 })
2. Tao refresh-token.entity.ts, login-attempt.entity.ts, password-reset-token.entity.ts
3. Chay: npm run migration:generate -- -n CreateAuthTables
4. Review migration, chay: npm run migration:run
```

**Buoc 2: Auth Service**
```
1. Inject: UsersService, JwtService, Redis (CACHE_MANAGER), Repository<RefreshToken>
2. Method: validateUser(email, password)
   - findByEmail (include password_hash: select: true)
   - bcrypt.compare(password, hash)
3. Method: generateTokenPair(user)
   - accessToken: jwt.sign({ sub: user.id, email, role }, { expiresIn: '60m' })
   - refreshToken: crypto.randomBytes(64).toString('hex')
   - Hash refresh: crypto.createHash('sha256').update(token).digest('hex')
   - Save hash to DB
4. Method: refreshTokens(oldRefreshToken)
   - Hash old token, lookup in DB
   - Check revoked_at IS NULL, expires_at > NOW()
   - Revoke old, generate new pair
   - QUAN TRONG: neu token da revoked nhung duoc gui lai → revokeAllUserTokens
5. Method: checkRateLimit(ip)
   - Redis GET rate:login:{ip} → neu >= 5: throw 429
   - Redis GET rate:login:lock:{ip} → neu exists: throw 423
6. Method: recordLoginAttempt(ip, email, success)
   - INSERT login_attempts
   - Neu fail: Redis INCR rate:login:{ip} (TTL 600s)
   - Neu fail count >= 5: Redis SET rate:login:lock:{ip} (TTL 1800s)
```

**Buoc 3: JWT Strategy**
```
1. Extract JWT tu cookie (khong phai Authorization header)
   - jwtFromRequest: ExtractJwt.fromExtractors([
       (req) => req?.cookies?.access_token
     ])
2. Validate: return { id: payload.sub, email: payload.email, role: payload.role }
```

**Buoc 4: Auth Controller**
```
1. POST /login: @Public(), @Throttle(5, 600)
   - Validate DTO, checkRateLimit, validateUser, generateTokenPair
   - res.cookie('access_token', ..., { httpOnly: true, secure: true, sameSite: 'strict' })
   - res.cookie('refresh_token', ..., { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/auth' })
2. POST /refresh: @Public()
   - Doc refresh_token tu req.cookies
   - refreshTokens(), set new cookies
3. POST /logout: @Auth()
   - Revoke refresh token, clear cookies
4. POST /forgot-password: @Public(), @Throttle(3, 3600)
   - Generate token, hash, save, enqueue MAIL_JOB
   - LUON tra 200 (chong enumeration)
5. POST /reset-password: @Public()
   - Validate token, hash new password, update user, revoke all tokens
6. GET /me: @Auth()
   - Return req.user (tu JWT strategy)
```

**Buoc 5: Users Module**
```
1. UsersService extends BaseService<User>
   - findByEmail(email): repository.findOne({ where: { email, deleted_at: IsNull() } })
   - create: hash password, generateUlid, save
   - delete: check khong cho xoa chinh minh (req.user.id !== id)
   - changePassword: neu doi cua minh → verify current_password truoc
2. UsersController: @AdminOnly() cho tat ca endpoints
```

**Buoc 6: Seed Super Admin**
```
scripts/seed-admin.ts:
  - Check neu da co admin → skip
  - Hash password, INSERT user voi role='admin', is_active=1
  - Log: "Super admin created: admin@bhquan.site"
```

### Frontend Implementation

**File Structure:**
```
frontend/src/
├── app/admin/login/page.tsx     # Login form
├── contexts/auth.context.tsx    # AuthProvider: user, login, logout, loading
├── components/auth/AuthGuard.tsx # Protect admin routes
├── lib/api.ts                   # Axios interceptor: auto-refresh on 401
└── middleware.ts                 # Next.js middleware: redirect /admin/* to /admin/login
```

**Thu tu implement (Frontend):**
```
1. auth.context.tsx:
   - State: user, loading, error
   - login(email, password): POST /auth/login, store user, redirect /admin
   - logout(): POST /auth/logout, clear state, redirect /admin/login
   - checkAuth on mount: GET /auth/me, set user or redirect
   - QUAN TRONG: token luu localStorage (access), refresh tu cookie

2. Login page:
   - Form: email + password, validation, error display
   - On submit: authContext.login()
   - Loading state, error message

3. middleware.ts:
   - Match /admin/* (except /admin/login)
   - Check cookie/header for token
   - Redirect to /admin/login neu khong co

4. Axios interceptor (lib/api.ts):
   - Request: attach Authorization: Bearer {token} tu localStorage
   - Response 401: queue request, POST /auth/refresh, retry all queued
   - Handle race condition: chi 1 refresh request tai 1 thoi diem
```

### Testing Checklist

- [ ] Login thanh cong → tra user + set cookies
- [ ] Login sai password → 401, KHONG reveal field nao sai
- [ ] Login 5 lan sai → 429 lock 30 phut
- [ ] Refresh token → tra access moi, revoke cu
- [ ] Dung revoked refresh → revoke ALL tokens cua user
- [ ] Forgot password → email duoc gui (check BullMQ)
- [ ] Reset password → doi duoc, revoke all tokens
- [ ] CRUD users: tao, sua, xoa (khong xoa chinh minh)
- [ ] Change password: verify current_password neu doi cua minh
- [ ] Rate limit hoat dong dung voi Redis TTL
