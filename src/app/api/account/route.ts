import { z } from "zod";
import { eq } from "drizzle-orm";
import { api } from "@/lib/api";
import { getDb, users } from "@/lib/db";
export const POST = api({ perm: "community:read", schema: z.object({ leaderboard: z.boolean() }), limit: [20, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  await db.update(users).set({ leaderboard: body.leaderboard }).where(eq(users.id, user.id));
  return { message: body.leaderboard ? "You appear on the leaderboard." : "You are hidden from the leaderboard." };
});
