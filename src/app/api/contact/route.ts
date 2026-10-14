import { NextResponse } from "next/server";
import { getDb, contactMessages } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60_000)) return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { website: _hp, ...data } = parsed.data;
  const db = await getDb();
  await db.insert(contactMessages).values(data);
  // Honest status: stored for organizers; no email is sent.
  return NextResponse.json({ ok: true, message: "Your message was recorded. Organizers will see it in the admin inbox. No email confirmation is sent." });
}
