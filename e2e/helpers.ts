import { Page, expect } from '@playwright/test';

/**
 * E2E Test Helpers
 * Helper functions for setting up test data and authentication
 */

export const TEST_USER = {
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

export const TEST_JOB = {
  company: 'Test Company Inc',
  position: 'Senior Software Engineer',
  location: 'San Francisco, CA',
};

/**
 * Sign up a new test user
 */
export async function signUpUser(page: Page, email: string, password: string) {
  await page.goto('/');

  // Wait for the auth form to load
  await expect(page.locator('text=Sign Up')).toBeVisible();

  // Click Sign Up tab
  await page.click('button:has-text("Sign Up")');

  // Fill in the form
  await page.fill('input[type="email"]', email);

  // Fill password fields (there are multiple password inputs)
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password); // Confirm password

  // Submit the form
  await page.click('button[type="submit"]:has-text("Sign Up")');

  // Wait for successful authentication (redirects to dashboard)
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Sign in an existing user
 */
export async function signInUser(page: Page, email: string, password: string) {
  await page.goto('/');

  // Wait for the auth form to load
  await expect(page.locator('text=Sign In')).toBeVisible();

  // Make sure we're on the Sign In tab
  await page.click('button:has-text("Sign In")');

  // Fill in the form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit the form
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Wait for successful authentication
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Create a test job application through the UI
 */
export async function createTestJob(
  page: Page,
  job: { company: string; position: string; location: string }
) {
  // Should be on dashboard - look for "Add Job" or "Track a New Application" button
  const addButton = page
    .locator(
      'button:has-text("Track a New Application"), button:has-text("Add Job")'
    )
    .first();
  await addButton.click();

  // Fill in the job form
  await page.fill(
    'input[placeholder*="Company" i], input[name="company_name"]',
    job.company
  );
  await page.fill(
    'input[placeholder*="Position" i], input[name="position_title"]',
    job.position
  );
  await page.fill(
    'input[placeholder*="Location" i], input[name="location"]',
    job.location
  );

  // Submit the form
  await page.click(
    'button[type="submit"]:has-text("Add"), button:has-text("Create")'
  );

  // Wait for the job to appear
  await expect(page.locator(`text=${job.company}`)).toBeVisible();
}

/**
 * Navigate to a job's detail page by clicking on a job card
 */
export async function navigateToJobDetail(page: Page, companyName: string) {
  // Click on the job card
  await page.click(`[data-testid="job-card"]:has-text("${companyName}")`);

  // Wait for the job detail page to load
  await expect(page.locator(`text=${companyName}`)).toBeVisible();
}
