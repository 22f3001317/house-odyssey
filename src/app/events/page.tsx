import { and, asc, eq, gte, or } from "drizzle-orm";
import ApiForm from "@/components/ApiForm";
import { requirePermission } from "@/lib/auth";
import { events, getDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Events() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const rows = await db.select().from(events).where(or(and(eq(events.status, "approved"), gte(events.startsAt, new Date())), eq(events.organizerId, u.id))).orderBy(asc(events.startsAt));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Events & meetups</h1>
      <ul className="mt-6 space-y-4">{rows.length === 0 && <li className="rounded-xl border-2 border-dashed border-ink p-6">No events yet. Propose one below.</li>}
        {rows.map((e) => (<li key={e.id} className="rounded-2xl border-2 border-ink bg-white p-5"><h2 className="font-display text-xl font-bold">{e.title}</h2>
          <p className="text-sm text-moss">{e.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC · {e.format}{e.location ? ` · ${e.location}` : ""}{e.organizerId === u.id ? ` · Your proposal: ${e.status}` : ""}</p><p className="mt-2">{e.description}</p></li>))}</ul>
      <section className="mt-10 rounded-2xl border-2 border-ink bg-sea p-5"><h2 className="mb-4 font-display text-2xl font-bold">Propose a meetup</h2>
        <ApiForm endpoint="/api/events" submitLabel="Submit proposal" fields={[{ name: "title", label: "Title" }, { name: "description", label: "Purpose and plan", multiline: true }, { name: "startsAt", label: "Date and time", type: "datetime-local" }, { name: "format", label: "Format", options: ["online", "offline"] }, { name: "location", label: "Location or meeting platform (optional)", optional: true }]} /></section></div>
  );
}
