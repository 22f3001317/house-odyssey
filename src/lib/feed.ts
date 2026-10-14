import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { answers, getDb, posts, users } from "@/lib/db";
// One query layer for post-like content: search, tag filter and pagination live here.
export async function feed(kind: string, q?: string, page = 1, size = 10) {
  const db = await getDb();
  const where = and(eq(posts.kind, kind), eq(posts.status, "published"), q ? ilike(posts.title, `%${q.replace(/[%_]/g, "")}%`) : undefined);
  return db.select({ id: posts.id, title: posts.title, body: posts.body, tag: posts.tag, url: posts.url, author: users.name, createdAt: posts.createdAt,
    solved: sql<boolean>`${posts.acceptedAnswerId} is not null`, answers: sql<number>`(select count(*)::int from ${answers} where ${answers.questionId} = ${posts.id})` })
    .from(posts).innerJoin(users, eq(users.id, posts.authorId)).where(where).orderBy(desc(posts.createdAt)).limit(size).offset((Math.max(page, 1) - 1) * size);
}
