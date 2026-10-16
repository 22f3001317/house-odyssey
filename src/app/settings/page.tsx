import ActionButton from "@/components/ActionButton";
import ApiForm from "@/components/ApiForm";
import { requireUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Settings | House Odyssey" };
export default async function Settings() {
  const u = await requireUser();
  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-12"><h1 className="font-display text-4xl font-bold">Settings</h1>
      <section><h2 className="font-display text-2xl font-bold">Account</h2><p className="mt-2">Email: {u.email}<br />Role: {u.role} · Status: {u.verification}</p><p className="mt-1 text-sm">Display name, house, bio and visibility are in <a className="underline" href="/profile/edit">Edit profile</a>.</p></section>
      <section><h2 className="font-display text-2xl font-bold">Change password</h2><div className="mt-3"><ApiForm endpoint="/api/account/password" submitLabel="Change password" fields={[{ name: "current", label: "Current password", type: "password", autoComplete: "current-password" }, { name: "next", label: "New password (10+ characters)", type: "password", autoComplete: "new-password" }]} /></div></section>
      <section><h2 className="font-display text-2xl font-bold">Leaderboard</h2><p className="mt-2">{u.leaderboard ? "You appear on the leaderboard." : "You are hidden from the leaderboard."} Your profile and achievements don't depend on it.</p>
        <div className="mt-3"><ActionButton endpoint="/api/account" body={{ leaderboard: !u.leaderboard }} label={u.leaderboard ? "Hide me from the leaderboard" : "Show me on the leaderboard"} /></div></section>
      <section><h2 className="font-display text-2xl font-bold">Notifications</h2><p className="mt-2">Notifications about replies, approvals and event changes appear in the app. No emails are sent for them.</p></section>
      <div><ActionButton endpoint="/api/auth/logout" label="Log out" /></div>
    </div>
  );
}
