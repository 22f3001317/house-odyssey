import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { api, fail } from "@/lib/api";
import { getDb, posts, questCompletions, users } from "@/lib/db";
import { houses, INTERESTS } from "@/data/seed";
import { AVATARS } from "@/lib/avatars";
import { SECTIONS } from "@/lib/profile";

const slugs = houses.map((h) => h.slug) as [string, ...string[]];
const keys = AVATARS.map((a) => a.key) as [string, ...string[]];
const schema = z.object({
  name: z.string().trim().min(2, "Enter a display name.").max(80), avatar: z.enum(keys), house: z.enum(slugs, { message: "Choose your house." }),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters."), skills: z.array(z.string().trim().min(1).max(30)).max(8, "Add up to 8 skills."),
  interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length), visibility: z.array(z.enum(SECTIONS)),
  featured: z.string().regex(/^((post|quest):[0-9a-f-]{36})?$/, "Pick a contribution from the list."),
});
export const POST = api({ perm: "community:read", schema, limit: [30, 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  if (body.featured) {
    const [kind, ref] = body.featured.split(":");
    // The student can only feature their own published post or an approved quest: ownership is checked here, not in the form.
    const [ok] = kind === "post"
      ? await db.select({ id: posts.id }).from(posts).where(and(eq(posts.id, ref), eq(posts.authorId, user.id), eq(posts.status, "published")))
      : await db.select({ id: questCompletions.id }).from(questCompletions).where(and(eq(questCompletions.questId, ref), eq(questCompletions.userId, user.id), eq(questCompletions.status, "approved")));
    if (!ok) return fail("You can only feature your own approved contributions.");
  }
  await db.update(users).set({
    name: body.name, avatar: body.avatar, bio: body.bio, skills: [...new Set(body.skills.map((s) => s.replace(/,/g, " ")))].join(","), interests: [...new Set(body.interests)].join(","),
    visibility: [...new Set(body.visibility)].join(","), featuredRef: body.featured || null, houseSlug: body.house,
  }).where(eq(users.id, user.id));
  return { message: "Profile saved." };
});
