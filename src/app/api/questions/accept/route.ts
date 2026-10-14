import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { answers, getDb, posts } from "@/lib/db";
import { award } from "@/lib/xp";
const schema = z.object({ questionId: z.string().uuid(), answerId: z.string().uuid() });
export const POST = api({ perm: "community:write", schema }, async ({ user, body }) => {
  const db = await getDb();
  const [a] = await db.select().from(answers).where(and(eq(answers.id, body.answerId), eq(answers.questionId, body.questionId)));
  if (!a) return fail("Answer not found.", 404);
  // Only the asker can accept, and only once: the WHERE clause enforces both.
  const [q] = await db.update(posts).set({ acceptedAnswerId: a.id }).where(and(eq(posts.id, body.questionId), eq(posts.authorId, user.id), eq(posts.kind, "question"), isNull(posts.acceptedAnswerId))).returning({ id: posts.id });
  if (!q) return fail("Only the asker can accept an answer, and only once.", 403);
  if (a.authorId !== user.id) await award(a.authorId, 15, "Accepted answer");
  return { message: "Answer accepted." };
});
