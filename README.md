# Benevola

**Benevola** connects volunteers with the organizations that need them.
Organizations post a shift with a real date, place and capacity; volunteers
find it by cause, distance or date, sign on, and both sides watch the roster
fill.

Built at NC State as a university project.

> **This is a demonstration, not a running service.** Every organization and
> event in the database is sample data we wrote. Nothing listed is an event you
> can attend, and the site says so in its footer and on every event page.

---

## Contents

- [Tech stack](#tech-stack)
- [What is built](#what-is-built)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Architecture notes](#architecture-notes)
- [Roadmap](#roadmap)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Leaflet (maps) |
| Backend | Node.js, Express 5 |
| Database | Postgres via Neon (SQLite in local development), Sequelize ORM |
| Search | SQL, built with Sequelize |
| Auth | Session cookies backed by a database session store, bcryptjs |
| Image storage | Cloudflare R2, presigned direct-to-browser uploads |
| Validation | Zod |
| Hosting | Vercel — two projects, frontend and API, both serverless |

Deliberately **not** used: AWS, Lambda, the Serverless Framework, Elasticsearch,
JWTs, Redis, Material UI. Earlier revisions of this project used several of
those; all were removed. If you find a reference to one, it is stale.

---

## What is built

Everything in this section is implemented and working. Anything not listed here
is either in [Roadmap](#roadmap) or does not exist.

- **Two account types** — volunteers and organizations register and sign in
  separately, and are stored as separate principals.
- **Event discovery** — search by keyword, cause tag, exact date, date range,
  time-of-day range, and geographic radius. Filters compose; a keyword narrows
  the others rather than replacing them.
- **RSVP and rosters** — volunteers sign on and cancel; organizers see who is
  coming and how many places are left, with a capacity meter.
- **Organization pages** — profile, branding, and the events they have posted.
- **Volunteer profiles** — display name, photo, and the events they have joined.
- **Event galleries** — a cover photo plus up to ten gallery images per event,
  uploaded straight from the browser to R2.
- **Admin role** — manages the shared cause-tag vocabulary and can moderate any
  organization's content.
- **Light and dark themes** — the whole interface ships both, with a toggle in
  the header.
- **Accessible motion** — every animation is opt-out under
  `prefers-reduced-motion`.

### Explicitly not implemented

Called out because earlier documentation claimed otherwise:

- **Volunteer availability schedules.** A table and model exist; no API exposes
  them, and no query filters on them. There is no schedule-based matching.
- **Password reset.** Removed before launch — there was no mail transport, so
  the endpoint silently sent nothing.
- **Full-text search engine.** Search is ordinary SQL. There is no
  Elasticsearch, no fuzzy matching, no autocomplete.
- **Skills, verification, hour tracking, waitlists, recurring events,
  notifications, messaging.** None of these exist in any form.

---

## Project structure

```
Benevola/
├── api/                       Express API — its own Vercel project
│   ├── index.js               builds and exports the app
│   ├── vercel.json            one serverless function
│   ├── config/config.js       the only place a connection is configured
│   ├── migrations/            17 migrations
│   ├── seeders/               tags, orgs, events, volunteers, admin
│   ├── src/
│   │   ├── models/            Sequelize models
│   │   ├── routes/            events, organizations, users, auth, uploads
│   │   ├── middleware/        auth, authorization, validation, rate limiting
│   │   ├── schemas/           Zod request validation
│   │   └── services/          buildEventQuery (search), storage (R2)
│   └── README.md              full route reference
├── fe/                        React app — its own Vercel project
│   ├── vercel.json            proxies /api/* to the API project
│   ├── src/
│   │   ├── data/              api.js owns every endpoint; hooks.js all state
│   │   ├── design/            which design renders a surface, and the theme
│   │   ├── variants/default/  the design that ships
│   │   └── OldThemes/         five shelved designs, not bundled
│   └── README.md
├── DEPLOY.md                  step-by-step deployment
└── SEEDED_ACCOUNTS.md         every seeded email and username
```

---

## Getting started

### Prerequisites

Node.js 18+. That is all — local development uses SQLite, so there is no
database, search engine or cloud account to install.

### Installation

```bash
npm install                 # root, for the dev runner
cd api && npm install
cd ../fe && npm install
```

### Environment

Copy `api/.env.example` to `api/.env`. For local work you only need
`SESSION_SECRET`; the R2 variables are optional and the app hides the upload
controls when they are absent.

`fe/.env.local` already points the frontend at `http://localhost:5173`.

### Database and running

```bash
cd api && npm run db:fresh    # migrate and seed a fresh SQLite database
cd .. && npm run dev          # API on :5173, frontend on :3000
```

Seeded logins are listed in [`SEEDED_ACCOUNTS.md`](./SEEDED_ACCOUNTS.md). Every
seeded account uses `demopass123` locally.

---

## API reference

The full, audited route list is in [`api/README.md`](./api/README.md). In
summary:

| Group | Paths |
|---|---|
| Events | `/api/events` — CRUD, `/search`, tags, attendees, gallery |
| Organizations | `/api/orgs` — CRUD, and the events they host |
| Users | `/api/users` — CRUD, and the events they have joined |
| Auth | `/api/auth` — register, login, logout, `/me` |
| Uploads | `/api/uploads` — presigned R2 upload URLs |

Authentication is a **session cookie**, not a bearer token. Send requests with
`credentials: 'include'`.

---

## Deployment

Two Vercel projects from this one repository, plus a Neon database. Everything
fits in free tiers. Full runbook in [`DEPLOY.md`](./DEPLOY.md).

The frontend proxies `/api/*` to the API project, so the browser only ever sees
one origin — which is what keeps the session cookie first-party and removes
CORS from the picture entirely.

---

## Architecture notes

- **Serverless-shaped API.** `index.js` builds the app synchronously and
  exports it; nothing is created inside a handler and there is no top-level
  `await`. It calls `listen()` only when run directly, which is what lets the
  same file serve local development and Vercel.
- **Sessions in the database.** A serverless instance cannot hold session state
  in memory, so sessions are rows in Postgres. The same reasoning drives the
  login rate limiter, which counts attempts in a table rather than a map.
- **Uploads bypass the API.** The browser asks for a presigned URL and PUTs the
  file straight to R2, so image bytes never occupy a function invocation.
- **Two principals, one session.** Users and organizations live in separate
  tables. The session records which kind is signed in, and middleware enforces
  which kind each route accepts.
- **Local SQLite, deployed Postgres.** Convenient, and the main source of bugs
  that only appear after deploy. `api/README.md` documents the specific traps.
- **One theme, five shelved.** Six designs were built; the site ships one and
  keeps the rest under `fe/src/OldThemes/`, unbundled.

---

## Roadmap

Nothing here is built. Grouped by theme.

### Discovery

- **Volunteer availability** — a weekly schedule, with events filtered to what
  fits it. The table exists; the API and matching do not.
- **Skills** — tag skills on profiles and events to match volunteers to work
  that suits them.
- **Community-service tags** — flag events that count as accepted community
  service. Needs research into which organizations legally qualify.
- **Server-side organization search** — the directory currently filters
  client-side, which will not survive a large number of organizations.

### Events

- **Recurring and multi-day events** — the model holds one date per event.
- **Waitlists** — join a full event and be notified when a place opens.
- **Imprecise public addresses** — show the precise location only to confirmed
  attendees.

### Organizations

- **Organization members** — let several users act for one organization,
  instead of an organization being a single shared account.
- **Standing volunteer roles** — ongoing positions alongside one-off shifts.

### Trust and safety

- **Verification** — for both users and organizations, to prevent
  impersonation.
- **Volunteer hour tracking** — hours confirmed by the host organization,
  shown on profiles. Probably needs check-in.
- **Reporting** — flag users who repeatedly sign up and do not attend.
- **Private profiles**.

### Social

- **Follows, feed and messaging** — the largest item here by some distance.
- **Notifications** — reminders, cancellations, waitlist updates.

### Platform

- **Goodie AI** — an agent that can perform any permitted API action on a
  user's behalf, rather than a chatbot bolted to the side.
