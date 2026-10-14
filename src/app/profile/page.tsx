import { desc, eq, and, isNotNull } from "drizzle-orm";
import { houses } from "@/data/seed";
import { requirePermission } from "@/lib/auth";
import { getDb, questCompletions, quests, xpLog } from "@/lib/db";
import { levelOf } from "@/lib/xp";
export const dynamic = "force-dynamic";
export default async function Profile() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const badges = await db.select({ badge: quests.badge, title: quests.title }).from(questCompletions).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(and(eq(questCompletions.userId, u.id), eq(questCompletions.status, "approved"), isNotNull(quests.badge)));
  const history = await db.select().from(xpLog).where(eq(xpLog.userId, u.id)).orderBy(desc(xpLog.createdAt)).limit(10);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">{u.name}</h1>
      <p className="mt-2">{houses.find((h) => h.slug === u.houseSlug)?.name ?? "No house selected yet"} · Level {levelOf(u.xp)} · {u.xp} XP</p>
      <h2 className="mt-8 font-display text-2xl font-bold">Badges</h2>
      {badges.length ? <ul className="mt-2 flex flex-wrap gap-2">{badges.map((b) => <li key={b.badge} className="rounded-full border-2 border-ink bg-compass px-4 py-1 font-bold" title={b.title}>{b.badge}</li>)}</ul> : <p className="mt-2">No badges yet. Complete quests to earn them.</p>}
      <h2 className="mt-8 font-display text-2xl font-bold">Recent XP</h2><ul className="mt-2">{history.map((h) => <li key={h.id}>+{h.amount} · {h.reason}</li>)}</ul></div>
  );
}
