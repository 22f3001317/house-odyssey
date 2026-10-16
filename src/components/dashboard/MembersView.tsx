import { desc, ilike, or, sql } from "drizzle-orm";
import { houses } from "@/data/seed";
import { getDb, users } from "@/lib/db";
const SIZE = 25;
export default async function MembersView({ sp }: { sp: { q?: string; page?: string } }) {
  const page = Math.max(Number(sp.page) || 1, 1), term = (sp.q ?? "").replace(/[%_]/g, "").slice(0, 60);
  const where = term ? or(ilike(users.name, `%${term}%`), ilike(users.email, `%${term}%`)) : undefined;
  const db = await getDb();
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(SIZE).offset((page - 1) * SIZE),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(where),
  ]);
  const th = "border-b-2 border-ink p-2 text-left whitespace-nowrap", td = "border-b border-ink/20 p-2 whitespace-nowrap", day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "never");
  const link = (p: number) => `/dashboard?tab=members&q=${encodeURIComponent(term)}&page=${p}`;
  return (
    <div>
      <h2 className="font-display text-3xl font-bold">All members</h2><p className="mt-1">{n} {term ? "matching" : "signed-up"} members. This page shows personal details: handle it with care.</p>
      <form className="mt-4 flex flex-wrap gap-2" role="search"><input type="hidden" name="tab" value="members" /><label htmlFor="q" className="sr-only">Search members</label><input id="q" name="q" defaultValue={term} placeholder="Search name or email" className="flex-1 rounded-lg border-2 border-ink p-2" /><button className="rounded-full border-2 border-ink px-4 font-bold">Search</button><a className="rounded-full border-2 border-ink bg-compass px-4 py-2 font-bold" href="/api/admin/export">Download CSV</a></form>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Name", "Email", "Role", "Status", "House", "XP", "Joined", "Last seen"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((u) => <tr key={u.id}><td className={td}>{u.name}</td><td className={td}>{u.email}</td><td className={td}>{u.role}</td><td className={td}>{u.verification}</td><td className={td}>{houses.find((h) => h.slug === u.houseSlug)?.name ?? "-"}</td><td className={td}>{u.xp}</td><td className={td}>{day(u.createdAt)}</td><td className={td}>{day(u.lastSeenAt)}</td></tr>)}</tbody></table></div>
      {rows.length === 0 && <p className="mt-4 rounded-xl border-2 border-dashed border-ink p-4">No members found.</p>}
      <nav className="mt-4 flex gap-4" aria-label="Pages">{page > 1 && <a className="underline" href={link(page - 1)}>Previous</a>}{page * SIZE < n && <a className="underline" href={link(page + 1)}>Next</a>}<a className="ml-auto underline" href="/dashboard?tab=analytics">Analytics</a></nav>
    </div>
  );
}
