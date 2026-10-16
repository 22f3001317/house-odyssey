import { z } from "zod";
import { api } from "@/lib/api";
import { getDb, posts } from "@/lib/db";
import { TRACKS } from "@/lib/tracks";

const schema = z.object({
  kind: z.enum(["post", "question", "resource"]), title: z.string().trim().min(3, "Add a title (3+ characters).").max(140), body: z.string().trim().min(10, "Write at least 10 characters.").max(4000),
  tag: z.string().trim().max(30).optional(), track: z.enum(TRACKS).optional(), url: z.string().trim().max(500).optional(), confirm: z.boolean().optional(),
}).superRefine((v, ctx) => {
  if (v.kind !== "resource") return;
  if (!v.confirm) ctx.addIssue({ code: "custom", message: "Confirm you have permission to share this material." });
  if (!/^https:\/\/[^\s]+$/.test(v.url ?? "")) ctx.addIssue({ code: "custom", message: "Resources need a link starting with https://" });
});
export const POST = api({ perm: "community:write", schema, limit: [10, 10 * 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  // Resources wait for council review; posts and questions publish immediately and can be reported.
  const status = body.kind === "resource" ? "pending" : "published";
  const [row] = await db.insert(posts).values({ kind: body.kind, authorId: user.id, title: body.title, body: body.body, tag: body.tag || null, track: body.track ?? "community", url: body.kind === "resource" ? body.url : null, status }).returning({ id: posts.id });
  return { id: row.id, message: status === "pending" ? "Submitted. A council member will review it before it appears." : "Posted." };
});
