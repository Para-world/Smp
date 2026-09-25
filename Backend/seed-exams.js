import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log("Seeding exams...");

  const students = await db.execute(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  if (students.rows.length === 0) {
    console.log("No student found. Run main seed first.");
    return;
  }
  const studentId = students.rows[0].id;

  const enrolledRows = await db.execute(`
    SELECT c.id, c.title, c.code, c.faculty_id
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    WHERE e.student_id = '${studentId}'
  `);

  if (enrolledRows.rows.length === 0) {
    console.log("Student has no courses.");
    return;
  }

  // Clear existing exams for these courses
  for (const row of enrolledRows.rows) {
    await db.execute(`DELETE FROM exams WHERE course_id = '${row.id}'`);
  }

  let added = 0;
  
  // Date utils
  const now = new Date();
  
  // Create an exam 2 days from now
  const nextExamDate = new Date(now);
  nextExamDate.setDate(now.getDate() + 2);
  const nextExamStr = nextExamDate.toISOString();

  // Create an exam in the past
  const pastExamDate = new Date(now);
  pastExamDate.setDate(now.getDate() - 10);
  const pastExamStr = pastExamDate.toISOString();

  // Create an exam tomorrow
  const tmrwExamDate = new Date(now);
  tmrwExamDate.setDate(now.getDate() + 1);
  const tmrwExamStr = tmrwExamDate.toISOString();

  const course1 = enrolledRows.rows[0];
  const course2 = enrolledRows.rows[1] || course1;
  const course3 = enrolledRows.rows[2] || course1;

  // Upcoming
  await db.execute(`
    INSERT INTO exams (
      id, course_id, title, description, exam_type, date, start_time, end_time, 
      duration_minutes, venue, building, floor, instructions, status, is_online
    ) VALUES (
      gen_random_uuid(), '${course1.id}', 'Mid-Term Examination', 'Covers chapters 1-5', 'MID_TERM', 
      '${nextExamStr}', '10:00', '12:00', 120, 'Room B-204', 'Main Academic Block', '2nd Floor', 
      '• Carry your valid student ID.\\n• Arrive at least 15 minutes before the exam.\\n• Electronic devices are not permitted.', 
      'SCHEDULED', false
    )
  `);
  added++;

  // Past
  await db.execute(`
    INSERT INTO exams (
      id, course_id, title, description, exam_type, date, start_time, end_time, 
      duration_minutes, venue, building, floor, instructions, status, is_online
    ) VALUES (
      gen_random_uuid(), '${course2.id}', 'Quiz 1', 'Basic concepts', 'QUIZ', 
      '${pastExamStr}', '14:00', '15:00', 60, 'Room C-102', 'Science Block', '1st Floor', 
      'No specific instructions.', 
      'SCHEDULED', false
    )
  `);
  added++;

  // Postponed
  await db.execute(`
    INSERT INTO exams (
      id, course_id, title, description, exam_type, date, start_time, end_time, 
      duration_minutes, venue, building, floor, instructions, status, original_date, is_online
    ) VALUES (
      gen_random_uuid(), '${course3.id}', 'Practical Exam', 'Lab assessment', 'PRACTICAL', 
      '${tmrwExamStr}', '09:00', '11:00', 120, 'Lab A', 'IT Block', 'Ground Floor', 
      'Bring your lab coat.', 
      'POSTPONED', '${pastExamStr}', false
    )
  `);
  added++;

  console.log(`Added ${added} exam entries.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
