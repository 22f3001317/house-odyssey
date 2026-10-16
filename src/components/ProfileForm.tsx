"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "./Avatar";
import { AVATARS } from "@/lib/avatars";
import { SECTIONS, SECTION_LABEL } from "@/lib/profile";

type Props = { initial: { name: string; avatar: string; house: string; bio: string; skills: string; interests: string[]; visibility: string[]; featured: string };
  houses: { slug: string; name: string }[]; interests: readonly string[]; featuredOptions: { value: string; label: string }[] };
export default function ProfileForm({ initial, houses, interests, featuredOptions }: Props) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const toggle = (k: "interests" | "visibility", v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const body = { name: f.name, avatar: f.avatar, house: f.house || undefined, bio: f.bio, skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean), interests: f.interests, visibility: f.visibility, featured: f.featured };
    const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setMsg({ ok: r.ok, text: d.message ?? d.error ?? "Something went wrong." }); if (r.ok) router.refresh();
  }
  const input = "mt-1 w-full rounded-lg border-2 border-ink bg-white p-3", chip = (on: boolean) => `cursor-pointer rounded-full border-2 border-ink px-4 py-2 ${on ? "bg-compass font-bold" : "bg-white"}`;
  return (
    <form onSubmit={save} className="space-y-8">
      <fieldset><legend className="font-display text-xl font-bold">Avatar</legend>
        <div className="mt-2 flex flex-wrap gap-3">{AVATARS.map((a) => <label key={a.key} className={`cursor-pointer rounded-full p-1 ${f.avatar === a.key ? "ring-4 ring-dusk" : ""}`}><input type="radio" name="avatar" className="sr-only" checked={f.avatar === a.key} onChange={() => setF({ ...f, avatar: a.key })} /><Avatar k={a.key} size={56} /><span className="sr-only">{a.name}</span></label>)}</div></fieldset>
      <div><label htmlFor="name" className="font-display text-xl font-bold">Display name</label><input id="name" className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><label htmlFor="house" className="font-display text-xl font-bold">Your house</label><select id="house" className={input} value={f.house} onChange={(e) => setF({ ...f, house: e.target.value })}><option value="">Not chosen yet</option>{houses.map((h) => <option key={h.slug} value={h.slug}>{h.name}</option>)}</select>
        <p className="mt-1 text-sm">This is the house you chose. Official membership may be confirmed separately.</p></div>
      <div><label htmlFor="bio" className="font-display text-xl font-bold">Short bio</label><textarea id="bio" rows={3} maxLength={280} className={input} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /><p className="text-sm">{f.bio.length}/280</p></div>
      <div><label htmlFor="skills" className="font-display text-xl font-bold">Skills (optional)</label><input id="skills" className={input} placeholder="e.g. Python, guitar, event planning" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} /><p className="text-sm">Separate with commas, up to 8.</p></div>
      <fieldset><legend className="font-display text-xl font-bold">Interests</legend><div className="mt-2 flex flex-wrap gap-2">{interests.map((i) => <label key={i} className={chip(f.interests.includes(i))}><input type="checkbox" className="sr-only" checked={f.interests.includes(i)} onChange={() => toggle("interests", i)} />{i}</label>)}</div></fieldset>
      <div><label htmlFor="featured" className="font-display text-xl font-bold">Featured contribution</label><select id="featured" className={input} value={f.featured} onChange={(e) => setF({ ...f, featured: e.target.value })}><option value="">None</option>{featuredOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <p className="mt-1 text-sm">Pick one thing you're proud of. Only your own approved or published work can be featured.</p></div>
      <fieldset><legend className="font-display text-xl font-bold">Who can see what</legend><p className="text-sm">Ticked sections are visible to other verified members. Unticked sections stay private to you. Your email is never shown.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{SECTIONS.map((s) => <label key={s} className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={f.visibility.includes(s)} onChange={() => toggle("visibility", s)} />{SECTION_LABEL[s]}</label>)}</div></fieldset>
      <button className="rounded-full border-2 border-ink bg-compass px-6 py-3 font-bold">Save profile</button>
      <p aria-live="polite" role={msg && !msg.ok ? "alert" : undefined} className={`font-semibold ${msg?.ok ? "text-moss" : "text-red-800"}`}>{msg?.text}</p>
    </form>
  );
}
