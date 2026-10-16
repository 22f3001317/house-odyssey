import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { getDb, users } from "@/lib/db";
const schema = z.object({ current: z.string().min(1, "Enter your current password."), next: z.string().min(10, "Use at least 10 characters.").max(128) });
export const POST = api({ schema, limit: [5, 10 * 60_000] }, async ({ user, body }) => {
  if (!(await bcrypt.compare(body.current, user.passwordHash))) return fail("Your current password is incorrect.", 403);
  const db = await getDb();
  await db.update(users).set({ passwordHash: await bcrypt.hash(body.next, 10) }).where(eq(users.id, user.id));
  return { message: "Password changed." };
});
