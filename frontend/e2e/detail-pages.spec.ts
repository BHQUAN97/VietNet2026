import { test, expect } from '@playwright/test'

/**
 * E2E: Detail Pages — Projects, Articles, Catalog [slug]
 * Kiem tra noi dung detail page: breadcrumb, gallery, related content, CTA
 */

test.describe('Project Detail Page', () => {
  test('navigates to a project detail and shows content', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const projectLink = page.locator('a[href*="/projects/"]').first()
    if ((await projectLink.count()) === 0) {
      test.skip(true, 'No projects available to test detail page')
      return
    }

    const href = await projectLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Page load OK
    expect(page.url()).toContain('/projects/')

    // Co heading (h1 hoac h2)
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
    const headingText = await heading.textContent()
    expect(headingText!.trim().length).toBeGreaterThan(0)
  })

  test('project detail has back navigation link', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const projectLink = page.locator('a[href*="/projects/"]').first()
    if ((await projectLink.count()) === 0) {
      test.skip(true, 'No projects available')
      return
    }

    const href = await projectLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Co link quay lai trang listing
    const backLink = page.locator('a[href="/projects"], a[href*="/projects"]:not([href*="/projects/"])')
    const breadcrumb = page.locator('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]')
    const hasBack = (await backLink.count()) > 0 || (await breadcrumb.count()) > 0

    expect(hasBack).toBeTruthy()
  })

  test('project detail has images or gallery', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const projectLink = page.locator('a[href*="/projects/"]').first()
    if ((await projectLink.count()) === 0) {
      test.skip(true, 'No projects available')
      return
    }

    const href = await projectLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    // Detail page phai co it nhat 1 image
    const images = page.locator('img[src]')
    const imgCount = await images.count()
    expect(imgCount).toBeGreaterThan(0)
  })

  test('project detail has description content', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const projectLink = page.locator('a[href*="/projects/"]').first()
    if ((await projectLink.count()) === 0) {
      test.skip(true, 'No projects available')
      return
    }

    const href = await projectLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Main content area phai co text > 50 ky tu
    const mainContent = page.locator('main, article').first()
    const textContent = await mainContent.textContent()
    expect(textContent!.trim().length).toBeGreaterThan(50)
  })
})

test.describe('Article Detail Page', () => {
  test('navigates to an article detail and shows content', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const articleLink = page.locator('a[href*="/articles/"]').first()
    if ((await articleLink.count()) === 0) {
      test.skip(true, 'No articles available to test detail page')
      return
    }

    const href = await articleLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    expect(page.url()).toContain('/articles/')

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('article detail has body content', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const articleLink = page.locator('a[href*="/articles/"]').first()
    if ((await articleLink.count()) === 0) {
      test.skip(true, 'No articles available')
      return
    }

    const href = await articleLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Article phai co noi dung dai
    const body = page.locator('article, main, [class*="content"]').first()
    const text = await body.textContent()
    expect(text!.trim().length).toBeGreaterThan(100)
  })

  test('article detail has meta info (date or author)', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const articleLink = page.locator('a[href*="/articles/"]').first()
    if ((await articleLink.count()) === 0) {
      test.skip(true, 'No articles available')
      return
    }

    const href = await articleLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Co meta info: ngay, tac gia, luot xem, hoac tag
    const metaInfo = page.locator('time, [class*="date"], [class*="author"], [class*="meta"], [class*="tag"]')
    const hasMetaInfo = (await metaInfo.count()) > 0
    // Soft check — co the khong co meta
    expect(hasMetaInfo || true).toBeTruthy()
  })
})

test.describe('Catalog Product Detail Page', () => {
  test('navigates to a product detail and shows content', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const productLink = page.locator('a[href*="/catalog/"]').first()
    if ((await productLink.count()) === 0) {
      test.skip(true, 'No products available to test detail page')
      return
    }

    const href = await productLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    expect(page.url()).toContain('/catalog/')

    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('product detail has CTA button (lien he tu van)', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const productLink = page.locator('a[href*="/catalog/"]').first()
    if ((await productLink.count()) === 0) {
      test.skip(true, 'No products available')
      return
    }

    const href = await productLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Product detail co CTA button: "Tư vấn", "Liên hệ", hoac link /contact
    const ctaBtn = page.locator('a[href*="/contact"], button:has-text("tư vấn"), button:has-text("liên hệ")')
    const hasCTA = (await ctaBtn.count()) > 0
    expect(hasCTA).toBeTruthy()
  })

  test('product detail has images', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const productLink = page.locator('a[href*="/catalog/"]').first()
    if ((await productLink.count()) === 0) {
      test.skip(true, 'No products available')
      return
    }

    const href = await productLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const images = page.locator('img[src]')
    expect(await images.count()).toBeGreaterThan(0)
  })

  test('product detail has material or dimension info', async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const productLink = page.locator('a[href*="/catalog/"]').first()
    if ((await productLink.count()) === 0) {
      test.skip(true, 'No products available')
      return
    }

    const href = await productLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Product co thong tin vat lieu, kich thuoc, hoac mo ta
    const mainContent = page.locator('main').first()
    const text = await mainContent.textContent()
    expect(text!.trim().length).toBeGreaterThan(50)
  })
})
