import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  users,
  enrollments,
  courses,
  assignments,
  grades,
  attendance,
  announcements,
  semesters,
  departments,
} from "../db/schema.js";
import { eq, and, desc, gte, lte, sql, count, avg } from "drizzle-orm";
import { AuthRequest, requireAuth, requireRole } from "../utils/middleware.js";

const router = Router();

// ─── GET /api/student/dashboard ──────────────────────────────────────────────
// Returns the authenticated student's dashboard data.
// The student is identified exclusively from the JWT — not from request params.

router.get(
  "/dashboard",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // ── 1. Student profile ─────────────────────────────────────────────
      const [student] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      // ── 2. Enrolled courses count ──────────────────────────────────────
      const enrolledRows = await db
        .select({ count: count() })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, userId),
            eq(enrollments.status, "enrolled")
          )
        );
      const enrolledCourses = enrolledRows[0]?.count ?? 0;

      // ── 3. Enrolled course details (for upcoming classes etc.) ─────────
      const studentEnrollments = await db
        .select({
          courseId: courses.id,
          courseTitle: courses.title,
          courseCode: courses.code,
          schedule: courses.schedule,
          location: courses.location,
          facultyId: courses.facultyId,
          departmentId: courses.departmentId,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(
          and(
            eq(enrollments.studentId, userId),
            eq(enrollments.status, "enrolled")
          )
        );

      // ── 4. Pending assignments ─────────────────────────────────────────
      const courseIds = studentEnrollments.map((e) => e.courseId);

      let pendingAssignments = 0;
      let pendingAssignmentsList: Array<{
        id: string;
        title: string;
        courseCode: string;
        courseTitle: string;
        type: string;
        dueDate: Date | null;
      }> = [];

      if (courseIds.length > 0) {
        // Get all published assignments for enrolled courses
        const allAssignments = await db
          .select({
            id: assignments.id,
            title: assignments.title,
            courseId: assignments.courseId,
            type: assignments.type,
            dueDate: assignments.dueDate,
          })
          .from(assignments)
          .where(eq(assignments.isPublished, true));

        // Filter to enrolled courses
        const enrolledAssignments = allAssignments.filter((a) =>
          courseIds.includes(a.courseId)
        );

        // Get graded assignment IDs for this student
        const gradedRows = await db
          .select({ assignmentId: grades.assignmentId })
          .from(grades)
          .where(eq(grades.studentId, userId));

        const gradedIds = new Set(gradedRows.map((g) => g.assignmentId));

        // Pending = published + in enrolled course + not yet graded + not past due
        const now = new Date();
        const pending = enrolledAssignments.filter(
          (a) => !gradedIds.has(a.id) && (!a.dueDate || new Date(a.dueDate) >= now)
        );
        pendingAssignments = pending.length;

        // Map with course info
        pendingAssignmentsList = pending.slice(0, 5).map((a) => {
          const course = studentEnrollments.find((e) => e.courseId === a.courseId);
          return {
            id: a.id,
            title: a.title,
            courseCode: course?.courseCode ?? "",
            courseTitle: course?.courseTitle ?? "",
            type: a.type,
            dueDate: a.dueDate,
          };
        });
      }

      // ── 5. Attendance percentage ───────────────────────────────────────
      let attendancePercentage: number | null = null;

      if (courseIds.length > 0) {
        const attendanceRows = await db
          .select({
            status: attendance.status,
          })
          .from(attendance)
          .where(eq(attendance.studentId, userId));

        const totalClasses = attendanceRows.length;
        const presentClasses = attendanceRows.filter(
          (a) => a.status === "present" || a.status === "late"
        ).length;

        if (totalClasses > 0) {
          attendancePercentage = Math.round(
            (presentClasses / totalClasses) * 100
          );
        }
      }

      // ── 6. GPA (average of final grades if available) ──────────────────
      let gpa: number | null = null;

      const gradeRows = await db
        .select({ finalGrade: enrollments.finalGrade })
        .from(enrollments)
        .where(eq(enrollments.studentId, userId));

      const numericGrades = gradeRows
        .map((g) => parseFloat(g.finalGrade ?? ""))
        .filter((g) => !isNaN(g));

      if (numericGrades.length > 0) {
        gpa =
          Math.round(
            (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length) *
              100
          ) / 100;
      }

      // ── 7. Upcoming classes (parsed from schedule strings) ─────────────
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayAbbrevs: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
        M: 1, T: 2, W: 3, R: 4, F: 5, S: 6, U: 0,
      };

      const today = new Date();
      const currentDay = today.getDay();

      // Get faculty names for enrolled courses
      const facultyIds = studentEnrollments
        .map((e) => e.facultyId)
        .filter((id): id is string => id !== null);

      let facultyMap: Record<string, string> = {};
      if (facultyIds.length > 0) {
        const facultyRows = await db
          .select({ id: users.id, name: users.name })
          .from(users);
        facultyRows.forEach((f) => {
          facultyMap[f.id] = f.name;
        });
      }

      const upcomingClasses = studentEnrollments
        .filter((e) => e.schedule)
        .map((e) => {
          // Parse schedule like "MWF 10:00-11:00" or "Mon/Wed 10:00 AM - 11:00 AM"
          const schedule = e.schedule ?? "";
          return {
            courseId: e.courseId,
            courseTitle: e.courseTitle,
            courseCode: e.courseCode,
            schedule,
            location: e.location,
            faculty: e.facultyId ? facultyMap[e.facultyId] ?? null : null,
          };
        })
        .slice(0, 6);

      // ── 8. Recent announcements ────────────────────────────────────────
      // Get announcements that are either global (no course/dept filter) or
      // related to the student's enrolled courses
      const recentAnnouncements = await db
        .select({
          id: announcements.id,
          title: announcements.title,
          content: announcements.content,
          isPinned: announcements.isPinned,
          publishedAt: announcements.publishedAt,
          authorId: announcements.authorId,
          courseId: announcements.courseId,
        })
        .from(announcements)
        .orderBy(desc(announcements.publishedAt))
        .limit(10);

      // Filter: global ones (no courseId) + ones matching enrolled courses
      const relevantAnnouncements = recentAnnouncements
        .filter(
          (a) =>
            !a.courseId || courseIds.includes(a.courseId)
        )
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          title: a.title,
          content:
            a.content.length > 120
              ? a.content.substring(0, 120) + "…"
              : a.content,
          isPinned: a.isPinned,
          publishedAt: a.publishedAt,
        }));

      // ── 9. Active semester info ────────────────────────────────────────
      const [activeSemester] = await db
        .select()
        .from(semesters)
        .where(eq(semesters.status, "active"))
        .limit(1);

      let semesterProgress: number | null = null;
      if (activeSemester) {
        const start = new Date(activeSemester.startDate).getTime();
        const end = new Date(activeSemester.endDate).getTime();
        const now = Date.now();
        if (end > start) {
          semesterProgress = Math.min(
            100,
            Math.max(0, Math.round(((now - start) / (end - start)) * 100))
          );
        }
      }

      // ── Response ───────────────────────────────────────────────────────
      res.json({
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          avatarUrl: student.avatarUrl,
          phone: student.phone,
          studentId: `BCA${new Date(student.createdAt).getFullYear()}${student.id.substring(0, 4).toUpperCase()}`,
          program: null, // To be set when student profiles are extended
          semester: activeSemester?.name ?? null,
          academicYear: activeSemester
            ? `${new Date(activeSemester.startDate).getFullYear()}–${new Date(activeSemester.endDate).getFullYear()}`
            : null,
        },
        statistics: {
          attendance: attendancePercentage,
          courses: enrolledCourses,
          pendingAssignments,
          gpa,
        },
        upcomingClasses,
        announcements: relevantAnnouncements,
        pendingAssignmentsList,
        semesterProgress,
        activeSemester: activeSemester
          ? {
              name: activeSemester.name,
              startDate: activeSemester.startDate,
              endDate: activeSemester.endDate,
            }
          : null,
      });
    } catch (error) {
      console.error("Student dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
