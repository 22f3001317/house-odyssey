import { houses } from "@/data/seed";
const pts = [[70, 210], [190, 110], [330, 190], [450, 80]];
export default function TrailMap() {
  return (
    <svg viewBox="0 0 520 280" className="w-full max-w-xl" role="img" aria-label="Trail map linking the four houses">
      <path d="M70,210 Q110,90 190,110 T330,190 T450,80" fill="none" stroke="#5A2431" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
      {houses.map((h, i) => (
        <g key={h.slug} transform={`translate(${pts[i][0]} ${pts[i][1]})`}>
          <circle r="26" fill={h.color} stroke="#5A2431" strokeWidth="4" />
          <text textAnchor="middle" dy="8" fontSize="22" fontWeight="700" fill="#fff">{h.name[0]}</text>
          <text textAnchor="middle" y="46" fontSize="14" fontWeight="600" fill="#5A2431">{h.name.replace(" House", "")}</text>
        </g>
      ))}
    </svg>
  );
}
