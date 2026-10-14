"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
export type Field = { name: string; label: string; type?: string; autoComplete?: string; multiline?: boolean; options?: string[]; optional?: boolean };
export default function ApiForm({ endpoint, fields, submitLabel, honeypot, extra }: { endpoint: string; fields: Field[]; submitLabel: string; honeypot?: boolean; extra?: object }) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<{ error?: string; message?: string; link?: string }>({});
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setState({});
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { ...extra };
    for (const f of fields) { const v = fd.get(f.name); body[f.name] = f.type === "checkbox" ? v === "on" : f.optional && !v ? undefined : v; }
    if (honeypot) body.website = fd.get("website") ?? "";
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res || !res.ok) return setState({ error: data?.error ?? "Something went wrong. Try again." });
    if (data.redirect) { router.push(data.redirect); router.refresh(); return; }
    ref.current?.reset(); setState({ message: data.message ?? "Done.", link: data.devVerifyUrl }); router.refresh();
  }
  const cls = "mt-1 w-full rounded-lg border-2 border-ink bg-white p-3";
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === "checkbox"
            ? <label className="flex items-start gap-2"><input name={f.name} type="checkbox" className="mt-1 h-5 w-5" /><span>{f.label}</span></label>
            : <><label htmlFor={f.name} className="block font-semibold">{f.label}</label>
              {f.multiline ? <textarea id={f.name} name={f.name} rows={5} className={cls} />
                : f.options ? <select id={f.name} name={f.name} className={cls}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                : <input id={f.name} name={f.name} type={f.type ?? "text"} autoComplete={f.autoComplete} className={cls} />}</>}
        </div>
      ))}
      {honeypot && <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />}
      <button disabled={busy} className="rounded-full border-2 border-ink bg-compass px-6 py-3 font-bold disabled:opacity-60">{busy ? "Working..." : submitLabel}</button>
      <div aria-live="polite">
        {state.error && <p role="alert" className="font-semibold text-red-800">{state.error}</p>}
        {state.message && <p className="font-semibold text-moss">{state.message}</p>}
        {state.link && <p className="mt-2 rounded-lg border-2 border-dashed border-ink p-3 text-sm">Prototype only: <Link className="underline" href={state.link}>confirm your email</Link></p>}
      </div>
    </form>
  );
}
