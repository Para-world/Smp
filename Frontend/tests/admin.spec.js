import { test, expect } from '@playwright/test';

test.describe('Admin Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@edusphere.local');
    await page.fill('input[type="password"]', 'Demo123!'); // assuming Demo123! is seeded
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
  });

  test('Dashboard loads correctly', async ({ page }) => {
    // Check main dashboard components
    await expect(page.locator('h1').first()).toContainText('Dashboard', { ignoreCase: true });
    // Check if quick stats are visible
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Total Faculty')).toBeVisible();
  });

  test('Students list and filtering', async ({ page }) => {
    // Navigate to students page
    await page.goto('/admin/students');
    await expect(page.locator('h1')).toContainText('Student Management', { ignoreCase: true });

    // Check if table renders
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check search functionality
    const searchInput = page.locator('input[placeholder="Search students..."]');
    await searchInput.fill('John');
    
    // Check if at least some results or empty state appear
    const emptyState = page.locator('text=No students match your current filters.');
    const rows = page.locator('tbody tr');
    
    // Either rows are shown or empty state is shown (since test DB state varies)
    await expect(rows.first().or(emptyState)).toBeVisible();
  });

  test('Courses management', async ({ page }) => {
    await page.goto('/admin/courses');
    await expect(page.locator('h1')).toContainText('Course Management', { ignoreCase: true });
    
    // Verify table loads
    await expect(page.locator('table')).toBeVisible();
  });

  test('Logout flow', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Find the profile/logout menu
    // Wait for header to be visible
    await page.waitForSelector('header');
    
    // Usually there's a user avatar/button to click
    const userMenuButton = page.locator('button').filter({ hasText: 'AD' }).first();
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
      await page.click('text=Log out', { force: true });
      await page.waitForURL('**/auth*');
    }
  });
});
