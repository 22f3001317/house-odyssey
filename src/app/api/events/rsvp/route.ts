import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { eventRsvps, events, getDb } from "@/lib/db";
import { notify } from "@/lib/notify";
const schema = z.object({ eventId: z.string().uuid(), status: z.enum(["going", "interested", "none"]) });
export const POST = api({ perm: "community:write", schema, limit: [60, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const [e] = await db.select().from(events).where(and(eq(events.id, body.eventId), eq(events.status, "approved")));
  if (!e) return fail("That event isn't open for registration.", 404);
  const [existing] = await db.select().from(eventRsvps).where(and(eq(eventRsvps.eventId, e.id), eq(eventRsvps.userId, user.id)));
  if (body.status === "none") {
    if (existing?.attended) return fail("Your attendance was already confirmed, so it can't be removed.", 409);
    await db.delete(eventRsvps).where(and(eq(eventRsvps.eventId, e.id), eq(eventRsvps.userId, user.id)));
    return { message: "Removed from your list." };
  }
  if (existing) await db.update(eventRsvps).set({ status: body.status }).where(eq(eventRsvps.id, existing.id));
  else await db.insert(eventRsvps).values({ eventId: e.id, userId: user.id, status: body.status });
  if (body.status === "going" && existing?.status !== "going" && e.organizerId !== user.id) await notify(e.organizerId, `${user.name} is going to "${e.title}"`, `/events/${e.id}`);
  return { message: body.status === "going" ? "You're going!" : "Marked as interested." };
});
