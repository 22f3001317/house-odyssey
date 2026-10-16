import Link from "next/link";
import { and, asc, desc, eq, gte, ilike, inArray, lt, or } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import ApiForm from "@/components/ApiForm";
import { requirePermission } from "@/lib/auth";
import { eventRsvps, events, getDb, savedItems } from "@/lib/db";
import { TRACK_LABEL, TRACKS } from "@/lib/tracks";
export const dynamic = "force-dynamic";
export const metadata = { title: "Events | House Odyssey" };
type SP = { q?: string; format?: string; track?: string; when?: string };
export default async function Events({ searchParams }: { searchParams: Promise<SP> }) {
  const u = await requirePermission("community:read");
  const sp = await searchParams, db = await getDb(), now = new Date();
  const when = sp.when === "past" || sp.when === "mine" ? sp.when : "upcoming", term = (sp.q ?? "").replace(/[%_]/g, "").slice(0, 60);
  const mineIds = db.select({ id: eventRsvps.eventId }).from(eventRsvps).where(eq(eventRsvps.userId, u.id));
  const savedIds = db.select({ id: savedItems.refId }).from(savedItems).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "event")));
  const base = when === "mine" ? or(eq(events.organizerId, u.id), inArray(events.id, mineIds), inArray(events.id, savedIds))
    : when === "past" ? and(inArray(events.status, ["approved", "completed"]), lt(events.startsAt, now)) : and(eq(events.status, "approved"), gte(events.startsAt, now));
  const rows = await db.select().from(events).where(and(base,
    term ? or(ilike(events.title, `%${term}%`), ilike(events.description, `%${term}%`)) : undefined,
    sp.format === "online" || sp.format === "offline" ? eq(events.format, sp.format) : undefined,
    (TRACKS as readonly string[]).includes(sp.track ?? "") ? eq(events.track, sp.track!) : undefined)).orderBy(when === "past" ? desc(events.startsAt) : asc(events.startsAt)).limit(40);
  const ids = rows.map((r) => r.id);
  const [rs, sv] = ids.length ? await Promise.all([
    db.select().from(eventRsvps).where(and(eq(eventRsvps.userId, u.id), inArray(eventRsvps.eventId, ids))),
    db.select().from(savedItems).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "event"), inArray(savedItems.refId, ids))),
  ]) : [[], []];
  const going = new Map(rs.map((r) => [r.eventId, r])), saved = new Set(sv.map((s) => s.refId));
  const sel = "rounded-lg border-2 border-ink bg-white p-2", tab = (w: string, l: string) => <Link key={w} href={`/events?when=${w}`} aria-current={when === w ? "page" : undefined} className={`rounded-full border-2 border-ink px-4 py-1 font-bold ${when === w ? "bg-compass" : "bg-white"}`}>{l}</Link>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Events & meetups</h1>
      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Event lists">{tab("upcoming", "Upcoming")}{tab("mine", "My events")}{tab("past", "Past")}</nav>
      <form className="mt-4 flex flex-wrap gap-2" role="search"><input type="hidden" name="when" value={when} /><label htmlFor="q" className="sr-only">Search events</label><input id="q" name="q" defaultValue={term} placeholder="Search" className={`${sel} flex-1`} />
        <label htmlFor="format" className="sr-only">Format</label><select id="format" name="format" defaultValue={sp.format ?? ""} className={sel}><option value="">Any format</option><option value="online">Online</option><option value="offline">In person</option></select>
        <label htmlFor="track" className="sr-only">Track</label><select id="track" name="track" defaultValue={sp.track ?? ""} className={sel}><option value="">Any track</option>{TRACKS.map((t) => <option key={t} value={t}>{TRACK_LABEL[t]}</option>)}</select><button className="rounded-full border-2 border-ink px-4 font-bold">Filter</button></form>
      <ul className="mt-6 space-y-4">{rows.length === 0 && <li className="rounded-xl border-2 border-dashed border-ink p-6">No events match. Try another filter, or propose one below.</li>}
        {rows.map((e) => { const r = going.get(e.id); return (
          <li key={e.id} className="rounded-2xl border-2 border-ink bg-white p-5"><h2 className="font-display text-xl font-bold"><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link></h2>
            <p className="text-sm text-moss">{e.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC · {e.format === "offline" ? "in person" : "online"} · {TRACK_LABEL[(TRACKS as readonly string[]).includes(e.track) ? (e.track as (typeof TRACKS)[number]) : "community"]}{e.organizerId === u.id ? ` · Your proposal: ${e.status}` : ""}{r ? ` · You: ${r.attended ? "attended" : r.status}` : ""}</p>
            <p className="mt-2">{e.description.slice(0, 160)}</p><div className="mt-3 w-32"><ActionButton endpoint="/api/saved" body={{ kind: "event", refId: e.id, saved: !saved.has(e.id) }} label={saved.has(e.id) ? "Unsave" : "Save"} /></div></li>); })}</ul>
      <section className="mt-10 rounded-2xl border-2 border-ink bg-sea p-5"><h2 className="mb-4 font-display text-2xl font-bold">Propose a meetup</h2>
        <ApiForm endpoint="/api/events" submitLabel="Submit proposal" fields={[{ name: "title", label: "Title" }, { name: "description", label: "Purpose and plan", multiline: true }, { name: "startsAt", label: "Date and time", type: "datetime-local" }, { name: "format", label: "Format", options: ["online", "offline"] }, { name: "track", label: "Track", options: [...TRACKS] }, { name: "location", label: "Location or meeting platform (optional)", optional: true }]} /></section></div>
  );
}
