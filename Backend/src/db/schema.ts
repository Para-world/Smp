import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  numeric,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "faculty",
  "admin",
  "parent",
  "dean",
  "registrar",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "enrolled",
  "dropped",
  "completed",
  "waitlisted",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);

export const semesterStatusEnum = pgEnum("semester_status", [
  "upcoming",
  "active",
  "completed",
]);

export const assignmentTypeEnum = pgEnum("assignment_type", [
  "homework",
  "quiz",
  "midterm",
  "final",
  "project",
  "lab",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "submitted",
  "late",
  "graded",
]);

export const classTypeEnum = pgEnum("class_type", [
  "lecture",
  "lab",
  "tutorial",
  "practical",
  "seminar",
  "other",
]);

export const examTypeEnum = pgEnum("exam_type", [
  "MID_TERM",
  "FINAL",
  "PRACTICAL",
  "VIVA",
  "INTERNAL",
  "QUIZ",
  "OTHER"
]);

export const examStatusEnum = pgEnum("exam_status", [
  "SCHEDULED",
  "POSTPONED",
  "CANCELLED"
]);

export const resultStatusEnum = pgEnum("result_status", [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "WITHHELD",
  "PASS", // keep for backward compatibility or final grading
  "FAIL",
  "ABSENT"
]);

export const announcementCategoryEnum = pgEnum("announcement_category", [
  "GENERAL", "ACADEMIC", "COURSE", "EXAM", "ASSIGNMENT", "ATTENDANCE", "TIMETABLE", "RESULT", "EVENT", "SYSTEM", "URGENT"
]);

export const priorityEnum = pgEnum("priority", ["NORMAL", "IMPORTANT", "URGENT"]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "ASSIGNMENT_CREATED", "ASSIGNMENT_DUE_SOON", "ASSIGNMENT_GRADED",
  "EXAM_CREATED", "EXAM_UPDATED", "EXAM_CANCELLED", "EXAM_POSTPONED",
  "TIMETABLE_UPDATED", "CLASS_CANCELLED", "ROOM_CHANGED",
  "RESULT_PUBLISHED", "ATTENDANCE_WARNING", "ANNOUNCEMENT_PUBLISHED",
  "SYSTEM"
]);

export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "APPROVED",
  "EXPIRED",
  "REJECTED",
  "USED",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);

export const studentStatusEnum = pgEnum("student_status", [
  "active",
  "inactive",
  "graduated",
  "suspended",
  "on_leave",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  theme: varchar("theme", { length: 20 }).notNull().default("system"), // 'light', 'dark', 'system'
  language: varchar("language", { length: 10 }).notNull().default("en"),
  
  // Notification Preferences
  emailNotifications: boolean("email_notifications").notNull().default(true),
  assignmentNotifications: boolean("assignment_notifications").notNull().default(true),
  examNotifications: boolean("exam_notifications").notNull().default(true),
  resultNotifications: boolean("result_notifications").notNull().default(true),
  attendanceNotifications: boolean("attendance_notifications").notNull().default(true),
  announcementNotifications: boolean("announcement_notifications").notNull().default(true),
  timetableNotifications: boolean("timetable_notifications").notNull().default(true),
  
  // Security
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Student Profiles ────────────────────────────────────────────────────────

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  program: varchar("program", { length: 255 }),
  department: varchar("department", { length: 255 }),
  semester: integer("semester"),
  academicYear: varchar("academic_year", { length: 20 }),
  enrollmentDate: date("enrollment_date"),
  status: studentStatusEnum("status").notNull().default("active"),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Security & Devices ──────────────────────────────────────────────────────

export const trustedDevices = pgTable("trusted_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }), // e.g., "Chrome on Windows"
  browser: varchar("browser", { length: 100 }),
  operatingSystem: varchar("operating_system", { length: 100 }),
  trusted: boolean("trusted").notNull().default(true),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export const deviceLoginRequests = pgTable("device_login_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash"), // Nullable until approved by trusted device
  status: requestStatusEnum("status").notNull().default("PENDING"),
  deviceName: varchar("device_name", { length: 255 }),
  browser: varchar("browser", { length: 100 }),
  operatingSystem: varchar("operating_system", { length: 100 }),
  attemptCount: integer("attempt_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

// ─── Departments ─────────────────────────────────────────────────────────────

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  headId: uuid("head_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Semesters ───────────────────────────────────────────────────────────────

export const semesters = pgTable("semesters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: semesterStatusEnum("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Courses ─────────────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  description: text("description"),
  credits: integer("credits").notNull().default(3),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),
  semesterId: uuid("semester_id")
    .notNull()
    .references(() => semesters.id),
  facultyId: uuid("faculty_id").references(() => users.id),
  maxCapacity: integer("max_capacity").notNull().default(30),
  schedule: varchar("schedule", { length: 255 }), // e.g. "MWF 10:00-11:00"
  location: varchar("location", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Class Schedules ─────────────────────────────────────────────────────────

export const classSchedules = pgTable("class_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  instructorId: uuid("instructor_id").references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: varchar("start_time", { length: 8 }).notNull(), // "HH:MM"
  endTime: varchar("end_time", { length: 8 }).notNull(),
  room: varchar("room", { length: 50 }),
  building: varchar("building", { length: 100 }),
  classType: classTypeEnum("class_type").notNull().default("lecture"),
  isOnline: boolean("is_online").notNull().default(false),
  meetingUrl: varchar("meeting_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Exams ───────────────────────────────────────────────────────────────────

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  examType: examTypeEnum("exam_type").notNull().default("MID_TERM"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  startTime: varchar("start_time", { length: 8 }).notNull(),
  endTime: varchar("end_time", { length: 8 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  venue: varchar("venue", { length: 255 }),
  building: varchar("building", { length: 255 }),
  floor: varchar("floor", { length: 50 }),
  instructions: text("instructions"),
  status: examStatusEnum("status").notNull().default("SCHEDULED"),
  isOnline: boolean("is_online").notNull().default(false),
  examUrl: varchar("exam_url", { length: 500 }),
  originalDate: timestamp("original_date", { withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Enrollments ─────────────────────────────────────────────────────────────

export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  status: enrollmentStatusEnum("status").notNull().default("enrolled"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  finalGrade: varchar("final_grade", { length: 5 }),
});

// ─── Assignments ─────────────────────────────────────────────────────────────

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  attachments: text("attachments"), // comma separated URLs or JSON string
  type: assignmentTypeEnum("type").notNull().default("homework"),
  maxScore: numeric("max_score", { precision: 5, scale: 2 }).notNull().default("100"),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  allowLateSubmission: boolean("allow_late_submission").notNull().default(false),
  allowResubmission: boolean("allow_resubmission").notNull().default(false),
  maxAttempts: integer("max_attempts").notNull().default(1),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Submissions ─────────────────────────────────────────────────────────────

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id),
  status: submissionStatusEnum("status").notNull().default("submitted"),
  content: text("content"),
  fileUrl: varchar("file_url", { length: 500 }),
  attempt: integer("attempt").notNull().default(1),
  isLate: boolean("is_late").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Grades ──────────────────────────────────────────────────────────────────

export const grades = pgTable("grades", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id),
  score: numeric("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradedBy: uuid("graded_by").references(() => users.id),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  remarks: text("remarks"),
  markedBy: uuid("marked_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Announcements ───────────────────────────────────────────────────────────

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: announcementCategoryEnum("category").notNull().default("GENERAL"),
  priority: priorityEnum("priority").notNull().default("NORMAL"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  departmentId: uuid("department_id").references(() => departments.id),
  courseId: uuid("course_id").references(() => courses.id),
  isPinned: boolean("is_pinned").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // e.g., 'assignment', 'exam', 'announcement'
  entityId: uuid("entity_id"),
  priority: priorityEnum("priority").notNull().default("NORMAL"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Results ─────────────────────────────────────────────────────────────────

export const studentResults = pgTable("student_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  semesterId: uuid("semester_id").notNull().references(() => semesters.id, { onDelete: "cascade" }),
  academicYear: varchar("academic_year", { length: 20 }), // e.g. "2026-2027"
  internalMarks: integer("internal_marks"),
  externalMarks: integer("external_marks"),
  practicalMarks: integer("practical_marks"),
  totalMarks: integer("total_marks"),
  grade: varchar("grade", { length: 5 }), // e.g. "A+", "B"
  gradePoint: integer("grade_point"), // e.g. 9, 8
  credits: integer("credits"),
  status: resultStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const semesterResults = pgTable("semester_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  semesterId: uuid("semester_id").notNull().references(() => semesters.id, { onDelete: "cascade" }),
  academicYear: varchar("academic_year", { length: 20 }),
  sgpa: varchar("sgpa", { length: 10 }), // Stored as string to handle precision like "8.61"
  totalCredits: integer("total_credits"),
  earnedCredits: integer("earned_credits"),
  status: resultStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resultAuditLogs = pgTable("result_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  resultId: uuid("result_id").notNull().references(() => studentResults.id, { onDelete: "cascade" }),
  changedBy: uuid("changed_by").notNull().references(() => users.id),
  changeType: varchar("change_type", { length: 50 }).notNull(), // e.g. 'STATUS_CHANGE', 'MARKS_CHANGE'
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, { fields: [users.id], references: [studentProfiles.userId] }),
  settings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
  enrollments: many(enrollments),
  taughtCourses: many(courses),
  grades: many(grades),
  attendanceRecords: many(attendance),
  announcements: many(announcements),
  trustedDevices: many(trustedDevices),
  deviceLoginRequests: many(deviceLoginRequests),
  studentResults: many(studentResults),
  semesterResults: many(semesterResults),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, { fields: [studentProfiles.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  head: one(users, { fields: [departments.headId], references: [users.id] }),
  courses: many(courses),
}));

export const semestersRelations = relations(semesters, ({ many }) => ({
  courses: many(courses),
  semesterResults: many(semesterResults),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, { fields: [courses.departmentId], references: [departments.id] }),
  semester: one(semesters, { fields: [courses.semesterId], references: [semesters.id] }),
  faculty: one(users, { fields: [courses.facultyId], references: [users.id] }),
  enrollments: many(enrollments),
  assignments: many(assignments),
  attendance: many(attendance),
  classSchedules: many(classSchedules),
  exams: many(exams),
  studentResults: many(studentResults),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, { fields: [enrollments.studentId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, { fields: [assignments.courseId], references: [courses.id] }),
  grades: many(grades),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(users, { fields: [grades.studentId], references: [users.id] }),
  assignment: one(assignments, { fields: [grades.assignmentId], references: [assignments.id] }),
  grader: one(users, { fields: [grades.gradedBy], references: [users.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(users, { fields: [attendance.studentId], references: [users.id] }),
  course: one(courses, { fields: [attendance.courseId], references: [courses.id] }),
  marker: one(users, { fields: [attendance.markedBy], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
  department: one(departments, { fields: [announcements.departmentId], references: [departments.id] }),
  course: one(courses, { fields: [announcements.courseId], references: [courses.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));


export const classSchedulesRelations = relations(classSchedules, ({ one }) => ({
  course: one(courses, { fields: [classSchedules.courseId], references: [courses.id] }),
  instructor: one(users, { fields: [classSchedules.instructorId], references: [users.id] }),
}));

export const examsRelations = relations(exams, ({ one }) => ({
  course: one(courses, { fields: [exams.courseId], references: [courses.id] }),
}));

export const studentResultsRelations = relations(studentResults, ({ one }) => ({
  student: one(users, { fields: [studentResults.studentId], references: [users.id] }),
  course: one(courses, { fields: [studentResults.courseId], references: [courses.id] }),
  semester: one(semesters, { fields: [studentResults.semesterId], references: [semesters.id] }),
}));

export const semesterResultsRelations = relations(semesterResults, ({ one }) => ({
  student: one(users, { fields: [semesterResults.studentId], references: [users.id] }),
  semester: one(semesters, { fields: [semesterResults.semesterId], references: [semesters.id] }),
}));

export const resultAuditLogsRelations = relations(resultAuditLogs, ({ one }) => ({
  result: one(studentResults, { fields: [resultAuditLogs.resultId], references: [studentResults.id] }),
  changer: one(users, { fields: [resultAuditLogs.changedBy], references: [users.id] }),
}));
