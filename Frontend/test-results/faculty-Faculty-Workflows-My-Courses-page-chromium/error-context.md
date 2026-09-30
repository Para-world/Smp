# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: faculty.spec.js >> Faculty Workflows >> My Courses page
- Location: tests\faculty.spec.js:21:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "My Courses"
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Dashboard</h1> aka getByRole('heading', { name: 'Dashboard' })
    2) <h1 class="text-3xl font-bold tracking-tight">My Courses</h1> aka getByRole('heading', { name: 'My Courses' })

Call log:
  - Expect "toContainText" locator('h1') with timeout 5000ms
  - waiting for locator('h1')
    - locator resolved to <h1 class="font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Dashboard</h1>
    - unexpected value "Dashboard"

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - region "Notifications alt+T"
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]:
        - generic [ref=f1e7]:
          - img "EduSphere" [ref=f1e8]
          - generic [ref=f1e9]: EduSphere Faculty
        - navigation [ref=f1e10]:
          - link "Dashboard" [ref=f1e12] [cursor=pointer]:
            - /url: /faculty/dashboard
          - generic [ref=f1e19]:
            - generic [ref=f1e20]: Academics
            - link "My Courses" [ref=f1e21] [cursor=pointer]:
              - /url: /faculty/courses
            - link "Assignments" [ref=f1e25] [cursor=pointer]:
              - /url: /faculty/assignments
            - link "Exams" [ref=f1e30] [cursor=pointer]:
              - /url: /faculty/exams
            - link "Timetable" [ref=f1e36] [cursor=pointer]:
              - /url: /faculty/timetable
          - generic [ref=f1e40]:
            - generic [ref=f1e41]: Communication
            - link "Announcements" [ref=f1e42] [cursor=pointer]:
              - /url: /faculty/announcements
            - link "Notifications" [ref=f1e47] [cursor=pointer]:
              - /url: /faculty/notifications
        - button "Sign Out" [ref=f1e53]
      - button [ref=f1e58]
    - generic [ref=f1e61]:
      - banner [ref=f1e62]:
        - generic [ref=f1e63]:
          - heading "Dashboard" [level=1] [ref=f1e65]
          - button "DF Demo Faculty faculty" [ref=f1e67]:
            - generic [ref=f1e68]: DF
            - generic [ref=f1e70]:
              - paragraph [ref=f1e71]: Demo Faculty
              - paragraph [ref=f1e72]: faculty
      - main [ref=f1e73]:
        - generic [ref=f1e74]:
          - generic [ref=f1e75]:
            - heading "My Courses" [level=1] [ref=f1e76]
            - paragraph [ref=f1e77]: Manage all the courses assigned to you.
          - generic [ref=f1e78]:
            - heading "No Courses Assigned" [level=3] [ref=f1e81]
            - paragraph [ref=f1e82]: You have not been assigned to teach any courses yet.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Faculty Workflows', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login as a faculty member
  6  |     // Assuming faculty@edusphere.com exists from the seed file
  7  |     await page.goto('/auth');
  8  |     await page.fill('input[type="email"]', 'faculty@edusphere.local');
  9  |     await page.fill('input[type="password"]', 'Demo123!');
  10 |     await page.click('button[type="submit"]');
  11 |     
  12 |     // Wait for the URL to contain dashboard
  13 |     await page.waitForURL('**/dashboard', { timeout: 10000 });
  14 |   });
  15 | 
  16 |   test('Dashboard loads correctly', async ({ page }) => {
  17 |     await expect(page.locator('h1').first()).toContainText('Dashboard', { ignoreCase: true });
  18 |     await expect(page.locator('text=My Courses')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('My Courses page', async ({ page }) => {
  22 |     await page.goto('/faculty/courses');
> 23 |     await expect(page.locator('h1')).toContainText('My Courses', { ignoreCase: true });
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  24 |   });
  25 | });
  26 | 
```