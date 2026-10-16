import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { answers, getDb, posts } from "@/lib/db";
import { notify } from "@/lib/notify";
const schema = z.object({ questionId: z.string().uuid(), body: z.string().trim().min(5, "Write at least 5 characters.").max(3000) });
export const POST = api({ perm: "community:write", schema, limit: [15, 10 * 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const [q] = await db.select({ id: posts.id, authorId: posts.authorId, title: posts.title }).from(posts).where(and(eq(posts.id, body.questionId), eq(posts.kind, "question"), eq(posts.status, "published")));
  if (!q) return fail("Question not found.", 404);
  await db.insert(answers).values({ questionId: q.id, authorId: user.id, body: body.body });
  if (q.authorId !== user.id) await notify(q.authorId, `${user.name} answered your question "${q.title}"`, `/questions/${q.id}`);
  return { message: "Answer posted." };
});
