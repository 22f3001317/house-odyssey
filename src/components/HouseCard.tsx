import Link from "next/link";
import type { House } from "@/data/seed";
export default function HouseCard({ h }: { h: House }) {
  return (
    <article className="flex flex-col rounded-2xl border-2 border-ink p-5" style={{ background: h.tint, boxShadow: `5px 5px 0 ${h.color}` }}>
      <h3 className="font-display text-2xl font-bold" style={{ color: h.color }}>{h.name}</h3>
      <p className="mt-2 flex-1">{h.blurb}</p>
      <p className="mt-3 text-sm">{h.interests.join(", ")}</p>
      <Link href={`/houses/${h.slug}`} className="mt-4 self-start rounded-full bg-ink px-4 py-2 font-semibold text-sea">Explore {h.name.replace(" House", "")}</Link>
    </article>
  );
}
