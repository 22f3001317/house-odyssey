export const TRACKS = ["technical", "cultural", "sports", "community"] as const;
export type Track = (typeof TRACKS)[number];
export const TRACK_LABEL: Record<Track, string> = { technical: "Technical", cultural: "Cultural", sports: "Sports", community: "Community & other" };
const CATEGORY: Record<string, Track> = { "technical learning": "technical", "academic resources": "technical", "cultural activities": "cultural", sports: "sports" };
const INTEREST: Record<string, Track> = { Technology: "technical", Programming: "technical", Gaming: "technical", "Academic resources": "technical", "Cultural activities": "cultural", "Creative projects": "cultural", Sports: "sports" };
export const trackOfCategory = (c: string): Track => CATEGORY[c] ?? "community";
export const tracksOfInterests = (list: string[]) => new Set(list.map((i) => INTEREST[i]).filter(Boolean) as Track[]);
export const asTrack = (v: string | null | undefined): Track => ((TRACKS as readonly string[]).includes(v ?? "") ? (v as Track) : "community");
