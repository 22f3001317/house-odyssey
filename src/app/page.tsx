import Link from "next/link";
import Pip from "@/components/Pip";
import TrailMap from "@/components/TrailMap";
import HouseCard from "@/components/HouseCard";
import { getHouses, getUpcomingEvents } from "@/lib/repo";
const steps = ["Explore the houses", "Verify your student account", "Choose your house and interests", "Begin your onboarding adventure", "Complete optional quests and contribute", "Earn achievements and track progress"];
export const revalidate = 60;
export default async function Home() {
  const [houses, events] = await Promise.all([getHouses(), getUpcomingEvents()]);
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <div className="flex items-end gap-3"><Pip /><p className="rounded-2xl rounded-bl-none border-2 border-ink bg-white px-4 py-2">New here? I'll show you around.</p></div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-5xl">Four houses. One campus. Find where you belong.</h1>
          <p className="mt-4 max-w-prose text-lg">House Odyssey helps new students discover their house, find events and notes, and get recognized for what they contribute.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/houses" className="rounded-full bg-compass px-6 py-3 font-bold border-2 border-ink">Explore Your House</Link>
            <Link href="/login" className="rounded-full border-2 border-ink px-6 py-3 font-bold">Student Login</Link>
          </div>
        </div>
        <TrailMap />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="houses">
        <h2 id="houses" className="font-display text-3xl font-bold">Explore the houses</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{houses.map((h) => <HouseCard key={h.slug} h={h} />)}</div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="how">
        <h2 id="how" className="font-display text-3xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => <li key={s} className="rounded-xl border-2 border-ink bg-white p-4"><span className="font-display text-2xl font-bold text-moss">{i + 1}</span> {s}</li>)}
        </ol>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="events">
        <h2 id="events" className="font-display text-3xl font-bold">Upcoming events</h2>
        {events.length === 0 ? <p className="mt-4 rounded-xl border-2 border-dashed border-ink p-6">No public events yet. Student-organized meetups will appear here once they are approved.</p>
          : <ul className="mt-4 space-y-3">{events.map((e) => <li key={e.id}><strong>{e.title}</strong>, {e.date}. {e.summary}</li>)}</ul>}
      </section>
    </>
  );
}
