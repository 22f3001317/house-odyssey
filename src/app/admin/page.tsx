import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import ApiForm from "@/components/ApiForm";
import { can, requirePermission } from "@/lib/auth";
import { contactMessages, events, getDb, posts, questCompletions, quests, reports, users, xpLog } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | House Odyssey" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (<section className="mt-10"><h2 className="font-display text-2xl font-bold">{title}</h2><div className="mt-3 space-y-3">{children}</div></section>);
const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-white p-4">{children}</div>;
const Btns = ({ items }: { items: { label: string; body: object }[] }) => <div className="flex flex-wrap gap-2">{items.map((i) => <ActionButton key={i.label} endpoint="/api/admin/action" body={i.body} label={i.label} />)}</div>;
const Empty = ({ what }: { what: string }) => <p className="rounded-xl border-2 border-dashed border-ink p-4">No {what}.</p>;

export default async function Admin() {
  const u = await requirePermission("contributions:review");
  const db = await getDb();
  const count = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;
  const [nUsers, nVerified, nPosts] = await Promise.all([
    count(db.select({ n: sql<number>`count(*)::int` }).from(users)), count(db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.verification, "verified"))),
    count(db.select({ n: sql<number>`count(*)::int` }).from(posts).where(eq(posts.status, "published"))),
  ]);
  const pendingCompletions = await db.select({ c: questCompletions, who: users.name, quest: quests.title, xp: quests.xp }).from(questCompletions).innerJoin(users, eq(users.id, questCompletions.userId)).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(eq(questCompletions.status, "pending"));
  const pendingRes = await db.select({ p: posts, who: users.name }).from(posts).innerJoin(users, eq(users.id, posts.authorId)).where(and(eq(posts.kind, "resource"), eq(posts.status, "pending")));
  const flagged = await db.select({ r: reports, title: posts.title, status: posts.status }).from(reports).innerJoin(posts, eq(posts.id, reports.postId)).orderBy(desc(reports.createdAt)).limit(20);
  const evs = await db.select({ e: events, who: users.name }).from(events).innerJoin(users, eq(users.id, events.organizerId)).where(inArray(events.status, ["submitted", "approved"])).orderBy(events.startsAt);
  const allQuests = await db.select().from(quests).orderBy(quests.title);
  const isAdmin = can(u, "users:review");
  const toVerify = isAdmin ? await db.select().from(users).where(inArray(users.verification, ["id_pending", "under_review", "resubmission_required"])) : [];
  const people = isAdmin ? await db.select().from(users).where(ne(users.role, "admin")).orderBy(users.name).limit(30) : [];
  const inbox = can(u, "reports:view") ? await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(10) : null;
  const xps = can(u, "reports:view") ? await db.select({ x: xpLog, who: users.name }).from(xpLog).innerJoin(users, eq(users.id, xpLog.userId)).orderBy(desc(xpLog.createdAt)).limit(10) : null;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Admin</h1><p className="mt-1">Signed in as {u.name} ({u.role}).</p>
      {can(u, "analytics:view") && <p className="mt-3 flex gap-4 font-bold underline"><a href="/admin/analytics">Analytics</a><a href="/admin/users">All members</a></p>}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Metrics">{[["Members", nUsers], ["Verified", nVerified], ["Published posts", nPosts], ["Awaiting review", pendingCompletions.length + pendingRes.length + flagged.length + evs.filter((e) => e.e.status === "submitted").length]].map(([l, v]) => <div key={l as string} className="rounded-xl border-2 border-ink bg-white p-4"><p className="font-display text-3xl font-bold">{v}</p><p className="text-sm">{l}</p></div>)}</section>
      <Section title="Quest approvals">{pendingCompletions.length ? pendingCompletions.map(({ c, who, quest, xp }) => <Row key={c.id}><div><p className="font-semibold">{who}: {quest} (+{xp} XP)</p><p className="text-sm">{c.proof}</p></div><Btns items={[{ label: "Approve", body: { type: "completion", id: c.id, decision: "approve" } }, { label: "Reject", body: { type: "completion", id: c.id, decision: "reject" } }]} /></Row>) : <Empty what="quest submissions waiting" />}</Section>
      <Section title="Resource moderation">{pendingRes.length ? pendingRes.map(({ p, who }) => <Row key={p.id}><div><p className="font-semibold">{p.title} <span className="font-normal">by {who}</span></p><p className="text-sm">{p.body}</p><a className="text-sm underline" href={p.url ?? "#"} target="_blank" rel="noopener noreferrer">{p.url}</a></div><Btns items={[{ label: "Publish", body: { type: "post", id: p.id, decision: "publish" } }, { label: "Hide", body: { type: "post", id: p.id, decision: "hide" } }]} /></Row>) : <Empty what="resources waiting" />}</Section>
      <Section title="Reported content">{flagged.length ? flagged.map(({ r, title, status }) => <Row key={r.id}><p>{title} ({status}) · reason: {r.reason}</p><Btns items={[{ label: "Hide post", body: { type: "post", id: r.postId, decision: "hide" } }, { label: "Dismiss", body: { type: "report", id: r.id } }]} /></Row>) : <Empty what="reports" />}</Section>
      <Section title="Event proposals">{evs.length ? evs.map(({ e, who }) => <Row key={e.id}><div><p className="font-semibold">{e.title} · {e.status}</p><p className="text-sm">{who} · {e.startsAt.toISOString().slice(0, 16).replace("T", " ")} UTC · {e.format}</p></div>
        <Btns items={e.status === "submitted" ? [{ label: "Approve", body: { type: "event", id: e.id, decision: "approved" } }, { label: "Reject", body: { type: "event", id: e.id, decision: "rejected" } }] : [{ label: "Mark completed (+XP)", body: { type: "event", id: e.id, decision: "completed" } }, { label: "Cancel", body: { type: "event", id: e.id, decision: "cancelled" } }]} /></Row>) : <Empty what="open event proposals" />}</Section>
      <Section title="Quests">{allQuests.map((q) => <Row key={q.id}><p>{q.title} · {q.xp} XP · {q.kind}{q.requiresApproval ? " · reviewed" : ""} · {q.active ? "active" : "archived"}</p><Btns items={[{ label: q.active ? "Archive" : "Activate", body: { type: "quest", id: q.id, active: !q.active } }]} /></Row>)}
        <div className="rounded-2xl border-2 border-ink bg-sea p-5"><h3 className="mb-3 font-display text-xl font-bold">Create a quest</h3><ApiForm endpoint="/api/admin/quests" submitLabel="Create quest" fields={[{ name: "title", label: "Title" }, { name: "description", label: "Instructions", multiline: true }, { name: "category", label: "Category", options: ["onboarding", "house discovery", "technical learning", "academic resources", "cultural activities", "sports", "community contribution", "event organization", "volunteering"] }, { name: "xp", label: "XP reward", type: "number" }, { name: "kind", label: "Completion type", options: ["visit", "trivia", "proof"] }, { name: "answer", label: "Trivia answer (use | for alternatives)", optional: true }, { name: "badge", label: "Badge name (optional)", optional: true }, { name: "requiresApproval", type: "checkbox", label: "Council approval required (always on for proof quests)" }]} /></div></Section>
      {isAdmin && <Section title="Student verification">{toVerify.length ? toVerify.map((t) => <Row key={t.id}><p>{t.name} · {t.email} · {t.verification}</p><Btns items={[{ label: "Verify", body: { type: "user", id: t.id, decision: "verified" } }, { label: "Reject", body: { type: "user", id: t.id, decision: "rejected" } }, { label: "Ask to resubmit", body: { type: "user", id: t.id, decision: "resubmission_required" } }]} /></Row>) : <Empty what="students waiting for verification" />}</Section>}
      {isAdmin && <Section title="Members and roles">{people.map((t) => <Row key={t.id}><p>{t.name} · {t.role} · {t.verification}</p><Btns items={[t.role === "council" ? { label: "Make student", body: { type: "role", id: t.id, role: "student" } } : { label: "Make council member", body: { type: "role", id: t.id, role: "council" } }]} /></Row>)}</Section>}
      {inbox && <Section title="Contact inbox">{inbox.length ? inbox.map((m) => <Row key={m.id}><div><p className="font-semibold">{m.subject} · {m.name} ({m.email})</p><p className="text-sm">{m.message}</p></div></Row>) : <Empty what="messages" />}</Section>}
      {xps && <Section title="XP history">{xps.length ? xps.map(({ x, who }) => <p key={x.id}>{who}: {x.amount > 0 ? "+" : ""}{x.amount} · {x.reason}</p>) : <Empty what="XP activity" />}</Section>}
    </div>
  );
}
