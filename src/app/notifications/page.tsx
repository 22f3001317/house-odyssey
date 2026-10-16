import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import ActionButton from "@/components/ActionButton";
import { requirePermission } from "@/lib/auth";
import { getDb, notifications } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications | House Odyssey" };
export default async function Notifications() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const rows = await db.select().from(notifications).where(eq(notifications.userId, u.id)).orderBy(desc(notifications.createdAt)).limit(50);
  const unread = rows.filter((r) => !r.read).length;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Notifications</h1>
      <p className="mt-2">Replies to your questions, approvals and event changes show up here.</p>
      {unread > 0 && <div className="mt-4 w-48"><ActionButton endpoint="/api/notifications" body={{ action: "read-all" }} label="Mark all as read" /></div>}
      <ul className="mt-6 space-y-3">{rows.length === 0 && <li className="rounded-xl border-2 border-dashed border-ink p-6">Nothing yet.</li>}
        {rows.map((n) => <li key={n.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink p-4 ${n.read ? "bg-white" : "bg-compass/40"}`}>
          <div><Link className="font-semibold underline" href={n.href}>{n.title}</Link><p className="text-sm">{n.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC{n.read ? "" : " · new"}</p></div>
          {!n.read && <ActionButton endpoint="/api/notifications" body={{ action: "read", id: n.id }} label="Mark read" />}</li>)}</ul></div>
  );
}
