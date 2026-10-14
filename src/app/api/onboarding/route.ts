import { z } from "zod";
import { eq } from "drizzle-orm";
import { api } from "@/lib/api";
import { getDb, users } from "@/lib/db";
import { houses, INTERESTS } from "@/data/seed";

const slugs = houses.map((h) => h.slug) as [string, ...string[]];
const schema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("start") }), z.object({ step: z.literal("house"), house: z.enum(slugs) }), z.object({ step: z.literal("story") }),
  z.object({ step: z.literal("interests"), interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length) }), z.object({ step: z.literal("finish") }), z.object({ step: z.literal("skip") }),
]);
export const POST = api({ perm: "community:read", schema, limit: [40, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  const set: Partial<typeof users.$inferInsert> =
    body.step === "start" ? { onboarding: "house" }
    : body.step === "house" ? { houseSlug: body.house, onboarding: "story" }
    : body.step === "story" ? { onboarding: "interests" }
    : body.step === "interests" ? { interests: [...new Set(body.interests)].join(","), onboarding: "quest" }
    : { onboarding: "done" };
  await db.update(users).set(set).where(eq(users.id, user.id));
  return { next: set.onboarding };
});
