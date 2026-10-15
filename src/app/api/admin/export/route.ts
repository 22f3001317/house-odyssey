import { desc } from "drizzle-orm";
import { can, getUser } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
// Spreadsheet formula injection guard: cells starting with = + - @ are prefixed with an apostrophe.
const cell = (v: unknown) => { let s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
export async function GET() {
  const u = await getUser();
  if (!can(u, "analytics:view")) return new Response("Forbidden", { status: 403 });
  const db = await getDb();
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  const head = ["name", "email", "role", "verification", "house", "xp", "joined", "last_seen"];
  const lines = rows.map((r) => [r.name, r.email, r.role, r.verification, r.houseSlug, r.xp, r.createdAt.toISOString(), r.lastSeenAt?.toISOString()].map(cell).join(","));
  return new Response([head.join(","), ...lines].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="house-odyssey-members.csv"', "Cache-Control": "no-store" } });
}
