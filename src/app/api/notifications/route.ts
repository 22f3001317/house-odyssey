import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api } from "@/lib/api";
import { getDb, notifications } from "@/lib/db";
const schema = z.discriminatedUnion("action", [z.object({ action: z.literal("read-all") }), z.object({ action: z.literal("read"), id: z.string().uuid() })]);
export const POST = api({ perm: "community:read", schema }, async ({ user, body }) => {
  const db = await getDb();
  // Always scoped to the signed-in member, so ids belonging to someone else match nothing.
  await db.update(notifications).set({ read: true }).where(body.action === "read" ? and(eq(notifications.userId, user.id), eq(notifications.id, body.id)) : eq(notifications.userId, user.id));
  return { message: "Marked as read." };
});
