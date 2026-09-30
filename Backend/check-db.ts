import "dotenv/config";
import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const result = await db.select().from(users).where(eq(users.email, "admin@edusphere.local")).limit(1);
  console.log(result);
  process.exit(0);
}
main();
