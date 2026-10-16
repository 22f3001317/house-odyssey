import { eq } from "drizzle-orm";
import QuestAction from "@/components/QuestAction";
import { getDb, quests, questCompletions } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { trackOfCategory, TRACK_LABEL } from "@/lib/tracks";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quests | House Odyssey" };
export default async function Quests() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const [all, mine] = await Promise.all([db.select().from(quests).where(eq(quests.active, true)), db.select().from(questCompletions).where(eq(questCompletions.userId, u.id))]);
  const status = new Map(mine.map((m) => [m.questId, m.status]));
  return (
    <div className="mx-auto max-w-4xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Questboard</h1><p className="mt-2">Optional tasks. Rewards are granted by the server once a quest is validated or approved.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">{all.map((q) => { const s = status.get(q.id); return (
        <li key={q.id} className="rounded-2xl border-2 border-ink bg-white p-5"><p className="text-sm uppercase tracking-wide text-moss">{q.category} · {TRACK_LABEL[trackOfCategory(q.category)]}</p><h2 className="font-display text-xl font-bold">{q.title}</h2>
          <p className="mt-1">{q.description}</p><p className="mt-2 font-semibold">+{q.xp} XP{q.badge ? ` · Badge: ${q.badge}` : ""}</p>
          {s ? <p className="mt-3 font-bold text-moss">{s === "approved" ? "Completed" : s === "pending" ? "Pending approval" : "Not approved"}</p> : <QuestAction slug={q.slug} kind={q.kind} />}</li>); })}</ul></div>
  );
}
