import { test, expect, type Page } from '@playwright/test'

/**
 * E2E: Public Pages — Navigation & SEO
 * Kiểm tra tất cả trang public load thành công và có SEO cơ bản
 */

// Các trang public cần test
const PUBLIC_PAGES = [
  { path: '/', title: 'VietNet Interior', heading: /nội thất|interior/i },
  { path: '/about', title: 'Giới thiệu', heading: /kiến tạo|về chúng tôi/i },
  { path: '/projects', title: /dự án/i, heading: /dự án/i },
  { path: '/articles', title: /tin tức|blog/i, heading: /tin tức|cảm hứng/i },
  { path: '/catalog', title: /sản phẩm|catalog/i, heading: /sản phẩm/i },
  { path: '/contact', title: /liên hệ|tư vấn/i, heading: /tư vấn/i },
]

test.describe('Public Pages - Load & SEO', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.path} loads successfully`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path, { waitUntil: 'domcontentloaded' })
      
      // HTTP status OK
      expect(response?.status()).toBeLessThan(400)

      // Page có title
      const title = await browserPage.title()
      expect(title).toBeTruthy()
      if (typeof page.title === 'string') {
        expect(title.toLowerCase()).toContain(page.title.toLowerCase())
      } else {
        expect(title).toMatch(page.title)
      }

      // Có heading h1
      const h1 = browserPage.locator('h1').first()
      await expect(h1).toBeVisible({ timeout: 10_000 })
      const h1Text = await h1.textContent()
      expect(h1Text).toMatch(page.heading)
    })
  }
})

test.describe('Navigation', () => {
  test('header navigation links work', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Kiểm tra header có tồn tại  
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    // Kiểm tra navigation links có tồn tại
    const navLinks = header.locator('a[href]')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('footer is visible on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })
})

test.describe('SEO Essentials', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const metaDesc = page.locator('meta[name="description"]')
    const content = await metaDesc.getAttribute('content')
    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(20)
  })

  test('homepage has JSON-LD structured data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const jsonLd = page.locator('script[type="application/ld+json"]')
    const count = await jsonLd.count()
    expect(count).toBeGreaterThan(0)

    const content = await jsonLd.first().textContent()
    expect(content).toBeTruthy()
    const parsed = JSON.parse(content!)
    expect(parsed['@context']).toContain('schema.org')
  })

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    expect(response?.status()).toBe(200)
  })

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response?.status()).toBe(200)
  })
})
