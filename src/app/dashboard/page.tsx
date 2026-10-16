import Link from "next/link";
import ActionButton from "@/components/ActionButton";
import AdminOverview from "@/components/dashboard/AdminOverview";
import AnalyticsView from "@/components/dashboard/AnalyticsView";
import MembersView from "@/components/dashboard/MembersView";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { can, demoVerification, requireUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | House Odyssey" };
const copy: Record<string, string> = {
  email_pending: "Confirm your email to continue.", id_pending: "Email confirmed. An organizer will verify your student status, then community features unlock.",
  under_review: "Your student ID is under review.", rejected: "Your verification was not approved. Contact the organizers.", resubmission_required: "Please resubmit your verification details.",
};
// One address for everyone: the dashboard you see depends on your role. Permissions are re-checked on the server for each view and each action.
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string }> }) {
  const u = await requireUser(), sp = await searchParams;
  if (u.verification !== "verified") return (
    <div className="mx-auto max-w-2xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Hi, {u.name}</h1><p className="mt-4 text-lg">{copy[u.verification]}</p>
      {u.verification === "id_pending" && demoVerification() && <div className="mt-6 rounded-xl border-2 border-dashed border-ink p-4"><p className="mb-3 text-sm">Prototype only: this simulates the ID check. A real deployment would use an institutional integration.</p><ActionButton endpoint="/api/auth/simulate" label="Simulate verification" className="bg-compass" /></div>}
      <div className="mt-8"><ActionButton endpoint="/api/auth/logout" label="Log out" /></div></div>);
  const staff = can(u, "contributions:review"), admin = can(u, "analytics:view");
  if (!staff) return <div className="mx-auto max-w-4xl px-4 py-12"><StudentDashboard u={u} /></div>;
  const tab = sp.tab === "personal" ? "personal" : admin && (sp.tab === "analytics" || sp.tab === "members") ? sp.tab : "overview";
  const tabs = [["overview", admin ? "Overview" : "Moderation"], ...(admin ? [["analytics", "Analytics"], ["members", "Members"]] : []), ["personal", "My dashboard"]];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10"><h1 className="font-display text-4xl font-bold">{admin ? "Admin dashboard" : "Council dashboard"}</h1>
      <p className="mt-1">Signed in as {u.name} ({u.role}).</p>
      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Dashboard sections">{tabs.map(([t, l]) => <Link key={t} href={`/dashboard?tab=${t}`} aria-current={tab === t ? "page" : undefined} className={`rounded-full border-2 border-ink px-4 py-1 font-bold ${tab === t ? "bg-compass" : "bg-white"}`}>{l}</Link>)}</nav>
      <div className="mt-6">{tab === "overview" && <AdminOverview u={u} />}{tab === "analytics" && <AnalyticsView />}{tab === "members" && <MembersView sp={sp} />}{tab === "personal" && <StudentDashboard u={u} />}</div></div>
  );
}
