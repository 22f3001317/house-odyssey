import { NextResponse } from "next/server";
import { can, getUser } from "@/lib/auth";
export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { name: u.name, verification: u.verification, role: u.role, admin: can(u, "contributions:review") } });
}
