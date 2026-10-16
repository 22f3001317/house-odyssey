import type { Track } from "@/lib/tracks";
// Achievements are computed only from verified records (council-approved quests, accepted answers, approved resources,
// council-confirmed events and attendance). Nothing here counts raw posts or clicks.
export type Stats = { onboardingDone: boolean; questsByTrack: Record<Track, number>; acceptedAnswers: number; resourcesPublished: number; eventsOrganized: number; eventsAttended: number };
export type Def = { code: string; title: string; description: string; target: number; value: (s: Stats) => number };
export const ACHIEVEMENTS: Def[] = [
  { code: "pathfinder", title: "Pathfinder", description: "Finish the onboarding adventure.", target: 1, value: (s) => (s.onboardingDone ? 1 : 0) },
  { code: "technical-explorer", title: "Technical Explorer", description: "Complete 3 approved technical quests.", target: 3, value: (s) => s.questsByTrack.technical },
  { code: "cultural-explorer", title: "Cultural Explorer", description: "Complete 3 approved cultural quests.", target: 3, value: (s) => s.questsByTrack.cultural },
  { code: "sports-explorer", title: "Sports Explorer", description: "Complete 3 approved sports quests.", target: 3, value: (s) => s.questsByTrack.sports },
  { code: "helping-hand", title: "Helping Hand", description: "Have an answer accepted by the person who asked.", target: 1, value: (s) => s.acceptedAnswers },
  { code: "trusted-sharer", title: "Trusted Sharer", description: "Share a resource that the council approves.", target: 1, value: (s) => s.resourcesPublished },
  { code: "event-organizer", title: "Event Organizer", description: "Organize a meetup that the council confirms took place.", target: 1, value: (s) => s.eventsOrganized },
  { code: "regular", title: "Regular", description: "Attend 3 events, confirmed by organizers.", target: 3, value: (s) => s.eventsAttended },
];
export const evaluate = (s: Stats) => ACHIEVEMENTS.map((d) => { const current = Math.min(d.value(s), d.target); return { code: d.code, title: d.title, description: d.description, target: d.target, current, earned: current >= d.target }; });
