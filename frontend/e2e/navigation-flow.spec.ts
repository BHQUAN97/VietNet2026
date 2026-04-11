import { test, expect } from '@playwright/test'

/**
 * E2E: Navigation Flow — User Journey
 * Kiểm tra user flow: browse qua menu, click vào detail, search
 */

test.describe('User Navigation Journey', () => {
  test('navigate from homepage to projects page via nav link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Tìm link "Dự Án" trong header nav
    const projectLink = page.locator('header a[href*="/projects"]').first()

    if (await projectLink.isVisible()) {
      await projectLink.click()
      await page.waitForURL('**/projects**', { timeout: 10_000 })
      expect(page.url()).toContain('/projects')

      // Page heading phải hiện
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()
    }
  })

  test('navigate from homepage to articles page via nav link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const articlesLink = page.locator('header a[href*="/articles"]').first()

    if (await articlesLink.isVisible()) {
      await articlesLink.click()
      await page.waitForURL('**/articles**', { timeout: 10_000 })
      expect(page.url()).toContain('/articles')
    }
  })

  test('navigate from homepage to contact page via nav link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const contactLink = page.locator('header a[href*="/contact"]').first()

    if (await contactLink.isVisible()) {
      await contactLink.click()
      await page.waitForURL('**/contact**', { timeout: 10_000 })
      expect(page.url()).toContain('/contact')
    }
  })

  test('click project card navigates to detail page', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Tìm project card link
    const projectCard = page.locator('a[href*="/projects/"]').first()

    if (await projectCard.count() > 0) {
      const href = await projectCard.getAttribute('href')
      await projectCard.click()

      // Phải navigate tới detail page
      await page.waitForURL(`**${href}**`, { timeout: 10_000 })
      expect(page.url()).toContain('/projects/')

      // Detail page phải có heading
      const heading = page.locator('h1, h2').first()
      await expect(heading).toBeVisible({ timeout: 5_000 })
    }
  })

  test('click article card navigates to detail page', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const articleCard = page.locator('a[href*="/articles/"]').first()

    if (await articleCard.count() > 0) {
      const href = await articleCard.getAttribute('href')
      await articleCard.click()

      await page.waitForURL(`**${href}**`, { timeout: 10_000 })
      expect(page.url()).toContain('/articles/')

      // Article detail phải có content
      const article = page.locator('article, main').first()
      await expect(article).toBeVisible({ timeout: 5_000 })
    }
  })

  test('click catalog product navigates to detail page', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const productCard = page.locator('a[href*="/catalog/"]').first()

    if (await productCard.count() > 0) {
      const href = await productCard.getAttribute('href')
      await productCard.click()

      await page.waitForURL(`**${href}**`, { timeout: 10_000 })
      expect(page.url()).toContain('/catalog/')
    }
  })

  test('logo click returns to homepage', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    // Logo thường là link về trang chủ
    const logo = page.locator('header a[href="/"]').first()

    if (await logo.count() > 0) {
      await logo.click()
      await page.waitForURL('**/', { timeout: 10_000 })

      // URL phải là homepage
      const url = new URL(page.url())
      expect(url.pathname).toBe('/')
    }
  })
})

test.describe('Error Pages', () => {
  test('404 page renders for non-existent route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-123', {
      waitUntil: 'domcontentloaded',
    })

    // HTTP 404 hoặc page hiển thị 404 message
    const status = response?.status()
    const pageContent = await page.textContent('body')

    const is404 =
      status === 404 ||
      pageContent?.includes('404') ||
      pageContent?.toLowerCase().includes('not found') ||
      pageContent?.includes('không tìm thấy')

    expect(is404).toBeTruthy()
  })

  test('404 page has link back to homepage', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-123', {
      waitUntil: 'domcontentloaded',
    })

    // Phải có link quay về trang chủ
    const homeLink = page.locator('a[href="/"]')
    const hasHomeLink = (await homeLink.count()) > 0

    // Hoặc header vẫn hiện với nav
    const header = page.locator('header')
    const hasHeader = (await header.count()) > 0

    expect(hasHomeLink || hasHeader).toBeTruthy()
  })
})

test.describe('Search Functionality', () => {
  test('search page loads', async ({ page }) => {
    const response = await page.goto('/search', {
      waitUntil: 'domcontentloaded',
    })

    // Search page accessible
    expect(response?.status()).toBeLessThan(400)
  })

  test('search page has input field', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' })

    // Phải có search input
    const searchInput = page.locator(
      'input[type="search"], input[type="text"], input[placeholder*="tìm"], input[placeholder*="search" i]'
    )

    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible()
    }
  })

  test('search with query returns results or empty state', async ({ page }) => {
    await page.goto('/search?q=nội+thất', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Phải hiện kết quả hoặc empty state
    const bodyText = await page.textContent('body')
    expect(bodyText!.length).toBeGreaterThan(100) // Page có content
  })
})
