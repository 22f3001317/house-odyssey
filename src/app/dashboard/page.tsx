import Link from "next/link";
import { eq } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import Pip from "@/components/Pip";
import { houses } from "@/data/seed";
import { demoVerification, requireUser } from "@/lib/auth";
import { getDb, quests, questCompletions } from "@/lib/db";
import { levelOf, levelProgress } from "@/lib/xp";
export const dynamic = "force-dynamic";
const copy: Record<string, string> = {
  email_pending: "Confirm your email to continue.", id_pending: "Email confirmed. Student ID verification is the last step before community features unlock.",
  under_review: "Your student ID is under review.", rejected: "Your verification was not approved. Contact the organizers.", resubmission_required: "Please resubmit your verification details.",
};
export default async function Dashboard() {
  const u = await requireUser();
  if (u.verification !== "verified") return (
    <div className="mx-auto max-w-2xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Hi, {u.name}</h1><p className="mt-4 text-lg">{copy[u.verification]}</p>
      {u.verification === "id_pending" && demoVerification() && <div className="mt-6 rounded-xl border-2 border-dashed border-ink p-4"><p className="mb-3 text-sm">Prototype only: this simulates the ID check. A real deployment would use an institutional integration.</p><ActionButton endpoint="/api/auth/simulate" label="Simulate verification" className="bg-compass" /></div>}
      <div className="mt-8"><ActionButton endpoint="/api/auth/logout" label="Log out" /></div></div>);
  const db = await getDb();
  const [all, mine] = await Promise.all([db.select().from(quests).where(eq(quests.active, true)), db.select().from(questCompletions).where(eq(questCompletions.userId, u.id))]);
  const done = new Set(mine.map((m) => m.questId)); const open = all.filter((q) => !done.has(q.id)).slice(0, 3);
  const house = houses.find((h) => h.slug === u.houseSlug); const interests = u.interests ? u.interests.split(",") : [];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4"><Pip size={64} /><div><h1 className="font-display text-4xl font-bold">Hi, {u.name}</h1><p>You are verified.{house ? ` Selected house: ${house.name}.` : ""}</p></div></div>
      {u.onboarding !== "done" && <p className="mt-6 rounded-xl border-2 border-ink bg-compass/40 p-4">Your adventure isn't finished. <Link className="font-bold underline" href="/onboarding">Continue onboarding</Link></p>}
      <section className="mt-8 rounded-2xl border-2 border-ink bg-white p-5" aria-label="Progress"><p className="font-display text-2xl font-bold">Level {levelOf(u.xp)} · {u.xp} XP</p>
        <div className="mt-2 h-4 rounded-full border-2 border-ink bg-sea" role="progressbar" aria-valuenow={levelProgress(u.xp)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level"><div className="h-full rounded-full bg-compass" style={{ width: `${levelProgress(u.xp)}%` }} /></div></section>
      {interests.length > 0 && <p className="mt-6">Your interests: {interests.join(", ")}</p>}
      <section className="mt-8"><h2 className="font-display text-2xl font-bold">Next quests</h2>{open.length ? <ul className="mt-3 space-y-2">{open.map((q) => <li key={q.id}><Link href="/quests" className="underline">{q.title}</Link> (+{q.xp} XP)</li>)}</ul> : <p className="mt-2">All current quests are done. Check back soon.</p>}</section>
      <div className="mt-8"><ActionButton endpoint="/api/auth/logout" label="Log out" /></div>
    </div>
  );
}
