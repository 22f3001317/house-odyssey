import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import { demoVerification, getUser } from "@/lib/auth";

// PROTOTYPE ONLY: stands in for a real institutional check. Disabled in production unless DEMO_VERIFICATION=true.
export async function POST() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!demoVerification()) return NextResponse.json({ error: "Simulated verification is turned off." }, { status: 403 });
  if (u.verification !== "id_pending") return NextResponse.json({ error: "Nothing to verify right now." }, { status: 400 });
  const db = await getDb();
  await db.update(users).set({ verification: "verified" }).where(eq(users.id, u.id));
  return NextResponse.json({ ok: true, message: "Verified (simulated)." });
}
