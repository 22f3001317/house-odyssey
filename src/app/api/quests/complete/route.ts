import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { getDb, quests, questCompletions } from "@/lib/db";
import { award } from "@/lib/xp";

const schema = z.object({ slug: z.string().min(1).max(60), answer: z.string().max(200).optional(), proof: z.string().trim().max(500).optional() });
export const POST = api({ perm: "community:write", schema, limit: [30, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const [q] = await db.select().from(quests).where(and(eq(quests.slug, body.slug), eq(quests.active, true)));
  if (!q) return fail("That quest isn't available.", 404);
  // Completion rules live on the server; the client never decides what counts.
  if (q.kind === "trivia" && !(q.answer ?? "").split("|").includes((body.answer ?? "").trim().toLowerCase())) return fail("Not quite. Try again!");
  if (q.kind === "proof" && (body.proof ?? "").length < 10) return fail("Add a few words of detail (10+ characters).");
  if (q.slug === "explore-house" && !user.houseSlug) return fail("Pick a house first.");
  const status = q.requiresApproval ? "pending" : "approved";
  const [row] = await db.insert(questCompletions).values({ userId: user.id, questId: q.id, status, proof: body.proof ?? null }).onConflictDoNothing().returning({ id: questCompletions.id });
  if (!row) return fail("You've already done this quest.");
  if (status === "approved") await award(user.id, q.xp, `Quest: ${q.title}`);
  return { status, xp: status === "approved" ? q.xp : 0, message: status === "approved" ? `Quest complete! +${q.xp} XP` : "Submitted. A council member will review it." };
});
