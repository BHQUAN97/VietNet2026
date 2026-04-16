# 03. API Health & Security — Kiem tra backend API

## Summary

Kiem tra cac API endpoint cua backend NestJS: health check, CRUD endpoints (projects/articles/products/categories), va bao mat (admin endpoints phai 401 khi chua xac thuc, login endpoint khong 500). Tat ca tests co co che skip graceful khi backend down (502).

**File test:** `e2e/api-health.spec.ts`
**So test:** 8 (5 health + 2 security + 1 login)
**API Base:** `https://bhquan.store/api`

## Workflow

```
Test runner
  → isBackendUp() — GET /api/health
    → 502 → Skip TAT CA API tests (backend down)
    → 200 → Chay tests binh thuong
  
Health Check:
  GET /api/health       → 200
  GET /api/projects     → { success: true, data: [...] }
  GET /api/articles     → { success: true, data: [...] }
  GET /api/products     → { success: true, data: [...] }
  GET /api/categories   → { success: true }

Security Check:
  GET /api/users         → 401/403 (khong co JWT)
  GET /api/analytics     → 401/403
  GET /api/settings      → 401/403
  GET /api/consultations → 401/403
  POST /api/auth/login   → 400/401/422 (khong duoc 500)
```

## Chi tiet cac test case

### TC-01: health endpoint responds
- **Muc dich:** Backend dang chay va phan hoi
- **Buoc:** GET `/api/health`
- **Ky vong:** Status 200
- **Skip khi:** Backend tra 502

### TC-02 den TC-05: CRUD API returns valid data
- **Muc dich:** Cac endpoint chinh tra data dung format `{ success, data }`
- **Endpoints:** `/projects?limit=5`, `/articles?limit=5`, `/products?limit=5`, `/categories`
- **Ky vong:** Status < 400 + JSON co property `success` va `data`
- **Giai phap khi fail:** Kiem tra NestJS controller → response format → DB connection

### TC-06: admin endpoints return 401 without auth
- **Muc dich:** 4 endpoints admin phai tu choi truy cap khi khong co JWT
- **Endpoints:** `/users`, `/analytics`, `/settings`, `/consultations`
- **Ky vong:** Status 401 hoac 403
- **Giai phap khi fail:** Kiem tra AuthGuard/JwtGuard tren controller → middleware order

### TC-07: login endpoint accepts POST with JSON
- **Muc dich:** Login sai khong duoc 500 (server error) — phai 400/401/422
- **Buoc:** POST `/api/auth/login` voi credentials sai
- **Ky vong:** Status < 500
- **Giai phap khi fail:** Kiem tra AuthController → exception handling → DTO validation

## Giai phap ky thuat: Graceful Skip

```typescript
async function isBackendUp(request: any): Promise<boolean> {
  try {
    const response = await request.get(`${API_BASE}/health`)
    return response.status() !== 502
  } catch {
    return false
  }
}

// Trong moi test:
test.skip(!backendUp, 'Backend is down (502) — skip API tests')
```

**Ly do:** Backend co the down trong qua trinh dev/deploy. Test suite khong duoc fail vi ly do infra — chi fail vi logic loi.
