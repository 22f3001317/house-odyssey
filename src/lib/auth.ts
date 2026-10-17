import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { eq, sql } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import { houseOf } from "@/data/seed";

const COOKIE = "ho_session";
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required in production");
  return new TextEncoder().encode(s ?? "dev-only-secret-change-me-32-chars-minimum!");
};
export async function setSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export const clearSession = async () => (await cookies()).delete(COOKIE);
// Records one activity row per member per day (and a last-seen time), at most once an hour per server instance.
const seen = new Map<string, number>();
async function touch(id: string) {
  const now = Date.now();
  if (now - (seen.get(id) ?? 0) < 3600_000) return;
  seen.set(id, now);
  try {
    const db = await getDb();
    await db.execute(sql`insert into activity (user_id, day) values (${id}, current_date) on conflict do nothing`);
    await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, id));
  } catch { /* analytics must never break sign-in */ }
}
export async function getUser() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    const db = await getDb();
    const [u] = await db.select().from(users).where(eq(users.id, payload.sub as string));
    if (u) await touch(u.id);
    return u ?? null;
  } catch { return null; }
}
export type User = NonNullable<Awaited<ReturnType<typeof getUser>>>;

// Explicit permissions. Every protected endpoint calls can() on the server; hiding a link is never the check.
const ROLE_PERMS: Record<string, string[]> = {
  student: ["community:read", "community:write"],
  council: ["community:read", "community:write", "content:manage", "contributions:review"],
  admin: ["community:read", "community:write", "content:manage", "contributions:review", "users:review", "reports:view", "analytics:view"],
};
export const can = (u: User | null, perm: string) => !!u && u.verification === "verified" && !!ROLE_PERMS[u.role]?.includes(perm);
export async function requireUser() { const u = await getUser(); if (!u) redirect("/login"); return u; }
// Students must belong to a house. Until they choose one they are sent to onboarding (staff accounts are exempt so moderation is never blocked).
export const hasHouse = (u: User) => !!houseOf(u.houseSlug);
export async function requirePermission(perm: string, opts?: { allowNoHouse?: boolean }) {
  const u = await requireUser();
  if (!can(u, perm)) redirect("/dashboard");
  if (!opts?.allowNoHouse && u.role === "student" && !hasHouse(u)) redirect("/onboarding");
  return u;
}

export const newToken = () => randomBytes(32).toString("hex");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const demoVerification = () => process.env.NODE_ENV !== "production" || process.env.DEMO_VERIFICATION === "true";
export const emailAllowed = (email: string) => {
  const list = (process.env.ALLOWED_EMAIL_DOMAINS ?? "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  return list.length === 0 || list.includes(email.split("@")[1]?.toLowerCase());
};

// In-memory limiter: per server instance only. Use Upstash/Vercel KV for strict limits across instances.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now); hits.set(key, recent);
  return recent.length <= max;
}
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
