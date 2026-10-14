import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { clientIp, rateLimit, setSession } from "@/lib/auth";

const DUMMY = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.2xKQhX1x9sZ0yq3v1bLr1pK8nO0y";
export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.email, parsed.data.email));
  const ok = await bcrypt.compare(parsed.data.password, u?.passwordHash ?? DUMMY);
  if (!u || !ok) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (u.verification === "email_pending") return NextResponse.json({ error: "Confirm your email first using the link we sent." }, { status: 403 });
  await setSession(u.id);
  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
