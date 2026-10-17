import Link from "next/link";
import { and, asc, desc, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import Avatar from "@/components/Avatar";
import { houses } from "@/data/seed";
import type { User } from "@/lib/auth";
import { announcements, eventRsvps, events, getDb, notifications, posts, questCompletions, quests, savedItems, xpLog } from "@/lib/db";
import { getPortfolio } from "@/lib/portfolio";
import { csv } from "@/lib/profile";
import { asTrack, trackOfCategory, tracksOfInterests, TRACK_LABEL } from "@/lib/tracks";
import { levelOf, levelProgress } from "@/lib/xp";

const Card = ({ title, children, href, cta }: { title: string; children: React.ReactNode; href?: string; cta?: string }) => (
  <section className="rounded-2xl border-2 border-ink bg-white p-5"><h2 className="font-display text-xl font-bold">{title}</h2><div className="mt-3 space-y-2">{children}</div>{href && <p className="mt-3"><Link className="font-bold underline" href={href}>{cta}</Link></p>}</section>);
const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-sm">{children}</p>;
const when = (d: Date) => d.toISOString().slice(0, 10);

export default async function StudentDashboard({ u }: { u: User }) {
  const db = await getDb(), now = new Date();
  const interests = csv(u.interests), myTracks = tracksOfInterests(interests), house = houses.find((h) => h.slug === u.houseSlug);
  const [upcoming, mine, allQuests, done, sPosts, sEvents, unread, [{ n: unreadN }], ann, xps, pendQ, pendR, props, unanswered, portfolio] = await Promise.all([
    db.select().from(events).where(and(eq(events.status, "approved"), gte(events.startsAt, now))).orderBy(asc(events.startsAt)).limit(12),
    db.select({ e: events, status: eventRsvps.status }).from(eventRsvps).innerJoin(events, eq(events.id, eventRsvps.eventId)).where(and(eq(eventRsvps.userId, u.id), eq(events.status, "approved"), gte(events.startsAt, now))).orderBy(asc(events.startsAt)).limit(5),
    db.select().from(quests).where(eq(quests.active, true)),
    db.select().from(questCompletions).where(eq(questCompletions.userId, u.id)),
    db.select({ id: posts.id, title: posts.title, kind: posts.kind }).from(savedItems).innerJoin(posts, eq(posts.id, savedItems.refId)).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "post"), eq(posts.status, "published"))).orderBy(desc(savedItems.createdAt)).limit(3),
    db.select({ id: events.id, title: events.title }).from(savedItems).innerJoin(events, eq(events.id, savedItems.refId)).where(and(eq(savedItems.userId, u.id), eq(savedItems.kind, "event"), eq(events.status, "approved"))).orderBy(desc(savedItems.createdAt)).limit(3),
    db.select().from(notifications).where(and(eq(notifications.userId, u.id), eq(notifications.read, false))).orderBy(desc(notifications.createdAt)).limit(3),
    db.select({ n: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, u.id), eq(notifications.read, false))),
    db.select().from(announcements).where(and(eq(announcements.active, true), or(isNull(announcements.houseSlug), u.houseSlug ? eq(announcements.houseSlug, u.houseSlug) : undefined))).orderBy(desc(announcements.createdAt)).limit(3),
    db.select().from(xpLog).where(eq(xpLog.userId, u.id)).orderBy(desc(xpLog.createdAt)).limit(5),
    db.select({ title: quests.title }).from(questCompletions).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(and(eq(questCompletions.userId, u.id), eq(questCompletions.status, "pending"))),
    db.select({ title: posts.title }).from(posts).where(and(eq(posts.authorId, u.id), eq(posts.kind, "resource"), eq(posts.status, "pending"))),
    db.select({ id: events.id, title: events.title, status: events.status }).from(events).where(and(eq(events.organizerId, u.id), inArray(events.status, ["submitted", "rejected"]))).orderBy(desc(events.createdAt)).limit(3),
    db.select({ id: posts.id, title: posts.title }).from(posts).where(and(eq(posts.kind, "question"), eq(posts.status, "published"), sql`${posts.authorId} <> ${u.id}`, sql`not exists (select 1 from answers a where a.question_id = ${posts.id})`)).orderBy(desc(posts.createdAt)).limit(3),
    getPortfolio(u.id, u.onboarding === "done"),
  ]);
  const match = (track: string) => myTracks.has(asTrack(track));
  const recEvents = [...upcoming].sort((a, b) => Number(match(b.track)) - Number(match(a.track))).slice(0, 4);
  const doneIds = new Set(done.map((d) => d.questId));
  const openQuests = allQuests.filter((q) => !doneIds.has(q.id)).sort((a, b) => Number(myTracks.has(trackOfCategory(b.category))) - Number(myTracks.has(trackOfCategory(a.category)))).slice(0, 3);
  const overlap = (h: (typeof houses)[number]) => h.interests.filter((i) => interests.includes(i)).length;
  const suggestions = houses.filter((h) => h.slug !== u.houseSlug && overlap(h) > 0).sort((a, b) => overlap(b) - overlap(a)).slice(0, 2);
  const nextMilestone = portfolio.milestones.find((m) => !m.earned);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4"><Avatar k={u.avatar} size={72} /><div><h1 className="font-display text-4xl font-bold">Hi, {u.name}</h1>
        <p>{house ? <><span className="font-semibold" style={{ color: house.color }}>{house.name}</span> {house.companion.emoji}</> : "No house chosen yet"} · Level {levelOf(u.xp)} · {u.xp} XP</p></div></header>
      {u.onboarding !== "done" && <p className="rounded-xl border-2 border-ink bg-compass/40 p-4">Your adventure isn't finished. <Link className="font-bold underline" href="/onboarding">Continue onboarding</Link></p>}
      {ann.length > 0 && <section aria-label="Announcements" className="space-y-2">{ann.map((a) => <div key={a.id} className="rounded-xl border-2 border-ink bg-dusk p-4 text-sea"><p className="font-bold">{a.title}{a.houseSlug ? ` (${houses.find((h) => h.slug === a.houseSlug)?.name ?? "house"})` : ""}</p><p>{a.body}</p></div>)}</section>}
      <section className="rounded-2xl border-2 border-ink bg-white p-5" aria-label="Progress"><div className="flex flex-wrap justify-between gap-2"><p className="font-display text-xl font-bold">Level {levelOf(u.xp)}</p><p>{levelProgress(u.xp)}/100 XP to next level</p></div>
        <div className="mt-2 h-4 rounded-full border-2 border-ink bg-sea" role="progressbar" aria-valuenow={levelProgress(u.xp)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level"><div className="h-full rounded-full bg-compass" style={{ width: `${levelProgress(u.xp)}%` }} /></div>
        {nextMilestone && <p className="mt-3 text-sm">Next milestone: <Link className="underline" href="/achievements">{nextMilestone.title}</Link> ({nextMilestone.current}/{nextMilestone.target})</p>}</section>
      <div className="grid gap-6 md:grid-cols-2">
        <Card title={`Notifications${unreadN ? ` (${unreadN} new)` : ""}`} href="/notifications" cta="All notifications">{unread.length ? unread.map((n) => <p key={n.id}><Link className="underline" href={n.href}>{n.title}</Link></p>) : <Empty>You're all caught up.</Empty>}</Card>
        <Card title="Your events" href="/events?when=mine" cta="My events">{mine.length ? mine.map(({ e, status }) => <p key={e.id}><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link><br /><span className="text-sm">{when(e.startsAt)} · {status}</span></p>) : <Empty>You haven't registered for anything yet.</Empty>}</Card>
        <Card title="Upcoming for you" href="/events" cta="Browse events">{recEvents.length ? recEvents.map((e) => <p key={e.id}><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link><br /><span className="text-sm">{when(e.startsAt)} · {TRACK_LABEL[asTrack(e.track)]}{match(e.track) ? " · matches your interests" : ""}</span></p>) : <Empty>No upcoming events yet. Why not propose one?</Empty>}</Card>
        <Card title="Quests for you" href="/quests" cta="Questboard">{openQuests.length ? openQuests.map((q) => <p key={q.id}><Link className="underline" href="/quests">{q.title}</Link> (+{q.xp} XP){myTracks.has(trackOfCategory(q.category)) ? <span className="text-sm"> · matches your interests</span> : null}</p>) : <Empty>All current quests are done. Check back soon.</Empty>}</Card>
        <Card title="Your submissions" href="/profile" cta="My profile">{pendQ.length + pendR.length + props.length ? <>{pendQ.map((q) => <p key={q.title}>Quest "{q.title}": waiting for approval</p>)}{pendR.map((r) => <p key={r.title}>Resource "{r.title}": waiting for review</p>)}{props.map((p) => <p key={p.id}><Link className="underline" href={`/events/${p.id}`}>{p.title}</Link>: {p.status}</p>)}</> : <Empty>Nothing is waiting on a reviewer.</Empty>}</Card>
        <Card title="Recent activity" href="/achievements" cta="My achievements">{xps.length ? xps.map((x) => <p key={x.id}>+{x.amount} · {x.reason}</p>) : <Empty>Complete a quest to get started.</Empty>}</Card>
        <Card title="Saved" href="/saved" cta="All saved">{sPosts.length + sEvents.length ? <>{sPosts.map((p) => <p key={p.id}>{p.kind === "question" ? <Link className="underline" href={`/questions/${p.id}`}>{p.title}</Link> : p.title}</p>)}{sEvents.map((e) => <p key={e.id}><Link className="underline" href={`/events/${e.id}`}>{e.title}</Link></p>)}</> : <Empty>Save posts, notes and events to find them here.</Empty>}</Card>
        <Card title="Recommended" href="/questions" cta="All questions">
          {unanswered.length > 0 && <><p className="font-semibold">Questions that need an answer</p>{unanswered.map((q) => <p key={q.id}><Link className="underline" href={`/questions/${q.id}`}>{q.title}</Link></p>)}</>}
          {suggestions.length > 0 && <><p className="font-semibold">Houses with shared interests</p>{suggestions.map((h) => <p key={h.slug}><Link className="underline" href={`/houses/${h.slug}`}>{h.name}</Link> <span className="text-sm">· {h.interests.filter((i) => interests.includes(i)).join(", ")}</span></p>)}</>}
          {unanswered.length + suggestions.length === 0 && <Empty>Add interests in <Link className="underline" href="/profile/edit">your profile</Link> to get recommendations.</Empty>}</Card>
      </div>
      <div><ActionButton endpoint="/api/auth/logout" label="Log out" /></div>
    </div>
  );
}
