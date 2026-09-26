import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  users,
  courses,
  enrollments,
  attendance,
} from "../db/schema.js";
import { eq, count, and, desc } from "drizzle-orm";
import { requireAuth, AuthRequest, requirePermission } from "../utils/middleware.js";
import { PERMISSIONS } from "../utils/permissions.js";

const router = Router();

// Apply auth middleware to all faculty routes
router.use(requireAuth);

/**
 * GET /api/faculty/dashboard
 * Retrieves statistics for the faculty dashboard
 */
router.get("/dashboard", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;

    // 1. My Courses
    const [myCoursesRes] = await db.select({ count: count() }).from(courses).where(eq(courses.facultyId, facultyId));
    
    // 2. Total Students across my courses
    // TODO: Join enrollments with courses where courses.facultyId = facultyId
    
    res.json({
      courses: myCoursesRes.count,
      students: 0, // Placeholder
    });

  } catch (error) {
    console.error("Error fetching faculty dashboard stats:", error);
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
});

/**
 * GET /api/faculty/courses/:courseId/attendance-roster
 * Get students enrolled in a specific course for marking attendance
 */
router.get("/courses/:courseId/attendance-roster", requirePermission(PERMISSIONS.ATTENDANCE_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;
    const facultyId = req.user!.userId;

    // Verify course belongs to this faculty
    const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.facultyId, facultyId)));
    if (!course) {
      res.status(403).json({ error: "Access denied or course not found" });
      return;
    }

    const roster = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        studentAvatar: users.avatarUrl,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, 'enrolled')));

    res.json(roster);
  } catch (error) {
    console.error("Error fetching roster:", error);
    res.status(500).json({ error: "Failed to load course roster" });
  }
});

/**
 * POST /api/faculty/courses/:courseId/attendance
 * Submit bulk attendance for a date
 */
router.post("/courses/:courseId/attendance", requirePermission(PERMISSIONS.ATTENDANCE_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;
    const facultyId = req.user!.userId;
    const { date, records } = req.body; 
    // records: Array of { studentId, status }

    if (!date || !records || !Array.isArray(records)) {
      res.status(400).json({ error: "Invalid data format" });
      return;
    }

    // Verify course belongs to faculty
    const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.facultyId, facultyId)));
    if (!course) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const rec of records) {
        // Upsert logic for attendance
        // Drizzle doesn't have a simple upsert by multiple columns unless there's a composite unique constraint.
        // So we delete existing record for student, course, date and then insert.
        await tx.delete(attendance).where(
          and(
            eq(attendance.courseId, courseId),
            eq(attendance.studentId, rec.studentId),
            eq(attendance.date, date)
          )
        );

        await tx.insert(attendance).values({
          courseId,
          studentId: rec.studentId,
          date,
          status: rec.status,
          markedBy: facultyId,
        });
      }
    });

    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance" });
  }
});

export default router;
