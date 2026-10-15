import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { houses } from "@/data/seed";
import { clientIp, rateLimit } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { normalizePath } from "@/lib/track";

const schema = z.object({ path: z.string().max(200) });
export async function POST(req: Request) {
  if (!rateLimit(`track:${clientIp(req)}`, 120, 60_000)) return new NextResponse(null, { status: 204 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return new NextResponse(null, { status: 204 });
  const path = normalizePath(p.data.path, houses.map((h) => h.slug));
  if (path) {
    try { const db = await getDb(); await db.execute(sql`insert into page_views (day, path, views) values (current_date, ${path}, 1) on conflict (day, path) do update set views = page_views.views + 1`); } catch { /* never surface tracking errors */ }
  }
  return new NextResponse(null, { status: 204 });
}
