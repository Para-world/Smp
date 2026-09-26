import { db } from "./src/db/index.js";
import { users, attendance } from "./src/db/schema.js";
import { eq, count, sql } from "drizzle-orm";

async function test() {
  try {
    const enrollmentTrend = await db.select({
      month: sql<string>`to_char(${users.createdAt}, 'Mon')`,
      count: count()
    })
    .from(users)
    .where(eq(users.role, "student"))
    .groupBy(sql`to_char(${users.createdAt}, 'Mon')`)
    .orderBy(sql`min(${users.createdAt})`);
    
    console.log("Enrollment:", enrollmentTrend);

    const attendanceTrend = await db.select({
      name: sql<string>`to_char(${attendance.date}, 'Dy')`,
      attendance: sql<number>`round((count(case when ${attendance.status} = 'present' then 1 end) * 100.0) / nullif(count(*), 0))`
    })
    .from(attendance)
    .groupBy(sql`to_char(${attendance.date}, 'Dy')`, attendance.date)
    .orderBy(sql`min(${attendance.date})`)
    .limit(7);

    console.log("Attendance:", attendanceTrend);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

test();
