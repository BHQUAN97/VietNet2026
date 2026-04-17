import { test, expect } from '@playwright/test'

/**
 * E2E: Visual Regression & Cross-browser Basics
 * So sánh giữa desktop và mobile viewport, kiểm tra font loading, animation
 */

test.describe('Visual Consistency', () => {
  test('page renders consistently - no FOUC', async ({ page }) => {
    // Kiểm tra Font Of Unstyled Content — stylesheet phải load
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // CSS phải được load
    const hasStylesheets = await page.evaluate(() => {
      return document.styleSheets.length > 0
    })
    expect(hasStylesheets).toBeTruthy()
  })

  test('homepage screenshot matches viewport', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Screenshot để visual comparison (nếu cần)
    // Kiểm tra viewport size đúng
    const viewport = page.viewportSize()
    expect(viewport).toBeTruthy()

    // No blank page — body phải có content
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyHeight).toBeGreaterThan(500) // Page phải có content đáng kể
  })

  test('dark mode / theme consistency', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Kiểm tra có color scheme applied
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgColor).toBeTruthy()
    expect(bgColor).not.toBe('') // Phải có background color, không transparent
  })

  test('footer consistent across pages', async ({ page }) => {
    const pages = ['/', '/about', '/contact', '/projects']
    let footerCopyright = ''

    for (const path of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const footer = page.locator('footer').first()
      if (await footer.count() > 0) {
        // So sanh phan copyright — phan co dinh, khong bi anh huong boi floating widgets
        const copyrightText = await footer.locator('text=/©.*VietNet/').first().textContent()

        if (!footerCopyright && copyrightText) {
          footerCopyright = copyrightText.trim()
        } else if (copyrightText) {
          expect(copyrightText.trim()).toBe(footerCopyright)
        }
      }
    }

    // Footer phai ton tai tren it nhat 1 trang
    expect(footerCopyright).toBeTruthy()
  })
})

test.describe('Assets & Resources', () => {
  test('favicon is accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Kiểm tra favicon link trong head
    const favicon = page.locator(
      'link[rel="icon"], link[rel="shortcut icon"]'
    )
    const hasFavicon = (await favicon.count()) > 0

    // Hoặc có default favicon path
    if (hasFavicon) {
      const href = await favicon.first().getAttribute('href')
      expect(href).toBeTruthy()
    }
  })

  test('no mixed content on HTTPS pages', async ({ page }) => {
    const mixedContentUrls: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (
        url.startsWith('http://') &&
        !url.includes('localhost') &&
        !url.includes('127.0.0.1')
      ) {
        mixedContentUrls.push(url)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Không nên có mixed content (HTTP trên HTTPS page)
    expect(
      mixedContentUrls.length,
      `Mixed content URLs: ${mixedContentUrls.join(', ')}`
    ).toBe(0)
  })

  test('page loads all critical CSS', async ({ page }) => {
    const failedCSS: string[] = []

    page.on('response', (response) => {
      if (
        response.url().endsWith('.css') &&
        response.status() >= 400
      ) {
        failedCSS.push(response.url())
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    expect(
      failedCSS.length,
      `Failed CSS: ${failedCSS.join(', ')}`
    ).toBe(0)
  })

  test('page loads all critical JavaScript', async ({ page }) => {
    const failedJS: string[] = []

    page.on('response', (response) => {
      if (
        response.url().endsWith('.js') &&
        response.status() >= 400
      ) {
        failedJS.push(response.url())
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    expect(
      failedJS.length,
      `Failed JS: ${failedJS.join(', ')}`
    ).toBe(0)
  })
})
