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
    PORT=3200 bash scripts/smoke.sh   # runs a 29-step end-to-end check against a fresh local database

## Admin analytics
Admins get `/admin/analytics` (members, sign-ups, daily active members, page views, top contributors, onboarding funnel, quest completions), `/admin/users` (searchable member list) and a CSV export. Page views are counts only: no cookies, IPs or visitor IDs are stored. Needs the `analytics:view` permission (admins only).

## Not built yet
Notifications and settings pages, post comments, answer voting, file uploads (resources are https links), QR attendance, real email delivery, institutional ID verification (simulated), Vitest unit tests, public "approved achievements" feed.
