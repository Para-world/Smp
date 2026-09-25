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
  submissions,
  classSchedules,
} from "../db/schema.js";
import { eq, and, desc, gte, lte, sql, count, avg, inArray } from "drizzle-orm";
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

      // ── 7. Upcoming classes (from classSchedules) ─────────────
      const today = new Date();
      const currentDay = today.getDay(); // 0-6

      let upcomingClasses: Array<any> = [];
      if (courseIds.length > 0) {
        const todaySchedules = await db
          .select({
            id: classSchedules.id,
            courseId: classSchedules.courseId,
            courseTitle: courses.title,
            courseCode: courses.code,
            instructorName: users.name,
            startTime: classSchedules.startTime,
            endTime: classSchedules.endTime,
            room: classSchedules.room,
            building: classSchedules.building,
            isOnline: classSchedules.isOnline,
          })
          .from(classSchedules)
          .innerJoin(courses, eq(classSchedules.courseId, courses.id))
          .leftJoin(users, eq(classSchedules.instructorId, users.id))
          .where(
            and(
              inArray(classSchedules.courseId, courseIds),
              eq(classSchedules.dayOfWeek, currentDay)
            )
          )
          .orderBy(classSchedules.startTime)
          .limit(6);

        upcomingClasses = todaySchedules.map((sch) => {
          return {
            id: sch.id,
            courseId: sch.courseId,
            courseTitle: sch.courseTitle,
            courseCode: sch.courseCode,
            schedule: `${sch.startTime} - ${sch.endTime}`,
            location: sch.room || "TBA",
            faculty: sch.instructorName || null,
          };
        });
      }

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
      const courseId = req.params.courseId as string;

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

// ─── GET /api/student/attendance ─────────────────────────────────────────────
// Returns overall attendance summary and course-wise breakdown.

router.get(
  "/attendance",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // 1. Get all enrollments for this student
      const studentCourses = await db
        .select({
          courseId: courses.id,
          code: courses.code,
          title: courses.title,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, userId));

      const courseIds = studentCourses.map(c => c.courseId);

      if (courseIds.length === 0) {
        res.json({
          summary: { percentage: 0, present: 0, absent: 0, late: 0, excused: 0, total: 0 },
          courses: []
        });
        return;
      }

      // 2. Fetch all attendance records for these courses
      const records = await db
        .select({
          courseId: attendance.courseId,
          status: attendance.status,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.studentId, userId)
          )
        );

      // 3. Aggregate data
      let totalPresent = 0, totalAbsent = 0, totalLate = 0, totalExcused = 0, totalClasses = 0;
      
      const courseMap = new Map();
      studentCourses.forEach(c => {
        courseMap.set(c.courseId, {
          courseId: c.courseId,
          code: c.code,
          name: c.title,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          percentage: 0
        });
      });

      records.forEach(r => {
        const c = courseMap.get(r.courseId);
        if (c) {
          c.total++;
          totalClasses++;
          
          if (r.status === 'present') { c.present++; totalPresent++; }
          else if (r.status === 'absent') { c.absent++; totalAbsent++; }
          else if (r.status === 'late') { c.late++; totalLate++; }
          else if (r.status === 'excused') { c.excused++; totalExcused++; }
        }
      });

      // Calculate percentages (assuming late counts as present for percentage, but configurable. Let's count present + late)
      const calculatePercentage = (p: number, l: number, t: number) => t === 0 ? 0 : Number((((p + l) / t) * 100).toFixed(1));

      const overallPercentage = calculatePercentage(totalPresent, totalLate, totalClasses);
      
      const coursesData = Array.from(courseMap.values()).map(c => ({
        ...c,
        percentage: calculatePercentage(c.present, c.late, c.total)
      }));

      res.json({
        summary: {
          percentage: overallPercentage,
          present: totalPresent,
          absent: totalAbsent,
          late: totalLate,
          excused: totalExcused,
          total: totalClasses
        },
        courses: coursesData
      });
    } catch (error) {
      console.error("Fetch attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/student/attendance/records ─────────────────────────────────────
// Detailed history with filters and pagination

router.get(
  "/attendance/records",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId, status, startDate, endDate, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const conditions = [eq(attendance.studentId, userId)];

      if (courseId) conditions.push(eq(attendance.courseId, courseId as string));
      if (status && status !== 'all') conditions.push(eq(attendance.status, status as any));
      if (startDate) conditions.push(gte(attendance.date, startDate as string));
      if (endDate) conditions.push(lte(attendance.date, endDate as string));

      const queryConditions = and(...conditions);

      const records = await db
        .select({
          id: attendance.id,
          date: attendance.date,
          status: attendance.status,
          remarks: attendance.remarks,
          markedAt: attendance.createdAt,
          course: {
            id: courses.id,
            code: courses.code,
            title: courses.title,
          }
        })
        .from(attendance)
        .innerJoin(courses, eq(attendance.courseId, courses.id))
        .where(queryConditions)
        .orderBy(desc(attendance.date), desc(attendance.createdAt))
        .limit(limitNum)
        .offset(offset);

      const [totalCount] = await db
        .select({ count: count() })
        .from(attendance)
        .where(queryConditions);

      res.json({
        records,
        pagination: {
          total: Number(totalCount.count),
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(Number(totalCount.count) / limitNum)
        }
      });
    } catch (error) {
      console.error("Fetch attendance records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/student/attendance/course/:courseId ────────────────────────────
// Detailed course attendance

router.get(
  "/attendance/course/:courseId",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const courseId = req.params.courseId as string;

      // Verify enrollment
      const [enrollment] = await db
        .select({ id: enrollments.id })
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
          faculty: {
            name: users.name,
          }
        })
        .from(courses)
        .leftJoin(users, eq(courses.facultyId, users.id))
        .where(eq(courses.id, courseId))
        .limit(1);

      // Fetch attendance history
      const history = await db
        .select({
          id: attendance.id,
          date: attendance.date,
          status: attendance.status,
          remarks: attendance.remarks,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.studentId, userId),
            eq(attendance.courseId, courseId)
          )
        )
        .orderBy(desc(attendance.date));

      let present = 0, absent = 0, late = 0, excused = 0, total = history.length;
      history.forEach(r => {
        if (r.status === 'present') present++;
        else if (r.status === 'absent') absent++;
        else if (r.status === 'late') late++;
        else if (r.status === 'excused') excused++;
      });

      const percentage = total === 0 ? 0 : Number((((present + late) / total) * 100).toFixed(1));

      res.json({
        course,
        summary: {
          percentage,
          present,
          absent,
          late,
          excused,
          total
        },
        history
      });
    } catch (error) {
      console.error("Fetch course attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


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

// ─── ASSIGNMENTS (STUDENT MODULE) ────────────────────────────────────────────

// 1. Get all assignments for enrolled courses with their status
router.get(
  "/assignments",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // 1. Get all courses the student is enrolled in
      const enrolledCourses = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(eq(enrollments.studentId, userId));

      const courseIds = enrolledCourses.map((e) => e.courseId);

      if (courseIds.length === 0) {
        res.json({ assignments: [], summary: { total: 0, pending: 0, submitted: 0, overdue: 0 } });
        return;
      }

      // 2. Fetch all published assignments for these courses
      const allAssignments = await db
        .select({
          id: assignments.id,
          courseId: assignments.courseId,
          title: assignments.title,
          type: assignments.type,
          dueDate: assignments.dueDate,
          maxScore: assignments.maxScore,
          courseCode: courses.code,
          courseTitle: courses.title,
        })
        .from(assignments)
        .innerJoin(courses, eq(assignments.courseId, courses.id))
        .where(
          and(
            eq(assignments.isPublished, true),
            sql`${assignments.courseId} = ANY(ARRAY[${sql.join(courseIds, sql`, `)}]::uuid[])`
          )
        );

      // 3. Fetch submissions for this student
      const allSubmissions = await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .where(eq(submissions.studentId, userId));

      // 4. Fetch grades for this student
      const allGrades = await db
        .select({
          assignmentId: grades.assignmentId,
          score: grades.score,
        })
        .from(grades)
        .where(eq(grades.studentId, userId));

      const submissionMap = new Map(allSubmissions.map((s) => [s.assignmentId, s]));
      const gradeMap = new Map(allGrades.map((g) => [g.assignmentId, g]));

      const now = new Date();
      let pendingCount = 0;
      let submittedCount = 0;
      let overdueCount = 0;

      const formattedAssignments = allAssignments.map((a) => {
        const submission = submissionMap.get(a.id);
        const grade = gradeMap.get(a.id);

        let status = "pending";
        if (grade) {
          status = "graded";
          submittedCount++;
        } else if (submission) {
          status = "submitted";
          submittedCount++;
        } else if (a.dueDate && new Date(a.dueDate) < now) {
          status = "overdue";
          overdueCount++;
        } else {
          status = "pending";
          pendingCount++;
        }

        return {
          id: a.id,
          courseId: a.courseId,
          courseCode: a.courseCode,
          courseTitle: a.courseTitle,
          title: a.title,
          type: a.type,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          status,
          score: grade?.score || null,
          submittedAt: submission?.submittedAt || null,
        };
      });

      // Sort by due date (closest first)
      formattedAssignments.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      res.json({
        assignments: formattedAssignments,
        summary: {
          total: formattedAssignments.length,
          pending: pendingCount,
          submitted: submittedCount,
          overdue: overdueCount,
        },
      });
    } catch (error) {
      console.error("Fetch student assignments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 2. Get details for a specific assignment
router.get(
  "/assignments/:assignmentId",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const assignmentId = req.params.assignmentId as string;

      // 1. Fetch assignment details
      const [assignment] = await db
        .select({
          id: assignments.id,
          courseId: assignments.courseId,
          title: assignments.title,
          description: assignments.description,
          type: assignments.type,
          dueDate: assignments.dueDate,
          maxScore: assignments.maxScore,
          weight: assignments.weight,
          courseCode: courses.code,
          courseTitle: courses.title,
        })
        .from(assignments)
        .innerJoin(courses, eq(assignments.courseId, courses.id))
        .where(eq(assignments.id, assignmentId))
        .limit(1);

      if (!assignment) {
        res.status(404).json({ error: "Assignment not found." });
        return;
      }

      // 2. Check if student is enrolled in the course
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, userId),
            eq(enrollments.courseId, assignment.courseId)
          )
        )
        .limit(1);

      if (!enrollment) {
        res.status(403).json({ error: "You are not enrolled in this course." });
        return;
      }

      // 3. Fetch submission details
      const [submission] = await db
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.studentId, userId),
            eq(submissions.assignmentId, assignmentId)
          )
        )
        .limit(1);

      // 4. Fetch grade details
      const [grade] = await db
        .select()
        .from(grades)
        .where(
          and(
            eq(grades.studentId, userId),
            eq(grades.assignmentId, assignmentId)
          )
        )
        .limit(1);

      let status = "pending";
      if (grade) {
        status = "graded";
      } else if (submission) {
        status = "submitted";
      } else if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
        status = "overdue";
      }

      res.json({
        assignment: { ...assignment, status },
        submission: submission || null,
        grade: grade || null,
      });
    } catch (error) {
      console.error("Fetch assignment details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 3. Submit an assignment
router.post(
  "/assignments/:assignmentId/submit",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const assignmentId = req.params.assignmentId as string;
      const { content, fileUrl } = req.body;

      // Check if assignment exists and is published
      const [assignment] = await db
        .select({ id: assignments.id, courseId: assignments.courseId, dueDate: assignments.dueDate })
        .from(assignments)
        .where(and(eq(assignments.id, assignmentId), eq(assignments.isPublished, true)))
        .limit(1);

      if (!assignment) {
        res.status(404).json({ error: "Assignment not found." });
        return;
      }

      // Check enrollment
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, userId),
            eq(enrollments.courseId, assignment.courseId)
          )
        )
        .limit(1);

      if (!enrollment) {
        res.status(403).json({ error: "You are not enrolled in this course." });
        return;
      }

      // Check if already graded
      const [grade] = await db
        .select({ id: grades.id })
        .from(grades)
        .where(and(eq(grades.studentId, userId), eq(grades.assignmentId, assignmentId)))
        .limit(1);
        
      if (grade) {
        res.status(400).json({ error: "This assignment has already been graded and cannot be resubmitted." });
        return;
      }

      // Check for existing submission
      const [existingSubmission] = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(and(eq(submissions.studentId, userId), eq(submissions.assignmentId, assignmentId)))
        .limit(1);

      const status = assignment.dueDate && new Date() > new Date(assignment.dueDate) ? "late" : "submitted";

      if (existingSubmission) {
        // Update
        const [updatedSubmission] = await db
          .update(submissions)
          .set({
            content,
            fileUrl,
            status,
            submittedAt: new Date(),
          })
          .where(eq(submissions.id, existingSubmission.id))
          .returning();
          
        res.json({ message: "Assignment resubmitted successfully.", submission: updatedSubmission });
        return;
      } else {
        // Insert
        const [newSubmission] = await db
          .insert(submissions)
          .values({
            studentId: userId,
            assignmentId,
            content,
            fileUrl,
            status,
          })
          .returning();
          
        res.json({ message: "Assignment submitted successfully.", submission: newSubmission });
        return;
      }
    } catch (error) {
      console.error("Submit assignment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/student/timetable ──────────────────────────────────────────────
// Fetch weekly schedule for enrolled courses
router.get(
  "/timetable",
  requireAuth,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.query;

      // 1. Get all courses student is enrolled in
      const studentEnrollments = await db
        .select({
          courseId: enrollments.courseId,
        })
        .from(enrollments)
        .where(eq(enrollments.studentId, userId));

      const courseIds = studentEnrollments.map((e) => e.courseId);

      if (courseIds.length === 0) {
        res.json([]);
        return;
      }

      // Filter by requested courseId if it exists, otherwise use all enrolled
      let queryCourseIds = courseIds;
      if (courseId && typeof courseId === "string") {
        if (!courseIds.includes(courseId)) {
          res.status(403).json({ error: "You are not enrolled in this course." });
          return;
        }
        queryCourseIds = [courseId];
      }

      // 2. Fetch class schedules for those courses
      const schedules = await db
        .select({
          id: classSchedules.id,
          courseId: classSchedules.courseId,
          courseTitle: courses.title,
          courseCode: courses.code,
          instructorName: users.name,
          dayOfWeek: classSchedules.dayOfWeek,
          startTime: classSchedules.startTime,
          endTime: classSchedules.endTime,
          room: classSchedules.room,
          building: classSchedules.building,
          classType: classSchedules.classType,
          isOnline: classSchedules.isOnline,
          meetingUrl: classSchedules.meetingUrl,
        })
        .from(classSchedules)
        .innerJoin(courses, eq(classSchedules.courseId, courses.id))
        .leftJoin(users, eq(classSchedules.instructorId, users.id))
        .where(inArray(classSchedules.courseId, queryCourseIds));

      res.json(schedules);
    } catch (error) {
      console.error("Fetch timetable error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
