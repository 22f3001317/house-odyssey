import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, users, emailTokens } from "@/lib/db";
import { clientIp, hashToken, rateLimit } from "@/lib/auth";

const list = (v?: string) => (v ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const db = await getDb();
  // Single use: the UPDATE only matches an unused, unexpired token, then marks it used.
  const [row] = await db.update(emailTokens).set({ usedAt: new Date() })
    .where(and(eq(emailTokens.tokenHash, hashToken(token)), isNull(emailTokens.usedAt), gt(emailTokens.expiresAt, new Date()))).returning();
  if (!row) return NextResponse.json({ error: "This link is invalid, expired or already used." }, { status: 400 });
  const [u] = await db.select().from(users).where(eq(users.id, row.userId));
  // Policy: a confirmed mailbox on a trusted college domain (AUTO_VERIFY_DOMAINS) or a configured admin address is verified at once.
  // Everyone else waits for an organizer in the admin area. A mailbox is evidence of enrollment, not proof of it.
  const auto = list(process.env.AUTO_VERIFY_DOMAINS).includes(u.email.split("@")[1]) || list(process.env.ADMIN_EMAILS).includes(u.email);
  await db.update(users).set({ verification: auto ? "verified" : "id_pending" }).where(and(eq(users.id, u.id), eq(users.verification, "email_pending")));
  return NextResponse.json({ ok: true, message: auto ? "Email confirmed and student status verified. You can sign in now." : "Email confirmed. An organizer will verify your student status. You can sign in now to check progress." });
}
