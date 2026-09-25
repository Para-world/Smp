import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "../db/index.js";
import {
  users,
  studentProfiles,
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
import { z } from "zod";

// ─── Avatar upload config ────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "avatars");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req: AuthRequest, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `avatar-${req.user!.userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WebP are allowed."));
    }
  },
});

// ─── Validation schemas ──────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s()-]{7,20}$/, "Invalid phone format")
    .optional()
    .nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  emergencyContactName: z.string().max(255).optional().nullable(),
  emergencyContactPhone: z
    .string()
    .regex(/^[+]?[\d\s()-]{7,20}$/, "Invalid phone format")
    .optional()
    .nullable(),
});

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

// ─── GET /api/student/courses ────────────────────────────────────────────────
// Returns all courses enrolled by the authenticated student.

router.get(
  "/courses",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const enrolledCourses = await db
        .select({
          id: courses.id,
          code: courses.code,
          title: courses.title,
          description: courses.description,
          credits: courses.credits,
          schedule: courses.schedule,
          location: courses.location,
          status: enrollments.status,
          enrolledAt: enrollments.enrolledAt,
          faculty: {
            id: users.id,
            name: users.name,
            email: users.email,
            avatarUrl: users.avatarUrl,
          },
          semester: {
            id: semesters.id,
            name: semesters.name,
            academicYear: sql<string>`concat(extract(year from ${semesters.startDate}), '-', extract(year from ${semesters.endDate}))`,
          },
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .leftJoin(users, eq(courses.facultyId, users.id))
        .leftJoin(semesters, eq(courses.semesterId, semesters.id))
        .where(eq(enrollments.studentId, userId));

      res.json({ courses: enrolledCourses });
    } catch (error) {
      console.error("Fetch student courses error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/student/courses/:courseId ──────────────────────────────────────
// Returns detailed info for a specific course, but ONLY if the student is enrolled.

router.get(
  "/courses/:courseId",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      // Check enrollment
      const [enrollment] = await db
        .select({
          status: enrollments.status,
          enrolledAt: enrollments.enrolledAt,
        })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, userId),
            eq(enrollments.courseId, courseId)
          )
        )
        .limit(1);

      if (!enrollment) {
        res.status(403).json({ error: "You are not enrolled in this course." });
        return;
      }

      // Fetch course details
      const [course] = await db
        .select({
          id: courses.id,
          code: courses.code,
          title: courses.title,
          description: courses.description,
          credits: courses.credits,
          schedule: courses.schedule,
          location: courses.location,
          faculty: {
            id: users.id,
            name: users.name,
            email: users.email,
            avatarUrl: users.avatarUrl,
          },
          department: {
            name: departments.name,
          },
          semester: {
            id: semesters.id,
            name: semesters.name,
            academicYear: sql<string>`concat(extract(year from ${semesters.startDate}), '-', extract(year from ${semesters.endDate}))`,
          }
        })
        .from(courses)
        .leftJoin(users, eq(courses.facultyId, users.id))
        .leftJoin(departments, eq(courses.departmentId, departments.id))
        .leftJoin(semesters, eq(courses.semesterId, semesters.id))
        .where(eq(courses.id, courseId))
        .limit(1);

      if (!course) {
         res.status(404).json({ error: "Course not found" });
         return;
      }

      // Fetch assignments for this course (only published ones)
      const courseAssignments = await db
        .select({
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          type: assignments.type,
          maxScore: assignments.maxScore,
          weight: assignments.weight,
          dueDate: assignments.dueDate,
        })
        .from(assignments)
        .where(
          and(
            eq(assignments.courseId, courseId),
            eq(assignments.isPublished, true)
          )
        )
        .orderBy(desc(assignments.dueDate));
        
      res.json({ 
        course: {
            ...course,
            enrollmentStatus: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
        },
        assignments: courseAssignments
      });
    } catch (error) {
      console.error("Fetch course details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;


// ─── GET /api/student/profile ────────────────────────────────────────────────
// Returns the authenticated student's full profile.

router.get(
  "/profile",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Get the user record
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      // Get or create the student profile
      let [profile] = await db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        // Auto-create profile row for existing students
        const [created] = await db
          .insert(studentProfiles)
          .values({ userId })
          .returning();
        profile = created;
      }

      // Generate a stable student ID
      const studentId = `BCA${new Date(user.createdAt).getFullYear()}${user.id.substring(0, 4).toUpperCase()}`;

      // Get active semester
      const [activeSemester] = await db
        .select()
        .from(semesters)
        .where(eq(semesters.status, "active"))
        .limit(1);

      res.json({
        student: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          studentId,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postalCode: profile.postalCode,
          program: profile.program,
          department: profile.department,
          semester: profile.semester ?? (activeSemester?.name || null),
          academicYear:
            profile.academicYear ??
            (activeSemester
              ? `${new Date(activeSemester.startDate).getFullYear()}–${new Date(activeSemester.endDate).getFullYear()}`
              : null),
          enrollmentDate: profile.enrollmentDate ?? user.createdAt,
          status: profile.status,
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone: profile.emergencyContactPhone,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Student profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── PATCH /api/student/profile ──────────────────────────────────────────────
// Updates only the editable fields of the student's profile.

router.patch(
  "/profile",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Validate input
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        });
        return;
      }

      const data = parsed.data;

      // Update the users table for name and phone
      if (data.name !== undefined || data.phone !== undefined) {
        const userUpdate: Record<string, unknown> = { updatedAt: new Date() };
        if (data.name !== undefined) userUpdate.name = data.name;
        if (data.phone !== undefined) userUpdate.phone = data.phone;
        await db.update(users).set(userUpdate).where(eq(users.id, userId));
      }

      // Ensure student profile exists
      let [profile] = await db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, userId))
        .limit(1);

      const profileUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (data.dateOfBirth !== undefined) profileUpdate.dateOfBirth = data.dateOfBirth;
      if (data.gender !== undefined) profileUpdate.gender = data.gender;
      if (data.address !== undefined) profileUpdate.address = data.address;
      if (data.city !== undefined) profileUpdate.city = data.city;
      if (data.state !== undefined) profileUpdate.state = data.state;
      if (data.postalCode !== undefined) profileUpdate.postalCode = data.postalCode;
      if (data.emergencyContactName !== undefined)
        profileUpdate.emergencyContactName = data.emergencyContactName;
      if (data.emergencyContactPhone !== undefined)
        profileUpdate.emergencyContactPhone = data.emergencyContactPhone;

      if (profile) {
        await db
          .update(studentProfiles)
          .set(profileUpdate)
          .where(eq(studentProfiles.userId, userId));
      } else {
        await db.insert(studentProfiles).values({
          userId,
          ...profileUpdate,
        });
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── POST /api/student/profile/avatar ────────────────────────────────────────
// Uploads or replaces the student's profile photo.

router.post(
  "/profile/avatar",
  requireAuth,
  requireRole("student"),
  (req: AuthRequest, res: Response, next) => {
    avatarUpload.single("avatar")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: "File size exceeds 2MB limit" });
            return;
          }
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(400).json({ error: err.message || "Upload failed" });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Build the public URL path
      const avatarUrl = `/uploads/avatars/${file.filename}`;

      // Delete old avatar file if it exists
      const [existingUser] = await db
        .select({ avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (existingUser?.avatarUrl?.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "..", existingUser.avatarUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update the user's avatar URL
      await db
        .update(users)
        .set({ avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({
        message: "Profile photo updated successfully",
        avatarUrl,
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
