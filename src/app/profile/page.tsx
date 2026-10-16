import ProfileView from "@/components/ProfileView";
import { requirePermission } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "My profile | House Odyssey" };
export default async function Profile() {
  const u = await requirePermission("community:read");
  return <div className="mx-auto max-w-3xl px-4 py-12"><ProfileView u={u} isSelf /></div>;
}
