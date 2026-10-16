import ApiForm, { type Field } from "./ApiForm";
import PostList from "./PostList";
import { requirePermission } from "@/lib/auth";
import { feed } from "@/lib/feed";
import { getDb, savedItems } from "@/lib/db";
import { TRACKS } from "@/lib/tracks";
import { and, eq } from "drizzle-orm";
export default async function FeedPage({ kind, title, intro, fields, searchParams, submitLabel }: { kind: "post" | "question" | "resource"; title: string; intro: string; fields: Field[]; searchParams: Promise<{ q?: string; page?: string }>; submitLabel: string }) {
  const me = await requirePermission("community:read");
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const list = await feed(kind, sp.q, page);
  const db = await getDb();
  const saved = new Set((await db.select({ id: savedItems.refId }).from(savedItems).where(and(eq(savedItems.userId, me.id), eq(savedItems.kind, "post")))).map((s) => s.id));
  const rows = list.map((r) => ({ ...r, saved: saved.has(r.id) }));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">{title}</h1><p className="mt-2">{intro}</p>
      <form className="mt-6 flex gap-2" role="search"><label htmlFor="q" className="sr-only">Search</label><input id="q" name="q" defaultValue={sp.q} placeholder="Search titles" className="flex-1 rounded-lg border-2 border-ink p-2" /><button className="rounded-full border-2 border-ink px-4 font-bold">Search</button></form>
      <div className="mt-6"><PostList rows={rows} kind={kind} /></div>
      <nav className="mt-4 flex gap-4" aria-label="Pages">{page > 1 && <a className="underline" href={`?q=${sp.q ?? ""}&page=${page - 1}`}>Previous</a>}{rows.length === 10 && <a className="underline" href={`?q=${sp.q ?? ""}&page=${page + 1}`}>Next</a>}</nav>
      <section className="mt-10 rounded-2xl border-2 border-ink bg-sea p-5"><h2 className="mb-4 font-display text-2xl font-bold">Add yours</h2><ApiForm endpoint="/api/posts" extra={{ kind }} fields={[...fields, { name: "track", label: "Track", options: [...TRACKS] }]} submitLabel={submitLabel} /></section>
    </div>
  );
}
