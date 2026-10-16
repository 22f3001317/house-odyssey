import { getDb, notifications } from "@/lib/db";
// Notifications are a convenience: failing to write one must never break the action that caused it.
export async function notify(userIds: string | string[], title: string, href: string) {
  const ids = [...new Set(Array.isArray(userIds) ? userIds : [userIds])];
  if (!ids.length) return;
  try { const db = await getDb(); await db.insert(notifications).values(ids.map((userId) => ({ userId, title: title.slice(0, 200), href }))); } catch (e) { console.error("notify failed", (e as Error).message); }
}
