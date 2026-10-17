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

    bash scripts/smoke-houses.sh               # mandatory house, the 12 houses, background assets
    PORT=3200 bash scripts/smoke-admin.sh      # roles, moderation, XP rules, events
    bash scripts/smoke-analytics.sh            # analytics tab, members tab, CSV export
    bash scripts/smoke-members.sh              # profiles, achievements, notifications, events, dashboards

## Houses and the animated background
The 12 IITM BS houses (names and places from https://study.iitm.ac.in/ds/student_life.html) live in `src/data/seed.ts`. Each has a theme colour and a "forest companion" animal that wanders through the background of the site for members of that house. Visitors, and members who haven't chosen a house yet, see a savanna (chital, blackbuck, monkeys, jackals, predators, birds, insects). Choosing a house is mandatory for students: the server redirects them to onboarding and blocks community actions until they do. The scene respects "reduce motion" and is hidden from screen readers.
Each companion records its `basis`: `house-site` (named on the house's own site), `park` (flagship species of the forest) or `unconfirmed` (best guess). Colours and animals are illustrations, not official logos; edit the file to match the real logos.

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
