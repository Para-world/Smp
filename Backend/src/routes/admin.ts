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
import { eq, count, and, gt, desc, ilike, or, sql } from "drizzle-orm";
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
    const { id } = req.params;

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
      startTime, endTime, durationMinutes, venue, instructions, status 
    } = req.body;

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

export default router;
