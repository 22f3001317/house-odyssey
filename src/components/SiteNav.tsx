"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
type Me = { name: string; verification: string; admin: boolean } | null;
const pub = [["/", "Home"], ["/houses", "Explore Houses"], ["/achievements", "Student Achievements"], ["/about", "About"], ["/contact", "Contact Us"]];
const member = [["/dashboard", "Dashboard"], ["/community", "Community"], ["/questions", "Questions"], ["/resources", "Resources"], ["/events", "Events"], ["/quests", "Quests"], ["/leaderboard", "Leaderboard"], ["/profile", "Profile"]];
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(null);
  useEffect(() => { fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.user)).catch(() => {}); }, []);
  const verified = me?.verification === "verified";
  const links = verified ? [...member, ...(me?.admin ? [["/admin", "Admin"]] : [])] : pub;
  const last = me ? ["/dashboard", me ? (verified ? "My account" : "Finish verification") : ""] : ["/login", "Student Login / Sign Up"];
  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-sea/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold">House Odyssey</Link>
        <ul className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-sm md:flex">
          {links.map(([h, l]) => <li key={h}><Link href={h} className="hover:underline">{l}</Link></li>)}
          {!verified && <li><Link href={last[0]} className="rounded-full bg-ink px-4 py-2 font-semibold text-sea">{last[1]}</Link></li>}
        </ul>
        <button className="p-2 md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <ul id="mobile-menu" className="space-y-1 border-t-2 border-ink px-4 pb-4 md:hidden">{(verified ? links : [...links, last]).map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)} className="block py-3 text-lg">{l}</Link></li>)}</ul>}
    </header>
  );
}
