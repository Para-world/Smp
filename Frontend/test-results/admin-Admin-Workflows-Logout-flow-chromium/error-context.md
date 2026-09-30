# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> Admin Workflows >> Logout flow
- Location: tests\admin.spec.js:50:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - region "Notifications alt+T"
  - generic [ref=f1e5]:
    - link "EduSphere Logo EduSphere" [ref=f1e6] [cursor=pointer]:
      - /url: /
      - img "EduSphere Logo" [ref=f1e7]
      - generic [ref=f1e8]: EduSphere
    - generic [ref=f1e9]:
      - generic [ref=f1e11]:
        - heading "Welcome back" [level=1] [ref=f1e12]
        - paragraph [ref=f1e13]: Sign in to access your academic dashboard
      - generic [ref=f1e14]:
        - generic [ref=f1e15]:
          - generic [ref=f1e16]: Email Address
          - generic [ref=f1e17]:
            - generic [ref=f1e18]: mail
            - textbox "jane@university.edu" [ref=f1e19]
        - generic [ref=f1e20]:
          - generic [ref=f1e21]: Password
          - generic [ref=f1e22]:
            - generic [ref=f1e23]: lock
            - textbox "Min. 8 characters" [ref=f1e24]
            - button "visibility" [ref=f1e25]
        - button "login Sign In" [ref=f1e27]:
          - generic [ref=f1e28]: login
          - text: Sign In
      - generic [ref=f1e29]: OR
      - paragraph [ref=f1e33]:
        - text: Don't have an account?
        - button "Create one" [ref=f1e34]
    - link "arrow_back Back to homepage" [ref=f1e35] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e36]: arrow_back
      - text: Back to homepage
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Workflows', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login before each test
  6  |     await page.goto('/auth');
  7  |     await page.fill('input[type="email"]', 'admin@edusphere.local');
  8  |     await page.fill('input[type="password"]', 'Demo123!'); // assuming Demo123! is seeded
  9  |     await page.click('button[type="submit"]');
  10 |     await page.waitForURL('/admin/dashboard', { timeout: 10000 });
  11 |   });
  12 | 
  13 |   test('Dashboard loads correctly', async ({ page }) => {
  14 |     // Check main dashboard components
  15 |     await expect(page.locator('h1').first()).toContainText('Dashboard', { ignoreCase: true });
  16 |     // Check if quick stats are visible
  17 |     await expect(page.locator('text=Total Students')).toBeVisible();
  18 |     await expect(page.locator('text=Total Faculty')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('Students list and filtering', async ({ page }) => {
  22 |     // Navigate to students page
  23 |     await page.goto('/admin/students');
  24 |     await expect(page.locator('h1')).toContainText('Student Management', { ignoreCase: true });
  25 | 
  26 |     // Check if table renders
  27 |     const table = page.locator('table');
  28 |     await expect(table).toBeVisible();
  29 |     
  30 |     // Check search functionality
  31 |     const searchInput = page.locator('input[placeholder="Search students..."]');
  32 |     await searchInput.fill('John');
  33 |     
  34 |     // Check if at least some results or empty state appear
  35 |     const emptyState = page.locator('text=No students match your current filters.');
  36 |     const rows = page.locator('tbody tr');
  37 |     
  38 |     // Either rows are shown or empty state is shown (since test DB state varies)
  39 |     await expect(rows.first().or(emptyState)).toBeVisible();
  40 |   });
  41 | 
  42 |   test('Courses management', async ({ page }) => {
  43 |     await page.goto('/admin/courses');
  44 |     await expect(page.locator('h1')).toContainText('Course Management', { ignoreCase: true });
  45 |     
  46 |     // Verify table loads
  47 |     await expect(page.locator('table')).toBeVisible();
  48 |   });
  49 | 
  50 |   test('Logout flow', async ({ page }) => {
  51 |     await page.goto('/admin/dashboard');
  52 |     // Find the profile/logout menu
  53 |     // Wait for header to be visible
  54 |     await page.waitForSelector('header');
  55 |     
  56 |     await page.locator('button').filter({ hasText: 'Log out' }).first().click({ force: true });
> 57 |     await page.waitForURL('/');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  58 |   });
  59 | });
  60 | 
```