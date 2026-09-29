import "dotenv/config";
import { db } from "./src/db/index.js";
import {
  users, departments, programs, semesters, studentProfiles, courses, enrollments,
  classSchedules, assignments, submissions, exams, studentResults, announcements, attendance
} from "./src/db/schema.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting realistic seed process...");

  // Password for all seeded users
  const passwordHash = await bcrypt.hash("Demo123!", 10);

  // 1. Create Core Config (Semesters, Departments, Programs)
  console.log("Creating core config...");
  const [department] = await db.insert(departments).values({
    name: "Computer Science",
    code: "CS",
    description: "Department of Computer Science and Engineering",
  }).returning();

  const [program] = await db.insert(programs).values({
    name: "Bachelor of Technology",
    code: "BTech",
    departmentId: department.id,
    durationYears: 4,
  }).returning();

  const [semester] = await db.insert(semesters).values({
    name: "Fall 2026",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-12-15"),
    status: "active",
  }).returning();

  // 2. Create Users
  console.log("Creating users (Super Admin, Admin, Faculty, Students)...");
  
  // Super Admin & Admin
  await db.insert(users).values([
    { name: "Super Admin", email: "admin@edusphere.local", role: "admin", passwordHash, isActive: true },
    { name: "Admin User", email: "admin2@edusphere.local", role: "admin", passwordHash, isActive: true }
  ]);

  // Faculty
  const facultyUsers = await db.insert(users).values([
    {
      name: "Demo Faculty",
      email: "faculty@edusphere.local",
      role: "faculty" as const,
      passwordHash,
      isActive: true,
      phone: faker.phone.number({ style: 'national' }),
    },
    ...Array.from({ length: 4 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: "faculty" as const,
      passwordHash,
      isActive: true,
      phone: faker.phone.number({ style: 'national' }),
    }))
  ]).returning();

  // Students
  const studentUsers = await db.insert(users).values([
    {
      name: "Demo Student",
      email: "student@edusphere.local",
      role: "student" as const,
      passwordHash,
      isActive: true,
      phone: faker.phone.number({ style: 'national' }),
    },
    ...Array.from({ length: 19 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: "student" as const,
      passwordHash,
      isActive: true,
      phone: faker.phone.number({ style: 'national' }),
    }))
  ]).returning();

  // Student Profiles
  await db.insert(studentProfiles).values(
    studentUsers.map(student => ({
      userId: student.id,
      departmentId: department.id,
      programId: program.id,
      semesterId: semester.id,
      academicYear: 2026,
      status: "active" as const,
      enrollmentDate: faker.date.past().toISOString(),
      gender: faker.helpers.arrayElement(["male", "female", "other"]),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString(),
      address: faker.location.streetAddress(),
    }))
  );

  // 3. Create Courses
  console.log("Creating courses...");
  const courseData = [
    { code: "CS101", title: "Introduction to Programming", credits: 3 },
    { code: "CS201", title: "Data Structures", credits: 4 },
    { code: "CS301", title: "Database Systems", credits: 3 },
    { code: "CS401", title: "Web Development", credits: 3 },
  ];

  const createdCourses = await db.insert(courses).values(
    courseData.map((c, i) => ({
      ...c,
      departmentId: department.id,
      facultyId: facultyUsers[i % facultyUsers.length].id,
      description: faker.lorem.paragraph(),
      isActive: true,
    }))
  ).returning();

  // 4. Enrollments
  console.log("Creating enrollments...");
  const allEnrollments = [];
  for (const student of studentUsers) {
    // Enroll each student in 2-3 random courses
    const enrolledCourses = faker.helpers.arrayElements(createdCourses, { min: 2, max: 3 });
    for (const course of enrolledCourses) {
      allEnrollments.push({
        studentId: student.id,
        courseId: course.id,
        semesterId: semester.id,
        status: "enrolled" as const,
        enrolledAt: new Date(),
      });
    }
  }
  await db.insert(enrollments).values(allEnrollments);

  // 5. Attendance & Timetable
  console.log("Creating timetable and attendance...");
  for (const course of createdCourses) {
    await db.insert(classSchedules).values({
      courseId: course.id,
      dayOfWeek: faker.number.int({ min: 1, max: 5 }),
      startTime: "10:00:00",
      endTime: "11:30:00",
      roomNumber: `Room ${faker.number.int({ min: 100, max: 500 })}`,
      classType: "lecture",
    });

    // Attendance for one random date
    const attendanceDate = new Date();
    attendanceDate.setDate(attendanceDate.getDate() - faker.number.int({ min: 1, max: 10 }));
    
    // Get students in this course
    const courseStudents = allEnrollments.filter(e => e.courseId === course.id);
    if (courseStudents.length > 0) {
      await db.insert(attendance).values(
        courseStudents.map(cs => ({
          studentId: cs.studentId,
          courseId: course.id,
          date: attendanceDate.toISOString().split('T')[0],
          status: faker.helpers.arrayElement(["present", "present", "present", "absent", "late"]),
          markedBy: course.facultyId,
        }))
      );
    }
  }

  // 6. Assignments & Submissions
  console.log("Creating assignments & submissions...");
  for (const course of createdCourses) {
    const [assignment] = await db.insert(assignments).values({
      courseId: course.id,
      title: `Assignment 1: ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      type: "homework",
      dueDate: faker.date.future(),
      maxScore: 100,
    }).returning();

    const courseStudents = allEnrollments.filter(e => e.courseId === course.id);
    if (courseStudents.length > 0) {
      await db.insert(submissions).values(
        courseStudents.map(cs => ({
          assignmentId: assignment.id,
          studentId: cs.studentId,
          status: "graded" as const,
          submittedAt: new Date(),
          grade: faker.number.int({ min: 60, max: 100 }),
          feedback: "Good work!",
          gradedBy: course.facultyId,
          gradedAt: new Date(),
        }))
      );
    }
  }

  // 7. Exams & Results
  console.log("Creating exams & results...");
  for (const course of createdCourses) {
    const examDate = faker.date.future();
    const [exam] = await db.insert(exams).values({
      courseId: course.id,
      title: "Midterm Examination",
      examType: "MID_TERM",
      date: examDate,
      startTime: "09:00:00",
      endTime: "11:00:00",
      durationMinutes: 120,
      venue: `Hall ${faker.number.int({ min: 1, max: 10 })}`,
      maxMarks: 100,
      status: "SCHEDULED",
    }).returning();

    const courseStudents = allEnrollments.filter(e => e.courseId === course.id);
    if (courseStudents.length > 0) {
      await db.insert(studentResults).values(
        courseStudents.map(cs => ({
          studentId: cs.studentId,
          courseId: course.id,
          semesterId: semester.id,
          examId: exam.id,
          totalMarks: faker.number.int({ min: 50, max: 100 }),
          grade: faker.helpers.arrayElement(["A", "B", "C"]),
          status: "PUBLISHED" as const,
          publishedAt: new Date(),
        }))
      );
    }
  }

  // 8. Announcements
  console.log("Creating announcements...");
  await db.insert(announcements).values({
    title: "Welcome to Fall 2026 Semester!",
    content: "We are excited to welcome all new and returning students to the Fall 2026 semester. Classes begin next week.",
    category: "GENERAL",
    priority: "IMPORTANT",
    audience: "ALL",
    authorId: (await db.select().from(users).where(eq(users.email, "admin@edusphere.com")))[0].id,
    isPublished: true,
    publishedAt: new Date(),
  });

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
