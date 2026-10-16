const KNOWN = ["/saved", "/notifications", "/settings", "/profile/edit", "/", "/houses", "/about", "/achievements", "/contact", "/login", "/verify", "/dashboard", "/onboarding", "/quests", "/community", "/questions", "/resources", "/events", "/leaderboard", "/profile"];
// Maps a raw URL path to a small fixed set of labels so the counter table can't be filled with arbitrary strings.
export function normalizePath(raw: string, houseSlugs: string[]): string | null {
  const p = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (p.startsWith("/admin") || p.startsWith("/api")) return null;
  if (KNOWN.includes(p)) return p;
  if (/^\/questions\/[0-9a-f-]{36}$/.test(p)) return "/questions/[id]";
  if (/^\/members\/[0-9a-f-]{36}$/.test(p)) return "/members/[id]";
  if (/^\/events\/[0-9a-f-]{36}$/.test(p)) return "/events/[id]";
  const m = p.match(/^\/houses\/([a-z0-9-]+)$/);
  if (m && houseSlugs.includes(m[1])) return p;
  return "/other";
}
