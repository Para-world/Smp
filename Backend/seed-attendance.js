import 'dotenv/config';
import { db } from './src/db/index.js';
import { users, courses, attendance, enrollments } from './src/db/schema.js';
import { eq, and } from 'drizzle-orm';

function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function seedAttendance() {
  console.log('Seeding attendance...');
  try {
    // Get student
    const student = await db.query.users.findFirst({
      where: eq(users.email, 'ram@gmail.com')
    });

    if (!student) {
      console.log('Student ram@gmail.com not found. Exiting.');
      return;
    }

    // Get course
    const course = await db.query.courses.findFirst({
      where: eq(courses.code, 'BCS-053')
    });
    if (!course) {
      console.log('Course BCS-053 not found. Exiting.');
      return;
    }

    // Clear old attendance
    await db.delete(attendance).where(
      and(
        eq(attendance.studentId, student.id),
        eq(attendance.courseId, course.id)
      )
    );

    // Insert 20 records
    const today = new Date();
    
    const records = [];
    
    // Some presents
    for (let i = 1; i <= 15; i++) {
      records.push({
        studentId: student.id,
        courseId: course.id,
        date: subDays(today, i).toISOString().split('T')[0], // yyyy-mm-dd
        status: 'present',
        remarks: 'Attended'
      });
    }
    
    // Some absents
    for (let i = 16; i <= 17; i++) {
      records.push({
        studentId: student.id,
        courseId: course.id,
        date: subDays(today, i).toISOString().split('T')[0],
        status: 'absent',
        remarks: 'Medical'
      });
    }

    // Some late
    for (let i = 18; i <= 19; i++) {
      records.push({
        studentId: student.id,
        courseId: course.id,
        date: subDays(today, i).toISOString().split('T')[0],
        status: 'late',
        remarks: 'Traffic'
      });
    }

    // Some excused
    records.push({
      studentId: student.id,
      courseId: course.id,
      date: subDays(today, 20).toISOString().split('T')[0],
      status: 'excused',
      remarks: 'College Event'
    });

    await db.insert(attendance).values(records);

    console.log('Done seeding attendance!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding attendance:', error);
    process.exit(1);
  }
}

seedAttendance();
