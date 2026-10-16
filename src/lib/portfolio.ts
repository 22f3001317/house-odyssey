import { and, desc, eq } from "drizzle-orm";
import { answers, eventRsvps, events, getDb, posts, questCompletions, quests } from "@/lib/db";
import { asTrack, trackOfCategory, TRACKS, type Track } from "@/lib/tracks";
import { evaluate, type Stats } from "@/lib/achievements";

export type Item = { track: Track; type: string; title: string; date: Date; href?: string };
const KIND: Record<string, string> = { post: "Post", question: "Question", resource: "Resource" };
export async function getPortfolio(userId: string, onboardingDone: boolean) {
  const db = await getDb();
  const [qs, ps, acc, org, att] = await Promise.all([
    db.select({ title: quests.title, category: quests.category, badge: quests.badge, date: questCompletions.createdAt }).from(questCompletions).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(and(eq(questCompletions.userId, userId), eq(questCompletions.status, "approved"))).orderBy(desc(questCompletions.createdAt)),
    db.select({ id: posts.id, kind: posts.kind, title: posts.title, track: posts.track, date: posts.createdAt }).from(posts).where(and(eq(posts.authorId, userId), eq(posts.status, "published"))).orderBy(desc(posts.createdAt)),
    db.select({ id: posts.id, title: posts.title, track: posts.track, date: answers.createdAt }).from(answers).innerJoin(posts, eq(posts.acceptedAnswerId, answers.id)).where(eq(answers.authorId, userId)),
    db.select().from(events).where(and(eq(events.organizerId, userId), eq(events.status, "completed"))),
    db.select({ e: events }).from(eventRsvps).innerJoin(events, eq(events.id, eventRsvps.eventId)).where(and(eq(eventRsvps.userId, userId), eq(eventRsvps.attended, true))),
  ]);
  const questsByTrack = { technical: 0, cultural: 0, sports: 0, community: 0 } as Record<Track, number>;
  qs.forEach((q) => { questsByTrack[trackOfCategory(q.category)]++; });
  const stats: Stats = { onboardingDone, questsByTrack, acceptedAnswers: acc.length, resourcesPublished: ps.filter((p) => p.kind === "resource").length, eventsOrganized: org.length, eventsAttended: att.length };
  const items: Item[] = [
    ...qs.map((q) => ({ track: trackOfCategory(q.category), type: "Quest", title: q.title, date: q.date })),
    ...ps.map((p) => ({ track: asTrack(p.track), type: KIND[p.kind] ?? "Post", title: p.title, date: p.date, href: p.kind === "question" ? `/questions/${p.id}` : undefined })),
    ...acc.map((a) => ({ track: asTrack(a.track), type: "Accepted answer", title: a.title, date: a.date, href: `/questions/${a.id}` })),
    ...org.map((e) => ({ track: asTrack(e.track), type: "Event organized", title: e.title, date: e.startsAt, href: `/events/${e.id}` })),
    ...att.map(({ e }) => ({ track: asTrack(e.track), type: "Event attended", title: e.title, date: e.startsAt, href: `/events/${e.id}` })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  const byTrack = TRACKS.map((t) => ({ track: t, items: items.filter((i) => i.track === t) })).filter((g) => g.items.length);
  return { stats, items, byTrack, badges: qs.filter((q) => q.badge).map((q) => ({ badge: q.badge as string, title: q.title, date: q.date })), milestones: evaluate(stats), organized: org, attended: att.map((a) => a.e) };
}
