import { and, desc, eq } from "drizzle-orm";
import ProfileForm from "@/components/ProfileForm";
import { houses, INTERESTS } from "@/data/seed";
import { requirePermission } from "@/lib/auth";
import { getDb, posts, questCompletions, quests } from "@/lib/db";
import { csv } from "@/lib/profile";
export const dynamic = "force-dynamic";
export const metadata = { title: "Edit profile | House Odyssey" };
export default async function EditProfile() {
  const u = await requirePermission("community:read");
  const db = await getDb();
  const [ps, qs] = await Promise.all([
    db.select({ id: posts.id, title: posts.title }).from(posts).where(and(eq(posts.authorId, u.id), eq(posts.status, "published"))).orderBy(desc(posts.createdAt)).limit(30),
    db.select({ id: quests.id, title: quests.title }).from(questCompletions).innerJoin(quests, eq(quests.id, questCompletions.questId)).where(and(eq(questCompletions.userId, u.id), eq(questCompletions.status, "approved"))),
  ]);
  const featuredOptions = [...ps.map((p) => ({ value: `post:${p.id}`, label: `Post: ${p.title}` })), ...qs.map((q) => ({ value: `quest:${q.id}`, label: `Quest: ${q.title}` }))];
  return (
    <div className="mx-auto max-w-2xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Edit your profile</h1><p className="mb-8 mt-2">Make it yours. You choose what other members can see.</p>
      <ProfileForm initial={{ name: u.name, avatar: u.avatar, house: u.houseSlug ?? "", bio: u.bio, skills: csv(u.skills).join(", "), interests: csv(u.interests), visibility: csv(u.visibility), featured: u.featuredRef ?? "" }}
        houses={houses.map((h) => ({ slug: h.slug, name: h.name }))} interests={INTERESTS} featuredOptions={featuredOptions} /></div>
  );
}
