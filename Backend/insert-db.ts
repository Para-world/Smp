import "dotenv/config";
import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";
import { hash } from "./src/utils/crypto.js";
import { eq } from "drizzle-orm";

async function main() {
  const passwordHash = await hash("Demo123!");
  
  await db.update(users).set({ passwordHash }).where(eq(users.email, "admin@edusphere.local"));
  console.log("Admin updated");

  await db.update(users).set({ passwordHash }).where(eq(users.email, "faculty@edusphere.local"));
  console.log("Faculty updated");
  
  process.exit(0);
}
main();
