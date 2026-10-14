import FeedPage from "@/components/FeedPage";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return <FeedPage kind="question" title="Student questions" intro="Ask something, or help someone out. Accepted answers earn XP." searchParams={searchParams} submitLabel="Ask"
    fields={[{ name: "title", label: "Question" }, { name: "body", label: "Details", multiline: true }, { name: "tag", label: "Category (optional)", optional: true }]} />;
}
