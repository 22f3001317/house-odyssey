export const SECTIONS = ["bio", "skills", "interests", "tracks", "badges", "featured", "contributions"] as const;
export type Section = (typeof SECTIONS)[number];
export const SECTION_LABEL: Record<Section, string> = { bio: "Bio", skills: "Skills", interests: "Interests", tracks: "Tracks", badges: "Badges and milestones", featured: "Featured contribution", contributions: "Contribution history" };
export const csv = (s: string | null | undefined) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
