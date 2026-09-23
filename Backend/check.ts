import { db } from "./src/db/index.js";
import { deviceLoginRequests } from "./src/db/schema.js";

async function run() {
  const reqs = await db.select().from(deviceLoginRequests);
  console.log("Device Login Requests:", reqs);
  process.exit(0);
}

run();
