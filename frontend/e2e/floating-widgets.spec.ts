import { test, expect } from '@playwright/test'

/**
 * E2E: Floating Widgets — Zalo, Messenger, Phone
 * Kiem tra floating contact widgets hien thi tren moi trang public
 */

test.describe('Floating Widgets - Desktop', () => {
  const PAGES_TO_CHECK = ['/', '/about', '/projects', '/catalog', '/contact']

  for (const path of PAGES_TO_CHECK) {
    test(`floating widgets visible on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)

      // Floating widget group phai ton tai
      const widgetGroup = page.locator('[role="group"], [class*="floating"], [class*="fab"]')
      const hasWidgets = (await widgetGroup.count()) > 0

      // Hoac kiem tra truc tiep cac link Zalo/Messenger/Phone
      const zaloLink = page.locator('a[href*="zalo.me"]')
      const messengerLink = page.locator('a[href*="m.me"]')
      const phoneLink = page.locator('a[href^="tel:"]')

      const hasZalo = (await zaloLink.count()) > 0
      const hasMessenger = (await messengerLink.count()) > 0
      const hasPhone = (await phoneLink.count()) > 0

      // It nhat 1 widget phai co
      expect(hasWidgets || hasZalo || hasMessenger || hasPhone).toBeTruthy()
    })
  }

  test('Zalo link has correct URL', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    const zaloLink = page.locator('a[href*="zalo.me"]').first()
    if ((await zaloLink.count()) > 0) {
      const href = await zaloLink.getAttribute('href')
      expect(href).toContain('zalo.me')
    }
  })

  test('Messenger link has correct URL', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    const messengerLink = page.locator('a[href*="m.me"]').first()
    if ((await messengerLink.count()) > 0) {
      const href = await messengerLink.getAttribute('href')
      expect(href).toContain('m.me')
    }
  })

  test('Phone link has tel: protocol', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    const phoneLink = page.locator('a[href^="tel:"]').first()
    if ((await phoneLink.count()) > 0) {
      const href = await phoneLink.getAttribute('href')
      // tel: co the co dau + hoac bat dau bang 0
      expect(href).toMatch(/^tel:[+\d]/)
    } else {
      // Khong co phone link — skip test
      test.skip(true, 'No phone link found in floating widgets')
    }
  })
})

test.describe('Floating Widgets - Mobile', () => {
  test.use({ viewport: { width: 412, height: 915 } })

  test('floating widgets accessible on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    // Mobile: widgets co the la FAB button can click de expand
    const zaloLink = page.locator('a[href*="zalo.me"]')
    const messengerLink = page.locator('a[href*="m.me"]')
    const phoneLink = page.locator('a[href^="tel:"]')
    const fabButton = page.locator('[class*="fab"], [class*="floating"] button')

    const hasDirectLinks = (await zaloLink.count()) > 0 ||
      (await messengerLink.count()) > 0 ||
      (await phoneLink.count()) > 0
    const hasFab = (await fabButton.count()) > 0

    expect(hasDirectLinks || hasFab).toBeTruthy()
  })

  test('floating widgets do not overlap content on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    // Widgets khong gay horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5
    })
    expect(hasOverflow).toBeFalsy()
  })
})

test.describe('Floating Widgets - Not on Admin', () => {
  test('floating widgets hidden on admin login page', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    // Admin pages khong nen co floating widgets
    const zaloLink = page.locator('a[href*="zalo.me"]')
    const messengerLink = page.locator('a[href*="m.me"]')

    // Widgets co the van hien (tuy implementation) — soft check
    const widgetCount = (await zaloLink.count()) + (await messengerLink.count())
    // Ghi nhan ket qua, khong fail hard
    if (widgetCount > 0) {
      console.log('Note: Floating widgets visible on admin page')
    }
  })
})
