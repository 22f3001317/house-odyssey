import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, users, emailTokens } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { clientIp, demoVerification, emailAllowed, hashToken, newToken, rateLimit } from "@/lib/auth";
import { baseUrl, mailConfigured, sendVerificationEmail } from "@/lib/mail";

const adminEmails = () => (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export async function POST(req: Request) {
  if (!rateLimit(`signup:${clientIp(req)}`, 5, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { name, email, password } = parsed.data;
  if (!emailAllowed(email)) return NextResponse.json({ error: "Use your college email address to sign up." }, { status: 400 });

  const db = await getDb();
  const token = newToken();
  const inserted = await db.insert(users).values({ name, email, passwordHash: await bcrypt.hash(password, 10), role: adminEmails().includes(email) ? "admin" : "student" }).onConflictDoNothing().returning({ id: users.id });
  let mailFailed = false;
  if (inserted[0]) {
    await db.insert(emailTokens).values({ userId: inserted[0].id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 3600_000) });
    if (mailConfigured()) {
      try { await sendVerificationEmail(email, name, `${baseUrl(req)}/verify?token=${token}`); } catch (e) { mailFailed = true; console.error("verification email failed", (e as Error).message); }
    }
  }
  // Same reply whether or not the email already existed, so the form can't be used to probe accounts.
  if (mailConfigured()) return NextResponse.json({ ok: true, message: mailFailed ? "Account created, but we couldn't send the email. Use the Resend tab in a few minutes." : "Check your college email for a confirmation link." });
  if (demoVerification()) return NextResponse.json({ ok: true, message: "Prototype mode: no email is sent. Use the verification link below.", ...(inserted[0] ? { devVerifyUrl: `/verify?token=${token}` } : {}) });
  return NextResponse.json({ ok: true, message: "Account request received. Email delivery is not configured on this deployment, so ask an organizer to verify your email." });
}
