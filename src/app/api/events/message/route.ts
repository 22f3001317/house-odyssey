import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { can } from "@/lib/auth";
import { eventMessages, eventRsvps, events, getDb } from "@/lib/db";
import { notify } from "@/lib/notify";
const schema = z.object({ eventId: z.string().uuid(), body: z.string().trim().min(2, "Write a message.").max(1000) });
export const POST = api({ perm: "community:write", schema, limit: [20, 10 * 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const [e] = await db.select().from(events).where(and(eq(events.id, body.eventId), inArray(events.status, ["approved", "completed"])));
  if (!e) return fail("Event not found.", 404);
  const rsvps = await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, e.id));
  // Only the organizer, council members and people who registered can join the coordination thread.
  if (e.organizerId !== user.id && !can(user, "content:manage") && !rsvps.some((r) => r.userId === user.id)) return fail("Register for this event to join the discussion.", 403);
  await db.insert(eventMessages).values({ eventId: e.id, authorId: user.id, body: body.body });
  await notify(e.organizerId === user.id ? rsvps.map((r) => r.userId) : [e.organizerId], `New message about "${e.title}"`, `/events/${e.id}`);
  return { message: "Message posted." };
});
