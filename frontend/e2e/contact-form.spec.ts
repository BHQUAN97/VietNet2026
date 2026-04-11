import { test, expect } from '@playwright/test'

/**
 * E2E: Contact / Consultation Form
 * Kiểm tra form tư vấn với validation
 */

test.describe('Contact Page - Consultation Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
  })

  test('form renders with required fields', async ({ page }) => {
    // Kiểm tra page header
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Form phải có input fields
    const form = page.locator('form').first()
    await expect(form).toBeVisible()

    // Kiểm tra các input cơ bản
    const inputs = form.locator('input, textarea, select')
    const inputCount = await inputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(3) // name, phone/email, message ít nhất
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    const form = page.locator('form').first()
    const submitBtn = form.locator('button[type="submit"]')

    // Submit form trống
    if (await submitBtn.count() > 0) {
      await submitBtn.click()

      // Chờ validation error hiện
      await page.waitForTimeout(500)
      
      // Kiểm tra có error message hoặc invalid state
      const hasErrors = await page.evaluate(() => {
        const invalidInputs = document.querySelectorAll(':invalid, [aria-invalid="true"]')
        const errorMessages = document.querySelectorAll('[role="alert"], .text-error, .error-message')
        return invalidInputs.length > 0 || errorMessages.length > 0
      })
      
      expect(hasErrors).toBeTruthy()
    }
  })

  test('submit button exists and is enabled', async ({ page }) => {
    const submitBtn = page.locator('form button[type="submit"]').first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })
})
