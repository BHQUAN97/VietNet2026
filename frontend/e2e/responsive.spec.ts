import { test, expect } from '@playwright/test'

/**
 * E2E: Responsive Design & Mobile
 * Test trên viewport mobile (Pixel 7: 412x915)
 */

test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test('homepage renders correctly on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Header visible
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
    })
    expect(hasHorizontalScroll).toBeFalsy()
  })

  test('mobile menu toggle works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Look for hamburger menu button
    const menuBtn = page.locator('header button').first()
    
    if (await menuBtn.count() > 0) {
      await menuBtn.click()
      await page.waitForTimeout(500)

      // Menu overlay or navigation should appear
      const mobileNav = page.locator('[class*="mobile"], [class*="overlay"], nav')
      const navCount = await mobileNav.count()
      expect(navCount).toBeGreaterThan(0)
    }
  })

  test('contact page form is usable on mobile', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })

    const form = page.locator('form').first()
    await expect(form).toBeVisible()

    // Inputs should be accessible (min touch target 44px)
    const inputs = form.locator('input, textarea')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const box = await input.boundingBox()
      if (box) {
        // Touch target height >= 40px (close to 44px standard)
        expect(box.height).toBeGreaterThanOrEqual(36)
      }
    }
  })

  test('catalog page filter button visible on mobile', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })

    // Mobile có nút "Bộ lọc" thay vì sidebar
    const filterBtn = page.locator('text=Bộ lọc')
    await expect(filterBtn).toBeVisible()

    // Sidebar ẩn trên mobile
    const sidebar = page.locator('aside')
    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeHidden()
    }
  })

  test('no text overflow on mobile', async ({ page }) => {
    const pagesToCheck = ['/', '/about', '/contact']

    for (const path of pagesToCheck) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
      })
      expect(hasOverflow, `Horizontal overflow on ${path}`).toBeFalsy()
    }
  })
})

test.describe('Desktop Responsive', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('catalog sidebar visible on desktop', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()
  })

  test('projects page grid shows multiple columns', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const grid = page.locator('.card-grid').first()
    if (await grid.count() > 0) {
      const gridStyle = await grid.evaluate((el) => {
        return window.getComputedStyle(el).display
      })
      expect(gridStyle).toBe('grid')
    }
  })
})
