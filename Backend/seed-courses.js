import 'dotenv/config';
import { db } from './src/db/index.js';
import { users, courses, enrollments, semesters, departments, assignments } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seedCourses() {
  console.log('Seeding courses...');
  try {
    // Get student
    const student = await db.query.users.findFirst({
      where: eq(users.email, 'ram@gmail.com')
    });

    if (!student) {
      console.log('Student ram@gmail.com not found. Exiting.');
      return;
    }

    // Check if we already have a department
    let department = await db.query.departments.findFirst();
    if (!department) {
      const [newDept] = await db.insert(departments).values({
        name: 'Computer Science',
        code: 'CS',
      }).returning();
      department = newDept;
    }

    // Check if we have a semester
    let semester = await db.query.semesters.findFirst();
    if (!semester) {
      const [newSem] = await db.insert(semesters).values({
        name: 'Semester 6',
        code: 'SEM6',
        startDate: new Date('2026-01-01').toISOString(),
        endDate: new Date('2026-06-30').toISOString(),
      }).returning();
      semester = newSem;
    }

    // Ensure instructor
    let instructor = await db.query.users.findFirst({
      where: eq(users.email, 'dr.sharma@edusphere.edu')
    });
    if (!instructor) {
      const [newInstructor] = await db.insert(users).values({
        name: 'Dr. Rahul Sharma',
        email: 'dr.sharma@edusphere.edu',
        passwordHash: 'fakehash',
        role: 'faculty'
      }).returning();
      instructor = newInstructor;
    }

    // Insert course
    let course = await db.query.courses.findFirst({
      where: eq(courses.code, 'BCS-053')
    });
    if (!course) {
      const [newCourse] = await db.insert(courses).values({
        title: 'Web Programming',
        code: 'BCS-053',
        description: 'Advanced concepts in modern web development including React, Node.js, and API design.',
        credits: 4,
        departmentId: department.id,
        semesterId: semester.id,
        facultyId: instructor.id,
        schedule: 'MWF 10:00-11:00',
        location: 'Lab 4'
      }).returning();
      course = newCourse;
    }

    // Insert enrollment
    let enrollment = await db.query.enrollments.findFirst({
      where: eq(enrollments.studentId, student.id)
    });
    if (!enrollment) {
      await db.insert(enrollments).values({
        studentId: student.id,
        courseId: course.id,
        status: 'enrolled'
      });
      console.log('Enrolled student in course!');
    } else {
      console.log('Student already enrolled in a course.');
    }

    // Insert an assignment
    let assignment = await db.query.assignments.findFirst({
      where: eq(assignments.courseId, course.id)
    });
    if (!assignment) {
      await db.insert(assignments).values({
        courseId: course.id,
        title: 'React Components Assignment',
        description: 'Build a reusable component library.',
        type: 'homework',
        maxScore: '100',
        weight: '10',
        dueDate: new Date('2026-05-15'),
        isPublished: true
      });
    }

    console.log('Done seeding!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seedCourses();
