import 'dotenv/config';
import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log("Dropping columns...");
  try {
    await db.execute(sql`ALTER TABLE student_profiles DROP COLUMN IF EXISTS program;`);
    await db.execute(sql`ALTER TABLE student_profiles DROP COLUMN IF EXISTS department;`);
    await db.execute(sql`ALTER TABLE student_profiles DROP COLUMN IF EXISTS semester;`);
    console.log("Dropped!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
