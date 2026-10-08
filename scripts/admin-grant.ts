// `bun run admin:grant <email>`: gives an existing user the admin role (#28). The user must
// have signed in once on that environment. Runs against whatever DATABASE_URL it gets:
// .env.local is develop; for production, see README → Admin.
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/neon-auth";
import { userRoles } from "@/db/schema";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: bun run admin:grant <email>");
  process.exit(1);
}
const db = getDb();
const [found] = await db.select({ id: user.id }).from(user).where(eq(sql`lower(${user.email})`, email)).limit(1);
if (!found) {
  console.error(`No user with ${email} here. They need to sign in once first.`);
  process.exit(1);
}
await db.insert(userRoles).values({ userId: found.id, role: "admin" }).onConflictDoNothing();
console.log(`${email} is an admin on ${new URL(process.env.DATABASE_URL!).hostname.split(".")[0]}.`);
