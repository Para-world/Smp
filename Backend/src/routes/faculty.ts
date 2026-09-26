import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  users,
  courses,
  enrollments,
} from "../db/schema.js";
import { eq, count, and } from "drizzle-orm";
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

export default router;
