export const AVATARS = [
  { key: "sun", name: "Sun", emoji: "☀️", bg: "#F6E3A8" }, { key: "fox", name: "Fox", emoji: "🦊", bg: "#F8DDD5" }, { key: "owl", name: "Owl", emoji: "🦉", bg: "#E6DBF0" },
  { key: "wave", name: "Wave", emoji: "🌊", bg: "#D4E9F0" }, { key: "leaf", name: "Leaf", emoji: "🌿", bg: "#DCEBD6" }, { key: "rocket", name: "Rocket", emoji: "🚀", bg: "#F6E3A8" },
  { key: "guitar", name: "Guitar", emoji: "🎸", bg: "#E6DBF0" }, { key: "ball", name: "Ball", emoji: "⚽", bg: "#DCEBD6" }, { key: "book", name: "Book", emoji: "📚", bg: "#F8DDD5" },
  { key: "palette", name: "Palette", emoji: "🎨", bg: "#D4E9F0" }, { key: "star", name: "Star", emoji: "⭐", bg: "#F6E3A8" }, { key: "compass", name: "Compass", emoji: "🧭", bg: "#E8D5D9" },
] as const;
export const avatarOf = (key: string) => AVATARS.find((a) => a.key === key) ?? AVATARS[0];
