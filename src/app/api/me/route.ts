import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { can, getUser } from "@/lib/auth";
import { houseOf } from "@/data/seed";
import { getDb, notifications } from "@/lib/db";
export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ user: null });
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, u.id), eq(notifications.read, false)));
  return NextResponse.json({ user: { name: u.name, verification: u.verification, role: u.role, admin: can(u, "contributions:review"), unread: n, house: houseOf(u.houseSlug)?.slug ?? null } });
}
