import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { PgliteDatabase } from "drizzle-orm/pglite";

const id = () => uuid("id").defaultRandom().primaryKey();
const created = () => timestamp("created_at").defaultNow().notNull();

export const users = pgTable("users", {
  id: id(), name: text("name").notNull(), email: text("email").notNull().unique(), passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // student | council | admin
  verification: text("verification").notNull().default("email_pending"),
  houseSlug: text("house_slug"), // the SELECTED house; official membership would be a separate, verified field
  interests: text("interests").notNull().default(""), onboarding: text("onboarding").notNull().default("arrival"),
  xp: integer("xp").notNull().default(0), avatar: text("avatar").notNull().default("sun"), bio: text("bio").notNull().default(""), skills: text("skills").notNull().default(""),
  visibility: text("visibility").notNull().default("bio,skills,interests,tracks,badges,featured"), featuredRef: text("featured_ref"), leaderboard: boolean("leaderboard").notNull().default(true),
  lastSeenAt: timestamp("last_seen_at"), createdAt: created(),
});
export const emailTokens = pgTable("email_tokens", {
  id: id(), userId: uuid("user_id").notNull(), tokenHash: text("token_hash").notNull().unique(), expiresAt: timestamp("expires_at").notNull(), usedAt: timestamp("used_at"),
});
export const contactMessages = pgTable("contact_messages", {
  id: id(), name: text("name").notNull(), email: text("email").notNull(), subject: text("subject").notNull(), message: text("message").notNull(), createdAt: created(),
});
export const quests = pgTable("quests", {
  id: id(), slug: text("slug").notNull().unique(), title: text("title").notNull(), description: text("description").notNull(), category: text("category").notNull(),
  xp: integer("xp").notNull(), kind: text("kind").notNull(), // visit | trivia | proof
  answer: text("answer"), requiresApproval: boolean("requires_approval").notNull().default(false), badge: text("badge"), active: boolean("active").notNull().default(true),
});
export const questCompletions = pgTable("quest_completions", {
  id: id(), userId: uuid("user_id").notNull(), questId: uuid("quest_id").notNull(), status: text("status").notNull(), proof: text("proof"), createdAt: created(),
}, (t) => [unique().on(t.userId, t.questId)]);
export const xpLog = pgTable("xp_log", { id: id(), userId: uuid("user_id").notNull(), amount: integer("amount").notNull(), reason: text("reason").notNull(), createdAt: created() });
export const posts = pgTable("posts", {
  id: id(), kind: text("kind").notNull(), authorId: uuid("author_id").notNull(), title: text("title").notNull(), body: text("body").notNull(), url: text("url"), tag: text("tag"), track: text("track").notNull().default("community"),
  status: text("status").notNull().default("published"), acceptedAnswerId: uuid("accepted_answer_id"), createdAt: created(),
});
export const answers = pgTable("answers", { id: id(), questionId: uuid("question_id").notNull(), authorId: uuid("author_id").notNull(), body: text("body").notNull(), createdAt: created() });
export const events = pgTable("events", {
  id: id(), organizerId: uuid("organizer_id").notNull(), title: text("title").notNull(), description: text("description").notNull(), startsAt: timestamp("starts_at").notNull(),
  format: text("format").notNull(), track: text("track").notNull().default("community"), location: text("location"), status: text("status").notNull().default("submitted"), createdAt: created(),
});
export const notifications = pgTable("notifications", { id: id(), userId: uuid("user_id").notNull(), title: text("title").notNull(), href: text("href").notNull(), read: boolean("read").notNull().default(false), createdAt: created() });
export const savedItems = pgTable("saved_items", { id: id(), userId: uuid("user_id").notNull(), kind: text("kind").notNull(), refId: uuid("ref_id").notNull(), createdAt: created() }, (t) => [unique().on(t.userId, t.kind, t.refId)]);
export const eventRsvps = pgTable("event_rsvps", { id: id(), eventId: uuid("event_id").notNull(), userId: uuid("user_id").notNull(), status: text("status").notNull(), attended: boolean("attended").notNull().default(false), createdAt: created() }, (t) => [unique().on(t.eventId, t.userId)]);
export const eventMessages = pgTable("event_messages", { id: id(), eventId: uuid("event_id").notNull(), authorId: uuid("author_id").notNull(), body: text("body").notNull(), createdAt: created() });
export const announcements = pgTable("announcements", { id: id(), title: text("title").notNull(), body: text("body").notNull(), houseSlug: text("house_slug"), active: boolean("active").notNull().default(true), createdAt: created() });
export const reports = pgTable("reports", { id: id(), postId: uuid("post_id").notNull(), reporterId: uuid("reporter_id").notNull(), reason: text("reason").notNull(), createdAt: created() });

// Idempotent bootstrap so a fresh Neon database or local file works with no migration step.
// For a long-lived deployment, move this to drizzle-kit migrations.
const T = "id uuid PRIMARY KEY DEFAULT gen_random_uuid()", C = "created_at timestamp NOT NULL DEFAULT now()";
const DDL = [
  `CREATE TABLE IF NOT EXISTS users (${T}, name text NOT NULL, email text NOT NULL UNIQUE, password_hash text NOT NULL, role text NOT NULL DEFAULT 'student', verification text NOT NULL DEFAULT 'email_pending', ${C})`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS house_slug text`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS interests text NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding text NOT NULL DEFAULT 'arrival'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at timestamp`,
  // Analytics: one row per member per active day, and per-day page-view counters. No IPs, cookies or visitor IDs are stored.
  `CREATE TABLE IF NOT EXISTS activity (user_id uuid NOT NULL, day date NOT NULL, PRIMARY KEY (user_id, day))`,
  `CREATE TABLE IF NOT EXISTS page_views (day date NOT NULL, path text NOT NULL, views integer NOT NULL DEFAULT 0, PRIMARY KEY (day, path))`,
  `CREATE TABLE IF NOT EXISTS email_tokens (${T}, user_id uuid NOT NULL, token_hash text NOT NULL UNIQUE, expires_at timestamp NOT NULL, used_at timestamp)`,
  `CREATE TABLE IF NOT EXISTS contact_messages (${T}, name text NOT NULL, email text NOT NULL, subject text NOT NULL, message text NOT NULL, ${C})`,
  `CREATE TABLE IF NOT EXISTS quests (${T}, slug text NOT NULL UNIQUE, title text NOT NULL, description text NOT NULL, category text NOT NULL, xp integer NOT NULL, kind text NOT NULL, answer text, requires_approval boolean NOT NULL DEFAULT false, badge text, active boolean NOT NULL DEFAULT true)`,
  `CREATE TABLE IF NOT EXISTS quest_completions (${T}, user_id uuid NOT NULL, quest_id uuid NOT NULL, status text NOT NULL, proof text, ${C}, UNIQUE (user_id, quest_id))`,
  `CREATE TABLE IF NOT EXISTS xp_log (${T}, user_id uuid NOT NULL, amount integer NOT NULL, reason text NOT NULL, ${C})`,
  `CREATE TABLE IF NOT EXISTS posts (${T}, kind text NOT NULL, author_id uuid NOT NULL, title text NOT NULL, body text NOT NULL, url text, tag text, status text NOT NULL DEFAULT 'published', accepted_answer_id uuid, ${C})`,
  `CREATE TABLE IF NOT EXISTS answers (${T}, question_id uuid NOT NULL, author_id uuid NOT NULL, body text NOT NULL, ${C})`,
  `CREATE TABLE IF NOT EXISTS events (${T}, organizer_id uuid NOT NULL, title text NOT NULL, description text NOT NULL, starts_at timestamp NOT NULL, format text NOT NULL, location text, status text NOT NULL DEFAULT 'submitted', ${C})`,
  `CREATE TABLE IF NOT EXISTS reports (${T}, post_id uuid NOT NULL, reporter_id uuid NOT NULL, reason text NOT NULL, ${C})`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text NOT NULL DEFAULT 'sun'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'bio,skills,interests,tracks,badges,featured'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS featured_ref text`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard boolean NOT NULL DEFAULT true`,
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'community'`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'community'`,
  `CREATE TABLE IF NOT EXISTS notifications (${T}, user_id uuid NOT NULL, title text NOT NULL, href text NOT NULL, read boolean NOT NULL DEFAULT false, ${C})`,
  `CREATE TABLE IF NOT EXISTS saved_items (${T}, user_id uuid NOT NULL, kind text NOT NULL, ref_id uuid NOT NULL, ${C}, UNIQUE (user_id, kind, ref_id))`,
  `CREATE TABLE IF NOT EXISTS event_rsvps (${T}, event_id uuid NOT NULL, user_id uuid NOT NULL, status text NOT NULL, attended boolean NOT NULL DEFAULT false, ${C}, UNIQUE (event_id, user_id))`,
  `CREATE TABLE IF NOT EXISTS event_messages (${T}, event_id uuid NOT NULL, author_id uuid NOT NULL, body text NOT NULL, ${C})`,
  `CREATE TABLE IF NOT EXISTS announcements (${T}, title text NOT NULL, body text NOT NULL, house_slug text, active boolean NOT NULL DEFAULT true, ${C})`,
  // Demo quests (editable in the admin area once Stage 5 is in).
  `INSERT INTO quests (slug,title,description,category,xp,kind,answer,requires_approval,badge) VALUES
   ('house-trivia','House trivia','How many houses are on the trail map? Type a number.','onboarding',30,'trivia','4|four',false,'First Steps'),
   ('explore-house','Explore your house','Pick a house in onboarding, then mark this done.','house discovery',20,'visit',NULL,false,NULL),
   ('read-guidelines','Read the community guidelines','Be kind, share only what you may share, and report problems. Mark done when read.','onboarding',10,'visit',NULL,false,NULL),
   ('share-a-tip','Share a helpful tip','Describe one tip you could share with new students. A house council member reviews it.','community contribution',40,'proof',NULL,true,'Helper'),
   ('attend-meetup','Attend a house meetup','Tell us which meetup you attended. A council member confirms it.','event organization',50,'proof',NULL,true,'Meetup Regular')
   ON CONFLICT (slug) DO NOTHING`,
];
type Db = PgliteDatabase;
async function init(): Promise<Db> {
  let db: Db;
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    db = drizzle(neon(process.env.DATABASE_URL)) as unknown as Db;
  } else {
    if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_DB) throw new Error("DATABASE_URL is required in production");
    const { mkdirSync } = await import("fs");
    mkdirSync("./.data", { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    db = drizzle(new PGlite("./.data/pglite"));
  }
  for (const s of DDL) await db.execute(sql.raw(s));
  return db;
}
const g = globalThis as unknown as { __ho_db?: Promise<Db> };
export const getDb = () => (g.__ho_db ??= init());
