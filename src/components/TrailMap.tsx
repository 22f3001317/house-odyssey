import { houses } from "@/data/seed";
// Twelve houses strung along one winding trail. Each stop shows the house's forest companion; names are in the cards below.
export default function TrailMap() {
  const pts = houses.map((_, i) => [34 + i * 41, 140 + Math.sin(i * 0.85) * 70] as const);
  return (
    <svg viewBox="0 0 520 280" className="w-full max-w-xl" role="img" aria-label="A winding trail through the twelve forest houses">
      <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} fill="none" stroke="#5A2431" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
      {houses.map((h, i) => (
        <g key={h.slug} transform={`translate(${pts[i][0]} ${pts[i][1]})`}><title>{`${h.name}: ${h.companion.name}`}</title>
          <circle r="19" fill={h.tint} stroke={h.color} strokeWidth="3.5" /><text textAnchor="middle" dy="7" fontSize="20">{h.companion.emoji}</text></g>))}
    </svg>
  );
}
