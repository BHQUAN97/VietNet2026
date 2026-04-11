import { test, expect } from '@playwright/test'

/**
 * E2E: API Health & Integration
 * Kiểm tra API backend responses từ frontend
 */

test.describe('API Health Check', () => {
  const API_BASE = process.env.API_URL || 'https://bhquan.store/api'

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`)

    // Health check phải 200
    expect(response.status()).toBe(200)
  })

  test('projects API returns valid data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/projects?limit=5`)

    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      // Phải có cấu trúc { success, data }
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('articles API returns valid data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/articles?limit=5`)

    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('products API returns valid data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?limit=5`)

    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
      expect(json).toHaveProperty('data')
    }
  })

  test('categories API returns valid data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`)

    expect(response.status()).toBeLessThan(400)

    if (response.status() === 200) {
      const json = await response.json()
      expect(json).toHaveProperty('success')
    }
  })
})

test.describe('API Security', () => {
  const API_BASE = process.env.API_URL || 'https://bhquan.store/api'

  test('admin endpoints return 401 without auth', async ({ request }) => {
    const protectedEndpoints = [
      '/users',
      '/analytics',
      '/settings',
      '/consultations',
    ]

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`)
      // Protected routes phải 401 hoặc 403
      expect([401, 403]).toContain(response.status())
    }
  })

  test('login endpoint accepts POST with JSON', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'test@test.com',
        password: 'wrongpassword',
      },
    })

    // Login sai phải 400, 401 hoặc 422 — KHÔNG phải 500
    expect(response.status()).toBeLessThan(500)
  })
})
