import FeedPage from "@/components/FeedPage";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return <FeedPage kind="post" title="Community" intro="Tips, project showcases and updates from students." searchParams={searchParams} submitLabel="Post"
    fields={[{ name: "title", label: "Title" }, { name: "body", label: "What do you want to share?", multiline: true }, { name: "tag", label: "Tag (optional)", optional: true }]} />;
}
