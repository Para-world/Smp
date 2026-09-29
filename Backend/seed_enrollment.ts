import { db } from './src/db/index.js';
import { users, enrollments } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  try {
    const students = await db.select().from(users).where(eq(users.role, 'student'));
    if (students.length === 0) {
      console.log('No students found.');
      process.exit(1);
    }
    
    // Enroll the first 3 students in Flora's course
    const courseId = 'd29030a2-c90e-4767-a379-256a664c3d67'; // From previous log
    
    for (let i = 0; i < Math.min(3, students.length); i++) {
      console.log('Enrolling', students[i].email);
      await db.insert(enrollments).values({
        studentId: students[i].id,
        courseId: courseId,
        status: 'enrolled'
      });
    }
    
    console.log('Students enrolled!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
