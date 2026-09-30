import { test, expect } from '@playwright/test';

test.describe('Faculty Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a faculty member
    // Assuming faculty@edusphere.com exists from the seed file
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'faculty@edusphere.local');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"]');
    
    // Wait for the URL to contain dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('Dashboard loads correctly', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Dashboard', { ignoreCase: true });
    await expect(page.locator('text=My Courses')).toBeVisible();
  });

  test('My Courses page', async ({ page }) => {
    await page.goto('/faculty/courses');
    await expect(page.locator('h1').last()).toContainText('My Courses', { ignoreCase: true });
  });
});
