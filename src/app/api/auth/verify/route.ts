import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, users, emailTokens } from "@/lib/db";
import { clientIp, hashToken, rateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const db = await getDb();
  // Single use: the UPDATE only matches an unused, unexpired token, then marks it used.
  const [row] = await db.update(emailTokens).set({ usedAt: new Date() })
    .where(and(eq(emailTokens.tokenHash, hashToken(token)), isNull(emailTokens.usedAt), gt(emailTokens.expiresAt, new Date()))).returning();
  if (!row) return NextResponse.json({ error: "This link is invalid, expired or already used." }, { status: 400 });
  await db.update(users).set({ verification: "id_pending" }).where(and(eq(users.id, row.userId), eq(users.verification, "email_pending")));
  return NextResponse.json({ ok: true, message: "Email confirmed. You can sign in now." });
}
