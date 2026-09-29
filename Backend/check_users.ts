import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  try {
    const facs = await db.select().from(users).where(eq(users.role, 'FACULTY'));
    console.log('Faculty users:');
    facs.forEach(f => console.log(f.email));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
