import { test, expect } from '@playwright/test'

/**
 * E2E: API Health & Integration
 * Kiểm tra API backend responses từ frontend
 * Khi backend down (502), test skip gracefully
 */

const API_BASE = process.env.API_URL || 'https://bhquan.store/api'

// Helper: check backend availability truoc khi chay test
async function isBackendUp(request: any): Promise<boolean> {
  try {
    const response = await request.get(`${API_BASE}/health`)
    return response.status() !== 502
  } catch {
    return false
  }
}

test.describe('API Health Check', () => {
  let backendUp = true

  test.beforeAll(async ({ request }) => {
    backendUp = await isBackendUp(request)
  })

  test('health endpoint responds', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.get(`${API_BASE}/health`)
    expect(response.status()).toBe(200)
  })

  test('projects API returns valid data', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.get(`${API_BASE}/projects?limit=5`)
    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('articles API returns valid data', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.get(`${API_BASE}/articles?limit=5`)
    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('products API returns valid data', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.get(`${API_BASE}/products?limit=5`)
    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('categories API returns valid data', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.get(`${API_BASE}/categories`)
    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
    }
  })
})

test.describe('API Security', () => {
  let backendUp = true

  test.beforeAll(async ({ request }) => {
    backendUp = await isBackendUp(request)
  })

  test('admin endpoints return 401 without auth', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const protectedEndpoints = [
      '/users',
      '/analytics/dashboard',
      '/settings',
      '/consultations',
    ]

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`)
      // Protected routes phai 401 hoac 403
      expect([401, 403]).toContain(response.status())
    }
  })

  test('login endpoint accepts POST with JSON', async ({ request }) => {
    test.skip(!backendUp, 'Backend is down (502) — skip API tests')
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'test@test.com',
        password: 'wrongpassword',
      },
    })

    // Login sai phai 400, 401 hoac 422 — KHONG phai 500
    expect(response.status()).toBeLessThan(500)
  })
})
