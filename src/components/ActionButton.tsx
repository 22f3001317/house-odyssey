"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function ActionButton({ endpoint, label, body, className = "" }: { endpoint: string; label: string; body?: object; className?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function go() {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(d.error ?? "Something went wrong.");
    if (d.redirect) router.push(d.redirect); else setMsg(d.message ?? "");
    router.refresh();
  }
  return <div><button onClick={go} className={`rounded-full border-2 border-ink px-5 py-2 font-bold ${className}`}>{label}</button><p aria-live="polite" className="mt-2">{msg}</p></div>;
}
