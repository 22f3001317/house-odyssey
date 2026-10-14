// Demo content only. Replace with official house details; the repo layer lets this swap to a database in Stage 2.
export type House = { slug: string; name: string; color: string; tint: string; blurb: string; interests: string[]; highlights: string[]; demo: boolean };
export const houses: House[] = [
  { slug: "ember", name: "Ember House", color: "#C4472B", tint: "#F8DDD5", blurb: "Builders and tinkerers who turn late-night ideas into things people use.", interests: ["Programming", "Gaming", "Creative projects"], highlights: ["Hosted a campus hack night", "Maintains the shared study-notes library"], demo: true },
  { slug: "tide", name: "Tide House", color: "#1F6F8B", tint: "#D4E9F0", blurb: "Organizers and volunteers who keep the community moving together.", interests: ["Volunteering", "Event organization", "Regional meetups"], highlights: ["Ran the new-student welcome walk", "Coordinates weekend volunteering"], demo: true },
  { slug: "grove", name: "Grove House", color: "#3C7A3E", tint: "#DCEBD6", blurb: "Athletes and outdoor people who show up rain or shine.", interests: ["Sports", "Regional meetups", "Volunteering"], highlights: ["Started a weekly open-court session", "Trail clean-up crew"], demo: true },
  { slug: "gale", name: "Gale House", color: "#7A4FA0", tint: "#E6DBF0", blurb: "Performers, writers and makers who give the campus its voice.", interests: ["Cultural activities", "Creative projects", "Academic resources"], highlights: ["Open-mic series", "Zine of student writing"], demo: true },
];
export const events: { id: string; title: string; date: string; summary: string }[] = [];
export const INTERESTS = ["Technology", "Programming", "Academic resources", "Cultural activities", "Sports", "Gaming", "Creative projects", "Regional meetups", "Volunteering"] as const;
