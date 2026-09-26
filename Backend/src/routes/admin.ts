import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  users,
  studentProfiles,
  courses,
  enrollments,
  attendance,
  exams,
  assignments,
  grades,
} from "../db/schema.js";
import { eq, count, and, gt, desc, ilike, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth, AuthRequest, requirePermission } from "../utils/middleware.js";
import { PERMISSIONS } from "../utils/permissions.js";

const router = Router();

// Apply auth middleware to all admin routes
router.use(requireAuth);

/**
 * GET /api/admin/dashboard
 * Retrieves institutional statistics for the admin dashboard
 */
router.get("/dashboard", requirePermission(PERMISSIONS.REPORTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Student Statistics
    const [totalStudentsRes] = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
    const [activeStudentsRes] = await db.select({ count: count() }).from(users).where(and(eq(users.role, "student"), eq(users.isActive, true)));
    
    // 2. Faculty Statistics
    const [totalFacultyRes] = await db.select({ count: count() }).from(users).where(eq(users.role, "faculty"));
    const [activeFacultyRes] = await db.select({ count: count() }).from(users).where(and(eq(users.role, "faculty"), eq(users.isActive, true)));
    
    // 3. Course Statistics
    const [totalCoursesRes] = await db.select({ count: count() }).from(courses);
    const [activeCoursesRes] = await db.select({ count: count() }).from(courses).where(eq(courses.isActive, true));

    // 4. Academic Statistics
    
    // Average Attendance
    const totalAttendance = await db.select({ count: count() }).from(attendance);
    const presentAttendance = await db.select({ count: count() }).from(attendance).where(eq(attendance.status, "present"));
    const avgAttendance = totalAttendance[0].count > 0 
      ? Math.round((presentAttendance[0].count / totalAttendance[0].count) * 100) 
      : 0;

    // Upcoming Exams (date > now)
    const now = new Date();
    const [upcomingExamsRes] = await db.select({ count: count() }).from(exams).where(gt(exams.date, now));

    // Pending Assignments (dueDate > now)
    const [pendingAssignmentsRes] = await db.select({ count: count() }).from(assignments).where(gt(assignments.dueDate, now));

    // Published Results
    const [publishedResultsRes] = await db.select({ count: count() }).from(grades); // Using grades for results proxy

    res.json({
      students: {
        total: totalStudentsRes.count,
        active: activeStudentsRes.count,
        new: 0, // Placeholder, can be calculated based on createdAt in last X days
        inactive: totalStudentsRes.count - activeStudentsRes.count
      },
      faculty: {
        total: totalFacultyRes.count,
        active: activeFacultyRes.count
      },
      courses: {
        total: totalCoursesRes.count,
        active: activeCoursesRes.count
      },
      academic: {
        averageAttendance: avgAttendance,
        upcomingExams: upcomingExamsRes.count,
        pendingAssignments: pendingAssignmentsRes.count,
        publishedResults: publishedResultsRes.count
      }
    });

  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
});

/**
 * GET /api/admin/students
 * List students with pagination, search, filter
 */
router.get("/students", requirePermission(PERMISSIONS.STUDENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const offset = (page - 1) * limit;

    let conditions = [eq(users.role, "student")];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(users.isActive, status === 'active'));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [totalCountRes] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const total = totalCountRes.count;

    // Get paginated data
    const studentsList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        avatarUrl: users.avatarUrl,
        program: studentProfiles.program,
        semester: studentProfiles.semester,
        status: studentProfiles.status,
        enrollmentDate: studentProfiles.enrollmentDate,
      })
      .from(users)
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    res.json({
      data: studentsList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to load students" });
  }
});

/**
 * GET /api/admin/students/:studentId
 * Get a specific student profile
 */
router.get("/students/:studentId", requirePermission(PERMISSIONS.STUDENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const [user] = await db.select().from(users).where(and(eq(users.id, studentId), eq(users.role, "student")));
    
    if (!user) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, studentId));

    res.json({ user, profile });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Failed to load student details" });
  }
});

/**
 * POST /api/admin/students
 * Create a new student profile
 */
router.post("/students", requirePermission(PERMISSIONS.STUDENTS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      address, program, department, semester, academicYear, status
    } = req.body;

    // Validate required
    if (!firstName || !lastName || !email) {
      res.status(400).json({ error: "First name, last name, and email are required" });
      return;
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const defaultPassword = "ChangeMe123!";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({
        email,
        name: `${firstName} ${lastName}`,
        passwordHash,
        role: "student",
        phone,
        isActive: status !== "inactive",
      }).returning();

      const [newProfile] = await tx.insert(studentProfiles).values({
        userId: newUser.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        gender: gender || null,
        address: address || null,
        program: program || null,
        department: department || null,
        semester: semester ? parseInt(semester) : null,
        academicYear: academicYear || null,
        status: status === "inactive" ? "inactive" : "active",
        enrollmentDate: new Date().toISOString(),
      }).returning();

      return { user: newUser, profile: newProfile };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

/**
 * GET /api/admin/instructors
 * List faculty with pagination, search, filter
 */
router.get("/instructors", requirePermission(PERMISSIONS.FACULTY_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const offset = (page - 1) * limit;

    let conditions = [eq(users.role, "faculty")];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(users.isActive, status === 'active'));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [totalCountRes] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const total = totalCountRes.count;

    // Get paginated data
    const facultyList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
      
    // Ideally, join with faculty profiles or departments. For now, returning users.

    res.json({
      data: facultyList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ error: "Failed to load instructors" });
  }
});

/**
 * GET /api/admin/instructors/:instructorId
 */
router.get("/instructors/:instructorId", requirePermission(PERMISSIONS.FACULTY_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instructorId } = req.params;

    const [user] = await db.select().from(users).where(and(eq(users.id, instructorId), eq(users.role, "faculty")));
    
    if (!user) {
      res.status(404).json({ error: "Instructor not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching instructor details:", error);
    res.status(500).json({ error: "Failed to load instructor details" });
  }
});

/**
 * GET /api/admin/courses
 * List courses with pagination and search
 */
router.get("/courses", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const offset = (page - 1) * limit;

    let conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.code, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountRes] = await db
      .select({ count: count() })
      .from(courses)
      .where(whereClause);

    const total = totalCountRes.count;

    const coursesList = await db
      .select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(courses.createdAt));

    res.json({
      data: coursesList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

/**
 * GET /api/admin/courses/:courseId
 */
router.get("/courses/:courseId", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    res.json({ course });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Failed to load course details" });
  }
});

/**
 * GET /api/admin/enrollments
 */
router.get("/enrollments", requirePermission(PERMISSIONS.ENROLLMENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const offset = (page - 1) * limit;

    const [totalCountRes] = await db.select({ count: count() }).from(enrollments);
    const total = totalCountRes.count;

    const enrollmentsList = await db
      .select({
        id: enrollments.id,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        courseId: courses.id,
        courseTitle: courses.title,
        courseCode: courses.code,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(enrollments.enrolledAt));

    res.json({
      data: enrollmentsList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to load enrollments" });
  }
});

export default router;
