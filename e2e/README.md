# E2E Tests with Playwright

This directory contains end-to-end tests for the Watstix application using Playwright.

**Note:** These tests require downloading Chromium from Playwright's CDN. In restricted environments where the CDN is blocked, you'll see a 403 error when installing browsers. The tests are properly configured and will run successfully in local development or CI/CD environments with CDN access.

## Running Tests

### Prerequisites

1. Install dependencies:

```bash
pnpm install
```

2. Install Playwright browsers:

```bash
pnpm exec playwright install chromium
```

### Running Tests

Run all E2E tests:

```bash
pnpm test:e2e
```

Run tests in UI mode (interactive):

```bash
pnpm test:e2e:ui
```

Run tests in headed mode (see the browser):

```bash
pnpm test:e2e:headed
```

Run specific test file:

```bash
pnpm exec playwright test e2e/interview-phases.spec.ts
```

Debug tests:

```bash
pnpm exec playwright test --debug
```

### View Test Report

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

## Test Structure

### Files

- **example.spec.ts** - Basic smoke tests to verify app loads
- **interview-phases.spec.ts** - Comprehensive tests for interview phases feature

### Test Organization

Tests are organized by feature and user flow:

1. **Creating Interview Phases** - Tests for adding new phases
2. **Updating Interview Phases** - Tests for editing existing phases
3. **Deleting Interview Phases** - Tests for removing phases
4. **Form Interactions** - Tests for form behavior (cancel, validation, etc.)
5. **Error Handling** - Tests for error states and messages
6. **Timeline Display** - Tests for phase list rendering and ordering

## Best Practices

### 1. Use Data Test IDs

Add `data-testid` attributes to components for reliable selectors:

```tsx
<div data-testid="job-card">...</div>
```

### 2. Use Page Object Pattern

For complex tests, consider creating page objects:

```typescript
class InterviewPhaseForm {
  constructor(private page: Page) {}

  async fillTitle(title: string) {
    await this.page.fill('input[name="title"]', title);
  }

  async submit() {
    await this.page.click('button:has-text("Add Phase")');
  }
}
```

### 3. Test Authentication

For authenticated flows, create a test fixture to handle login:

```typescript
test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
});
```

### 4. Mock External APIs

Use route handlers to mock Supabase or other APIs:

```typescript
await page.route('**/rest/v1/interview_phases**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: mockData }),
  });
});
```

## Debugging

### 1. Use Playwright Inspector

```bash
pnpm exec playwright test --debug
```

### 2. Take Screenshots

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 3. Trace Viewer

Traces are automatically captured on first retry. View them with:

```bash
pnpm exec playwright show-trace trace.zip
```

## CI/CD Integration

The tests are configured to run in CI with:

- Retries on failure
- Sequential execution
- HTML report generation

See `playwright.config.ts` for CI-specific settings.

## Writing New Tests

1. Create a new `.spec.ts` file in `e2e/`
2. Follow the existing test structure
3. Use descriptive test names that explain user behavior
4. Add data-testids to components as needed
5. Keep tests independent and isolated

Example:

```typescript
test('should do something important', async ({ page }) => {
  // Arrange: Set up the test
  await page.goto('/');

  // Act: Perform the action
  await page.click('button:has-text("Click Me")');

  // Assert: Verify the result
  await expect(page.locator('text=Success')).toBeVisible();
});
```
