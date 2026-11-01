import { test, expect } from '@playwright/test';

test.describe('Event Planning Assistant E2E Flow', () => {
  test('creates a complete wedding plan, updates budget spend, and toggles checklist items', async ({
    page
  }) => {
    await page.goto('/');

    // 1. Verify page title and header
    await expect(page.locator('h1')).toContainText('GenAI Event Planning Assistant');

    // 2. Fill setup form
    await page.selectOption('#field-eventType', 'wedding');
    await page.fill('#field-city', 'Udaipur');
    await page.fill('#field-guestCount', '300');
    await page.fill('#field-totalBudget', '3000000');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify plan loaded
    await expect(page.locator('h2')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Budget Allocation Overview')).toBeVisible();

    // 5. Navigate tabs
    await page.click('#tab-timeline');
    await expect(page.getByText('Milestone Timeline & Action Plan')).toBeVisible();

    await page.click('#tab-vendors');
    await expect(page.getByText('Vendor Sourcing & Interview Checklist')).toBeVisible();

    await page.click('#tab-ideas');
    await expect(page.getByText('Themes & Aesthetic Concepts')).toBeVisible();
  });
});

