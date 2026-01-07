import { test, expect } from '@playwright/test';

/**
 * Basic E2E test to verify Playwright setup
 */

test.describe('Basic App Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/Vite \+ React \+ TS|Watstix/);
  });

  test('should display auth form for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/');

    // Should show login/signup form
    // Adjust selectors based on your actual auth form
    await expect(
      page.locator('input[type="email"], input[name="email"]')
    ).toBeVisible({ timeout: 10000 });
  });
});
