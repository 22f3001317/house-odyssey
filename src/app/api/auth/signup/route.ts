import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, users, emailTokens } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { clientIp, emailAllowed, hashToken, newToken, rateLimit } from "@/lib/auth";

const adminEmails = () => (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export async function POST(req: Request) {
  if (!rateLimit(`signup:${clientIp(req)}`, 5, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { name, email, password } = parsed.data;
  if (!emailAllowed(email)) return NextResponse.json({ error: "Use your college email address to sign up." }, { status: 400 });
  const db = await getDb();
  const dev = process.env.NODE_ENV !== "production";
  const token = newToken();
  const inserted = await db.insert(users).values({ name, email, passwordHash: await bcrypt.hash(password, 10), role: adminEmails().includes(email) ? "admin" : "student" }).onConflictDoNothing().returning({ id: users.id });
  if (inserted[0]) await db.insert(emailTokens).values({ userId: inserted[0].id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 3600_000) });
  // Same reply whether or not the email already existed, so the form can't be used to probe accounts.
  return NextResponse.json({
    ok: true,
    message: dev ? "Prototype mode: no email is sent. Use the verification link below." : "Account request received. Email delivery is not configured on this deployment, so ask an organizer to verify your email.",
    ...(dev && inserted[0] ? { devVerifyUrl: `/verify?token=${token}` } : {}),
  });
}
