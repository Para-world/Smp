import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log("Seeding results...");

  const students = await db.execute(`
    SELECT u.id 
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    WHERE u.role = 'student' 
    LIMIT 1
  `);
  if (students.rows.length === 0) {
    console.log("No enrolled student found. Run main seed first.");
    return;
  }
  const studentId = students.rows[0].id;

  const enrolledRows = await db.execute(`
    SELECT c.id as course_id, c.title, c.code, c.semester_id, c.credits, s.name as semester_name, s.code as semester_code
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    JOIN semesters s ON c.semester_id = s.id
    WHERE e.student_id = '${studentId}'
  `);

  if (enrolledRows.rows.length === 0) {
    console.log("Student has no enrolled courses.");
    return;
  }

  const semesterGroups = {};
  for (const row of enrolledRows.rows) {
    if (!semesterGroups[row.semester_id]) {
      semesterGroups[row.semester_id] = {
        semester_id: row.semester_id,
        semester_name: row.semester_name,
        courses: []
      };
    }
    semesterGroups[row.semester_id].courses.push(row);
  }

  // Clear existing results for this student
  await db.execute(`DELETE FROM semester_results WHERE student_id = '${studentId}'`);
  await db.execute(`DELETE FROM student_results WHERE student_id = '${studentId}'`);

  for (const semId of Object.keys(semesterGroups)) {
    const group = semesterGroups[semId];
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalGradePoints = 0;

    for (const course of group.courses) {
      const credits = course.credits || 3;
      totalCredits += credits;

      // Make up some result
      const internalMarks = 20 + Math.floor(Math.random() * 10); // 20-30
      const externalMarks = 50 + Math.floor(Math.random() * 20); // 50-70
      const practicalMarks = Math.floor(Math.random() * 10); // 0-10
      const totalMarks = internalMarks + externalMarks + practicalMarks;

      let grade = 'C';
      let gradePoint = 6;
      if (totalMarks >= 90) { grade = 'A+'; gradePoint = 10; }
      else if (totalMarks >= 80) { grade = 'A'; gradePoint = 9; }
      else if (totalMarks >= 70) { grade = 'B+'; gradePoint = 8; }
      else if (totalMarks >= 60) { grade = 'B'; gradePoint = 7; }

      earnedCredits += credits;
      totalGradePoints += (gradePoint * credits);

      await db.execute(`
        INSERT INTO student_results (
          id, student_id, course_id, semester_id, academic_year, 
          internal_marks, external_marks, practical_marks, total_marks,
          grade, grade_point, credits, status, published_at
        ) VALUES (
          gen_random_uuid(), '${studentId}', '${course.course_id}', '${semId}', '2025-2026',
          ${internalMarks}, ${externalMarks}, ${practicalMarks}, ${totalMarks},
          '${grade}', ${gradePoint}, ${credits}, 'PASS', now()
        )
      `);
    }

    const sgpa = (totalGradePoints / totalCredits).toFixed(2);

    await db.execute(`
      INSERT INTO semester_results (
        id, student_id, semester_id, academic_year, 
        sgpa, total_credits, earned_credits, status, published_at
      ) VALUES (
        gen_random_uuid(), '${studentId}', '${semId}', '2025-2026',
        '${sgpa}', ${totalCredits}, ${earnedCredits}, 'PASS', now()
      )
    `);
  }

  console.log("Seeding results complete!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
