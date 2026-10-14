"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function QuestAction({ slug, kind }: { slug: string; kind: string }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const r = await fetch("/api/quests/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, answer: f.get("answer") ?? undefined, proof: f.get("proof") ?? undefined }) });
    const d = await r.json().catch(() => ({})); setMsg(d.message ?? d.error ?? ""); if (r.ok) router.refresh();
  }
  return (<form onSubmit={submit} className="mt-3 space-y-2">
    {kind === "trivia" && <input name="answer" aria-label="Answer" className="w-full rounded-lg border-2 border-ink p-2" />}
    {kind === "proof" && <textarea name="proof" aria-label="Details" rows={2} className="w-full rounded-lg border-2 border-ink p-2" />}
    <button className="rounded-full border-2 border-ink bg-compass px-4 py-2 font-bold">{kind === "visit" ? "Mark done" : "Submit"}</button><p aria-live="polite" className="text-sm">{msg}</p></form>);
}
