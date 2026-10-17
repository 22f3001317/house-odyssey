import { notFound } from "next/navigation";
import Link from "next/link";
import { getHouse } from "@/lib/repo";
export default async function HousePage({ params }: { params: Promise<{ slug: string }> }) {
  const h = await getHouse((await params).slug);
  if (!h) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold" style={{ color: h.color }}>{h.name}</h1>
      <p className="mt-1 font-semibold">{h.place}</p><p className="mt-4 text-lg">{h.blurb}</p>
      <p className="mt-4 text-lg"><span aria-hidden="true" className="text-3xl">{h.companion.emoji}</span> Forest companion: {h.companion.name}</p>
            <h2 className="mt-8 font-display text-2xl font-bold">Public highlights</h2>
      <p className="mt-2">{h.highlights.length ? h.highlights.join(", ") : "No public highlights yet. Approved house milestones will appear here."}</p>
      <Link href="/login" className="mt-8 inline-block rounded-full bg-compass px-6 py-3 font-bold border-2 border-ink">Sign up to join {h.name}</Link>
    </div>
  );
}
