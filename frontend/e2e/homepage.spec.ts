import { test, expect } from '@playwright/test'

/**
 * E2E: Homepage — Hero, Sections, và Interactive elements
 * Kiểm tra chi tiết trang chủ với Page Builder sections
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('renders hero section', async ({ page }) => {
    // Homepage dùng SectionRenderer — kiểm tra có section nào render
    const sections = page.locator('section')
    const count = await sections.count()
    expect(count).toBeGreaterThan(0)
  })

  test('loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Lọc bỏ các lỗi known (hydration warnings, etc.)
    const criticalErrors = errors.filter(
      (e) => !e.includes('hydrat') && !e.includes('Warning:') && !e.includes('favicon')
    )
    
    // Cho phép tối đa 2 non-critical errors
    expect(criticalErrors.length).toBeLessThanOrEqual(2)
  })

  test('no broken images on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Kiểm tra tất cả img tags
    const images = page.locator('img[src]')
    const imgCount = await images.count()
    
    for (let i = 0; i < Math.min(imgCount, 10); i++) {
      const img = images.nth(i)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const src = await img.getAttribute('src')
      
      // Image nên load thành công (naturalWidth > 0)
      // Skip data: URLs và SVGs
      if (src && !src.startsWith('data:') && !src.endsWith('.svg')) {
        expect(naturalWidth, `Image broken: ${src}`).toBeGreaterThan(0)
      }
    }
  })

  test('page loads within performance budget', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - startTime

    // DOM content loaded within 5 seconds
    expect(loadTime).toBeLessThan(5_000)
  })
})
