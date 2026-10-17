// The 12 IITM BS houses and their locations follow https://study.iitm.ac.in/ds/student_life.html.
// Colours and the "forest companion" animals are our own illustrations, not official logos.
// companion.basis: "house-site" = named on the house's own site, "park" = flagship species of the park, "unconfirmed" = best guess, please check.
export type House = { slug: string; name: string; place: string; color: string; tint: string; blurb: string;
  companion: { name: string; emoji: string; basis: "house-site" | "park" | "unconfirmed" }; friends: string[]; sky: string[]; interests: string[]; highlights: string[] };
const h = (slug: string, name: string, place: string, color: string, tint: string, blurb: string, companion: House["companion"], friends: string[], sky: string[]): House =>
  ({ slug, name: `${name} House`, place, color, tint, blurb, companion, friends, sky, interests: [], highlights: [] });
export const houses: House[] = [
  h("saranda", "Saranda", "Saranda forest, Jharkhand", "#2F6B3A", "#DDEBD9", "Named after Saranda forest in West Singhbhum, Jharkhand.", { name: "Asian elephant", emoji: "🐘", basis: "unconfirmed" }, ["🦌", "🐒", "🐗"], ["🦅", "🐝"]),
  h("nallamala", "Nallamala", "Nallamala Hills, Andhra Pradesh", "#8A5A2B", "#EFE2D2", "Named after the Nallamala Hills of the Eastern Ghats in Andhra Pradesh.", { name: "Bengal tiger", emoji: "🐅", basis: "unconfirmed" }, ["🦌", "🐗", "🐒"], ["🦜", "🦋"]),
  h("pichavaram", "Pichavaram", "Pichavaram Mangrove Forest, Tamil Nadu", "#1F7A7A", "#D5ECEA", "Named after the Pichavaram mangrove forest in Cuddalore district, Tamil Nadu.", { name: "Waterbirds", emoji: "🦢", basis: "unconfirmed" }, ["🦆", "🐊", "🦜"], ["🦅", "🦋"]),
  h("sundarbans", "Sundarbans", "Sundarbans, West Bengal", "#1F5F8B", "#D6E6F2", "Named after the Sundarbans mangrove forest of West Bengal, a UNESCO World Heritage Site and a major Bengal tiger reserve.", { name: "Royal Bengal tiger", emoji: "🐅", basis: "park" }, ["🐊", "🦌", "🐗"], ["🦆", "🦋"]),
  h("wayanad", "Wayanad", "Wayanad Wildlife Sanctuary, Kerala", "#4C8C2B", "#E0EDD3", "Named after Wayanad Wildlife Sanctuary in Kerala.", { name: "Asian elephant", emoji: "🐘", basis: "unconfirmed" }, ["🐅", "🦌", "🐒"], ["🦜", "🦋"]),
  h("namdapha", "Namdapha", "Namdapha National Park, Arunachal Pradesh", "#5B4B9A", "#E4DFF2", "Named after Namdapha National Park in Arunachal Pradesh, home to all four big cat species found in India.", { name: "Clouded leopard", emoji: "🐆", basis: "park" }, ["🐅", "🐿️", "🐒"], ["🦜", "🦋"]),
  h("gir", "Gir", "Gir National Park, Gujarat", "#C77B1E", "#F6E3C8", "Named after Gir National Park in Gujarat, the only natural home of the Asiatic lion.", { name: "Asiatic lion", emoji: "🦁", basis: "house-site" }, ["🐆", "🦌", "🦚"], ["🦅", "🦋"]),
  h("kanha", "Kanha", "Kanha National Park, Madhya Pradesh", "#A8602A", "#F1DCC9", "Named after Kanha National Park in Madhya Pradesh, known for the hard-ground barasingha and the Bengal tiger.", { name: "Barasingha", emoji: "🦌", basis: "park" }, ["🐅", "🐗", "🐒"], ["🦜", "🦋"]),
  h("bandipur", "Bandipur", "Bandipur National Park, Karnataka", "#B5472F", "#F5D9D0", "Named after Bandipur National Park in Karnataka, a tiger reserve under Project Tiger.", { name: "Bengal tiger", emoji: "🐅", basis: "house-site" }, ["🐘", "🐆", "🦌"], ["🦅", "🦋"]),
  h("corbett", "Corbett", "Jim Corbett National Park, Uttarakhand", "#7A2E3B", "#EBD3D8", "Named after Jim Corbett National Park in Uttarakhand, India's oldest national park.", { name: "Bengal tiger", emoji: "🐅", basis: "park" }, ["🐘", "🦌", "🐒"], ["🦅", "🦜"]),
  h("nilgiri", "Nilgiri", "Nilgiri Biosphere Reserve", "#3A6EA5", "#DAE5F1", "Named after the Nilgiri Biosphere Reserve, home to the Nilgiri tahr and the lion-tailed macaque.", { name: "Nilgiri tahr", emoji: "🐐", basis: "park" }, ["🐒", "🐘", "🦌"], ["🦅", "🦋"]),
  h("kaziranga", "Kaziranga", "Kaziranga National Park, Assam", "#6B6B2A", "#E9E9CC", "Named after Kaziranga National Park in Assam, famous for the one-horned rhinoceros.", { name: "Indian one-horned rhinoceros", emoji: "🦏", basis: "park" }, ["🐘", "🐃", "🦌"], ["🦆", "🦋"]),
];
export const houseOf = (slug: string | null | undefined) => houses.find((x) => x.slug === slug) ?? null;
export const events: { id: string; title: string; date: string; summary: string }[] = [];
export const INTERESTS = ["Technology", "Programming", "Academic resources", "Cultural activities", "Sports", "Gaming", "Creative projects", "Regional meetups", "Volunteering"] as const;
