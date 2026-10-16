import { TRACK_LABEL } from "@/lib/tracks";
import type { Item } from "@/lib/portfolio";
import type { Track } from "@/lib/tracks";
// Lists what a student contributed, grouped by track. It shows titles, not totals, so it reads as a showcase rather than a score.
export default function ContribByTrack({ groups, cap = 6 }: { groups: { track: Track; items: Item[] }[]; cap?: number }) {
  if (!groups.length) return <p className="rounded-xl border-2 border-dashed border-ink p-4">Nothing here yet. Approved quests, resources, answers and events will appear as they happen.</p>;
  return (<div className="space-y-4">{groups.map((g) => (
    <div key={g.track}><h3 className="font-display text-lg font-bold">{TRACK_LABEL[g.track]}</h3>
      <ul className="mt-1 space-y-1">{g.items.slice(0, cap).map((i, n) => <li key={n}><span className="text-sm text-moss">{i.type} · {i.date.toISOString().slice(0, 10)}</span><br />{i.href ? <a className="underline" href={i.href}>{i.title}</a> : i.title}</li>)}</ul></div>))}</div>);
}
