import HouseCard from "@/components/HouseCard";
import { getHouses } from "@/lib/repo";
export const metadata = { title: "Explore Houses | House Odyssey" };
export default async function Houses() {
  const houses = await getHouses();
  return (<div className="mx-auto max-w-6xl px-4 py-12"><h1 className="font-display text-4xl font-bold">Explore the houses</h1>
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{houses.map((h) => <HouseCard key={h.slug} h={h} />)}</div></div>);
}
