import { z } from "zod";
import { and, eq, inArray, ne } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { can } from "@/lib/auth";
import { events, getDb, posts, questCompletions, quests, reports, users } from "@/lib/db";
import { award } from "@/lib/xp";

const id = z.string().uuid();
const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("completion"), id, decision: z.enum(["approve", "reject"]) }),
  z.object({ type: z.literal("post"), id, decision: z.enum(["publish", "hide"]) }),
  z.object({ type: z.literal("report"), id }),
  z.object({ type: z.literal("event"), id, decision: z.enum(["approved", "rejected", "completed", "cancelled"]) }),
  z.object({ type: z.literal("user"), id, decision: z.enum(["verified", "rejected", "resubmission_required"]) }),
  z.object({ type: z.literal("role"), id, role: z.enum(["student", "council"]) }),
  z.object({ type: z.literal("quest"), id, active: z.boolean() }),
]);
// Each action type maps to one explicit permission, checked on the server for every call.
const PERM = { completion: "contributions:review", post: "content:manage", report: "content:manage", event: "content:manage", quest: "content:manage", user: "users:review", role: "users:review" } as const;
const FROM: Record<string, string[]> = { approved: ["submitted"], rejected: ["submitted"], completed: ["approved"], cancelled: ["approved"] };

export const POST = api({ perm: "contributions:review", schema, limit: [120, 60_000] }, async ({ user, body }) => {
  if (!can(user, PERM[body.type])) return fail("You don't have permission to do that.", 403);
  const db = await getDb();
  switch (body.type) {
    case "completion": {
      const [c] = await db.update(questCompletions).set({ status: body.decision === "approve" ? "approved" : "rejected" }).where(and(eq(questCompletions.id, body.id), eq(questCompletions.status, "pending"))).returning();
      if (!c) return fail("Already reviewed.", 409);
      if (body.decision === "approve") { const [q] = await db.select().from(quests).where(eq(quests.id, c.questId)); await award(c.userId, q.xp, `Quest approved: ${q.title}`); }
      return { message: body.decision === "approve" ? "Approved and XP awarded." : "Rejected." };
    }
    case "post": {
      const [p] = await db.update(posts).set({ status: body.decision === "publish" ? "published" : "hidden" }).where(eq(posts.id, body.id)).returning({ id: posts.id });
      if (!p) return fail("Not found.", 404);
      await db.delete(reports).where(eq(reports.postId, body.id));
      return { message: body.decision === "publish" ? "Published." : "Hidden." };
    }
    case "report": await db.delete(reports).where(eq(reports.id, body.id)); return { message: "Report dismissed." };
    case "event": {
      const [e] = await db.update(events).set({ status: body.decision }).where(and(eq(events.id, body.id), inArray(events.status, FROM[body.decision]))).returning();
      if (!e) return fail("That event can't move to this state.", 409);
      // XP only after a council member confirms the event happened, never from the organizer's own claim.
      if (body.decision === "completed") await award(e.organizerId, 25, `Event completed: ${e.title}`);
      return { message: `Event ${body.decision}.` };
    }
    case "user": {
      const [t] = await db.update(users).set({ verification: body.decision }).where(and(eq(users.id, body.id), ne(users.verification, "email_pending"))).returning({ id: users.id });
      return t ? { message: `User marked ${body.decision}.` } : fail("User not found or email not confirmed.", 404);
    }
    case "role": {
      const [t] = await db.update(users).set({ role: body.role }).where(and(eq(users.id, body.id), ne(users.role, "admin"))).returning({ id: users.id });
      return t ? { message: `Role set to ${body.role}.` } : fail("User not found, or is an admin.", 404);
    }
    case "quest": await db.update(quests).set({ active: body.active }).where(eq(quests.id, body.id)); return { message: body.active ? "Quest activated." : "Quest archived." };
  }
});
