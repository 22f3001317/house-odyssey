import { z } from "zod";
import { api } from "@/lib/api";
import { announcements, getDb } from "@/lib/db";
import { houses } from "@/data/seed";
const audience = ["all", ...houses.map((h) => h.slug)] as [string, ...string[]];
const schema = z.object({ title: z.string().trim().min(3, "Add a title.").max(120), body: z.string().trim().min(5, "Add a message.").max(600), audience: z.enum(audience) });
export const POST = api({ perm: "content:manage", schema, limit: [20, 60_000] }, async ({ body }) => {
  const db = await getDb();
  await db.insert(announcements).values({ title: body.title, body: body.body, houseSlug: body.audience === "all" ? null : body.audience });
  return { message: "Announcement published." };
});
