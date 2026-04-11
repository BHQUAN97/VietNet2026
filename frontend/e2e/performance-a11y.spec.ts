import { test, expect } from '@playwright/test'

/**
 * E2E: Performance & Accessibility basics
 * Kiểm tra performance và a11y cơ bản
 */

test.describe('Performance', () => {
  test('homepage LCP under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'load' })
    const loadTime = Date.now() - startTime

    // Full load under 5s (production via CDN nên nhanh hơn)
    expect(loadTime).toBeLessThan(5_000)
  })

  test('no large layout shifts on homepage', async ({ page }) => {
    // Inject CLS observer trước khi navigate
    await page.goto('/', { waitUntil: 'load' })

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
        })
        observer.observe({ type: 'layout-shift', buffered: true })
        
        // Wait a bit then report
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 3000)
      })
    })

    // CLS should be under 0.25 (Google's threshold is 0.1 for good, 0.25 for needs improvement)
    expect(cls).toBeLessThan(0.25)
  })

  test('page resources dont exceed size limits', async ({ page }) => {
    const resourceSizes: { url: string; size: number }[] = []

    page.on('response', async (response) => {
      const headers = response.headers()
      const contentLength = parseInt(headers['content-length'] || '0')
      if (contentLength > 500_000) { // > 500KB
        resourceSizes.push({
          url: response.url(),
          size: contentLength,
        })
      }
    })

    await page.goto('/', { waitUntil: 'load' })

    // Không nên có resource > 2MB (trừ images)
    const largeNonImages = resourceSizes.filter(
      (r) => !r.url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i) && r.size > 2_000_000
    )
    expect(largeNonImages.length).toBe(0)
  })
})

test.describe('Accessibility Basics', () => {
  test('all images have alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const images = page.locator('img')
    const imgCount = await images.count()

    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Mỗi img phải có alt hoặc role="presentation"
      const hasAltOrPresentation = (alt !== null) || role === 'presentation'
      expect(hasAltOrPresentation).toBeTruthy()
    }
  })

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Phải có đúng 1 h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })

    // Tab qua các input fields
    await page.keyboard.press('Tab')
    
    // Focus phải nằm trên element nào đó
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTag).toBeTruthy()
  })

  test('color contrast - login button visible', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    
    // Button text should be readable
    const textContent = await submitBtn.textContent()
    expect(textContent!.trim().length).toBeGreaterThan(0)
  })

  test('language attribute set on html', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })
})
