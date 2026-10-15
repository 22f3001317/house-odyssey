export type Point = { label: string; value: number };
export default function BarChart({ title, data }: { title: string; data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.value)), total = data.reduce((a, d) => a + d.value, 0);
  const W = 600, H = 130, gap = 2, bw = W / data.length - gap;
  return (
    <figure className="rounded-2xl border-2 border-ink bg-white p-4">
      <figcaption className="font-display text-lg font-bold">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H + 20}`} role="img" aria-label={`${title}: ${total} in total over ${data.length} days, peak ${max} in a day`} className="mt-2 w-full">
        {data.map((d, i) => { const h = Math.round((d.value / max) * H); return <rect key={d.label} x={i * (bw + gap)} y={H - h} width={bw} height={d.value ? Math.max(h, 2) : 0} rx="2" fill="#7A2E3B"><title>{`${d.label}: ${d.value}`}</title></rect>; })}
        <line x1="0" x2={W} y1={H} y2={H} stroke="#5A2431" />
        <text x="0" y={H + 15} fontSize="11" fill="#5A2431">{data[0]?.label.slice(5)}</text>
        <text x={W} y={H + 15} fontSize="11" textAnchor="end" fill="#5A2431">{data[data.length - 1]?.label.slice(5)}</text>
      </svg>
      <p className="text-sm">Total {total} · peak {max} in a day</p>
    </figure>
  );
}
