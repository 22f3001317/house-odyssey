import FeedPage from "@/components/FeedPage";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  return <FeedPage kind="resource" title="Notes & resources" intro="Links to notes and study material. Share only what you have the right to share. New items appear after council review." searchParams={searchParams} submitLabel="Submit for review"
    fields={[{ name: "title", label: "Title" }, { name: "body", label: "Description", multiline: true }, { name: "url", label: "Link (https://)" }, { name: "tag", label: "Subject (optional)", optional: true }, { name: "confirm", type: "checkbox", label: "I have permission to share this material." }]} />;
}
