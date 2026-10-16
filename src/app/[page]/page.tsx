import { notFound } from "next/navigation";
// Stage 1 placeholders. Each gets a real build in a later stage.
const pages: Record<string, { title: string; body: string }> = {
  about: { title: "About House Odyssey", body: "House Odyssey helps students discover their house, find events and resources, and be recognized for contributions. Public pages never show private posts or contact details. For statistics, we count page views without cookies or personal identifiers, and we record which signed-in members were active each day. Only administrators can see member lists and statistics." },
};
export function generateStaticParams() { return Object.keys(pages).map((page) => ({ page })); }
export const dynamicParams = false;
export default async function Stub({ params }: { params: Promise<{ page: string }> }) {
  const p = pages[(await params).page];
  if (!p) notFound();
  return <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">{p.title}</h1><p className="mt-4 max-w-prose text-lg">{p.body}</p></div>;
}
