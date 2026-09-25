import 'dotenv/config';
import { db } from './src/db/index.js';
import { users, courses, assignments, submissions, enrollments } from './src/db/schema.js';
import { eq, and } from 'drizzle-orm';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function seedAssignments() {
  console.log('Seeding assignments...');
  try {
    const student = await db.query.users.findFirst({
      where: eq(users.email, 'ram@gmail.com')
    });

    if (!student) {
      console.log('Student ram@gmail.com not found. Exiting.');
      return;
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.code, 'BCS-053')
    });
    if (!course) {
      console.log('Course BCS-053 not found. Exiting.');
      return;
    }

    const today = new Date();

    const createdAssignments = await db.insert(assignments).values([
      {
        courseId: course.id,
        title: "Assignment 1: React Basics",
        description: "Build a simple React component and submit the code.",
        type: "homework",
        maxScore: "100",
        weight: "10",
        dueDate: subDays(today, 5),
        isPublished: true,
      },
      {
        courseId: course.id,
        title: "Assignment 2: State Management",
        description: "Implement Redux in your application.",
        type: "homework",
        maxScore: "100",
        weight: "15",
        dueDate: addDays(today, 2),
        isPublished: true,
      },
      {
        courseId: course.id,
        title: "Midterm Project",
        description: "Build a full stack application using MERN stack.",
        type: "project",
        maxScore: "100",
        weight: "30",
        dueDate: addDays(today, 10),
        isPublished: true,
      },
      {
        courseId: course.id,
        title: "Quiz 1",
        description: "Multiple choice questions on React hooks.",
        type: "quiz",
        maxScore: "20",
        weight: "5",
        dueDate: subDays(today, 20),
        isPublished: true,
      }
    ]).returning();

    // Add a submission for Assignment 1
    await db.insert(submissions).values({
      studentId: student.id,
      assignmentId: createdAssignments[0].id,
      status: "submitted",
      content: "Here is my code snippet for Assignment 1.",
      submittedAt: subDays(today, 6),
    });

    // Add a late submission for Quiz 1
    await db.insert(submissions).values({
      studentId: student.id,
      assignmentId: createdAssignments[3].id,
      status: "late",
      content: "Sorry I'm late",
      submittedAt: subDays(today, 15),
    });

    console.log('Done seeding assignments!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding assignments:', error);
    process.exit(1);
  }
}

seedAssignments();
