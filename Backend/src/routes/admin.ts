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
  studentResults,
  semesters,
  resultAuditLogs,
  classSchedules,
  announcements,
  notifications,
  submissions,
  systemAuditLogs,
  systemSettings,
  departments,
  programs
} from "../db/schema.js";
import { eq, count, and, gt, desc, ilike, or, sql, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth, AuthRequest, requirePermission } from "../utils/middleware.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { sendNotificationEmail } from "../utils/mailer.js";
import { jsonToCsv } from "../utils/csv.js";
import { logAudit } from "../utils/auditLogger.js";

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

    // Recharts Data: Enrollment Trend (Group by Month)
    const enrollmentTrend = await db.select({
      name: sql<string>`to_char(${users.createdAt}, 'Mon')`,
      students: count()
    })
    .from(users)
    .where(eq(users.role, "student"))
    .groupBy(sql`to_char(${users.createdAt}, 'Mon')`)
    .orderBy(sql`min(${users.createdAt})`);

    // Recharts Data: Attendance Overview (Group by Day)
    const attendanceTrend = await db.select({
      name: sql<string>`to_char(${attendance.date}, 'Dy')`,
      attendance: sql<number>`round((count(case when ${attendance.status} = 'present' then 1 end) * 100.0) / nullif(count(*), 0))`
    })
    .from(attendance)
    .groupBy(sql`to_char(${attendance.date}, 'Dy')`, attendance.date)
    .orderBy(desc(attendance.date))
    .limit(7);

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
      },
      analytics: {
        enrollmentTrend: enrollmentTrend.length > 0 ? enrollmentTrend : [
          { name: 'Jan', students: 0 },
          { name: 'Feb', students: 0 }
        ],
        attendanceTrend: attendanceTrend.length > 0 ? attendanceTrend.reverse() : [
          { name: 'Mon', attendance: 0 },
          { name: 'Tue', attendance: 0 }
        ]
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

    let conditions: any[] = [eq(users.role, "student")];

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
        programId: studentProfiles.programId,
        semesterId: studentProfiles.semesterId,
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
    const studentId = req.params.studentId as string;

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
        programId: program || null,
        departmentId: department || null,
        semesterId: semester || null,
        academicYear: academicYear || null,
        status: status === "inactive" ? "inactive" : "active",
        enrollmentDate: new Date().toISOString(),
      }).returning();

      return { user: newUser, profile: newProfile };
    });
    await logAudit(
      req.user!.userId,
      "CREATE",
      "STUDENT",
      result.user.id,
      null,
      { email: result.user.email, name: result.user.name },
      req.ip,
      req.headers["user-agent"]
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

/**
 * POST /api/admin/students/bulk-import
 * Bulk import students
 */
router.post("/students/bulk-import", requirePermission(PERMISSIONS.STUDENTS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: "No students provided for import" });
      return;
    }

    const defaultPassword = "ChangeMe123!";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const results = { successful: 0, failed: 0, errors: [] as any[] };

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      try {
        if (!row.firstName || !row.lastName || !row.email) {
          throw new Error("Missing required fields (firstName, lastName, email)");
        }

        const existingUser = await db.select().from(users).where(eq(users.email, row.email));
        if (existingUser.length > 0) {
          throw new Error("Email already in use");
        }

        await db.transaction(async (tx) => {
          const [newUser] = await tx.insert(users).values({
            email: row.email,
            name: `${row.firstName} ${row.lastName}`,
            passwordHash,
            role: "student",
            isActive: true,
          }).returning();

          await tx.insert(studentProfiles).values({
            userId: newUser.id,
            programId: row.program || null,
            semesterId: row.semester || null,
            departmentId: row.department || null,
            academicYear: row.academicYear || null,
            status: "active",
            enrollmentDate: new Date().toISOString(),
          });
        });

        results.successful++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row: i + 1, email: row.email, error: err.message });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error in bulk import:", error);
    res.status(500).json({ error: "Failed to process bulk import" });
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

    let conditions: any[] = [eq(users.role, "faculty")];

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
    const instructorId = req.params.instructorId as string;

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

    let conditions: any[] = [];

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
    const courseId = req.params.courseId as string;

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

/**
 * POST /api/admin/enrollments
 * Enroll student in a course
 */
router.post("/enrollments", requirePermission(PERMISSIONS.ENROLLMENTS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      res.status(400).json({ error: "Student ID and Course ID are required" });
      return;
    }

    // Validate student exists
    const [student] = await db.select().from(users).where(and(eq(users.id, studentId), eq(users.role, "student")));
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Validate course exists
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Prevent duplicate enrollment
    const [existing] = await db.select().from(enrollments).where(and(
      eq(enrollments.studentId, studentId),
      eq(enrollments.courseId, courseId)
    ));

    if (existing) {
      res.status(400).json({ error: "Student is already enrolled in this course" });
      return;
    }

    // Create enrollment
    const [newEnrollment] = await db.insert(enrollments).values({
      studentId,
      courseId,
      status: "enrolled",
    }).returning();

    res.status(201).json({ message: "Student enrolled successfully", enrollment: newEnrollment });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    res.status(500).json({ error: "Failed to enroll student" });
  }
});

/**
 * DELETE /api/admin/enrollments/:id
 * Remove an enrollment
 */
router.delete("/enrollments/:id", requirePermission(PERMISSIONS.ENROLLMENTS_DELETE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [deleted] = await db.delete(enrollments).where(eq(enrollments.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Enrollment not found" });
      return;
    }

    res.json({ message: "Enrollment removed successfully" });
  } catch (error) {
    console.error("Error removing enrollment:", error);
    res.status(500).json({ error: "Failed to remove enrollment" });
  }
});

/**
 * GET /api/admin/assignments
 * List all assignments
 */
router.get("/assignments", requirePermission(PERMISSIONS.ASSIGNMENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allAssignments = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        courseId: courses.id,
        courseTitle: courses.title,
        courseCode: courses.code,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .orderBy(desc(assignments.createdAt));

    res.json(allAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to load assignments" });
  }
});

/**
 * GET /api/admin/attendance/summary
 * Get attendance statistics and analytics
 */
router.get("/attendance/summary", requirePermission(PERMISSIONS.ATTENDANCE_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;

    // Total records
    const [totalRecordsRes] = await db.select({ count: count() }).from(attendance);
    const totalRecords = totalRecordsRes.count;

    // Total present
    const [presentRecordsRes] = await db.select({ count: count() }).from(attendance).where(eq(attendance.status, 'present'));
    const presentRecords = presentRecordsRes.count;

    const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    // Students below threshold logic
    // This is complex in a single drizzle query without raw SQL, so doing a simple aggregate using raw if needed or simple group by
    // For now, returning mock/simplified for below threshold count
    const studentsBelowThreshold = 0; // Requires complex group by (present / total per student)

    // Last 5 days trend
    // Mocking for now as drizzle date grouping is dialect specific
    const trend = [
      { name: 'Mon', attendance: 92 },
      { name: 'Tue', attendance: 88 },
      { name: 'Wed', attendance: 95 },
      { name: 'Thu', attendance: 90 },
      { name: 'Fri', attendance: Math.max(averageAttendance, 50) }, // Use real stat for today
    ];

    res.json({
      averageAttendance,
      studentsBelowThreshold,
      trend,
      totalRecords
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ error: "Failed to load attendance summary" });
  }
});

/**
 * GET /api/admin/attendance
 * List attendance records with filtering
 */
router.get("/attendance", requirePermission(PERMISSIONS.ATTENDANCE_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const courseId = req.query.courseId as string;
    const studentId = req.query.studentId as string;
    const dateStr = req.query.date as string;

    const offset = (page - 1) * limit;

    let conditions = [];

    if (courseId) conditions.push(eq(attendance.courseId, courseId));
    if (studentId) conditions.push(eq(attendance.studentId, studentId));
    if (dateStr) conditions.push(eq(attendance.date, dateStr)); // expects YYYY-MM-DD

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountRes] = await db.select({ count: count() }).from(attendance).where(whereClause);
    const total = totalCountRes.count;

    const attendanceList = await db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        remarks: attendance.remarks,
        studentName: users.name,
        studentEmail: users.email,
        courseTitle: courses.title,
        courseCode: courses.code,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.studentId, users.id))
      .innerJoin(courses, eq(attendance.courseId, courses.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(attendance.date));

    res.json({
      data: attendanceList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to load attendance" });
  }
});

/**
 * GET /api/admin/exams
 * Fetch all exams with their course details
 */
router.get("/exams", requirePermission(PERMISSIONS.EXAMS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examList = await db
      .select({
        id: exams.id,
        title: exams.title,
        date: exams.date,
        startTime: exams.startTime,
        endTime: exams.endTime,
        durationMinutes: exams.durationMinutes,
        venue: exams.venue,
        status: exams.status,
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
      })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .orderBy(desc(exams.date));

    res.json(examList);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ error: "Failed to load exams" });
  }
});

/**
 * POST /api/admin/exams
 * Create a new exam
 */
router.post("/exams", requirePermission(PERMISSIONS.EXAMS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      courseId, title, description, examType, date, 
      startTime, endTime, durationMinutes, venue, instructions 
    } = req.body;

    if (!courseId || !title || !date || !startTime || !endTime || !durationMinutes) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const examDate = new Date(date);

    // Fetch the course to get the facultyId for instructor conflict checking
    const [targetCourse] = await db.select({ facultyId: courses.facultyId }).from(courses).where(eq(courses.id, courseId));
    
    // Conflict Validation
    const conflictingExams = await db
      .select({
        id: exams.id,
        courseId: exams.courseId,
        venue: exams.venue,
        facultyId: courses.facultyId
      })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .where(
        and(
          eq(sql`DATE(${exams.date})`, sql`DATE(${examDate.toISOString()})`),
          // Simple time overlap check (assumes HH:mm format)
          or(
            and(lte(exams.startTime, endTime), gte(exams.endTime, startTime))
          )
        )
      );

    for (const conflict of conflictingExams) {
      if (venue && conflict.venue === venue) {
        res.status(409).json({ error: "Venue conflict: Another exam is scheduled in this room at this time." });
        return;
      }
      if (conflict.courseId === courseId) {
        res.status(409).json({ error: "Course conflict: An exam for this course is already scheduled at this time." });
        return;
      }
      if (targetCourse?.facultyId && conflict.facultyId === targetCourse.facultyId) {
        res.status(409).json({ error: "Instructor conflict: The instructor is already invigilating another exam at this time." });
        return;
      }
    }

    const [newExam] = await db.insert(exams).values({
      courseId,
      title,
      description,
      examType: examType || 'MID_TERM',
      date: new Date(date),
      startTime,
      endTime,
      durationMinutes: parseInt(durationMinutes, 10),
      venue,
      instructions,
      status: 'SCHEDULED'
    }).returning();

    res.status(201).json(newExam);
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ error: "Failed to create exam" });
  }
});

/**
 * PUT /api/admin/exams/:id
 * Update an existing exam
 */
router.put("/exams/:id", requirePermission(PERMISSIONS.EXAMS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examId = req.params.id as string;
    const { 
      title, description, examType, date, 
      startTime, endTime, durationMinutes, venue, instructions, status, courseId 
    } = req.body;

    if (date && startTime && endTime) {
      const examDate = new Date(date);
      
      const targetCourseId = courseId || (await db.select({ courseId: exams.courseId }).from(exams).where(eq(exams.id, examId)))[0]?.courseId;
      const targetCourse = targetCourseId ? (await db.select({ facultyId: courses.facultyId }).from(courses).where(eq(courses.id, targetCourseId)))[0] : null;

      const conflictingExams = await db
        .select({
          id: exams.id,
          courseId: exams.courseId,
          venue: exams.venue,
          facultyId: courses.facultyId
        })
        .from(exams)
        .innerJoin(courses, eq(exams.courseId, courses.id))
        .where(
          and(
            eq(sql`DATE(${exams.date})`, sql`DATE(${examDate.toISOString()})`),
            or(
              and(lte(exams.startTime, endTime), gte(exams.endTime, startTime))
            )
          )
        );

      for (const conflict of conflictingExams) {
        if (conflict.id === examId) continue;
        if (venue && conflict.venue === venue) {
          res.status(409).json({ error: "Venue conflict: Another exam is scheduled in this room at this time." });
          return;
        }
        if (targetCourseId && conflict.courseId === targetCourseId) {
          res.status(409).json({ error: "Course conflict: An exam for this course is already scheduled at this time." });
          return;
        }
        if (targetCourse?.facultyId && conflict.facultyId === targetCourse.facultyId) {
          res.status(409).json({ error: "Instructor conflict: The instructor is already invigilating another exam at this time." });
          return;
        }
      }
    }

    const [updatedExam] = await db.update(exams).set({
      title,
      description,
      examType,
      date: date ? new Date(date) : undefined,
      startTime,
      endTime,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      venue,
      instructions,
      status,
      updatedAt: new Date()
    }).where(eq(exams.id, examId)).returning();

    if (!updatedExam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    res.json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ error: "Failed to update exam" });
  }
});

/**
 * GET /api/admin/results
 * Get all results with optional filtering
 */
router.get("/results", requirePermission(PERMISSIONS.RESULTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, semesterId } = req.query;

    const conditions = [];
    if (courseId) conditions.push(eq(studentResults.courseId, courseId as string));
    if (semesterId) conditions.push(eq(studentResults.semesterId, semesterId as string));

    const results = await db
      .select({
        id: studentResults.id,
        courseId: studentResults.courseId,
        semesterId: studentResults.semesterId,
        studentId: studentResults.studentId,
        internalMarks: studentResults.internalMarks,
        externalMarks: studentResults.externalMarks,
        practicalMarks: studentResults.practicalMarks,
        totalMarks: studentResults.totalMarks,
        grade: studentResults.grade,
        gradePoint: studentResults.gradePoint,
        status: studentResults.status,
        studentName: users.name,
        studentEmail: users.email,
        courseCode: courses.code,
        courseTitle: courses.title,
      })
      .from(studentResults)
      .innerJoin(users, eq(studentResults.studentId, users.id))
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .innerJoin(courses, eq(studentResults.courseId, courses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(studentResults.updatedAt));

    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to load results" });
  }
});

/**
 * POST /api/admin/results
 * Create or Update result
 */
router.post("/results", requirePermission(PERMISSIONS.RESULTS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, courseId, semesterId, academicYear, internalMarks, externalMarks, practicalMarks, totalMarks, grade, gradePoint, status } = req.body;
    
    if (!studentId || !courseId || !semesterId) {
      res.status(400).json({ error: "studentId, courseId, semesterId are required" });
      return;
    }

    // Check if exists
    const existing = await db.select().from(studentResults).where(and(
      eq(studentResults.studentId, studentId),
      eq(studentResults.courseId, courseId),
      eq(studentResults.semesterId, semesterId)
    ));

    let result;
    if (existing.length > 0) {
      if (existing[0].status === 'PUBLISHED' && !req.body.reason) {
        res.status(403).json({ error: "Cannot modify a PUBLISHED result without providing a reason." });
        return;
      }
      
      [result] = await db.update(studentResults).set({
        internalMarks: internalMarks !== undefined ? parseInt(internalMarks, 10) : existing[0].internalMarks,
        externalMarks: externalMarks !== undefined ? parseInt(externalMarks, 10) : existing[0].externalMarks,
        practicalMarks: practicalMarks !== undefined ? parseInt(practicalMarks, 10) : existing[0].practicalMarks,
        totalMarks: totalMarks !== undefined ? parseInt(totalMarks, 10) : existing[0].totalMarks,
        grade: grade || existing[0].grade,
        gradePoint: gradePoint !== undefined ? parseInt(gradePoint, 10) : existing[0].gradePoint,
        status: status || existing[0].status,
        updatedAt: new Date()
      }).where(eq(studentResults.id, existing[0].id)).returning();

      await db.insert(resultAuditLogs).values({
        resultId: result.id,
        changedBy: req.user!.userId,
        changeType: "MARKS_CHANGE",
        oldValue: existing[0],
        newValue: result,
        reason: req.body.reason || "Marks updated manually",
      });
    } else {
      [result] = await db.insert(studentResults).values({
        studentId,
        courseId,
        semesterId,
        academicYear,
        internalMarks: internalMarks ? parseInt(internalMarks, 10) : null,
        externalMarks: externalMarks ? parseInt(externalMarks, 10) : null,
        practicalMarks: practicalMarks ? parseInt(practicalMarks, 10) : null,
        totalMarks: totalMarks ? parseInt(totalMarks, 10) : null,
        grade,
        gradePoint: gradePoint ? parseInt(gradePoint, 10) : null,
        status: status || 'DRAFT'
      }).returning();

      await db.insert(resultAuditLogs).values({
        resultId: result.id,
        changedBy: req.user!.userId,
        changeType: "INITIAL_ENTRY",
        oldValue: null,
        newValue: result,
        reason: "Initial result entry",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Failed to save result" });
  }
});

/**
 * PUT /api/admin/results/:id
 * Update result status
 */
router.put("/results/:id", requirePermission(PERMISSIONS.RESULTS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const [existing] = await db.select().from(studentResults).where(eq(studentResults.id, req.params.id as string));
    if (!existing) {
       res.status(404).json({ error: "Not found" });
       return;
    }

    const [result] = await db.update(studentResults).set({
      status,
      updatedAt: new Date(),
      publishedAt: status === 'PUBLISHED' ? new Date() : undefined
    }).where(eq(studentResults.id, req.params.id as string)).returning();
    
    await db.insert(resultAuditLogs).values({
      resultId: result.id,
      changedBy: req.user!.userId,
      changeType: "STATUS_CHANGE",
      oldValue: { status: existing.status },
      newValue: { status: result.status },
      reason: req.body.reason || `Status changed to ${status}`,
    });

    // Send email notification if result just got published
    if (existing.status !== 'PUBLISHED' && status === 'PUBLISHED') {
      const [student] = await db.select({ email: users.email }).from(users).where(eq(users.id, result.studentId));
      const [course] = await db.select({ title: courses.title, code: courses.code }).from(courses).where(eq(courses.id, result.courseId));
      if (student && course) {
        setImmediate(async () => {
          try {
            await sendNotificationEmail(
              student.email,
              `Result Published: ${course.code}`,
              `
              <h2 style="color: #333; margin-bottom: 16px;">Result Published</h2>
              <p style="color: #555;">Your result for the course <strong>${course.code} - ${course.title}</strong> has been published by the administration.</p>
              <p style="color: #555; margin-top: 20px;">You can log in to your student portal to view your grades.</p>
              `
            );
            
            // Insert in-app notification
            await db.insert(notifications).values({
              userId: result.studentId,
              title: `Result Published: ${course.code}`,
              message: `Your result for the course ${course.code} has been published.`,
              type: 'RESULT_PUBLISHED',
              entityType: 'result',
              entityId: result.id,
              priority: 'IMPORTANT'
            });
          } catch (e) {
             console.error(`Failed to send result email to ${student.email}`, e);
          }
        });
      }
    }

    res.json(result);
  } catch(error) {
    res.status(500).json({ error: "Failed to update" });
  }
});

/**
 * POST /api/admin/results/bulk-import
 * Bulk import results
 */
router.post("/results/bulk-import", requirePermission(PERMISSIONS.RESULTS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { results, semesterId, academicYear } = req.body;
    
    if (!Array.isArray(results) || results.length === 0) {
      res.status(400).json({ error: "Invalid data format. Expected an array of results." });
      return;
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of results) {
      try {
        const { studentId, courseCode, internalMarks, externalMarks, practicalMarks, totalMarks, grade, gradePoint } = row;
        
        // Find course
        const [course] = await db.select({ id: courses.id }).from(courses).where(eq(courses.code, courseCode));
        if (!course) {
          skipped++;
          errors.push(`Course ${courseCode} not found for student ${studentId}`);
          continue;
        }

        // Find existing result
        const existing = await db.select().from(studentResults).where(and(
          eq(studentResults.studentId, studentId),
          eq(studentResults.courseId, course.id),
          eq(studentResults.semesterId, semesterId)
        ));

        let savedResult;
        if (existing.length > 0) {
          if (existing[0].status === 'PUBLISHED') {
            skipped++;
            errors.push(`Skipped ${studentId}: result already PUBLISHED.`);
            continue;
          }

          [savedResult] = await db.update(studentResults).set({
            internalMarks: internalMarks !== undefined ? parseInt(internalMarks, 10) : existing[0].internalMarks,
            externalMarks: externalMarks !== undefined ? parseInt(externalMarks, 10) : existing[0].externalMarks,
            practicalMarks: practicalMarks !== undefined ? parseInt(practicalMarks, 10) : existing[0].practicalMarks,
            totalMarks: totalMarks !== undefined ? parseInt(totalMarks, 10) : existing[0].totalMarks,
            grade: grade || existing[0].grade,
            gradePoint: gradePoint !== undefined ? parseInt(gradePoint, 10) : existing[0].gradePoint,
            updatedAt: new Date()
          }).where(eq(studentResults.id, existing[0].id)).returning();

          await db.insert(resultAuditLogs).values({
            resultId: savedResult.id,
            changedBy: req.user!.userId,
            changeType: "BULK_IMPORT_UPDATE",
            oldValue: existing[0],
            newValue: savedResult,
            reason: "Bulk import",
          });
        } else {
          [savedResult] = await db.insert(studentResults).values({
            studentId,
            courseId: course.id,
            semesterId,
            academicYear,
            internalMarks: internalMarks ? parseInt(internalMarks, 10) : null,
            externalMarks: externalMarks ? parseInt(externalMarks, 10) : null,
            practicalMarks: practicalMarks ? parseInt(practicalMarks, 10) : null,
            totalMarks: totalMarks ? parseInt(totalMarks, 10) : null,
            grade,
            gradePoint: gradePoint ? parseInt(gradePoint, 10) : null,
            status: 'DRAFT'
          }).returning();

          await db.insert(resultAuditLogs).values({
            resultId: savedResult.id,
            changedBy: req.user!.userId,
            changeType: "BULK_IMPORT_CREATE",
            oldValue: null,
            newValue: savedResult,
            reason: "Bulk import",
          });
        }
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`Error processing student ${row.studentId}: ${(err as Error).message}`);
      }
    }

    res.json({ imported, skipped, errors });
  } catch (error) {
    console.error("Error bulk importing results:", error);
    res.status(500).json({ error: "Failed to bulk import results" });
  }
});

/**
 * GET /api/admin/results/:id/audit
 * Get audit logs for a result
 */
router.get("/results/:id/audit", requirePermission(PERMISSIONS.RESULTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await db
      .select({
        id: resultAuditLogs.id,
        changeType: resultAuditLogs.changeType,
        oldValue: resultAuditLogs.oldValue,
        newValue: resultAuditLogs.newValue,
        reason: resultAuditLogs.reason,
        createdAt: resultAuditLogs.createdAt,
        changedBy: users.name,
      })
      .from(resultAuditLogs)
      .leftJoin(users, eq(resultAuditLogs.changedBy, users.id))
      .where(eq(resultAuditLogs.resultId, req.params.id as string))
      .orderBy(desc(resultAuditLogs.createdAt));

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

/**
 * ─── TIMETABLE MANAGEMENT ───────────────────────────────────────────────────
 */

/**
 * Check for scheduling conflicts
 */
const checkTimetableConflicts = async (scheduleData: any, excludeId?: string) => {
  const { dayOfWeek, startTime, endTime, room, instructorId, courseId } = scheduleData;
  
  // Basic validation
  if (startTime >= endTime) {
    return "Start time must be before end time.";
  }

  // Fetch schedules for the same day
  const query = db.select().from(classSchedules).where(eq(classSchedules.dayOfWeek, dayOfWeek));
  const sameDaySchedules = await query;
  
  for (const s of sameDaySchedules) {
    if (excludeId && s.id === excludeId) continue;
    
    // Check time overlap
    const overlaps = startTime < s.endTime && endTime > s.startTime;
    
    if (overlaps) {
      if (room && s.room === room && !s.isOnline) {
        return `Conflict detected: Room ${room} is already assigned from ${s.startTime} – ${s.endTime}.`;
      }
      if (instructorId && s.instructorId === instructorId) {
        return `Conflict detected: Instructor is already assigned from ${s.startTime} – ${s.endTime}.`;
      }
      if (courseId && s.courseId === courseId) {
        return `Conflict detected: Course is already scheduled from ${s.startTime} – ${s.endTime}.`;
      }
    }
  }
  
  return null;
};

// GET all schedules
router.get("/timetable", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await db
      .select({
        id: classSchedules.id,
        courseId: classSchedules.courseId,
        instructorId: classSchedules.instructorId,
        dayOfWeek: classSchedules.dayOfWeek,
        startTime: classSchedules.startTime,
        endTime: classSchedules.endTime,
        room: classSchedules.room,
        building: classSchedules.building,
        classType: classSchedules.classType,
        isOnline: classSchedules.isOnline,
        meetingUrl: classSchedules.meetingUrl,
        courseCode: courses.code,
        courseTitle: courses.title,
        instructorName: users.name,
      })
      .from(classSchedules)
      .innerJoin(courses, eq(classSchedules.courseId, courses.id))
      .leftJoin(users, eq(classSchedules.instructorId, users.id))
      .orderBy(classSchedules.dayOfWeek, classSchedules.startTime);

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
});

// POST create schedule
router.post("/timetable", requirePermission(PERMISSIONS.COURSES_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    const conflict = await checkTimetableConflicts(data);
    if (conflict) {
      res.status(409).json({ error: conflict });
      return;
    }

    const [newSchedule] = await db.insert(classSchedules).values({
      courseId: data.courseId,
      instructorId: data.instructorId,
      dayOfWeek: parseInt(data.dayOfWeek, 10),
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      building: data.building,
      classType: data.classType || 'lecture',
      isOnline: data.isOnline || false,
      meetingUrl: data.meetingUrl,
    }).returning();

    res.json(newSchedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// PUT update schedule
router.put("/timetable/:id", requirePermission(PERMISSIONS.COURSES_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const scheduleId = req.params.id as string;
    
    const conflict = await checkTimetableConflicts(data, scheduleId);
    if (conflict) {
      res.status(409).json({ error: conflict });
      return;
    }

    const [updatedSchedule] = await db.update(classSchedules).set({
      courseId: data.courseId,
      instructorId: data.instructorId,
      dayOfWeek: parseInt(data.dayOfWeek, 10),
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      building: data.building,
      classType: data.classType,
      isOnline: data.isOnline,
      meetingUrl: data.meetingUrl,
      updatedAt: new Date(),
    }).where(eq(classSchedules.id, scheduleId)).returning();

    res.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// DELETE schedule
router.delete("/timetable/:id", requirePermission(PERMISSIONS.COURSES_DELETE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await db.delete(classSchedules).where(eq(classSchedules.id, req.params.id as string));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

/**
 * ─── SEMESTERS ──────────────────────────────────────────────────────────────
 */

router.get("/semesters", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await db
      .select({
        id: semesters.id,
        name: semesters.name,
        startDate: semesters.startDate,
        endDate: semesters.endDate,
        status: semesters.status,
      })
      .from(semesters)
      .orderBy(desc(semesters.status), desc(semesters.startDate));

    res.json(list);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
});

/**
 * ─── ANNOUNCEMENT MANAGEMENT ────────────────────────────────────────────────
 */

// GET all announcements
router.get("/announcements", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        category: announcements.category,
        priority: announcements.priority,
        audience: announcements.audience,
        programId: announcements.program,
        semesterId: announcements.semesterId,
        courseId: announcements.courseId,
        attachments: announcements.attachments,
        status: announcements.status,
        isPinned: announcements.isPinned,
        publishedAt: announcements.publishedAt,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        authorName: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.authorId, users.id))
      .orderBy(desc(announcements.createdAt));

    res.json(list);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// POST create announcement
router.post("/announcements", requirePermission(PERMISSIONS.COURSES_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;

    const [newAnn] = await db.insert(announcements).values({
      title: data.title,
      content: data.content,
      category: data.category || 'GENERAL',
      priority: data.priority || 'NORMAL',
      audience: data.audience || 'ALL',
      program: data.program,
      semesterId: data.semesterId,
      courseId: data.courseId,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      status: data.status || 'DRAFT',
      isPinned: data.isPinned || false,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      authorId: req.user!.userId,
    }).returning();

    res.json(newAnn);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// PUT update announcement
router.put("/announcements/:id", requirePermission(PERMISSIONS.COURSES_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    // Check if status changes to PUBLISHED to set publishedAt
    let publishedAt = undefined;
    if (data.status === 'PUBLISHED') {
      const existing = await db.select({ status: announcements.status }).from(announcements).where(eq(announcements.id, req.params.id as string));
      if (existing[0] && existing[0].status !== 'PUBLISHED') {
        publishedAt = new Date();
      }
    }

    const [updated] = await db.update(announcements).set({
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      audience: data.audience,
      program: data.program,
      semesterId: data.semesterId,
      courseId: data.courseId,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      status: data.status,
      isPinned: data.isPinned,
      publishedAt: publishedAt,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }).where(eq(announcements.id, req.params.id as string)).returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// DELETE announcement
router.delete("/announcements/:id", requirePermission(PERMISSIONS.COURSES_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await db.delete(announcements).where(eq(announcements.id, req.params.id as string));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// ─── NOTIFICATIONS API ────────────────────────────────────────────────────────
// GET /api/admin/notifications - List all notifications sent
router.get("/notifications", requirePermission(PERMISSIONS.SYSTEM_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(100);
    res.json(list);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /api/admin/notifications - Send a new notification
router.post("/notifications", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type, priority, audience, program, semesterId, courseId, targetStudentId, sendEmail } = req.body;
    
    if (!title || !message || !audience) {
      res.status(400).json({ error: "Title, message, and audience are required" });
      return;
    }

    // Determine target users
    let targetUsers: { id: string, email: string, name: string }[] = [];

    if (audience === 'ALL_STUDENTS') {
      targetUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.role, "student"));
    } else if (audience === 'FACULTY') {
      targetUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.role, "faculty"));
    } else if (audience === 'SPECIFIC_PROGRAM' && program) {
      const studs = await db.select({ id: users.id, email: users.email, name: users.name })
        .from(studentProfiles)
        .innerJoin(users, eq(users.id, studentProfiles.userId))
        .where(eq(studentProfiles.programId, program));
      targetUsers = studs;
    } else if (audience === 'SPECIFIC_SEMESTER' && semesterId) {
       const studs = await db.select({ id: users.id, email: users.email, name: users.name })
        .from(enrollments)
        .innerJoin(users, eq(users.id, enrollments.studentId))
        .innerJoin(courses, eq(courses.id, enrollments.courseId))
        .where(eq(courses.semesterId, semesterId));
      
      // deduplicate by id
      const uniqueIds = new Set();
      targetUsers = studs.filter(user => {
        if (!uniqueIds.has(user.id)) {
          uniqueIds.add(user.id);
          return true;
        }
        return false;
      });
    } else if (audience === 'SPECIFIC_COURSE' && courseId) {
      const studs = await db.select({ id: users.id, email: users.email, name: users.name })
        .from(enrollments)
        .innerJoin(users, eq(users.id, enrollments.studentId))
        .where(eq(enrollments.courseId, courseId));
      targetUsers = studs;
    } else if (audience === 'SPECIFIC_STUDENT' && targetStudentId) {
      const stud = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.id, targetStudentId));
      if (stud.length > 0) targetUsers = stud;
    } else {
      res.status(400).json({ error: "Invalid audience or missing audience specific ID" });
      return;
    }

    if (targetUsers.length === 0) {
      res.status(400).json({ error: "No users found for the specified audience" });
      return;
    }

    // Insert notifications into DB
    const insertData = targetUsers.map(user => ({
      userId: user.id,
      title,
      message,
      type: type || 'SYSTEM',
      priority: priority || 'NORMAL',
    }));

    await db.insert(notifications).values(insertData);

    // Send emails async if requested
    if (sendEmail) {
      // Async email sending without blocking the API response
      setImmediate(async () => {
        for (const user of targetUsers) {
          try {
            await sendNotificationEmail(user.email, title, `
              <h2 style="color: #333; margin-bottom: 16px;">${title}</h2>
              <p style="color: #555; white-space: pre-wrap;">${message}</p>
            `);
          } catch (e) {
            console.error(`Failed to send email to ${user.email}`, e);
          }
        }
      });
    }

    res.json({ success: true, count: targetUsers.length, message: `Notification sent to ${targetUsers.length} users.` });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// ─── REPORTS API ────────────────────────────────────────────────────────
// GET /api/admin/reports - Fetch report data based on filters
router.get("/reports", requirePermission(PERMISSIONS.REPORTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, type, program, department, semester, academicYear, course, startDate, endDate, format } = req.query;

    if (!category || !type) {
      res.status(400).json({ error: "Report category and type are required" });
      return;
    }

    let resultData: any = {};

    // Base conditions
    const buildStudentConditions = () => {
      const conditions: any[] = [];
      if (program) conditions.push(eq(studentProfiles.programId, program as string));
      if (department) conditions.push(eq(studentProfiles.departmentId, department as string));
      if (semester) conditions.push(eq(studentProfiles.semesterId, semester as string));
      if (academicYear) conditions.push(eq(studentProfiles.academicYear, academicYear as string));
      return conditions;
    };

    if (category === "students") {
      const conds = buildStudentConditions();
      const baseQuery = db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        programId: studentProfiles.programId,
        semesterId: studentProfiles.semesterId,
        enrollmentDate: studentProfiles.enrollmentDate
      })
      .from(users)
      .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(and(eq(users.role, "student"), ...conds));

      const students = await baseQuery;

      if (type === "enrollment") {
        resultData = students; // For now just return raw, frontend can aggregate
      } else if (type === "active_inactive") {
        const active = students.filter(s => s.isActive).length;
        const inactive = students.filter(s => !s.isActive).length;
        resultData = { active, inactive, total: students.length, details: students };
      } else if (type === "by_semester") {
        const bySem = students.reduce((acc: any, s) => {
          const sem = s.semesterId || 'Unknown';
          acc[sem] = (acc[sem] || 0) + 1;
          return acc;
        }, {});
        resultData = Object.keys(bySem).map(k => ({ semesterId: k, count: bySem[k] }));
      } else if (type === "by_program") {
        const byProg = students.reduce((acc: any, s) => {
          const prog = s.programId || 'Unknown';
          acc[prog] = (acc[prog] || 0) + 1;
          return acc;
        }, {});
        resultData = Object.keys(byProg).map(k => ({ programId: k, count: byProg[k] }));
      }
    } else if (category === "attendance") {
      // Fetch attendance
      const conds: any[] = [];
      if (course) conds.push(eq(courses.id, course as string));
      if (startDate) conds.push(gte(attendance.date, startDate as string));
      if (endDate) conds.push(lte(attendance.date, endDate as string));

      const attQuery = await db.select({
        status: attendance.status,
        studentId: attendance.studentId,
        courseId: attendance.courseId,
        date: attendance.date
      })
      .from(attendance)
      .innerJoin(courses, eq(courses.id, attendance.courseId))
      .where(and(...conds));

      if (type === "overall") {
        const present = attQuery.filter(a => a.status === 'present').length;
        const absent = attQuery.filter(a => a.status === 'absent').length;
        const late = attQuery.filter(a => a.status === 'late').length;
        const excused = attQuery.filter(a => a.status === 'excused').length;
        resultData = { present, absent, late, excused, total: attQuery.length };
      } else if (type === "course") {
         const courseStats = attQuery.reduce((acc: any, a) => {
           if (!acc[a.courseId]) acc[a.courseId] = { present: 0, total: 0 };
           acc[a.courseId].total++;
           if (a.status === 'present') acc[a.courseId].present++;
           return acc;
         }, {});
         // Frontend can resolve course names
         resultData = Object.keys(courseStats).map(cId => ({
           courseId: cId,
           percentage: Math.round((courseStats[cId].present / courseStats[cId].total) * 100)
         }));
      } else if (type === "low_attendance") {
        const studentStats = attQuery.reduce((acc: any, a) => {
          if (!acc[a.studentId]) acc[a.studentId] = { present: 0, total: 0 };
          acc[a.studentId].total++;
          if (a.status === 'present') acc[a.studentId].present++;
          return acc;
        }, {});
        
        const low = Object.keys(studentStats).filter(sId => {
          return (studentStats[sId].present / studentStats[sId].total) < 0.75;
        }).map(sId => ({
           studentId: sId,
           percentage: Math.round((studentStats[sId].present / studentStats[sId].total) * 100)
        }));
        resultData = low;
      }
    } else if (category === "academic") {
      const conds: any[] = [];
      if (course) conds.push(eq(studentResults.courseId, course as string));
      if (semester) conds.push(eq(studentResults.semesterId, semester as string));

      const resQuery = await db.select({
        grade: studentResults.grade,
        courseId: studentResults.courseId,
        semesterId: studentResults.semesterId,
      })
      .from(studentResults)
      .where(and(eq(studentResults.status, 'PUBLISHED'), ...conds));

      if (type === "pass_fail") {
        const pass = resQuery.filter(r => r.grade !== 'F').length;
        const fail = resQuery.filter(r => r.grade === 'F').length;
        resultData = { pass, fail, total: resQuery.length };
      } else if (type === "grade_distribution") {
        const dist = resQuery.reduce((acc: any, r) => {
          const g = r.grade || 'NA';
          acc[g] = (acc[g] || 0) + 1;
          return acc;
        }, {});
        resultData = Object.keys(dist).map(g => ({ grade: g, count: dist[g] }));
      } else if (type === "course_performance") {
        const perf = resQuery.reduce((acc: any, r) => {
           if (!acc[r.courseId]) acc[r.courseId] = { pass: 0, total: 0 };
           acc[r.courseId].total++;
           if (r.grade !== 'F') acc[r.courseId].pass++;
           return acc;
        }, {});
        resultData = Object.keys(perf).map(cId => ({
           courseId: cId,
           passRate: Math.round((perf[cId].pass / perf[cId].total) * 100)
        }));
      }
    } else if (category === "assignment") {
      const conds: any[] = [];
      if (course) conds.push(eq(assignments.courseId, course as string));

      const assignQuery = await db.select({
        id: assignments.id,
        courseId: assignments.courseId,
        title: assignments.title
      }).from(assignments).where(and(...conds));

      const subQuery = await db.select({
        assignmentId: submissions.assignmentId,
        status: submissions.status,
        submittedAt: submissions.submittedAt
      }).from(submissions);

      if (type === "submission_rate") {
        const stats = assignQuery.map(a => {
           const subs = subQuery.filter(s => s.assignmentId === a.id);
           return { assignment: a.title, submissions: subs.length };
        });
        resultData = stats;
      } else if (type === "late_submissions") {
        const late = subQuery.filter(s => s.status === 'late').length;
        resultData = { late, total: subQuery.length };
      } else if (type === "grading_completion") {
        const graded = subQuery.filter(s => s.status === 'graded').length;
        resultData = { graded, total: subQuery.length };
      }
    } else if (category === "exam") {
      const conds: any[] = [];
      if (course) conds.push(eq(exams.courseId, course as string));
      if (startDate) conds.push(gte(exams.date, new Date(startDate as string)));
      if (endDate) conds.push(lte(exams.date, new Date(endDate as string)));

      const exQuery = await db.select({
        id: exams.id,
        title: exams.title,
        date: exams.date,
        status: exams.status,
      }).from(exams).where(and(...conds));

      if (type === "upcoming") {
        resultData = exQuery.filter(e => e.status === 'SCHEDULED' && new Date(e.date) > new Date());
      } else if (type === "schedule") {
        resultData = exQuery.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    }

    if (format === 'csv') {
      let dataToExport = resultData;
      if (!Array.isArray(resultData)) {
        // Wrap object in array if it's a single summary object
        dataToExport = [resultData];
      }
      const csv = jsonToCsv(dataToExport);
      const filename = `report_${category}_${type}_${new Date().getTime()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else {
      res.json(resultData);
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// ─── AUDIT LOGS API ────────────────────────────────────────────────────────
// GET /api/admin/audit-logs - Fetch paginated, filterable system audit logs
router.get("/audit-logs", requirePermission(PERMISSIONS.AUDIT_LOGS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entity, actorId, search, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const offsetNum = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (action) conditions.push(eq(systemAuditLogs.action, action as string));
    if (entity) conditions.push(eq(systemAuditLogs.entity, entity as string));
    if (actorId) conditions.push(eq(systemAuditLogs.actorId, actorId as string));
    
    if (search) {
       conditions.push(
         or(
           ilike(systemAuditLogs.action, `%${search}%`),
           ilike(systemAuditLogs.entity, `%${search}%`)
         )
       );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalLogsResult, logs] = await Promise.all([
      db.select({ count: count() }).from(systemAuditLogs).where(whereClause),
      db.select({
        id: systemAuditLogs.id,
        actorId: systemAuditLogs.actorId,
        actorName: users.name,
        actorEmail: users.email,
        action: systemAuditLogs.action,
        entity: systemAuditLogs.entity,
        entityId: systemAuditLogs.entityId,
        oldValue: systemAuditLogs.oldValue,
        newValue: systemAuditLogs.newValue,
        ipAddress: systemAuditLogs.ipAddress,
        userAgent: systemAuditLogs.userAgent,
        createdAt: systemAuditLogs.createdAt,
      })
      .from(systemAuditLogs)
      .leftJoin(users, eq(users.id, systemAuditLogs.actorId))
      .where(whereClause)
      .orderBy(desc(systemAuditLogs.createdAt))
      .limit(limitNum)
      .offset(offsetNum)
    ]);

    res.json({
      data: logs,
      meta: {
        total: totalLogsResult[0].count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLogsResult[0].count / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// ─── SETTINGS API ──────────────────────────────────────────────────────────
// GET /api/admin/settings - Fetch all system settings
router.get("/settings", requirePermission(PERMISSIONS.SETTINGS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settingsRows = await db.select().from(systemSettings);
    
    // Convert array of rows into a key-value object
    const settingsMap = settingsRows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);
    
    res.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch system settings" });
  }
});

// POST /api/admin/settings - Update system settings
router.post("/settings", requirePermission(PERMISSIONS.SETTINGS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      res.status(400).json({ error: "Invalid settings format" });
      return;
    }

    const updatedKeys: string[] = [];

    // Perform updates in a transaction
    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        
        // Only insert/update if value is defined
        if (value !== undefined) {
          // Check if key exists
          const existing = await tx.select().from(systemSettings).where(eq(systemSettings.key, key));
          
          let oldValue = null;
          if (existing.length > 0) {
            oldValue = existing[0].value;
            await tx.update(systemSettings)
              .set({ value, updatedBy: req.user!.userId, updatedAt: new Date() })
              .where(eq(systemSettings.key, key));
          } else {
            await tx.insert(systemSettings)
              .values({ key, value, updatedBy: req.user!.userId });
          }
          
          updatedKeys.push(key);
          
          // Log each individual setting change
          await logAudit(
            req.user!.userId,
            "UPDATE",
            "SYSTEM_SETTING",
            key,
            oldValue,
            value,
            req.ip,
            req.headers["user-agent"]
          );
        }
      }
    });

    res.json({ message: "Settings updated successfully", updatedKeys });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update system settings" });
  }
});
// ─── SEMESTERS / ACADEMIC YEAR API ─────────────────────────────────────────

// GET /api/admin/semesters - Fetch all semesters
router.get("/semesters", requirePermission(PERMISSIONS.SYSTEM_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await db.select().from(semesters).orderBy(desc(semesters.startDate));
    res.json(data);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
});

// POST /api/admin/semesters - Create a new semester
router.post("/semesters", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, academicYear, startDate, endDate, status } = req.body;
    
    if (!name || !code || !startDate || !endDate) {
      res.status(400).json({ error: "Name, code, start date, and end date are required" });
      return;
    }

    const [newSemester] = await db.insert(semesters).values({
      name,
      code,
      academicYear,
      startDate,
      endDate,
      status: status || "upcoming"
    }).returning();

    await logAudit(
      req.user!.userId,
      "CREATE",
      "SEMESTER",
      newSemester.id,
      null,
      newSemester,
      req.ip,
      req.headers["user-agent"]
    );

    res.status(201).json(newSemester);
  } catch (error: any) {
    console.error("Error creating semester:", error);
    if (error.code === '23505') { // unique violation
      res.status(400).json({ error: "Semester code already exists" });
    } else {
      res.status(500).json({ error: "Failed to create semester" });
    }
  }
});

// PUT /api/admin/semesters/:id - Update a semester
router.put("/semesters/:id", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, code, academicYear, startDate, endDate, status } = req.body;

    const [existing] = await db.select().from(semesters).where(eq(semesters.id, id));
    if (!existing) {
      res.status(404).json({ error: "Semester not found" });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db.update(semesters).set(updateData).where(eq(semesters.id, id)).returning();

    await logAudit(
      req.user!.userId,
      "UPDATE",
      "SEMESTER",
      updated.id,
      existing,
      updated,
      req.ip,
      req.headers["user-agent"]
    );

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating semester:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Semester code already exists" });
    } else {
      res.status(500).json({ error: "Failed to update semester" });
    }
  }
});
// ─── DEPARTMENTS API ───────────────────────────────────────────────────────

router.get("/departments", requirePermission(PERMISSIONS.SYSTEM_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await db.select().from(departments).orderBy(departments.name);
    res.json(data);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.post("/departments", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description, headId } = req.body;
    
    if (!name || !code) {
      res.status(400).json({ error: "Name and code are required" });
      return;
    }

    const [newDept] = await db.insert(departments).values({
      name,
      code,
      description,
      headId: headId || null
    }).returning();

    await logAudit(req.user!.userId, "CREATE", "DEPARTMENT", newDept.id, null, newDept, req.ip, req.headers["user-agent"]);

    res.status(201).json(newDept);
  } catch (error: any) {
    console.error("Error creating department:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Department code or name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create department" });
    }
  }
});

router.put("/departments/:id", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, code, description, headId } = req.body;

    const [existing] = await db.select().from(departments).where(eq(departments.id, id));
    if (!existing) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (headId !== undefined) updateData.headId = headId;

    const [updated] = await db.update(departments).set(updateData).where(eq(departments.id, id)).returning();

    await logAudit(req.user!.userId, "UPDATE", "DEPARTMENT", updated.id, existing, updated, req.ip, req.headers["user-agent"]);

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating department:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Department code or name already exists" });
    } else {
      res.status(500).json({ error: "Failed to update department" });
    }
  }
});

// ─── PROGRAMS API ──────────────────────────────────────────────────────────

router.get("/programs", requirePermission(PERMISSIONS.SYSTEM_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await db.select().from(programs).orderBy(programs.name);
    res.json(data);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

router.post("/programs", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description, departmentId } = req.body;
    
    if (!name || !code || !departmentId) {
      res.status(400).json({ error: "Name, code, and departmentId are required" });
      return;
    }

    const [newProg] = await db.insert(programs).values({
      name,
      code,
      description,
      departmentId
    }).returning();

    await logAudit(req.user!.userId, "CREATE", "PROGRAM", newProg.id, null, newProg, req.ip, req.headers["user-agent"]);

    res.status(201).json(newProg);
  } catch (error: any) {
    console.error("Error creating program:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Program code or name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create program" });
    }
  }
});

router.put("/programs/:id", requirePermission(PERMISSIONS.SYSTEM_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, code, description, departmentId } = req.body;

    const [existing] = await db.select().from(programs).where(eq(programs.id, id));
    if (!existing) {
      res.status(404).json({ error: "Program not found" });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (departmentId !== undefined) updateData.departmentId = departmentId;

    const [updated] = await db.update(programs).set(updateData).where(eq(programs.id, id)).returning();

    await logAudit(req.user!.userId, "UPDATE", "PROGRAM", updated.id, existing, updated, req.ip, req.headers["user-agent"]);

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating program:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Program code or name already exists" });
    } else {
      res.status(500).json({ error: "Failed to update program" });
    }
  }
});

export default router;
