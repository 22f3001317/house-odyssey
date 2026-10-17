"use client";
import { houseOf } from "@/data/seed";
import { useMe } from "./MeContext";

// A small, quiet scene behind the whole site. Members see their house's forest companion and its neighbours wandering by;
// everyone else (signed out, or no house chosen yet) sees a savanna. Purely decorative: hidden from assistive tech, never intercepts clicks,
// and the global reduced-motion rule freezes it into a still picture.
const SAVANNA = { color: "#B07A2A", tint: "#F3E2B8", walkers: ["🦌", "🦌", "🐒", "🐺", "🐅", "🐆", "🦌"], sky: ["🦅", "🦜", "🦋", "🐝", "🦋"] };
type Critter = { e: string; size: number; bottom: number; dur: number; delay: number; x: number; op: number; hop: number };
const pick = <T,>(a: T[], i: number) => a[i % a.length];

export default function Backdrop() {
  const me = useMe();
  if (me === undefined) return null; // wait for the first answer so a member never sees the wrong scene flash by
  const house = houseOf(me?.house);
  const scene = house ? { color: house.color, tint: house.tint, walkers: [house.companion.emoji, ...house.friends, house.companion.emoji, ...house.friends].slice(0, 7), sky: [...house.sky, ...house.sky, "🐝"].slice(0, 5) } : SAVANNA;
  // Deterministic layout: the same house always gets the same arrangement.
  const walkers: Critter[] = scene.walkers.map((e, i) => ({ e, size: i === 0 ? 40 : 24 + ((i * 7) % 14), bottom: 4 + ((i * 23) % 44), dur: 70 + ((i * 29) % 70), delay: -((i * 37) % 90), x: 6 + ((i * 41) % 88), op: 0.55 + ((i * 13) % 30) / 100, hop: 0.9 + (i % 4) * 0.35 }));
  const flyers: Critter[] = scene.sky.map((e, i) => ({ e, size: e === "🐝" || e === "🦋" ? 15 : 22, bottom: 38 + ((i * 17) % 40), dur: 38 + ((i * 11) % 36), delay: -((i * 19) % 50), x: 10 + ((i * 53) % 80), op: 0.6, hop: 1.4 + (i % 3) * 0.5 }));
  const c = scene.color;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: `radial-gradient(circle at 88% 6%, rgba(232,200,117,.45), transparent 38%), linear-gradient(to bottom, #FBF4E6 0%, #FBF4E6 58%, ${scene.tint} 100%)`, animation: "fadein 1.2s ease both" }}>
      <svg className="absolute bottom-0 left-0 h-48 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 120 C200 70 360 150 560 110 S980 60 1180 100 S1380 130 1440 100 V200 H0Z" fill={c} opacity=".10" />
        <path d="M0 160 C240 120 420 180 680 150 S1100 110 1440 150 V200 H0Z" fill={c} opacity=".16" />
        <g fill={c} opacity=".22"><path d="M120 150 v-34 M96 118 h48 M104 112 h32" stroke={c} strokeWidth="4" strokeLinecap="round" /><path d="M980 160 v-44 M950 120 h60 M958 112 h44" stroke={c} strokeWidth="4" strokeLinecap="round" /><path d="M1290 150 v-30 M1270 122 h40" stroke={c} strokeWidth="4" strokeLinecap="round" /></g>
      </svg>
      {walkers.map((k, i) => (
        <span key={`w${i}`} className="critter" style={{ bottom: k.bottom, fontSize: k.size, opacity: k.op, animation: `walk ${k.dur}s linear ${k.delay}s infinite`, ["--x" as string]: `${k.x}%` }}>
          <span className="critter-in" style={{ animation: `hop ${k.hop}s ease-in-out infinite` }}>{k.e}</span></span>))}
      {flyers.map((k, i) => (
        <span key={`f${i}`} className="critter" style={{ bottom: `${k.bottom}vh`, fontSize: k.size, opacity: k.op, animation: `fly ${k.dur}s linear ${k.delay}s infinite`, ["--x" as string]: `${k.x}%` }}>
          <span className="critter-in" style={{ animation: `flap ${k.hop}s ease-in-out infinite` }}>{k.e}</span></span>))}
    </div>
  );
}
