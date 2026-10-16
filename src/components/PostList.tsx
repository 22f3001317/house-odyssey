import ActionButton from "./ActionButton";
import { asTrack, TRACK_LABEL } from "@/lib/tracks";
export type Row = { id: string; title: string; body: string; tag: string | null; url: string | null; author: string; authorId: string; track: string; saved?: boolean; createdAt: Date; answers?: number; solved?: boolean };
export default function PostList({ rows, kind }: { rows: Row[]; kind: string }) {
  if (!rows.length) return <p className="rounded-xl border-2 border-dashed border-ink p-6">Nothing here yet. Be the first!</p>;
  return (<ul className="space-y-4">{rows.map((r) => (
    <li key={r.id} className="rounded-2xl border-2 border-ink bg-white p-5">
      <h3 className="font-display text-xl font-bold">{kind === "question" ? <a className="underline" href={`/questions/${r.id}`}>{r.title}</a> : r.title}</h3>
      <p className="text-sm text-moss"><a className="underline" href={`/members/${r.authorId}`}>{r.author}</a> · {TRACK_LABEL[asTrack(r.track)]} · {r.createdAt.toISOString().slice(0, 10)}{r.tag ? ` · #${r.tag}` : ""}{kind === "question" ? ` · ${r.solved ? "Solved" : "Unsolved"} · ${r.answers ?? 0} answers` : ""}</p>
      {kind !== "question" && <p className="mt-2 whitespace-pre-wrap">{r.body}</p>}
      {r.url && <p className="mt-2"><a className="font-semibold underline" href={r.url} target="_blank" rel="noopener noreferrer">Open resource</a></p>}
      <div className="mt-3 flex flex-wrap gap-3"><ActionButton endpoint="/api/saved" body={{ kind: "post", refId: r.id, saved: !r.saved }} label={r.saved ? "Unsave" : "Save"} /><ActionButton endpoint="/api/reports" body={{ postId: r.id, reason: "Reported by a member" }} label="Report" /></div>
    </li>))}</ul>);
}
