import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import { requirePermission } from "@/lib/auth";
import { events, getDb, posts, savedItems } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Saved | House Odyssey" };
export default async function Saved() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const [ps, es] = await Promise.all([
    db.select({ id: posts.id, title: posts.title, kind: posts.kind, url: posts.url, body: posts.body }).from(savedItems).innerJoin(posts, eq(posts.id, savedItems.refId)).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "post"), eq(posts.status, "published"))).orderBy(desc(savedItems.createdAt)),
    db.select({ id: events.id, title: events.title, startsAt: events.startsAt }).from(savedItems).innerJoin(events, eq(events.id, savedItems.refId)).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "event"), eq(events.status, "approved"))).orderBy(desc(savedItems.createdAt)),
  ]);
  const row = "flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-white p-4";
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12"><h1 className="font-display text-4xl font-bold">Saved</h1>
      <section><h2 className="font-display text-2xl font-bold">Posts, questions and notes</h2><ul className="mt-3 space-y-3">{ps.length === 0 && <li className="rounded-xl border-2 border-dashed border-ink p-4">Nothing saved yet. Use "Save" on any post, question or resource.</li>}
        {ps.map((p) => <li key={p.id} className={row}><div><p className="font-semibold">{p.kind === "question" ? <Link className="underline" href={`/questions/${p.id}`}>{p.title}</Link> : p.title}</p>{p.url && <a className="text-sm underline" href={p.url} target="_blank" rel="noopener noreferrer">Open resource</a>}</div><ActionButton endpoint="/api/saved" body={{ kind: "post", refId: p.id, saved: false }} label="Remove" /></li>)}</ul></section>
      <section><h2 className="font-display text-2xl font-bold">Events</h2><ul className="mt-3 space-y-3">{es.length === 0 && <li className="rounded-xl border-2 border-dashed border-ink p-4">No saved events.</li>}
        {es.map((e) => <li key={e.id} className={row}><div><Link className="font-semibold underline" href={`/events/${e.id}`}>{e.title}</Link><p className="text-sm">{e.startsAt.toISOString().slice(0, 10)}</p></div><ActionButton endpoint="/api/saved" body={{ kind: "event", refId: e.id, saved: false }} label="Remove" /></li>)}</ul></section></div>
  );
}
