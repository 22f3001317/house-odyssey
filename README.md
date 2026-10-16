# House Odyssey

Gamified house onboarding and community portal. Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, + TypeScript + Tailwind, Drizzle ORM, Postgres (Neon in production, embedded PGlite locally).

## Run locally
Requires Node 20.9 or newer.
    npm install && npm run dev      # http://localhost:3000, no database setup needed
In dev, sign-up shows a verification link (no email is sent) and the dashboard has a clearly labeled "Simulate verification" button.

## Deploy to Vercel
1. Create a free Postgres database (Neon) and import this repo in Vercel.
2. Set env vars (see `.env.example`): `DATABASE_URL`, `SESSION_SECRET` (long random string), `ALLOWED_EMAIL_DOMAINS` (your college domain), `ADMIN_EMAILS` (first admin), and `DEMO_VERIFICATION=true` only for demos.
3. Tables and demo quests are created automatically on first request.

## Turn on real sign-up emails
Set these in Vercel, then turn `DEMO_VERIFICATION` off and redeploy: `SMTP_URL`, `EMAIL_FROM`, `APP_URL`, `ALLOWED_EMAIL_DOMAINS`, `AUTO_VERIFY_DOMAINS` (see `.env.example`). Confirmed college-domain mailboxes are verified automatically; other addresses wait for an admin in `/admin`.

## Structure
- `src/app` pages and API routes; `src/lib` db, auth, `api()` guard wrapper, XP rules, queries; `src/components` UI; `src/data/seed.ts` demo houses (replace with official content).
- Every protected endpoint goes through `api({ perm })` or `requirePermission()`: auth, role permission, rate limit and Zod validation are enforced on the server.

## Test
Each script starts the app on a fresh local database and checks the behaviour end to end:

    PORT=3200 bash scripts/smoke-admin.sh      # roles, moderation, XP rules, events
    bash scripts/smoke-analytics.sh            # analytics tab, members tab, CSV export
    bash scripts/smoke-members.sh              # profiles, achievements, notifications, events, dashboards

## One dashboard, three views
`/dashboard` is the only dashboard address. What you see depends on your role, and every action is re-checked on the server:
- **Student:** personalized dashboard (announcements, your events, events and quests matched to your interests, saved items, notifications, submission status, recommendations).
- **Council member:** moderation queues (quest approvals, resources, reports, event proposals, quests, announcements) plus "My dashboard".
- **Admin:** everything above plus **Analytics** (members, sign-ups, daily active members, page views, top contributors, funnel) and **Members** (searchable list, CSV export).
The old `/admin` addresses redirect to `/dashboard`. Page views are counts only: no cookies, IPs or visitor IDs are stored.

## Member features
Profile (avatar, display name, house, bio, skills, interests, tracks, featured contribution, per-section visibility), achievement showcase (badges and milestones computed only from verified records, with optional progress), saved posts and events, notifications, events (filters, going/interested, coordination thread, organizer-confirmed attendance), settings (password, leaderboard opt-out).

## Not built yet
Password reset ("forgot password"), account deletion, avatar uploads (presets only), emailed notifications, post comments, answer voting, QR attendance, institutional ID verification (simulated), Vitest unit tests, a public "approved achievements" feed.
