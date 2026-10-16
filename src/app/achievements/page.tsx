import Link from "next/link";
import ContribByTrack from "@/components/ContribByTrack";
import { houses } from "@/data/seed";
import { getUser } from "@/lib/auth";
import { getPortfolio } from "@/lib/portfolio";
export const dynamic = "force-dynamic";
export const metadata = { title: "Achievements | House Odyssey" };
export default async function Achievements() {
  const u = await getUser();
  if (!u || u.verification !== "verified") return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Student Achievements</h1><p className="mt-4 max-w-prose text-lg">Approved house milestones and event highlights will be listed here. Nothing appears publicly until it is approved. Verified students can sign in to see their own achievement showcase.</p></div>);
  const p = await getPortfolio(u.id, u.onboarding === "done"), house = houses.find((h) => h.slug === u.houseSlug);
  const earned = p.milestones.filter((m) => m.earned), open = p.milestones.filter((m) => !m.earned), card = "rounded-2xl border-2 border-ink bg-white p-5";
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="font-display text-4xl font-bold">My achievements</h1>
      <p>Only verified actions count here: quests a council member approved, answers the asker accepted, resources that were published and events whose attendance was confirmed. Showcase what you did, not how much you clicked.</p>
      <section className={card}><h2 className="font-display text-2xl font-bold">Earned</h2>
        {p.badges.length + earned.length ? <ul className="mt-2 flex flex-wrap gap-2">{p.badges.map((b) => <li key={b.badge} className="rounded-full border-2 border-ink bg-compass px-4 py-1 font-bold" title={b.title}>{b.badge}</li>)}{earned.map((m) => <li key={m.code} className="rounded-full border-2 border-ink bg-dusk px-4 py-1 font-bold text-sea" title={m.description}>{m.title}</li>)}</ul> : <p className="mt-2">Nothing earned yet. Try a <Link className="underline" href="/quests">quest</Link>.</p>}</section>
      <section className={card}><h2 className="font-display text-2xl font-bold">In progress (optional)</h2>
        <ul className="mt-3 space-y-4">{open.map((m) => <li key={m.code}><p className="font-semibold">{m.title}: {m.current}/{m.target}</p><p className="text-sm">{m.description}</p>
          <div className="mt-1 h-3 rounded-full border-2 border-ink bg-sea" role="progressbar" aria-label={`${m.title} progress`} aria-valuenow={m.current} aria-valuemin={0} aria-valuemax={m.target}><div className="h-full rounded-full bg-compass" style={{ width: `${(m.current / m.target) * 100}%` }} /></div></li>)}{open.length === 0 && <li>You've earned every milestone. Well done!</li>}</ul></section>
      <section className={card}><h2 className="font-display text-2xl font-bold">Completed quests and approved activities, by track</h2><div className="mt-3"><ContribByTrack groups={p.byTrack} cap={10} /></div></section>
      <section className={card}><h2 className="font-display text-2xl font-bold">House and event achievements</h2>
        <p className="mt-2">{house ? `Your house: ${house.name}.` : "You haven't chosen a house yet."}</p>
        <h3 className="mt-3 font-semibold">Events you organized (confirmed)</h3><ul className="list-disc pl-6">{p.organized.length ? p.organized.map((e) => <li key={e.id}><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link></li>) : <li>None yet.</li>}</ul>
        <h3 className="mt-3 font-semibold">Events you attended (confirmed by organizers)</h3><ul className="list-disc pl-6">{p.attended.length ? p.attended.map((e) => <li key={e.id}><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link> · {e.startsAt.toISOString().slice(0, 10)}</li>) : <li>None yet.</li>}</ul></section>
      <p><Link className="font-bold underline" href="/profile/edit">Choose a featured contribution for your profile</Link></p>
    </div>
  );
}
