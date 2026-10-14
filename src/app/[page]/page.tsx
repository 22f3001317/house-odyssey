import { notFound } from "next/navigation";
// Stage 1 placeholders. Each gets a real build in a later stage.
const pages: Record<string, { title: string; body: string }> = {
  about: { title: "About House Odyssey", body: "House Odyssey helps students discover their house, find events and resources, and be recognized for contributions. Public pages never show private posts or contact details." },
  achievements: { title: "Student Achievements", body: "Approved house milestones and event highlights will be listed here. Nothing appears until it is approved for public view." },
};
export function generateStaticParams() { return Object.keys(pages).map((page) => ({ page })); }
export const dynamicParams = false;
export default async function Stub({ params }: { params: Promise<{ page: string }> }) {
  const p = pages[(await params).page];
  if (!p) notFound();
  return <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-bold">{p.title}</h1><p className="mt-4 max-w-prose text-lg">{p.body}</p></div>;
}
