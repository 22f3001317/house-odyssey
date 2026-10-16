import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { can } from "@/lib/auth";
import { eventRsvps, events, getDb } from "@/lib/db";
import { notify } from "@/lib/notify";
import { award } from "@/lib/xp";
const schema = z.object({ eventId: z.string().uuid(), userId: z.string().uuid(), attended: z.literal(true) });
export const POST = api({ perm: "community:write", schema, limit: [120, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const [e] = await db.select().from(events).where(and(eq(events.id, body.eventId), inArray(events.status, ["approved", "completed"])));
  if (!e) return fail("Event not found.", 404);
  if (e.organizerId !== user.id && !can(user, "content:manage")) return fail("Only the organizer or a council member can confirm attendance.", 403);
  // Only members who registered as "going" can be confirmed, and each is confirmed (and rewarded) once.
  const [r] = await db.update(eventRsvps).set({ attended: true }).where(and(eq(eventRsvps.eventId, e.id), eq(eventRsvps.userId, body.userId), eq(eventRsvps.status, "going"), eq(eventRsvps.attended, false))).returning();
  if (!r) return fail("That member isn't registered as going, or was already confirmed.", 409);
  await award(body.userId, 10, `Attended: ${e.title}`);
  await notify(body.userId, `Your attendance at "${e.title}" was confirmed (+10 XP)`, `/achievements`);
  return { message: "Attendance confirmed." };
});
