"use client";
import Link from "next/link";
import { useState } from "react";
import { useMe } from "./MeContext";
import { Menu, X } from "lucide-react";
const pub = [["/", "Home"], ["/houses", "Explore Houses"], ["/achievements", "Student Achievements"], ["/about", "About"], ["/contact", "Contact Us"]];
const main = [["/dashboard", "Dashboard"], ["/community", "Community"], ["/questions", "Questions"], ["/resources", "Resources"], ["/events", "Events"], ["/quests", "Quests"], ["/leaderboard", "Leaderboard"]];
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const me = useMe() ?? null;
  const verified = me?.verification === "verified", n = me?.unread ?? 0;
  const account = [["/profile", "My profile"], ["/achievements", "Achievements"], ["/saved", "Saved"], ["/notifications", n ? `Notifications (${n})` : "Notifications"], ["/settings", "Settings"]];
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; };
  const cls = "hover:underline";
  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-sea/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold">House Odyssey</Link>
        <ul className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-sm md:flex">
          {(verified ? main : pub).map(([h, l]) => <li key={h}><Link href={h} className={cls}>{l}</Link></li>)}
          {verified && <li className="relative"><details className="group"><summary className="cursor-pointer rounded-full border-2 border-ink px-3 py-1 font-semibold">Me{n > 0 && <span className="ml-1 rounded-full bg-compass px-2">{n}</span>}</summary>
            <ul className="absolute right-0 mt-2 w-48 space-y-1 rounded-xl border-2 border-ink bg-sea p-3 shadow">{account.map(([h, l]) => <li key={h}><Link href={h} className={cls}>{l}</Link></li>)}<li><button onClick={logout} className="hover:underline">Log out</button></li></ul></details></li>}
          {me && !verified && <><li><Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 font-semibold text-sea">Finish verification</Link></li><li><button onClick={logout} className={cls}>Log out</button></li></>}
          {!me && <li><Link href="/login" className="rounded-full bg-ink px-4 py-2 font-semibold text-sea">Student Login / Sign Up</Link></li>}
        </ul>
        <button className="p-2 md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <ul id="mobile-menu" className="space-y-1 border-t-2 border-ink px-4 pb-4 md:hidden">
        {(verified ? [...main, ...account] : me ? [...pub, ["/dashboard", "Finish verification"]] : [...pub, ["/login", "Student Login / Sign Up"]]).map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)} className="block py-3 text-lg">{l}</Link></li>)}
        {me && <li><button onClick={logout} className="block py-3 text-lg">Log out</button></li>}</ul>}
    </header>
  );
}
