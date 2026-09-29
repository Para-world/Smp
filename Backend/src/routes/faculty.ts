import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  users,
  courses,
  enrollments,
  attendance,
  assignments,
  submissions,
  grades,
  exams,
  classSchedules,
  announcements,
  notifications,
} from "../db/schema.js";
import { eq, count, and, desc, sql, gte, inArray, or } from "drizzle-orm";
import { requireAuth, AuthRequest, requirePermission, requireRole } from "../utils/middleware.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { sendNotificationEmail } from "../utils/mailer.js";

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
    
    // 2. Total distinct Students across my courses
    const [studentsRes] = await db.select({ 
      count: count(sql`DISTINCT ${enrollments.studentId}`) 
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(courses.facultyId, facultyId));

    // 3. Today's Classes
    const today = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
    const [todaysClassesRes] = await db.select({ count: count() })
      .from(classSchedules)
      .innerJoin(courses, eq(classSchedules.courseId, courses.id))
      .where(and(eq(courses.facultyId, facultyId), eq(classSchedules.dayOfWeek, today)));

    // 4. Pending Grading (submissions with status 'submitted')
    const [pendingGradingRes] = await db.select({ count: count() })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(and(eq(courses.facultyId, facultyId), eq(submissions.status, 'submitted')));

    // 5. Upcoming Exams
    const [upcomingExamsRes] = await db.select({ count: count() })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .where(and(eq(courses.facultyId, facultyId), gte(exams.date, new Date())));

    // 6. Recent Announcements
    const recentAnnouncements = await db.select()
      .from(announcements)
      .where(eq(announcements.audience, "ALL"))
      .orderBy(desc(announcements.createdAt))
      .limit(5);
    
    res.json({
      courses: myCoursesRes.count,
      students: Number(studentsRes.count),
      todaysClasses: todaysClassesRes.count,
      pendingGrading: pendingGradingRes.count,
      upcomingExams: upcomingExamsRes.count,
      recentAnnouncements
    });

  } catch (error) {
    console.error("Error fetching faculty dashboard stats:", error);
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
});

/**
 * GET /api/faculty/courses
 * Get list of courses assigned to the faculty
 */
router.get("/courses", requirePermission(PERMISSIONS.COURSES_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;

    const facultyCourses = await db
      .select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
        isActive: courses.isActive,
      })
      .from(courses)
      .where(eq(courses.facultyId, facultyId))
      .orderBy(desc(courses.createdAt));

    res.json(facultyCourses);
  } catch (error) {
    console.error("Error fetching faculty courses:", error);
    res.status(500).json({ error: "Failed to load courses" });
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

/**
 * POST /api/faculty/assignments
 * Create a new assignment
 */
router.post("/assignments", requirePermission(PERMISSIONS.ASSIGNMENTS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;
    const { 
      title, courseId, description, instructions, attachments,
      dueDate, maxScore, weight, allowLateSubmission, allowResubmission, maxAttempts
    } = req.body;

    if (!title || !courseId) {
      res.status(400).json({ error: "Title and Course ID are required" });
      return;
    }

    // Verify course belongs to faculty
    const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.facultyId, facultyId)));
    if (!course) {
      res.status(403).json({ error: "Access denied or course not found" });
      return;
    }

    const [assignment] = await db.insert(assignments).values({
      courseId,
      title,
      description,
      instructions,
      attachments,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxScore: maxScore || "100",
      weight: weight || "1",
      allowLateSubmission: allowLateSubmission || false,
      allowResubmission: allowResubmission || false,
      maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1,
      isPublished: true, // Assuming published immediately for simplicity
    }).returning();

    // Notify enrolled students
    setImmediate(async () => {
      try {
        const enrolledStudents = await db.select({ id: users.id, email: users.email }).from(enrollments)
          .innerJoin(users, eq(users.id, enrollments.studentId))
          .where(eq(enrollments.courseId, courseId));
          
        for (const student of enrolledStudents) {
          // Send Email
          await sendNotificationEmail(
            student.email,
            `New Assignment: ${title}`,
            `
            <h2 style="color: #333; margin-bottom: 16px;">New Assignment Posted</h2>
            <p style="color: #555;">A new assignment <strong>${title}</strong> has been posted in ${course.code}.</p>
            <p style="color: #555;">Due Date: ${dueDate ? new Date(dueDate).toLocaleString() : 'No due date'}</p>
            `
          );

          // Add in-app notification
          await db.insert(notifications).values({
            userId: student.id,
            title: `New Assignment: ${title}`,
            message: `A new assignment has been posted for ${course.code}.`,
            type: 'ASSIGNMENT_CREATED',
            entityType: 'assignment',
            entityId: assignment.id,
            priority: 'NORMAL'
          });
        }
      } catch (e) {
        console.error("Failed to send assignment notifications:", e);
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

/**
 * GET /api/faculty/assignments
 * List assignments for faculty courses
 */
router.get("/assignments", requirePermission(PERMISSIONS.ASSIGNMENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;

    const facultyAssignments = await db
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
      .where(eq(courses.facultyId, facultyId))
      .orderBy(desc(assignments.createdAt));

    res.json(facultyAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to load assignments" });
  }
});

/**
 * GET /api/faculty/assignments/:assignmentId/submissions
 * View submissions for a specific assignment
 */
router.get("/assignments/:assignmentId/submissions", requirePermission(PERMISSIONS.ASSIGNMENTS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const facultyId = req.user!.userId;

    // Verify assignment belongs to faculty's course
    const [assignment] = await db
      .select({ id: assignments.id })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(and(eq(assignments.id, assignmentId), eq(courses.facultyId, facultyId)));

    if (!assignment) {
      res.status(403).json({ error: "Access denied or assignment not found" });
      return;
    }

    const submissionList = await db
      .select({
        id: submissions.id,
        status: submissions.status,
        submittedAt: submissions.submittedAt,
        content: submissions.content,
        fileUrl: submissions.fileUrl,
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        gradeId: grades.id,
        score: grades.score,
        feedback: grades.feedback,
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.studentId, users.id))
      .leftJoin(grades, and(
        eq(grades.assignmentId, assignmentId),
        eq(grades.studentId, users.id)
      ))
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.submittedAt));
      
    res.json(submissionList);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to load submissions" });
  }
});

/**
 * POST /api/faculty/assignments/:assignmentId/submissions/:studentId/grade
 * Grade a student's submission
 */
router.post("/assignments/:assignmentId/submissions/:studentId/grade", requirePermission(PERMISSIONS.SUBMISSIONS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const studentId = req.params.studentId as string;
    const facultyId = req.user!.userId;
    const { score, feedback } = req.body;

    if (score === undefined) {
      res.status(400).json({ error: "Score is required" });
      return;
    }

    // Verify assignment belongs to faculty's course
    const [assignment] = await db
      .select({ id: assignments.id, maxScore: assignments.maxScore })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(and(eq(assignments.id, assignmentId), eq(courses.facultyId, facultyId)));

    if (!assignment) {
      res.status(403).json({ error: "Access denied or assignment not found" });
      return;
    }

    // Validate score
    if (parseFloat(score) > parseFloat(assignment.maxScore as unknown as string) || parseFloat(score) < 0) {
      res.status(400).json({ error: `Score must be between 0 and ${assignment.maxScore}` });
      return;
    }

    // Upsert grade
    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(and(eq(grades.assignmentId, assignmentId), eq(grades.studentId, studentId)));

    if (existingGrade) {
      await db.update(grades).set({
        score: score.toString(),
        feedback,
        gradedBy: facultyId,
        gradedAt: new Date(),
      }).where(eq(grades.id, existingGrade.id));
    } else {
      await db.insert(grades).values({
        assignmentId,
        studentId,
        score: score.toString(),
        feedback,
        gradedBy: facultyId,
        gradedAt: new Date(),
      });
    }

    // Update submission status
    await db.update(submissions)
      .set({ status: 'graded' })
      .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)));

    res.json({ message: "Grade saved successfully" });
  } catch (error) {
    console.error("Error saving grade:", error);
    res.status(500).json({ error: "Failed to save grade" });
  }
});

/**
 * GET /api/faculty/exams
 * List exams for courses assigned to this faculty
 */
router.get("/exams", requirePermission(PERMISSIONS.EXAMS_READ), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;

    const facultyExams = await db
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
        courseTitle: courses.title,
        courseCode: courses.code,
      })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .where(eq(courses.facultyId, facultyId))
      .orderBy(desc(exams.date));

    res.json(facultyExams);
  } catch (error) {
    console.error("Error fetching faculty exams:", error);
    res.status(500).json({ error: "Failed to load exams" });
  }
});

/**
 * POST /api/faculty/exams
 * Create a new exam for a course assigned to this faculty
 */
router.post("/exams", requirePermission(PERMISSIONS.EXAMS_CREATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;
    const { 
      courseId, title, description, examType, date, 
      startTime, endTime, durationMinutes, venue, instructions 
    } = req.body;

    if (!courseId || !title || !date || !startTime || !endTime || !durationMinutes) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Verify course belongs to faculty
    const [course] = await db.select().from(courses).where(and(eq(courses.id, courseId), eq(courses.facultyId, facultyId)));
    if (!course) {
      res.status(403).json({ error: "Access denied or course not found" });
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
 * PUT /api/faculty/exams/:id
 * Update an existing exam for a course assigned to this faculty
 */
router.put("/exams/:id", requirePermission(PERMISSIONS.EXAMS_UPDATE), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examId = req.params.id as string;
    const facultyId = req.user!.userId;
    const { 
      title, description, examType, date, 
      startTime, endTime, durationMinutes, venue, instructions, status 
    } = req.body;

    // Verify exam belongs to faculty's course
    const [existingExam] = await db
      .select({ id: exams.id })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .where(and(eq(exams.id, examId), eq(courses.facultyId, facultyId)));

    if (!existingExam) {
      res.status(403).json({ error: "Access denied or exam not found" });
      return;
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

    res.json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ error: "Failed to update exam" });
  }
});

// ─── GET /api/faculty/timetable ─────────────────────────────────────────────

router.get(
  "/timetable",
  requireAuth,
  requireRole("faculty"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const facultyId = req.user!.userId;

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
        .where(eq(classSchedules.instructorId, facultyId))
        .orderBy(classSchedules.dayOfWeek, classSchedules.startTime);

      res.json(schedules);
    } catch (error) {
      console.error("Fetch faculty timetable error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * ─── ANNOUNCEMENT MANAGEMENT ────────────────────────────────────────────────
 */

// GET faculty's announcements
router.get("/announcements", requireAuth, requireRole("faculty"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        category: announcements.category,
        priority: announcements.priority,
        audience: announcements.audience,
        program: announcements.program,
        semesterId: announcements.semesterId,
        courseId: announcements.courseId,
        attachments: announcements.attachments,
        status: announcements.status,
        isPinned: announcements.isPinned,
        publishedAt: announcements.publishedAt,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .where(eq(announcements.authorId, req.user!.userId))
      .orderBy(desc(announcements.createdAt));

    res.json(list);
  } catch (error) {
    console.error("Error fetching faculty announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// POST create announcement
router.post("/announcements", requireAuth, requireRole("faculty"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const facultyId = req.user!.userId;

    // Faculty specific authorization check
    if (data.audience === 'COURSE') {
      if (!data.courseId) {
        res.status(400).json({ error: "Course ID is required for COURSE audience" });
        return;
      }
      const course = await db.select().from(courses).where(and(eq(courses.id, data.courseId), eq(courses.facultyId, facultyId)));
      if (course.length === 0) {
        res.status(403).json({ error: "Not authorized to publish to this course" });
        return;
      }
    } else if (data.audience === 'ALL') {
      res.status(403).json({ error: "Faculty cannot publish to ALL students. Please contact Admin." });
      return;
    }

    const [newAnn] = await db.insert(announcements).values({
      title: data.title,
      content: data.content,
      category: data.category || 'GENERAL',
      priority: data.priority || 'NORMAL',
      audience: data.audience || 'COURSE',
      program: data.program,
      semesterId: data.semesterId,
      courseId: data.courseId,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      status: data.status || 'DRAFT',
      isPinned: data.isPinned || false,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      authorId: facultyId,
    }).returning();

    res.json(newAnn);
  } catch (error) {
    console.error("Error creating faculty announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// PUT update announcement
router.put("/announcements/:id", requireAuth, requireRole("faculty"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const facultyId = req.user!.userId;
    
    // Check ownership
    const existing = await db.select().from(announcements).where(and(eq(announcements.id, req.params.id as string), eq(announcements.authorId, facultyId)));
    if (existing.length === 0) {
      res.status(404).json({ error: "Announcement not found or unauthorized" });
      return;
    }

    if (data.audience === 'COURSE' && data.courseId) {
      const course = await db.select().from(courses).where(and(eq(courses.id, data.courseId), eq(courses.facultyId, facultyId)));
      if (course.length === 0) {
        res.status(403).json({ error: "Not authorized to publish to this course" });
        return;
      }
    }

    let publishedAt = undefined;
    if (data.status === 'PUBLISHED' && existing[0].status !== 'PUBLISHED') {
      publishedAt = new Date();
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
    }).where(and(eq(announcements.id, req.params.id as string), eq(announcements.authorId, facultyId))).returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating faculty announcement:", error);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// DELETE announcement
router.delete("/announcements/:id", requireAuth, requireRole("faculty"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user!.userId;
    const existing = await db.select().from(announcements).where(and(eq(announcements.id, req.params.id as string), eq(announcements.authorId, facultyId)));
    if (existing.length === 0) {
      res.status(404).json({ error: "Announcement not found or unauthorized" });
      return;
    }
    await db.delete(announcements).where(and(eq(announcements.id, req.params.id as string), eq(announcements.authorId, facultyId)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting faculty announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
