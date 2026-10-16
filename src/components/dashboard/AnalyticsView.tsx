import { sql, type SQL } from "drizzle-orm";
import BarChart from "@/components/BarChart";
import { houses } from "@/data/seed";
import { getDb } from "@/lib/db";

const DAYS = `generate_series(current_date - 29, current_date, interval '1 day') d`;
const label = "to_char(d::date, 'YYYY-MM-DD')";
const STEP: Record<string, string> = { arrival: "Not started", house: "Choosing a house", story: "House story", interests: "Interests", quest: "First quest", done: "Finished" };

export default async function AnalyticsView() {
  const db = await getDb();
  // Some drivers return { rows }, others a bare array; accept both.
  const q = async <T,>(s: SQL) => { const r = (await db.execute(s)) as unknown as { rows?: T[] } | T[]; return (Array.isArray(r) ? r : (r.rows ?? [])) as T[]; };
  const [k, signups, dau, views, actions, topPages, funnel, byHouse, contributors, quests, content] = await Promise.all([
    q<Record<string, number>>(sql`select
      (select count(*) from users)::int as members, (select count(*) from users where verification='verified')::int as verified,
      (select count(*) from users where verification in ('id_pending','under_review','resubmission_required'))::int as awaiting,
      (select count(*) from users where verification='email_pending')::int as unconfirmed,
      (select count(*) from users where created_at >= now() - interval '7 days')::int as new7,
      (select count(*) from activity where day = current_date)::int as active_today,
      (select count(distinct user_id) from activity where day >= current_date - 6)::int as active7,
      (select coalesce(sum(views),0) from page_views where day >= current_date - 29)::int as views30,
      (select coalesce(sum(views),0) from page_views where day = current_date)::int as views_today`),
    q<{ label: string; value: number }>(sql.raw(`select ${label} as label, count(u.id)::int as value from ${DAYS} left join users u on u.created_at::date = d::date group by d order by d`)),
    q<{ label: string; value: number }>(sql.raw(`select ${label} as label, count(a.user_id)::int as value from ${DAYS} left join activity a on a.day = d::date group by d order by d`)),
    q<{ label: string; value: number }>(sql.raw(`select ${label} as label, coalesce(sum(p.views),0)::int as value from ${DAYS} left join page_views p on p.day = d::date group by d order by d`)),
    q<{ label: string; value: number }>(sql.raw(`select ${label} as label, ((select count(*) from posts where created_at::date = d::date) + (select count(*) from answers where created_at::date = d::date) + (select count(*) from quest_completions where created_at::date = d::date))::int as value from ${DAYS} order by d`)),
    q<{ path: string; views: number }>(sql`select path, sum(views)::int as views from page_views where day >= current_date - 29 group by path order by views desc limit 10`),
    q<{ step: string; n: number }>(sql`select onboarding as step, count(*)::int as n from users where verification='verified' group by onboarding`),
    q<{ house: string | null; n: number; xp: number }>(sql`select house_slug as house, count(*)::int as n, coalesce(sum(xp),0)::int as xp from users where verification='verified' group by house_slug order by n desc`),
    q<{ name: string; house_slug: string | null; posts: number; answers: number; quests: number; events: number }>(sql`select * from (select u.name, u.house_slug,
      (select count(*) from posts p where p.author_id=u.id and p.status='published')::int as posts, (select count(*) from answers a where a.author_id=u.id)::int as answers,
      (select count(*) from quest_completions c where c.user_id=u.id and c.status='approved')::int as quests, (select count(*) from events e where e.organizer_id=u.id and e.status='completed')::int as events
      from users u) t where posts+answers+quests+events > 0 order by (posts+answers+quests+events) desc, name limit 10`),
    q<{ title: string; approved: number; pending: number }>(sql`select q.title, (count(c.id) filter (where c.status='approved'))::int as approved, (count(c.id) filter (where c.status='pending'))::int as pending from quests q left join quest_completions c on c.quest_id=q.id group by q.id, q.title order by approved desc, q.title`),
    q<Record<string, number>>(sql`select (select count(*) from posts where kind='post' and status='published')::int as posts, (select count(*) from posts where kind='question' and status='published')::int as questions,
      (select count(*) from posts where kind='question' and accepted_answer_id is not null)::int as solved, (select count(*) from posts where kind='resource' and status='published')::int as resources,
      (select count(*) from answers)::int as answers, (select count(*) from events where status in ('approved','completed'))::int as events, (select count(*) from reports)::int as reports,
      (select count(*) from contact_messages)::int as messages`),
  ]);
  const kp = k[0], c = content[0], houseName = (s: string | null) => houses.find((h) => h.slug === s)?.name ?? "No house yet";
  const cards: [string, number][] = [["Members", kp.members], ["Verified", kp.verified], ["Awaiting verification", kp.awaiting], ["Email not confirmed", kp.unconfirmed], ["New (7 days)", kp.new7], ["Active today", kp.active_today], ["Active (7 days)", kp.active7], ["Page views (30 days)", kp.views30]];
  const card = "rounded-xl border-2 border-ink bg-white p-4", th = "border-b-2 border-ink p-2 text-left", td = "border-b border-ink/20 p-2";
  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Analytics</h2>
      <p className="mt-1 text-sm">Days are in UTC. Page views and activity are counted from the day tracking was switched on. Traffic is page counts only: no cookies, IP addresses or visitor IDs are stored, so anonymous unique visitors are not measured.</p>
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Key numbers">{cards.map(([l, v]) => <div key={l} className={card}><p className="font-display text-3xl font-bold">{v}</p><p className="text-sm">{l}</p></div>)}</section>
      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Last 30 days">
        <BarChart title="New sign-ups per day" data={signups} /><BarChart title="Active members per day" data={dau} />
        <BarChart title="Page views per day" data={views} /><BarChart title="Contributions per day (posts, answers, quest submissions)" data={actions} />
      </section>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section><h2 className="font-display text-2xl font-bold">Top contributors</h2>
          {contributors.length ? <div className="mt-2 overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className={th}>Member</th><th className={th}>Posts</th><th className={th}>Answers</th><th className={th}>Quests</th><th className={th}>Events</th></tr></thead>
            <tbody>{contributors.map((r) => <tr key={r.name + r.house_slug}><td className={td}>{r.name}<span className="block text-xs">{houseName(r.house_slug)}</span></td><td className={td}>{r.posts}</td><td className={td}>{r.answers}</td><td className={td}>{r.quests}</td><td className={td}>{r.events}</td></tr>)}</tbody></table></div> : <p className="mt-2 rounded-xl border-2 border-dashed border-ink p-4">No contributions yet.</p>}</section>
        <section><h2 className="font-display text-2xl font-bold">Most viewed pages (30 days)</h2>
          {topPages.length ? <ol className="mt-2 space-y-1">{topPages.map((p) => <li key={p.path}>{p.path} · {p.views}</li>)}</ol> : <p className="mt-2 rounded-xl border-2 border-dashed border-ink p-4">No page views recorded yet.</p>}</section>
        <section><h2 className="font-display text-2xl font-bold">Onboarding progress (verified members)</h2>
          <ul className="mt-2 space-y-1">{funnel.length ? funnel.map((f) => <li key={f.step}>{STEP[f.step] ?? f.step}: {f.n}</li>) : <li>No verified members yet.</li>}</ul></section>
        <section><h2 className="font-display text-2xl font-bold">Houses</h2>
          <ul className="mt-2 space-y-1">{byHouse.length ? byHouse.map((h) => <li key={h.house ?? "none"}>{houseName(h.house)}: {h.n} members · {h.xp} XP</li>) : <li>No verified members yet.</li>}</ul></section>
        <section><h2 className="font-display text-2xl font-bold">Quest completions</h2>
          <ul className="mt-2 space-y-1">{quests.map((r) => <li key={r.title}>{r.title}: {r.approved} done{r.pending ? `, ${r.pending} pending` : ""}</li>)}</ul></section>
        <section><h2 className="font-display text-2xl font-bold">Content</h2>
          <ul className="mt-2 space-y-1"><li>Posts: {c.posts}</li><li>Questions: {c.questions} ({c.solved} solved)</li><li>Answers: {c.answers}</li><li>Resources: {c.resources}</li><li>Approved events: {c.events}</li><li>Open reports: {c.reports}</li><li>Contact messages: {c.messages}</li></ul></section>
      </div>
    </div>
  );
}
