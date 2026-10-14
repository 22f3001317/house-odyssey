import { eq } from "drizzle-orm";
import Onboarding from "@/components/Onboarding";
import { houses, INTERESTS } from "@/data/seed";
import { getDb, quests } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const [q] = await db.select().from(quests).where(eq(quests.slug, "house-trivia"));
  return (<div className="mx-auto max-w-2xl px-4 py-12"><Onboarding initial={u.onboarding} houses={houses} interests={INTERESTS} houseSlug={u.houseSlug} quest={{ slug: q.slug, title: q.title, description: q.description, xp: q.xp }} /></div>);
}
