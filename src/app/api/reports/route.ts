import { z } from "zod";
import { api } from "@/lib/api";
import { getDb, reports } from "@/lib/db";
const schema = z.object({ postId: z.string().uuid(), reason: z.string().trim().min(3).max(300) });
export const POST = api({ perm: "community:read", schema, limit: [10, 10 * 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  await db.insert(reports).values({ postId: body.postId, reporterId: user.id, reason: body.reason });
  return { message: "Reported. A council member will take a look." };
});
