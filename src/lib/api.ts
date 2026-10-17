import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { can, getUser, hasHouse, rateLimit, type User } from "@/lib/auth";

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
type Opts<T> = { perm?: string; schema?: ZodType<T>; limit?: [number, number] };
// One wrapper = one place where auth, permission, rate limit and validation are enforced for every protected endpoint.
export function api<T = unknown>(o: Opts<T>, fn: (c: { user: User; body: T }) => Promise<Response | object>) {
  return async (req: Request) => {
    try {
      const user = await getUser();
      if (!user) return fail("Sign in first.", 401);
      if (o.perm && !can(user, o.perm)) return fail("You don't have permission to do that.", 403);
      if (o.perm === "community:write" && user.role === "student" && !hasHouse(user)) return fail("Choose your house first (open onboarding or your profile).", 403);
      if (o.limit && !rateLimit(`${new URL(req.url).pathname}:${user.id}`, o.limit[0], o.limit[1])) return fail("Slow down and try again shortly.", 429);
      let body = undefined as T;
      if (o.schema) {
        const p = o.schema.safeParse(await req.json().catch(() => null));
        if (!p.success) return fail(p.error.issues[0].message);
        body = p.data;
      }
      const r = await fn({ user, body });
      return r instanceof Response ? r : NextResponse.json({ ok: true, ...r });
    } catch (e) { console.error(e); return fail("Server error.", 500); }
  };
}
