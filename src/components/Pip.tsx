// Pip: original lantern-spirit helper. Static SVG; bobbing is disabled by the reduced-motion rule.
export default function Pip({ size = 96, mood = "happy", float = true }: { size?: number; mood?: "happy" | "curious"; float?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Pip, your guide" className={float ? "bob" : ""}>
      <path d="M50 6v10" stroke="#5A2431" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="56" rx="30" ry="34" fill="#E8C875" stroke="#5A2431" strokeWidth="4" />
      <ellipse cx="50" cy="60" rx="20" ry="22" fill="#F6E3A8" />
      <circle cx="41" cy="54" r="4" fill="#5A2431" /><circle cx="59" cy="54" r="4" fill="#5A2431" />
      {mood === "happy" ? <path d="M42 68q8 8 16 0" stroke="#5A2431" strokeWidth="4" fill="none" strokeLinecap="round" /> : <circle cx="50" cy="70" r="4" fill="#5A2431" />}
    </svg>
  );
}
