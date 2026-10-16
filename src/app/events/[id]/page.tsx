import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import ApiForm from "@/components/ApiForm";
import { can, requirePermission } from "@/lib/auth";
import { eventMessages, eventRsvps, events, getDb, savedItems, users } from "@/lib/db";
import { asTrack, TRACK_LABEL } from "@/lib/tracks";
export const dynamic = "force-dynamic";
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePermission("community:read");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await getDb();
  const [row] = await db.select({ e: events, organizer: users.name }).from(events).innerJoin(users, eq(users.id, events.organizerId)).where(eq(events.id, id));
  if (!row) notFound();
  const e = row.e, isOrg = e.organizerId === me.id, staff = can(me, "content:manage");
  if (!["approved", "completed"].includes(e.status) && !isOrg && !staff) notFound(); // proposals are private to the organizer and the council
  const rsvps = await db.select({ r: eventRsvps, name: users.name }).from(eventRsvps).innerJoin(users, eq(users.id, eventRsvps.userId)).where(eq(eventRsvps.eventId, e.id));
  const mine = rsvps.find((x) => x.r.userId === me.id)?.r, open = e.status === "approved", live = open || e.status === "completed", inThread = isOrg || staff || !!mine;
  const [sv] = await db.select().from(savedItems).where(and(eq(savedItems.userId, me.id), eq(savedItems.kind, "event"), eq(savedItems.refId, e.id)));
  const msgs = inThread && live ? await db.select({ m: eventMessages, name: users.name }).from(eventMessages).innerJoin(users, eq(users.id, eventMessages.authorId)).where(eq(eventMessages.eventId, e.id)).orderBy(asc(eventMessages.createdAt)) : [];
  const btn = (s: "going" | "interested" | "none", label: string) => <ActionButton key={s} endpoint="/api/events/rsvp" body={{ eventId: e.id, status: s }} label={label} className={mine?.status === s ? "bg-compass" : ""} />;
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div><h1 className="font-display text-4xl font-bold">{e.title}</h1>
        <p className="mt-1 text-moss">{e.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC · {e.format === "offline" ? "in person" : "online"} · {TRACK_LABEL[asTrack(e.track)]} · organized by {row.organizer} · status: {e.status}</p>
        {e.location && <p className="mt-1">Where: {e.location}</p>}<p className="mt-3 whitespace-pre-wrap">{e.description}</p></div>
      {open && !isOrg && <div className="flex flex-wrap items-start gap-3">{btn("going", "I'm going")}{btn("interested", "Interested")}{mine && !mine.attended && btn("none", "Remove")}
        <ActionButton endpoint="/api/saved" body={{ kind: "event", refId: e.id, saved: !sv }} label={sv ? "Unsave" : "Save"} /></div>}
      {mine?.attended && <p className="font-bold text-moss">Your attendance was confirmed.</p>}
      {(inThread || staff) && live && <section className="rounded-2xl border-2 border-ink bg-white p-5"><h2 className="font-display text-2xl font-bold">Who's coming</h2>
        <ul className="mt-2 space-y-2">{rsvps.length === 0 && <li>No one has registered yet.</li>}{rsvps.map(({ r, name }) => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
          <span><Link className="underline" href={`/members/${r.userId}`}>{name}</Link> · {r.attended ? "attended" : r.status}</span>
          {(isOrg || staff) && r.status === "going" && !r.attended && <ActionButton endpoint="/api/events/attendance" body={{ eventId: e.id, userId: r.userId, attended: true }} label="Confirm attended" />}</li>)}</ul></section>}
      {inThread && live && <section className="rounded-2xl border-2 border-ink bg-white p-5"><h2 className="font-display text-2xl font-bold">Coordination</h2>
        <ul className="mt-2 space-y-2">{msgs.length === 0 && <li>No messages yet.</li>}{msgs.map(({ m, name }) => <li key={m.id}><span className="text-sm text-moss">{name} · {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span><p className="whitespace-pre-wrap">{m.body}</p></li>)}</ul>
        <div className="mt-4"><ApiForm endpoint="/api/events/message" extra={{ eventId: e.id }} submitLabel="Post message" fields={[{ name: "body", label: "Message", multiline: true }]} /></div></section>}
      {live && !inThread && <p className="rounded-xl border-2 border-dashed border-ink p-4">Register as going or interested to see who's coming and join the discussion.</p>}
      <p><Link className="font-bold underline" href="/events">Back to events</Link></p>
    </div>
  );
}
