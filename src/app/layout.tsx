import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Track from "@/components/Track";
export const metadata: Metadata = { title: "House Odyssey", description: "Find your house, join the quests, and get recognized for what you contribute." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-compass focus:p-3">Skip to content</a>
      <SiteNav />
      <Track />
      <main id="main">{children}</main>
      <footer className="mt-20 border-t-2 border-ink px-4 py-8 text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4">
          <p>House names, mascots and highlights are demo content until official details are supplied.</p>
          <p className="flex gap-4"><Link href="/about">Privacy</Link><Link href="/about">Terms</Link><Link href="/about">Accessibility</Link><Link href="/contact">Contact</Link></p>
        </div>
      </footer>
    </body></html>
  );
}
