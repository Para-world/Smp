import { db } from './src/db/index.js';
import { users, courses, departments, semesters } from './src/db/schema.js';
import { eq, like } from 'drizzle-orm';

async function run() {
  try {
    const facs = await db.select().from(users).where(like(users.name, '%lora%'));
    if (facs.length === 0) {
      console.log('No flora found.');
      process.exit(1);
    }
    const floraId = facs[0].id;
    
    // get any department and semester
    const depts = await db.select().from(departments);
    const sems = await db.select().from(semesters);
    
    if (depts.length === 0 || sems.length === 0) {
      console.log('No departments or semesters found to link course');
      process.exit(1);
    }
    
    console.log('Assigning a test course to ', facs[0].email);
    const newCourse = await db.insert(courses).values({
      code: 'CS101-Flora',
      title: 'Introduction to Computer Science for Flora',
      description: 'Test course for testing attendance',
      credits: 4,
      departmentId: depts[0].id,
      facultyId: floraId,
      semesterId: sems[0].id,
      isActive: true,
    }).returning();
    
    console.log('Course Created:', newCourse);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
