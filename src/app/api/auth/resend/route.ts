import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, users, emailTokens } from "@/lib/db";
import { clientIp, demoVerification, hashToken, newToken, rateLimit } from "@/lib/auth";
import { baseUrl, mailConfigured, sendVerificationEmail } from "@/lib/mail";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email.") });
export async function POST(req: Request) {
  if (!rateLimit(`resend:${clientIp(req)}`, 3, 10 * 60_000)) return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const generic = { ok: true, message: "If that address has an unconfirmed account, a new link is on its way." };
  const db = await getDb();
  const [u] = await db.select().from(users).where(and(eq(users.email, parsed.data.email), eq(users.verification, "email_pending")));
  if (!u) return NextResponse.json(generic);
  const token = newToken();
  await db.update(emailTokens).set({ usedAt: new Date() }).where(and(eq(emailTokens.userId, u.id), isNull(emailTokens.usedAt))); // older links stop working
  await db.insert(emailTokens).values({ userId: u.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 3600_000) });
  if (mailConfigured()) { try { await sendVerificationEmail(u.email, u.name, `${baseUrl(req)}/verify?token=${token}`); } catch (e) { console.error("resend failed", (e as Error).message); } return NextResponse.json(generic); }
  return NextResponse.json(demoVerification() ? { ...generic, message: "Prototype mode: no email is sent.", devVerifyUrl: `/verify?token=${token}` } : { ok: true, message: "Email delivery is not configured on this deployment. Ask an organizer to verify you." });
}
