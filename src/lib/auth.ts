import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";

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
export async function getUser() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    const db = await getDb();
    const [u] = await db.select().from(users).where(eq(users.id, payload.sub as string));
    return u ?? null;
  } catch { return null; }
}
export type User = NonNullable<Awaited<ReturnType<typeof getUser>>>;

// Explicit permissions. Every protected endpoint calls can() on the server; hiding a link is never the check.
const ROLE_PERMS: Record<string, string[]> = {
  student: ["community:read", "community:write"],
  council: ["community:read", "community:write", "content:manage", "contributions:review"],
  admin: ["community:read", "community:write", "content:manage", "contributions:review", "users:review", "reports:view"],
};
export const can = (u: User | null, perm: string) => !!u && u.verification === "verified" && !!ROLE_PERMS[u.role]?.includes(perm);
export async function requireUser() { const u = await getUser(); if (!u) redirect("/login"); return u; }
export async function requirePermission(perm: string) { const u = await requireUser(); if (!can(u, perm)) redirect("/dashboard"); return u; }

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
