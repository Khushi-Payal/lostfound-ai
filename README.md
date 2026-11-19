# TraceIt — Pan-India Lost & Found Matching Platform

**Lost Somewhere? Found Together.**

TraceIt is a presentation-ready, responsive lost-and-found service built with the Next.js App Router. It brings community reports into a searchable directory, calculates explainable lost/found similarity scores, and offers private messaging, ownership claims, notifications, saved items, dashboards and admin moderation.

> **Matching transparency:** TraceIt currently uses a reusable, weighted text/category/attribute/location/date similarity module. It does not call a paid AI API and does not claim that a score is a verified AI prediction. Image upload and preview are supported; image similarity is an extension point for a future visual model, not part of the current score.

## Demo mode

TraceIt runs without external services or database credentials. When `MONGODB_URI` is empty, API routes use a file-backed JSON demo store at `.data/traceit-demo.json`, seed 21 sample reports from Indian cities, and persist subsequent reports, claims, notifications, users and contact messages locally on the server. `.data/` is git-ignored.

Authentication is **not** stored in browser localStorage. Demo and MongoDB modes both hash passwords with bcrypt and use signed JWTs in HTTP-only cookies. The fallback JWT secret is development-only; provide `JWT_SECRET` for any deployed environment.

### Demo accounts

| Account | Email | Password | Access |
| --- | --- | --- | --- |
| Community member | `demo@traceit.in` | `Demo123!` | Reports, matches, notifications, claims, saved items, profile |
| Administrator | `admin@traceit.in` | `Admin123!` | All member features plus protected moderation and admin dashboard |

These are **demo-only credentials**. Never use them in production.

## Requirements

- Node.js 20.9 or newer (Node 22 recommended)
- npm 10+
- Optional: MongoDB 7+ (local or a MongoDB-compatible deployment) for database mode

## Run locally

```bash
npm install
cp .env.example .env.local
# Leave MONGODB_URI blank for seeded demo mode.
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The development server binds to `0.0.0.0` for hosted previews as well as local use.

### Production build and lint

```bash
npm run lint
npm run build
npm start
```

## MongoDB setup

1. Create a database and set `MONGODB_URI` in `.env.local`, for example:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/traceit
   JWT_SECRET=<at-least-32-random-characters>
   ```
2. Create an account through **Sign up**. Passwords are bcrypt-hashed before insertion.
3. To grant a trusted account admin privileges, connect with a secured MongoDB shell and promote only that account:
   ```javascript
   db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
   ```
4. Keep MongoDB credentials and `JWT_SECRET` out of source control. `.env*` is ignored; `.env.example` contains placeholders only.

MongoDB mode uses Mongoose models for users, lost reports, found reports, notifications, claims, support messages and saved items. With no configured email provider, password-reset requests in MongoDB mode ask the user to contact an administrator; the local demo instead displays a one-time reset code on screen.

## Main features

- Responsive home page, public item directory, report forms, details, About, How it Works and Contact pages.
- Light/dark theme with persisted preference, mobile navigation, accessible forms, loading states and toasts.
- Sign-up, sign-in, sign-out, bcrypt password hashing, HTTP-only JWT cookies, profile and demo reset flow.
- Lost/found reports with Indian state/city selection, image preview, status tracking, per-owner edit/delete and generated report IDs.
- Search suggestions, category/state/city/brand/date/status filters, sorting and pagination.
- Match engine in `lib/matching.js`:
  - Description and keyword similarity — 30%
  - Category — 20%
  - Brand and colour — 15%
  - State/city proximity — 20%
  - Date proximity — 15%
  - Recommendations below 40% are suppressed; 40–64% Weak, 65–84% Possible, 85–100% Strong.
- Private two-way in-app messages, match suggestions, saved reports, in-app notifications and safe ownership claims.
- Member dashboard with real account data, activity charts (Recharts), report management, notifications, claims, saved items and profile settings.
- Admin dashboard protected both by server-rendered route checks and server-side API role checks; includes reports, users, claims, moderation and statistics.
- Contact form stored in demo JSON or MongoDB.

## Project structure

```text
app/                     App Router pages and route handlers
  api/                   Authentication, reports, matching, claims, notifications, profile, admin
  about/                 About TraceIt and privacy/safety commitment
  admin/                 Protected admin console
  browse/                Searchable public directory
  contact/               Support form and FAQs
  dashboard/             Protected member workspace
  how-it-works/           Reporting and matching explanation
  items/[id]/             Dynamic item details and safe claim/contact flows
  report/{lost,found}/    Authenticated reporting flows
components/              Shared navigation, cards, forms, dashboard and page UI
context/                 Auth, theme and toast providers
lib/                     Matching engine, storage adapters, auth, validators and utilities
models/                  Mongoose schemas and indexes
utils/                   API and formatting helpers
.env.example             Environment variable template
```

## API overview

- `POST /api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`; `GET /api/auth/me`
- `GET /api/items`, `POST /api/items/lost`, `POST /api/items/found`, `GET/PUT/DELETE /api/items/[id]`
- `POST /api/matches`, `GET /api/matches/[itemId]` and an authenticated member match summary at `GET /api/matches`
- `GET /api/notifications`, `PATCH /api/notifications/[id]`, `PATCH /api/notifications/mark-all-read`
- `GET/POST /api/claims`, `PATCH /api/claims/[id]`
- `GET /api/messages`, `POST /api/messages/[threadId]/reply` for private two-way member conversations
- `POST /api/contact`, `GET/PUT /api/profile`, `GET/POST /api/saved`, `DELETE /api/saved/[id]`
- Protected admin APIs: `/api/admin/overview`, `/api/admin/items`, `/api/admin/users`

## Safety & privacy notes

- Public listings never return a reporter's email or mobile number. Messages are routed in-app.
- Do not publish passwords, full identity numbers or financial details. Keep one identifying detail private until a claim is reviewed.
- TraceIt is a community demo, not a government or law-enforcement service. Reports are user-submitted and may be inaccurate.
- A similarity score is only a lead. Verify ownership carefully and arrange handovers in public places.

## Open in Antigravity

1. Clone or open this repository in Antigravity.
2. In its integrated terminal, run `npm install`.
3. Copy `.env.example` to `.env.local`; leave `MONGODB_URI` blank to use the seeded demo.
4. Run `npm run dev` and open the forwarded port **3000** preview.
5. Sign in with `demo@traceit.in` / `Demo123!`, or use `admin@traceit.in` / `Admin123!` to demonstrate moderation.

No paid API keys are required for the local demo.
