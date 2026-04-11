import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config cho VietNet2026
 * Target: bhquan.store (production) hoặc localhost:3000 (dev)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    // Chạy test trên production hoặc local
    baseURL: process.env.BASE_URL || 'https://bhquan.store',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Viewport mặc định desktop
    viewport: { width: 1280, height: 720 },
    // Ignore HTTPS errors cho local dev
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
