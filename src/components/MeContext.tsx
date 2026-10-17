"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export type Me = { name: string; verification: string; role: string; unread: number; house: string | null } | null;
const Ctx = createContext<{ me: Me | undefined }>({ me: undefined });
// One /api/me request per navigation, shared by the nav bar and the animated background. `undefined` means "still loading".
export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const path = usePathname();
  const load = useCallback(() => { fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.user)).catch(() => setMe(null)); }, []);
  useEffect(() => { load(); }, [path, load]);
  useEffect(() => { window.addEventListener("me:refresh", load); return () => window.removeEventListener("me:refresh", load); }, [load]);
  return <Ctx.Provider value={{ me }}>{children}</Ctx.Provider>;
}
export const useMe = () => useContext(Ctx).me;
