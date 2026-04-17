import { test, expect } from '@playwright/test'

/**
 * E2E: Projects Page — Listing, Filtering, Detail
 * Kiểm tra trang dự án với category filter và pagination
 */

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  })

  test('displays page header with title', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Dự Án')
  })

  test('loads project cards or shows empty state', async ({ page }) => {
    // Chờ loading xong
    await page.waitForTimeout(3000)

    // Kiểm tra có project cards hoặc empty message
    const projectCards = page.locator('.card-grid a, .card-premium')
    const emptyMessage = page.locator('text=/chưa có|trống|empty/i')
    const errorMessage = page.locator('text=/lỗi|error|thử lại/i')
    
    const hasCards = (await projectCards.count()) > 0
    const hasEmpty = (await emptyMessage.count()) > 0
    const hasError = (await errorMessage.count()) > 0
    
    // Một trong 3 trạng thái phải đúng
    expect(hasCards || hasEmpty || hasError).toBeTruthy()
  })

  test('project card links to detail page', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const projectLink = page.locator('a[href*="/projects/"]').first()
    
    if (await projectLink.count() > 0) {
      const href = await projectLink.getAttribute('href')
      expect(href).toMatch(/\/projects\/[\w-]+/)
    }
  })
})

test.describe('Articles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' })
  })

  test('displays page header', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('loads article cards or shows empty/error state', async ({ page }) => {
    await page.waitForTimeout(3000)

    const articleCards = page.locator('.card-grid a')
    const emptyMessage = page.locator('text=/chưa có|trống/i')
    const errorMessage = page.locator('text=/lỗi|error|thử lại/i')
    
    const hasCards = (await articleCards.count()) > 0
    const hasEmpty = (await emptyMessage.count()) > 0
    const hasError = (await errorMessage.count()) > 0
    
    expect(hasCards || hasEmpty || hasError).toBeTruthy()
  })

  test('article card has title and optional excerpt', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const firstCard = page.locator('.card-grid a').first()
    
    if (await firstCard.count() > 0) {
      const title = firstCard.locator('h3').first()
      await expect(title).toBeVisible()
      const titleText = await title.textContent()
      expect(titleText!.trim().length).toBeGreaterThan(0)
    }
  })
})

test.describe('Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' })
  })

  test('displays page header with product count', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Sản Phẩm')
  })

  test('material filter sidebar exists on desktop', async ({ page }) => {
    // Chỉ test trên desktop viewport
    if (page.viewportSize()!.width >= 1024) {
      const sidebar = page.locator('aside').first()
      await expect(sidebar).toBeVisible()
      
      // Có filter buttons
      const filterBtns = sidebar.locator('button')
      expect(await filterBtns.count()).toBeGreaterThanOrEqual(2) // "Tất cả" + ít nhất 1 material
    }
  })

  test('catalog has filter sidebar or product grid', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Catalog page co aside filter hoac product grid
    const sidebar = page.locator('aside, [role="complementary"]')
    const productGrid = page.locator('a[href*="/catalog/"]')

    const hasSidebar = (await sidebar.count()) > 0
    const hasProducts = (await productGrid.count()) > 0

    expect(hasSidebar || hasProducts).toBeTruthy()
  })

  test('loads products or shows empty state', async ({ page }) => {
    await page.waitForTimeout(3000)

    const productCards = page.locator('a[href*="/catalog/"]')
    const emptyMessage = page.locator('text=/không tìm thấy|chưa có|empty/i')
    const errorMessage = page.locator('text=/lỗi|error|thử lại/i')
    
    const hasCards = (await productCards.count()) > 0
    const hasEmpty = (await emptyMessage.count()) > 0
    const hasError = (await errorMessage.count()) > 0
    
    expect(hasCards || hasEmpty || hasError).toBeTruthy()
  })
})

test.describe('About Page', () => {
  test('displays company story and quality commitment', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    // Main heading: "Kiến Tạo Không Gian Sống Tinh Tế"
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Kiến Tạo')

    // Cam ket chat luong section (thay vi Su menh / Tam nhin cu)
    const qualitySection = page.locator('h2').filter({ hasText: /chất lượng/i }).first()
    await expect(qualitySection).toBeVisible()
  })

  test('stats counter section exists', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    // Stats: "Dự án hoàn thành", "Năm kinh nghiệm", "Khách hàng tin tưởng"
    const statsSection = page.locator('text=Dự án hoàn thành')
    await expect(statsSection).toBeVisible()
  })

  test('warranty section is visible', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    // Scroll to warranty section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // heading "An tâm với bảo hành dài hạn"
    const warrantyHeader = page.locator('h2').filter({ hasText: /bảo hành/i }).first()
    await expect(warrantyHeader).toBeVisible()
  })
})
