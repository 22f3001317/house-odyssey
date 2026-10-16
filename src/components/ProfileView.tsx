import Link from "next/link";
import { and, eq } from "drizzle-orm";
import Avatar from "./Avatar";
import ContribByTrack from "./ContribByTrack";
import { houses } from "@/data/seed";
import type { User } from "@/lib/auth";
import { getDb, posts, questCompletions, quests } from "@/lib/db";
import { getPortfolio } from "@/lib/portfolio";
import { csv, SECTION_LABEL, type Section } from "@/lib/profile";
import { TRACK_LABEL } from "@/lib/tracks";

// One profile view for both the owner ("my space") and other members. Other members only see sections the owner made visible.
export default async function ProfileView({ u, isSelf }: { u: User; isSelf: boolean }) {
  const db = await getDb();
  const p = await getPortfolio(u.id, u.onboarding === "done");
  const vis = new Set(csv(u.visibility)), show = (s: Section) => isSelf || vis.has(s);
  const tag = (s: Section) => isSelf ? <span className="ml-2 text-xs font-normal text-moss">{vis.has(s) ? "Visible to members" : "Only you"}</span> : null;
  const house = houses.find((h) => h.slug === u.houseSlug), interests = csv(u.interests), skills = csv(u.skills);
  let featured: { title: string; note: string } | null = null;
  if (u.featuredRef) {
    const [kind, ref] = u.featuredRef.split(":");
    if (kind === "post") { const [r] = await db.select({ title: posts.title, body: posts.body }).from(posts).where(and(eq(posts.id, ref), eq(posts.authorId, u.id), eq(posts.status, "published"))); if (r) featured = { title: r.title, note: r.body.slice(0, 200) }; }
    else { const [r] = await db.select({ title: quests.title }).from(questCompletions).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(and(eq(questCompletions.userId, u.id), eq(questCompletions.questId, ref), eq(questCompletions.status, "approved"))); if (r) featured = { title: r.title, note: "A completed quest." }; }
  }
  const earned = p.milestones.filter((m) => m.earned), next = p.milestones.filter((m) => !m.earned).slice(0, 2);
  const H = ({ s, children }: { s: Section; children: React.ReactNode }) => <h2 className="font-display text-2xl font-bold">{children ?? SECTION_LABEL[s]}{tag(s)}</h2>;
  const card = "rounded-2xl border-2 border-ink bg-white p-5";
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-5 rounded-2xl border-2 border-ink p-6" style={{ background: house?.tint ?? "#fff", boxShadow: `5px 5px 0 ${house?.color ?? "#5A2431"}` }}>
        <Avatar k={u.avatar} size={96} />
        <div><h1 className="font-display text-4xl font-bold">{u.name}</h1>
          <p className="mt-1 font-semibold" style={{ color: house?.color }}>{house ? house.name : "No house chosen yet"}</p>
          {isSelf && <p className="mt-3 flex flex-wrap gap-4 font-bold underline"><Link href="/profile/edit">Edit profile</Link><Link href="/achievements">My achievements</Link><Link href="/settings">Settings</Link></p>}</div>
      </header>
      {show("bio") && <section className={card}><H s="bio">About</H>{u.bio ? <p className="mt-2 whitespace-pre-wrap">{u.bio}</p> : <p className="mt-2">{isSelf ? "Add a short bio so people know who you are." : "No bio yet."}</p>}</section>}
      {(show("skills") || show("interests")) && (skills.length > 0 || interests.length > 0 || isSelf) && <section className={card}>
        {show("skills") && <><H s="skills">Skills</H><ul className="mt-2 flex flex-wrap gap-2">{skills.length ? skills.map((s) => <li key={s} className="rounded-full border-2 border-ink px-3 py-1">{s}</li>) : <li>None added yet.</li>}</ul></>}
        {show("interests") && <><h2 className="mt-5 font-display text-2xl font-bold">Interests{tag("interests")}</h2><ul className="mt-2 flex flex-wrap gap-2">{interests.length ? interests.map((s) => <li key={s} className="rounded-full bg-compass px-3 py-1 font-semibold">{s}</li>) : <li>None chosen yet.</li>}</ul></>}</section>}
      {show("tracks") && <section className={card}><H s="tracks">Tracks</H><p className="text-sm">Where this member has verified contributions.</p>
        <ul className="mt-2 flex flex-wrap gap-2">{p.byTrack.length ? p.byTrack.map((g) => <li key={g.track} className="rounded-full border-2 border-ink bg-sea px-4 py-1 font-semibold">{TRACK_LABEL[g.track]}</li>) : <li>No verified contributions yet.</li>}</ul></section>}
      {show("badges") && <section className={card}><H s="badges">Badges and milestones</H>
        {p.badges.length + earned.length ? <ul className="mt-2 flex flex-wrap gap-2">{p.badges.map((b) => <li key={b.badge} className="rounded-full border-2 border-ink bg-compass px-4 py-1 font-bold" title={b.title}>{b.badge}</li>)}{earned.map((m) => <li key={m.code} className="rounded-full border-2 border-ink bg-dusk px-4 py-1 font-bold text-sea" title={m.description}>{m.title}</li>)}</ul> : <p className="mt-2">No badges yet. They are earned for approved quests and verified milestones.</p>}
        {isSelf && next.length > 0 && <div className="mt-4"><p className="font-semibold">Next up</p><ul className="mt-1 space-y-2">{next.map((m) => <li key={m.code}>{m.title}: {m.current}/{m.target}<div className="h-3 rounded-full border-2 border-ink bg-sea" role="progressbar" aria-label={`${m.title} progress`} aria-valuenow={m.current} aria-valuemin={0} aria-valuemax={m.target}><div className="h-full rounded-full bg-compass" style={{ width: `${(m.current / m.target) * 100}%` }} /></div></li>)}</ul></div>}</section>}
      {show("featured") && (featured || isSelf) && <section className={card}><H s="featured">Featured contribution</H>{featured ? <><p className="mt-2 font-display text-xl font-bold">{featured.title}</p><p className="whitespace-pre-wrap">{featured.note}</p></> : <p className="mt-2">Choose something you're proud of in <Link className="underline" href="/profile/edit">Edit profile</Link>.</p>}</section>}
      {show("contributions") && <section className={card}><H s="contributions">Contribution history</H><div className="mt-3"><ContribByTrack groups={p.byTrack} /></div></section>}
    </div>
  );
}
