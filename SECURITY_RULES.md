# SECURITY STANDARDS V3.0

> VietNet Interior | Defense-in-Depth
> Last updated: 2026-03-27

---

## 1. Input Sanitization

### HTML Content (Rich Text Editors)

- All HTML submitted from rich text editors (TinyMCE, CKEditor, or similar) must pass through DOMPurify on the backend before storage.
- Stripped elements: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`.
- Stripped attributes: `onerror`, `onload`, `onclick`, `onmouseover`, and all other inline event handlers.
- Allowed tags whitelist: `p`, `h1-h6`, `ul`, `ol`, `li`, `a`, `img`, `strong`, `em`, `br`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `blockquote`, `figure`, `figcaption`.
- Links (`<a>`) must have `rel="noopener noreferrer"` added automatically.

### DTO Validation (NestJS)

- Every endpoint must define a DTO class with `class-validator` decorators.
- No direct access to `req.body` properties without validation.
- Common validation rules:
  - `@IsString()`, `@IsNotEmpty()` for required text fields.
  - `@IsEmail()` for email fields.
  - `@MaxLength()` enforced on all string fields.
  - `@IsOptional()` explicitly declared for optional fields.
  - `@IsULID()` custom decorator for all ID parameters.
- Global validation pipe enabled with `whitelist: true` and `forbidNonWhitelisted: true` to strip unknown properties.

### Slug Validation

- Slugs must match the pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- No special characters, no spaces, no uppercase.
- Maximum length: 200 characters.
- Validated at the DTO level before reaching the service layer.

### File Upload Validation

| Check           | Rule                                                    |
|----------------|---------------------------------------------------------|
| File size       | Maximum 20MB per file                                   |
| MIME type       | Whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| File extension  | Must match MIME type (no `.jpg` with `application/pdf` MIME) |
| Magic bytes     | Verify file header matches declared MIME type            |
| Filename        | Sanitize to remove path traversal characters (`../`, `./`) |
| Dimensions      | Maximum 8000x8000 pixels (prevents decompression bombs) |

---

## 2. Authentication and Authorization

### JWT Strategy

- Access tokens and refresh tokens stored in HttpOnly cookies. Never in localStorage or sessionStorage.
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`.
- Access token lifetime: 60 minutes.
- Refresh token lifetime: 7 days.
- Token payload contains: `sub` (user ULID), `role`, `iat`, `exp`. No sensitive data in payload.

### Token Rotation

- On each token refresh, the old refresh token is invalidated.
- Refresh tokens stored in the database with a hash; raw token never persisted.
- If a previously used (invalidated) refresh token is presented, revoke all tokens for that user (indicates token theft).

### RBAC Middleware

Three guards applied at the route level:

| Guard            | Purpose                                         |
|-----------------|--------------------------------------------------|
| `@RequireAuth`   | Validates JWT, attaches user to request          |
| `@RequireAdmin`  | Validates user has admin role                    |
| `@RequirePlan`   | Validates user has an active subscription plan   |

- Guards are composable: `@RequireAuth` + `@RequireAdmin` on admin-only routes.
- Failed auth returns `401 Unauthorized` with a generic message (no details about which check failed).
- Failed authorization returns `403 Forbidden`.

### Password Security

- Hashing: bcrypt with cost factor 12.
- Minimum password length: 8 characters.
- No maximum length restriction below 128 characters.
- Password not returned in any API response, ever.

---

## 3. Anti-Spam and Rate Limiting

### Rate Limit Rules

| Endpoint Category | Limit                        | Block Duration |
|-------------------|------------------------------|----------------|
| Login             | 5 failed attempts / 10 min   | 30-minute IP block |
| Contact form      | 1 request / minute per IP    | Reject with 429 |
| Password reset    | 3 requests / hour per email  | Reject with 429 |
| General API       | 100 requests / minute per IP | Reject with 429 |
| File upload       | 10 requests / minute per user| Reject with 429 |

### Implementation

- NestJS `@nestjs/throttler` module (ThrottlerModule) for general rate limiting.
- Custom rate limiter using Redis for login attempt tracking (supports IP-based blocking with TTL).
- Rate limit headers included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### Bot Detection (Analytics)

- Traffic counter middleware checks `User-Agent` against a known bot list (Googlebot, Bingbot, etc.).
- Bot traffic is recorded separately and excluded from analytics dashboards.
- Requests with empty `User-Agent` are flagged and not counted as real traffic.

---

## 4. SQL Injection and Query Safety

### Mandatory Rules

- 100% of database queries must use parameterized queries via TypeORM QueryBuilder or repository methods.
- String concatenation for SQL is strictly prohibited. No exceptions.
- Raw queries (`query()`) are only permitted for complex aggregations and must use parameterized placeholders (`?` or named parameters).
- All ID parameters (ULIDs) are validated at the DTO/pipe level before reaching any query.

### ORM Configuration

- TypeORM `synchronize: false` in production. Schema changes only via migrations.
- Query logging disabled in production (`logging: false`).
- Connection pool: `max: 20`, `min: 5`.

---

## 5. Transport Security and HTTP Headers

### CORS Policy

```typescript
{
  origin: [
    'https://bhquan.site',
    'https://admin.bhquan.site'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}
```

- No wildcard (`*`) origins in production.
- `credentials: true` required for HttpOnly cookie auth.

### Security Headers (Helmet.js)

| Header                        | Value                                           |
|-------------------------------|------------------------------------------------|
| Strict-Transport-Security     | `max-age=31536000; includeSubDomains`          |
| X-Content-Type-Options        | `nosniff`                                      |
| X-Frame-Options               | `DENY`                                         |
| X-XSS-Protection              | `0` (rely on CSP instead)                      |
| Referrer-Policy                | `strict-origin-when-cross-origin`              |
| Content-Security-Policy        | `default-src 'self'; img-src 'self' https://*.r2.cloudflarestorage.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'` |
| Permissions-Policy             | `camera=(), microphone=(), geolocation=()`     |

### HTTPS Enforcement

- Cloudflare handles SSL termination (Full Strict mode).
- Nginx redirects all HTTP traffic to HTTPS.
- HSTS header ensures browsers always use HTTPS after first visit.

---

## 6. Data Protection

### Logging Rules

- Never log: passwords, JWT tokens, refresh tokens, credit card numbers, personal identification numbers.
- Pino logger configured with redaction paths:
  ```typescript
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.refreshToken']
  ```
- Request body logging limited to non-sensitive fields only.

### Error Response Rules

- Production error responses must never include:
  - Stack traces
  - Internal file paths
  - Database query details
  - Third-party service credentials or URLs
- All unhandled exceptions caught by NestJS Global Exception Filter and returned as:
  ```json
  {
    "success": false,
    "message": "An unexpected error occurred",
    "statusCode": 500
  }
  ```
- Detailed error information logged server-side with the `requestId` for debugging.

### Image Privacy

- EXIF metadata stripped from all uploaded images during the Sharp processing pipeline.
- Original filenames are not preserved; files renamed to ULID-based names.
- Original uploads stored in R2 private bucket (no public URL).
- Only processed versions (resized, WebP) served from the R2 public bucket.

### Environment Variables

- `.env` files are listed in `.gitignore` and never committed.
- `.env.example` provided with placeholder values for all required variables.
- Production secrets managed via environment variables on the VPS, not in any file tracked by git.
- Docker Compose uses `env_file` directive to inject variables.

---

## 7. Dependency Security

- Run `npm audit` as part of the CI pipeline. Fail the build on critical vulnerabilities.
- Pin exact dependency versions in `package-lock.json` (committed to git).
- Review changelogs before upgrading major versions of authentication or security-related packages.
- No use of deprecated or unmaintained packages for security-critical functions.

---

## 8. Security Incident Response

### If a breach is suspected:

1. Rotate all JWT secrets immediately.
2. Invalidate all active refresh tokens in the database.
3. Rotate database passwords and Redis passwords.
4. Review Nginx access logs and NestJS application logs for the suspected timeframe.
5. Check for unauthorized admin accounts or role escalations.
6. Notify affected users if personal data was exposed.

### Regular Audits

- Monthly: Review admin account list, remove unused accounts.
- Monthly: Check for new `npm audit` advisories.
- Quarterly: Review CORS origins, rate limit thresholds, and RBAC rules.
