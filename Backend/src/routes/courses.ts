import { Router, Response } from "express";
import { db } from "../db/index.js";
import { courses, departments, semesters, enrollments, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, requireAuth, requireRole } from "../utils/middleware.js";

const router = Router();

// ─── Validation ──────────────────────────────────────────────────────────────

const createCourseSchema = z.object({
  title: z.string().min(2).max(255),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  credits: z.number().int().min(1).max(12).default(3),
  departmentId: z.string().uuid(),
  semesterId: z.string().uuid(),
  facultyId: z.string().uuid().optional(),
  maxCapacity: z.number().int().min(1).default(30),
  schedule: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
});

// ─── GET /api/courses — List courses ─────────────────────────────────────────

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        code: courses.code,
        description: courses.description,
        credits: courses.credits,
        maxCapacity: courses.maxCapacity,
        schedule: courses.schedule,
        location: courses.location,
        isActive: courses.isActive,
        departmentId: courses.departmentId,
        semesterId: courses.semesterId,
        facultyId: courses.facultyId,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(eq(courses.isActive, true));

    res.json({ courses: allCourses, count: allCourses.length });
  } catch (error) {
    console.error("List courses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/courses/:id — Get course details ──────────────────────────────

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    res.json({ course });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/courses — Create course (admin/faculty) ──────────────────────

router.post("/", requireAuth, requireRole("admin", "dean", "registrar"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = createCourseSchema.parse(req.body);

    const [newCourse] = await db
      .insert(courses)
      .values(body)
      .returning();

    res.status(201).json({ course: newCourse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Create course error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/courses/:id/enroll — Enroll student ──────────────────────────

router.post("/:id/enroll", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const studentId = req.user!.userId;

    // Check if already enrolled
    const existing = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.status, "enrolled")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Already enrolled in this course" });
      return;
    }

    const [enrollment] = await db
      .insert(enrollments)
      .values({ studentId, courseId })
      .returning();

    res.status(201).json({ enrollment });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
