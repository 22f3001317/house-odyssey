import { avatarOf } from "@/lib/avatars";
export default function Avatar({ k, size = 64 }: { k: string; size?: number }) {
  const a = avatarOf(k);
  return <span role="img" aria-label={`Avatar: ${a.name}`} className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ width: size, height: size, background: a.bg, fontSize: size * 0.55 }}>{a.emoji}</span>;
}
