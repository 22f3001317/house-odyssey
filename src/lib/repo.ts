import { and, asc, eq, gte } from "drizzle-orm";
import { houses } from "@/data/seed";
import { events, getDb } from "@/lib/db";
export async function getHouses() { return houses; }
export async function getHouse(slug: string) { return houses.find((h) => h.slug === slug) ?? null; }
// Public view: approved, upcoming events only, with no location or organizer details.
export async function getUpcomingEvents() {
  try {
    const db = await getDb();
    const rows = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt, summary: events.description }).from(events).where(and(eq(events.status, "approved"), gte(events.startsAt, new Date()))).orderBy(asc(events.startsAt)).limit(5);
    return rows.map((r) => ({ id: r.id, title: r.title, date: r.startsAt.toISOString().slice(0, 10), summary: r.summary }));
  } catch { return []; }
}
