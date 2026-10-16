import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import ProfileView from "@/components/ProfileView";
import { requirePermission } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Member({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePermission("community:read");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  if (id === me.id) redirect("/profile");
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.id, id));
  if (!u || u.verification !== "verified") notFound();
  return <div className="mx-auto max-w-3xl px-4 py-12"><ProfileView u={u} isSelf={false} /></div>;
}
