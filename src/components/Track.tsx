"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
// Privacy-light page counter: sends only the page path. No cookies, no IP or visitor ID is stored.
export default function Track() {
  const path = usePathname();
  useEffect(() => {
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
