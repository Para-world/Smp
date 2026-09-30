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
waiting for navigation to "**/auth*" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e3]:
    - region "Notifications alt+T"
    - generic [ref=f1e4]:
      - complementary [ref=f1e5]:
        - generic [ref=f1e6]:
          - generic [ref=f1e7]:
            - img "EduSphere" [ref=f1e8]
            - generic [ref=f1e9]: EduSphere Admin
          - navigation [ref=f1e10]:
            - link "Dashboard" [ref=f1e13] [cursor=pointer]:
              - /url: /admin/dashboard
            - generic [ref=f1e20]:
              - generic [ref=f1e21]: Reports
              - link "Reports & Analytics" [ref=f1e23] [cursor=pointer]:
                - /url: /admin/reports
            - generic [ref=f1e28]:
              - generic [ref=f1e29]: People
              - link "Students" [ref=f1e31] [cursor=pointer]:
                - /url: /admin/students
              - link "Faculty" [ref=f1e39] [cursor=pointer]:
                - /url: /admin/instructors
            - generic [ref=f1e45]:
              - generic [ref=f1e46]: Academics
              - link "Organization" [ref=f1e48] [cursor=pointer]:
                - /url: /admin/organization
              - link "Semesters" [ref=f1e55] [cursor=pointer]:
                - /url: /admin/semesters
              - link "Courses" [ref=f1e60] [cursor=pointer]:
                - /url: /admin/courses
              - link "Enrollments" [ref=f1e65] [cursor=pointer]:
                - /url: /admin/enrollments
              - link "Attendance" [ref=f1e72] [cursor=pointer]:
                - /url: /admin/attendance
              - link "Assignments" [ref=f1e79] [cursor=pointer]:
                - /url: /admin/assignments
              - link "Exams" [ref=f1e85] [cursor=pointer]:
                - /url: /admin/exams
              - link "Results" [ref=f1e91] [cursor=pointer]:
                - /url: /admin/results
              - link "Timetable" [ref=f1e97] [cursor=pointer]:
                - /url: /admin/timetable
            - generic [ref=f1e101]:
              - generic [ref=f1e102]: Communication
              - link "Announcements" [ref=f1e104] [cursor=pointer]:
                - /url: /admin/announcements
              - link "Notifications" [ref=f1e110] [cursor=pointer]:
                - /url: /admin/notifications
            - generic [ref=f1e115]:
              - generic [ref=f1e116]: System
              - link "Reports" [ref=f1e118] [cursor=pointer]:
                - /url: /admin/reports
              - link "Audit Logs" [ref=f1e122] [cursor=pointer]:
                - /url: /admin/audit-logs
              - link "Settings" [ref=f1e127] [cursor=pointer]:
                - /url: /admin/settings
          - button "Log out" [ref=f1e133]
        - button "Collapse sidebar" [ref=f1e138]
      - generic [ref=f1e141]:
        - banner [ref=f1e142]:
          - generic [ref=f1e143]:
            - heading "Institutional Dashboard" [level=1] [ref=f1e145]
            - textbox "Search students, faculty, courses..." [ref=f1e152]
            - generic [ref=f1e153]:
              - button [ref=f1e155]
              - button "SA Super Admin admin" [active] [ref=f1e159]:
                - generic [ref=f1e160]: SA
                - generic [ref=f1e162]:
                  - paragraph [ref=f1e163]: Super Admin
                  - paragraph [ref=f1e164]: admin
        - main [ref=f1e165]:
          - generic [ref=f1e166]:
            - generic [ref=f1e167]:
              - generic [ref=f1e175]:
                - paragraph [ref=f1e176]: Total Students
                - heading "11" [level=3] [ref=f1e177]
                - paragraph [ref=f1e178]: 11 Active
              - generic [ref=f1e185]:
                - paragraph [ref=f1e186]: Total Faculty
                - heading "6" [level=3] [ref=f1e187]
                - paragraph [ref=f1e188]: 6 Active
              - generic [ref=f1e193]:
                - paragraph [ref=f1e194]: Total Courses
                - heading "3" [level=3] [ref=f1e195]
                - paragraph [ref=f1e196]: 3 Active
              - generic [ref=f1e203]:
                - paragraph [ref=f1e204]: Average Attendance
                - heading "75%" [level=3] [ref=f1e205]
                - paragraph [ref=f1e206]: Across all courses
            - generic [ref=f1e207]:
              - heading "Critical Alerts" [level=3] [ref=f1e213]
              - generic [ref=f1e214]:
                - generic [ref=f1e215]:
                  - generic [ref=f1e216]: System backup failed at 02:00 AM. Requires immediate attention.
                  - button "Review logs" [ref=f1e217]
                - generic [ref=f1e218]:
                  - generic [ref=f1e219]: 5 faculty members have pending grading past the 48-hour deadline.
                  - button "View details" [ref=f1e220]
            - generic [ref=f1e221]:
              - generic [ref=f1e222]:
                - generic [ref=f1e223]:
                  - heading "Today's Activity" [level=3] [ref=f1e224]
                  - button "View All" [ref=f1e227]
                - generic [ref=f1e228]:
                  - generic [ref=f1e235]:
                    - paragraph [ref=f1e236]: New student enrolled
                    - paragraph [ref=f1e237]: 10 mins ago
                  - generic [ref=f1e246]:
                    - paragraph [ref=f1e247]: CS101 Results Published
                    - paragraph [ref=f1e248]: 1 hour ago
                  - generic [ref=f1e256]:
                    - paragraph [ref=f1e257]: System Maintenance Scheduled
                    - paragraph [ref=f1e258]: 3 hours ago
                  - generic [ref=f1e266]:
                    - paragraph [ref=f1e267]: New course 'Data Structures' added
                    - paragraph [ref=f1e268]: 5 hours ago
              - generic [ref=f1e272]:
                - heading "Academic Operations" [level=3] [ref=f1e273]
                - generic [ref=f1e274]:
                  - generic [ref=f1e275]:
                    - generic [ref=f1e276]: Upcoming Exams
                    - generic [ref=f1e282]: "0"
                  - generic [ref=f1e283]:
                    - generic [ref=f1e284]: Pending Assignments
                    - generic [ref=f1e290]: "1"
                  - generic [ref=f1e291]:
                    - generic [ref=f1e292]: Published Results
                    - generic [ref=f1e299]: "0"
              - generic [ref=f1e300]:
                - heading "Student Enrollment Trend" [level=3] [ref=f1e301]
                - application [ref=f1e305]:
                  - generic [ref=f1e312]:
                    - generic [ref=f1e313]: Sep
                    - generic [ref=f1e316]:
                      - generic [ref=f1e317]: "0"
                      - generic [ref=f1e319]: "3"
                      - generic [ref=f1e321]: "6"
                      - generic [ref=f1e323]: "9"
                      - generic [ref=f1e325]: "12"
              - generic [ref=f1e327]:
                - heading "Weekly Attendance Overview" [level=3] [ref=f1e328]
                - application [ref=f1e332]:
                  - generic [ref=f1e361]:
                    - generic [ref=f1e362]:
                      - generic [ref=f1e363]: Fri
                      - generic [ref=f1e365]: Sat
                      - generic [ref=f1e367]: Sun
                      - generic [ref=f1e369]: Mon
                      - generic [ref=f1e371]: Tue
                      - generic [ref=f1e373]: Wed
                      - generic [ref=f1e375]: Thu
                    - generic [ref=f1e377]:
                      - generic [ref=f1e378]: "0"
                      - generic [ref=f1e380]: "25"
                      - generic [ref=f1e382]: "50"
                      - generic [ref=f1e384]: "75"
                      - generic [ref=f1e386]: "100"
  - generic [aria-hidden] [ref=f1e388]: "25"
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
  56 |     // Usually there's a user avatar/button to click
  57 |     const userMenuButton = page.locator('button').filter({ hasText: 'AD' }).first();
  58 |     if (await userMenuButton.isVisible()) {
  59 |       await userMenuButton.click();
  60 |       await page.click('text=Log out', { force: true });
> 61 |       await page.waitForURL('**/auth*');
     |                  ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  62 |     }
  63 |   });
  64 | });
  65 | 
```