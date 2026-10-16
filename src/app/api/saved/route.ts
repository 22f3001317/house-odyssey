import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { events, getDb, posts, savedItems } from "@/lib/db";
const schema = z.object({ kind: z.enum(["post", "event"]), refId: z.string().uuid(), saved: z.boolean() });
export const POST = api({ perm: "community:read", schema, limit: [60, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  if (!body.saved) { await db.delete(savedItems).where(and(eq(savedItems.userId, user.id), eq(savedItems.kind, body.kind), eq(savedItems.refId, body.refId))); return { message: "Removed from saved." }; }
  const [target] = body.kind === "post"
    ? await db.select({ id: posts.id }).from(posts).where(and(eq(posts.id, body.refId), eq(posts.status, "published")))
    : await db.select({ id: events.id }).from(events).where(and(eq(events.id, body.refId), eq(events.status, "approved")));
  if (!target) return fail("That item isn't available to save.", 404);
  await db.insert(savedItems).values({ userId: user.id, kind: body.kind, refId: body.refId }).onConflictDoNothing();
  return { message: "Saved." };
});
