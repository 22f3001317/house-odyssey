import { z } from "zod";
import { api } from "@/lib/api";
import { getDb, quests } from "@/lib/db";
const schema = z.object({
  title: z.string().trim().min(3, "Add a title.").max(80), description: z.string().trim().min(10, "Add instructions (10+ characters).").max(500), category: z.string().trim().min(2).max(40),
  xp: z.coerce.number().int("XP must be a whole number.").min(1).max(200), kind: z.enum(["visit", "trivia", "proof"]), answer: z.string().trim().max(100).optional(),
  badge: z.string().trim().max(30).optional(), requiresApproval: z.boolean().optional(),
}).refine((v) => v.kind !== "trivia" || !!v.answer, { message: "Trivia quests need an answer (use | for alternatives)." });
export const POST = api({ perm: "content:manage", schema }, async ({ body }) => {
  const db = await getDb();
  const slug = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(quests).values({ slug, title: body.title, description: body.description, category: body.category, xp: body.xp, kind: body.kind, answer: body.kind === "trivia" ? body.answer!.toLowerCase() : null,
    badge: body.badge || null, requiresApproval: body.kind === "proof" ? true : !!body.requiresApproval }); // proof quests are always reviewed
  return { message: "Quest created." };
});
