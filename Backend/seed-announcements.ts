import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { users, announcements, notifications, courses } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding announcements and notifications...");

  try {
    // 1. Get a student
    const [student] = await db.select().from(users).where(eq(users.role, "student")).limit(1);
    
    if (!student) {
      console.log("No student found. Please run seed.js and seed-courses.js first.");
      return;
    }

    // 2. Get an author
    const [author] = await db.select().from(users).limit(1);

    if (!author) {
      console.log("No author found.");
      return;
    }

    // 3. Get a course
    const [course] = await db.select().from(courses).limit(1);

    // 4. Create Announcements
    await db.insert(announcements).values([
      {
        title: "Welcome to the New Semester",
        content: "Welcome everyone to the Fall 2026 semester. Please check your timetables and ensure all course registrations are complete.",
        category: "GENERAL",
        priority: "IMPORTANT",
        authorId: author.id,
        isPinned: true,
      },
      {
        title: "Campus Wi-Fi Maintenance",
        content: "The campus Wi-Fi will be down for maintenance this Saturday from 2 AM to 6 AM.",
        category: "SYSTEM",
        priority: "NORMAL",
        authorId: author.id,
      },
      {
        title: "Upcoming Midterm Examinations",
        content: "Midterm examinations will commence from next week. Please check the exam portal for detailed schedules.",
        category: "EXAM",
        priority: "URGENT",
        authorId: author.id,
      },
    ]);

    if (course) {
      await db.insert(announcements).values([
        {
          title: `Assignment 1 for ${course.title}`,
          content: `Your first assignment for ${course.code} has been published. It is due next Friday.`,
          category: "COURSE",
          priority: "NORMAL",
          authorId: author.id,
          courseId: course.id,
        },
      ]);
    }

    // 5. Create Notifications
    await db.insert(notifications).values([
      {
        userId: student.id,
        type: "ASSIGNMENT_DUE_SOON",
        title: "Assignment Due Soon",
        message: "Your Database Management assignment is due tomorrow.",
        entityType: "assignment",
        priority: "IMPORTANT",
        isRead: false,
      },
      {
        userId: student.id,
        type: "RESULT_PUBLISHED",
        title: "Result Published",
        message: "Your Semester 5 results are now available.",
        entityType: "result",
        priority: "NORMAL",
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: student.id,
        type: "EXAM_UPDATED",
        title: "Exam Schedule Updated",
        message: "The venue for your upcoming exam has been changed to Hall B.",
        entityType: "exam",
        priority: "URGENT",
        isRead: false,
      },
      {
        userId: student.id,
        type: "ANNOUNCEMENT_PUBLISHED",
        title: "New Announcement",
        message: "Welcome to the New Semester announcement has been published.",
        entityType: "announcement",
        priority: "NORMAL",
        isRead: false,
      },
    ]);

    console.log("Successfully seeded announcements and notifications!");
  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed();
