import { z } from "zod";
import { api } from "@/lib/api";
import { events, getDb } from "@/lib/db";
const schema = z.object({
  title: z.string().trim().min(3, "Add a title.").max(120), description: z.string().trim().min(10, "Describe the meetup (10+ characters).").max(2000),
  startsAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)) && Date.parse(s) > Date.now(), "Pick a date in the future."),
  format: z.enum(["online", "offline"]), location: z.string().trim().max(200).optional(),
});
export const POST = api({ perm: "community:write", schema, limit: [5, 60 * 60_000] }, async ({ user, body }) => {
  const db = await getDb();
  await db.insert(events).values({ organizerId: user.id, title: body.title, description: body.description, startsAt: new Date(body.startsAt), format: body.format, location: body.location || null });
  return { message: "Proposal submitted. The house council will review it." };
});
