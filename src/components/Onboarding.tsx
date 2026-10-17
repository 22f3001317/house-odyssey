"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Pip from "./Pip";
import type { House } from "@/data/seed";
const refreshMe = () => window.dispatchEvent(new Event("me:refresh"));

type Step = "arrival" | "house" | "story" | "interests" | "quest" | "done";
type Quest = { slug: string; title: string; description: string; xp: number };
async function call(url: string, body: object) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}
export default function Onboarding({ initial, houses, interests, quest, houseSlug }: { initial: string; houses: House[]; interests: readonly string[]; quest: Quest; houseSlug: string | null }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(initial === "done" ? "done" : (initial as Step));
  const [house, setHouse] = useState<House | null>(houses.find((h) => h.slug === houseSlug) ?? null);
  const [picked, setPicked] = useState<string[]>([]);
  const [line, setLine] = useState(0);
  const [msg, setMsg] = useState("");
  const [reward, setReward] = useState(0);
  const go = async (body: { step: string; [k: string]: unknown }, next: Step) => {
    setMsg(""); const r = await call("/api/onboarding", body);
    if (!r.ok) return setMsg(r.data.error ?? "Something went wrong."); setStep(next);
  };
  const lines = house ? [`Welcome to ${house.name}! ${house.blurb}`, `Your forest companion is the ${house.companion.name} ${house.companion.emoji}. You'll spot it wandering around the background of this site.`, "Ready to pick a few interests so I can point you at the right things?"] : [];
  const box = "rounded-2xl border-2 border-ink bg-white p-6";
  const btn = "rounded-full border-2 border-ink bg-compass px-6 py-3 font-bold";
  const view = {
    arrival: (<div className={box}><h2 className="font-display text-3xl font-bold">Your odyssey begins</h2><p className="mt-3">I'm Pip. In a few short scenes you'll pick your house, tell me what you like, and try a first quest. Choosing a house is the one required step. Nothing here asks you to post or share personal details.</p>
      <div className="mt-5 flex flex-wrap gap-3"><button className={btn} onClick={() => go({ step: "start" }, "house")}>Begin the journey</button></div></div>),
    house: (<div className={box}><h2 className="font-display text-3xl font-bold">Choose your house</h2><p className="mt-2">You can change this later. Selecting a house is your choice; official membership may be confirmed separately.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{houses.map((h) => (<button key={h.slug} onClick={() => { setHouse(h); go({ step: "house", house: h.slug }, "story").then(refreshMe); setLine(0); }} className="rounded-xl border-2 border-ink p-4 text-left" style={{ background: h.tint }}><span className="font-display text-xl font-bold" style={{ color: h.color }}>{h.name}</span><span className="block text-sm">{h.place}</span><span className="block text-sm">{h.companion.emoji} {h.companion.name}</span></button>))}</div></div>),
    story: (<div className={box}><div className="flex items-start gap-3"><Pip size={72} /><p className="rounded-2xl rounded-tl-none border-2 border-ink bg-sea p-4" aria-live="polite">{lines[line]}</p></div>
      <div className="mt-5 flex flex-wrap gap-3"><button className={btn} onClick={() => (line < lines.length - 1 ? setLine(line + 1) : go({ step: "story" }, "interests"))}>{line < lines.length - 1 ? "Next" : "Choose interests"}</button><button className="rounded-full border-2 border-ink px-6 py-3 font-bold" onClick={() => go({ step: "story" }, "interests")}>Skip story</button></div></div>),
    interests: (<div className={box}><h2 className="font-display text-3xl font-bold">What are you into?</h2><p className="mt-2">Optional. This only tunes your recommendations.</p>
      <fieldset className="mt-4 flex flex-wrap gap-2"><legend className="sr-only">Interests</legend>{interests.map((i) => (<label key={i} className={`cursor-pointer rounded-full border-2 border-ink px-4 py-2 ${picked.includes(i) ? "bg-compass font-bold" : "bg-white"}`}><input type="checkbox" className="sr-only" checked={picked.includes(i)} onChange={() => setPicked(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])} />{i}</label>))}</fieldset>
      <button className={`${btn} mt-5`} onClick={() => go({ step: "interests", interests: picked }, "quest")}>Continue</button></div>),
    quest: (<form className={box} onSubmit={async (e) => { e.preventDefault(); const a = String(new FormData(e.currentTarget).get("answer") ?? ""); const r = await call("/api/quests/complete", { slug: quest.slug, answer: a });
      if (!r.ok) return setMsg(r.data.error ?? "Try again."); setReward(r.data.xp); setMsg(r.data.message); }}>
      <h2 className="font-display text-3xl font-bold">First quest: {quest.title}</h2><p className="mt-2">{quest.description}</p>
      <label htmlFor="answer" className="mt-4 block font-semibold">Your answer</label><input id="answer" name="answer" className="mt-1 w-full rounded-lg border-2 border-ink p-3" />
      <div className="mt-4 flex flex-wrap gap-3">{!reward && <button className={btn}>Submit (+{quest.xp} XP)</button>}<button type="button" className="rounded-full border-2 border-ink px-6 py-3 font-bold" onClick={() => go({ step: "finish" }, "done")}>{reward ? "Finish" : "Skip quest"}</button></div></form>),
    done: (<div className={box}><h2 className="font-display text-3xl font-bold">You're on the trail{house ? ` with ${house.name}` : ""}!</h2><p className="mt-2">{reward ? `You earned ${reward} XP. ` : ""}Your dashboard has recommended next steps.</p><Link href="/dashboard" className={`${btn} mt-5 inline-block`}>Enter the dashboard</Link></div>),
  }[step];
  return (<motion.div key={step} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>{view}<p role="alert" className="mt-3 font-semibold text-moss">{msg}</p></motion.div>);
}
