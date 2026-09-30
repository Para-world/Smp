import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('should login as admin and navigate to dashboard', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill the login form (based on the UI in this project)
    await page.fill('input[type="email"]', 'admin@edusphere.local');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"]');

    // Wait for URL to be the admin dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Assert we're on the dashboard by checking text
    await expect(page.locator('h1').first()).toContainText('Dashboard', { ignoreCase: true });
  });
});
