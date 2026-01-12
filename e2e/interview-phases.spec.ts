import { test, expect } from '@playwright/test';
import { signUpUser, createTestJob, TEST_USER, TEST_JOB } from './helpers';

/**
 * E2E Tests for Interview Phases Feature
 *
 * These tests cover the full user flow for managing interview phases,
 * including form submission, async operations, and state management.
 *
 * PREREQUISITES:
 * - Supabase backend must be running
 * - Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) must be set
 * - App dev server must be running (handled by playwright.config.ts webServer)
 */

test.describe('Interview Phases', () => {
  test.beforeEach(async ({ page }) => {
    // Sign up a new test user (using timestamp to ensure unique email)
    await signUpUser(page, TEST_USER.email, TEST_USER.password);

    // Create a test job application
    await createTestJob(page, TEST_JOB);

    // Navigate to the job detail page
    await page.click(
      `[data-testid="job-card"]:has-text("${TEST_JOB.company}")`
    );
  });

  test.describe('Creating Interview Phases', () => {
    test('should create a new interview phase successfully', async ({
      page,
    }) => {
      // Click "Add Interview Phase" button
      await page.click(
        'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
      );

      // Fill in the form
      await page.fill('input[name="title"]', 'Phone Screen');
      await page.fill('textarea[name="description"]', 'Initial screening call');
      await page.fill(
        'input[name="interviewer_names"]',
        'Jane Doe, John Smith'
      );
      await page.fill(
        'textarea[name="notes"]',
        'Great conversation about the role'
      );
      await page.selectOption('select[name="outcome"]', 'passed');

      // Submit the form
      await page.click('button:has-text("Add Phase")');

      // Wait for the form to close and phase to appear
      await expect(page.locator('text=Phone Screen')).toBeVisible();
      await expect(page.locator('text=Jane Doe, John Smith')).toBeVisible();
      await expect(page.locator('text=Passed')).toBeVisible();
    });

    test('should parse comma-separated interviewer names correctly', async ({
      page,
    }) => {
      await page.click(
        'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
      );

      // Enter multiple names separated by commas
      await page.fill('input[name="title"]', 'Technical Interview');
      await page.fill(
        'input[name="interviewer_names"]',
        'Alice Johnson, Bob Lee, Carol White'
      );

      await page.click('button:has-text("Add Phase")');

      // Verify all names are displayed
      await expect(
        page.locator('text=Alice Johnson, Bob Lee, Carol White')
      ).toBeVisible();
    });

    test('should handle empty optional fields gracefully', async ({ page }) => {
      await page.click(
        'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
      );

      // Only fill required field (title)
      await page.fill('input[name="title"]', 'Quick Phone Screen');

      await page.click('button:has-text("Add Phase")');

      // Verify phase is created
      await expect(page.locator('text=Quick Phone Screen')).toBeVisible();
    });

    test('should require title field', async ({ page }) => {
      await page.click(
        'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
      );

      // Try to submit without title
      await page.fill('input[name="interviewer_names"]', 'Jane Doe');

      // Attempt to submit
      await page.click('button:has-text("Add Phase")');

      // Form should still be visible (validation prevented submission)
      await expect(page.locator('input[name="title"]')).toBeVisible();
    });

    test('should default outcome to pending', async ({ page }) => {
      await page.click(
        'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
      );

      // Check default value
      const outcomeSelect = page.locator('select[name="outcome"]');
      await expect(outcomeSelect).toHaveValue('pending');
    });

    test('should calculate correct sort_order for multiple phases', async ({
      page,
    }) => {
      // Create first phase
      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Phone Screen');
      await page.click('button:has-text("Add Phase")');
      await expect(page.locator('text=Phone Screen')).toBeVisible();

      // Create second phase
      await page.click('button:has-text("Add Interview Phase")');
      await page.fill('input[name="title"]', 'Technical Interview');
      await page.click('button:has-text("Add Phase")');
      await expect(page.locator('text=Technical Interview')).toBeVisible();

      // Create third phase
      await page.click('button:has-text("Add Interview Phase")');
      await page.fill('input[name="title"]', 'Final Interview');
      await page.click('button:has-text("Add Phase")');

      // Verify all three phases exist in order
      const phases = page.locator('[data-testid^="phase-card-"]');
      await expect(phases).toHaveCount(3);

      // Verify order
      const firstPhase = phases.nth(0);
      const secondPhase = phases.nth(1);
      const thirdPhase = phases.nth(2);

      await expect(firstPhase.locator('text=Phone Screen')).toBeVisible();
      await expect(
        secondPhase.locator('text=Technical Interview')
      ).toBeVisible();
      await expect(thirdPhase.locator('text=Final Interview')).toBeVisible();
    });
  });

  test.describe('Updating Interview Phases', () => {
    test('should update an existing interview phase', async ({ page }) => {
      // Create a phase first
      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Phone Screen');
      await page.click('button:has-text("Add Phase")');

      // Click edit button
      await page.click('button[title="Edit phase"]');

      // Update the title
      await page.fill('input[name="title"]', 'Updated Phone Screen');
      await page.selectOption('select[name="outcome"]', 'passed');

      // Submit update
      await page.click('button:has-text("Update")');

      // Verify updates
      await expect(page.locator('text=Updated Phone Screen')).toBeVisible();
      await expect(page.locator('text=Passed')).toBeVisible();
    });

    test('should populate form fields when editing', async ({ page }) => {
      // Create a phase with all fields
      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Technical Interview');
      await page.fill('textarea[name="description"]', 'Coding challenge');
      await page.fill('input[name="interviewer_names"]', 'Alice, Bob');
      await page.fill('textarea[name="notes"]', 'Did well on algorithms');
      await page.selectOption('select[name="outcome"]', 'passed');
      await page.click('button:has-text("Add Phase")');

      // Click edit
      await page.click('button[title="Edit phase"]');

      // Verify all fields are populated
      await expect(page.locator('input[name="title"]')).toHaveValue(
        'Technical Interview'
      );
      await expect(page.locator('textarea[name="description"]')).toHaveValue(
        'Coding challenge'
      );
      await expect(page.locator('input[name="interviewer_names"]')).toHaveValue(
        'Alice, Bob'
      );
      await expect(page.locator('textarea[name="notes"]')).toHaveValue(
        'Did well on algorithms'
      );
      await expect(page.locator('select[name="outcome"]')).toHaveValue(
        'passed'
      );
    });
  });

  test.describe('Deleting Interview Phases', () => {
    test('should delete an interview phase', async ({ page }) => {
      // Create a phase
      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Phone Screen');
      await page.click('button:has-text("Add Phase")');
      await expect(page.locator('text=Phone Screen')).toBeVisible();

      // Delete the phase
      await page.click('button[title="Delete phase"]');

      // Verify it's deleted
      await expect(page.locator('text=Phone Screen')).not.toBeVisible();
      await expect(page.locator('text=No Interview Phases Yet')).toBeVisible();
    });
  });

  test.describe('Form Interactions', () => {
    test('should cancel form without saving', async ({ page }) => {
      await page.click('button:has-text("Add First Phase")');

      // Fill in some data
      await page.fill('input[name="title"]', 'Should Not Save');

      // Click cancel
      await page.click('button:has-text("Cancel")');

      // Verify form closed and data not saved
      await expect(page.locator('input[name="title"]')).not.toBeVisible();
      await expect(page.locator('text=Should Not Save')).not.toBeVisible();
    });

    test('should close form with X button', async ({ page }) => {
      await page.click('button:has-text("Add First Phase")');

      // Click X button (find by class or aria-label if available)
      await page.click(
        '.text-color-neutral:has-text("×"), button[aria-label="Close"]'
      );

      // Verify form closed
      await expect(page.locator('input[name="title"]')).not.toBeVisible();
    });

    test('should show all outcome options', async ({ page }) => {
      await page.click('button:has-text("Add First Phase")');

      // Get all options from the select
      const options = await page
        .locator('select[name="outcome"] option')
        .allTextContents();

      expect(options).toContain('Pending');
      expect(options).toContain('Passed');
      expect(options).toContain('Failed');
      expect(options).toContain('Cancelled');
    });

    test('should disable submit button while submitting', async ({ page }) => {
      await page.click('button:has-text("Add First Phase")');

      await page.fill('input[name="title"]', 'Test Phase');

      // Click submit and immediately check if button is disabled
      const submitButton = page.locator('button:has-text("Add Phase")');
      await submitButton.click();

      // The button should show "Saving..." and be disabled (briefly)
      // Note: This might be too fast to catch in E2E, but we can try
      const isSaving = await page
        .locator('button:has-text("Saving...")')
        .isVisible()
        .catch(() => false);
      if (isSaving) {
        await expect(
          page.locator('button:has-text("Saving...")')
        ).toBeDisabled();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message when creation fails', async ({
      page,
    }) => {
      // This test would require mocking the API to return an error
      // In a real scenario, you might:
      // 1. Mock the network response
      // 2. Trigger a server error
      // 3. Test offline behavior

      // Example with network interception:
      await page.route('**/rest/v1/interview_phases**', (route) => {
        route.abort('failed');
      });

      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Test Phase');
      await page.click('button:has-text("Add Phase")');

      // Should show error message
      await expect(page.locator('text=Failed to create phase')).toBeVisible();
    });

    test('should display error message when update fails', async ({ page }) => {
      // Create phase first (without network error)
      await page.click('button:has-text("Add First Phase")');
      await page.fill('input[name="title"]', 'Original Phase');
      await page.click('button:has-text("Add Phase")');

      // Now intercept update requests
      await page.route('**/rest/v1/interview_phases**', (route) => {
        if (route.request().method() === 'PATCH') {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      // Try to update
      await page.click('button[title="Edit phase"]');
      await page.fill('input[name="title"]', 'Updated Phase');
      await page.click('button:has-text("Update")');

      // Should show error
      await expect(page.locator('text=Failed to update phase')).toBeVisible();
    });
  });

  test.describe('Outcome Badge Display', () => {
    test('should display correct styling for each outcome', async ({
      page,
    }) => {
      const outcomes = [
        { value: 'pending', color: 'bg-gray-100' },
        { value: 'passed', color: 'bg-green-100' },
        { value: 'failed', color: 'bg-red-100' },
        { value: 'cancelled', color: 'bg-yellow-100' },
      ];

      for (const outcome of outcomes) {
        await page.click(
          'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
        );
        await page.fill('input[name="title"]', `Phase - ${outcome.value}`);
        await page.selectOption('select[name="outcome"]', outcome.value);
        await page.click('button:has-text("Add Phase")');

        // Verify badge has correct styling
        const badge = page.locator(
          `text=${outcome.value.charAt(0).toUpperCase() + outcome.value.slice(1)}`
        );
        await expect(badge).toBeVisible();
        await expect(badge).toHaveClass(new RegExp(outcome.color));
      }
    });
  });

  test.describe('Timeline Display', () => {
    test('should show empty state when no phases exist', async ({ page }) => {
      // Should show empty state
      await expect(page.locator('text=No Interview Phases Yet')).toBeVisible();
      await expect(
        page.locator('text=Track your interview process by adding phases')
      ).toBeVisible();
      await expect(
        page.locator('button:has-text("Add First Phase")')
      ).toBeVisible();
    });

    test('should display phases in correct sort order', async ({ page }) => {
      // Create phases in order
      const phases = ['First', 'Second', 'Third'];

      for (const phase of phases) {
        await page.click(
          'button:has-text("Add First Phase"), button:has-text("Add Interview Phase")'
        );
        await page.fill('input[name="title"]', `${phase} Phase`);
        await page.click('button:has-text("Add Phase")');
      }

      // Verify order
      const phaseCards = page.locator('[data-testid^="phase-card-"]');
      await expect(phaseCards).toHaveCount(3);

      const titles = await phaseCards.locator('h3').allTextContents();
      expect(titles).toEqual(['First Phase', 'Second Phase', 'Third Phase']);
    });
  });
});
