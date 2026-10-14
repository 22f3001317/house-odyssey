import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import ApiForm from "@/components/ApiForm";
import { requirePermission } from "@/lib/auth";
import { answers, getDb, posts, users } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Question({ params }: { params: { id: string } }) {
  const me = await requirePermission("community:read");
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const db = await getDb();
  const [q] = await db.select({ p: posts, author: users.name }).from(posts).innerJoin(users, eq(users.id, posts.authorId)).where(and(eq(posts.id, params.id), eq(posts.kind, "question"), eq(posts.status, "published")));
  if (!q) notFound();
  const list = await db.select({ a: answers, author: users.name }).from(answers).innerJoin(users, eq(users.id, answers.authorId)).where(eq(answers.questionId, q.p.id)).orderBy(asc(answers.createdAt));
  const mine = q.p.authorId === me.id;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-3xl font-bold">{q.p.title}</h1>
      <p className="text-sm text-moss">{q.author} · {q.p.acceptedAnswerId ? "Solved" : "Unsolved"}</p><p className="mt-3 whitespace-pre-wrap">{q.p.body}</p>
      <h2 className="mt-8 font-display text-2xl font-bold">{list.length} answers</h2>
      <ul className="mt-3 space-y-3">{list.map(({ a, author }) => (<li key={a.id} className="rounded-xl border-2 border-ink bg-white p-4"><p className="whitespace-pre-wrap">{a.body}</p><p className="mt-1 text-sm text-moss">{author}{q.p.acceptedAnswerId === a.id ? " · Accepted answer" : ""}</p>
        {mine && !q.p.acceptedAnswerId && <div className="mt-2 w-48"><ActionButton endpoint="/api/questions/accept" body={{ questionId: q.p.id, answerId: a.id }} label="Accept this answer" /></div>}</li>))}</ul>
      <section className="mt-8"><h2 className="mb-3 font-display text-xl font-bold">Your answer</h2><ApiForm endpoint="/api/answers" extra={{ questionId: q.p.id }} submitLabel="Post answer" fields={[{ name: "body", label: "Answer", multiline: true }]} /></section></div>
  );
}
