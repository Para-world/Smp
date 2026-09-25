import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

config(); // Load .env

// Since schema.ts uses import/export, we'll just connect directly and insert raw data 
// using generic drizzle queries, or we can compile it.
// To avoid compilation hassle in Node.js script, we can execute SQL directly 
// or use simple Drizzle schema definitions.

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log("Seeding schedule...");

  // 1. Get a student
  const students = await db.execute(`SELECT id FROM users WHERE role = 'student' LIMIT 1`);
  if (students.rows.length === 0) {
    console.log("No student found. Run main seed first.");
    return;
  }
  const studentId = students.rows[0].id;

  // 2. Get enrolled courses for this student
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

  // Clear existing schedules for these courses
  for (const row of enrolledRows.rows) {
    await db.execute(`DELETE FROM class_schedules WHERE course_id = '${row.id}'`);
  }

  // 3. Create schedules
  let added = 0;
  
  for (const course of enrolledRows.rows) {
    // Add two classes for each course (e.g., Monday and Wednesday)
    const schedules = [
      {
        day: 1, // Monday
        start: "10:00",
        end: "11:00",
        room: "Room B-204"
      },
      {
        day: 3, // Wednesday
        start: "12:00",
        end: "13:00",
        room: "Room C-102"
      }
    ];

    for (const sch of schedules) {
      await db.execute(`
        INSERT INTO class_schedules (
          id, course_id, instructor_id, day_of_week, start_time, end_time, 
          room, building, class_type, is_online
        ) VALUES (
          gen_random_uuid(), '${course.id}', ${course.faculty_id ? `'${course.faculty_id}'` : 'NULL'}, 
          ${sch.day}, '${sch.start}', '${sch.end}', 
          '${sch.room}', 'Main Block', 'lecture', false
        )
      `);
      added++;
    }
  }

  // Add one for Tuesday and Thursday
  if (enrolledRows.rows.length > 1) {
    const course = enrolledRows.rows[1];
    await db.execute(`
      INSERT INTO class_schedules (
        id, course_id, instructor_id, day_of_week, start_time, end_time, 
        room, building, class_type, is_online
      ) VALUES (
        gen_random_uuid(), '${course.id}', ${course.faculty_id ? `'${course.faculty_id}'` : 'NULL'}, 
        2, '09:00', '10:30', 
        'Lab A', 'IT Block', 'lab', false
      )
    `);
    added++;
    
    await db.execute(`
      INSERT INTO class_schedules (
        id, course_id, instructor_id, day_of_week, start_time, end_time, 
        room, building, class_type, is_online
      ) VALUES (
        gen_random_uuid(), '${course.id}', ${course.faculty_id ? `'${course.faculty_id}'` : 'NULL'}, 
        4, '14:00', '15:30', 
        'Online', 'N/A', 'lecture', true
      )
    `);
    added++;
  }
  
  // Add a class for today if it doesn't already have one
  const todayDay = new Date().getDay(); // 0-6
  const course = enrolledRows.rows[0];
  await db.execute(`
    INSERT INTO class_schedules (
      id, course_id, instructor_id, day_of_week, start_time, end_time, 
      room, building, class_type, is_online
    ) VALUES (
      gen_random_uuid(), '${course.id}', ${course.faculty_id ? `'${course.faculty_id}'` : 'NULL'}, 
      ${todayDay}, '08:00', '09:00', 
      'Room A-101', 'Main Block', 'lecture', false
    )
  `);
  added++;

  console.log(`Added ${added} schedule entries.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
