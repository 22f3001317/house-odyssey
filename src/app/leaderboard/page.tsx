import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { houses } from "@/data/seed";
import { requirePermission } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { levelOf } from "@/lib/xp";
export const dynamic = "force-dynamic";
export default async function Leaderboard() {
  await requirePermission("community:read");
  const db = await getDb();
  const top = await db.select({ id: users.id, name: users.name, xp: users.xp, house: users.houseSlug }).from(users).where(and(eq(users.verification, "verified"), eq(users.leaderboard, true))).orderBy(desc(users.xp)).limit(20);
  const totals = await db.select({ house: users.houseSlug, total: sql<number>`coalesce(sum(${users.xp}),0)::int` }).from(users).where(eq(users.verification, "verified")).groupBy(users.houseSlug);
  const name = (s: string | null) => houses.find((h) => h.slug === s)?.name ?? "No house yet";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Leaderboard</h1>
      <h2 className="mt-6 font-display text-2xl font-bold">Houses</h2><ul className="mt-2">{totals.sort((a, b) => b.total - a.total).map((t) => <li key={t.house ?? "none"}>{name(t.house)}: {t.total} XP</li>)}</ul>
      <h2 className="mt-6 font-display text-2xl font-bold">Top members</h2>
      <ol className="mt-2 space-y-1">{top.map((t, i) => <li key={t.id}>{i + 1}. <Link className="underline" href={`/members/${t.id}`}>{t.name}</Link> · {name(t.house)} · Level {levelOf(t.xp)} · {t.xp} XP</li>)}</ol></div>
  );
}
