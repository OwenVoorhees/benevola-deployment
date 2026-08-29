# Benevola — API

Express 5 on Node, Sequelize over Postgres, deployed as a single Vercel
serverless function.

Every route below was checked against `src/routes/` rather than transcribed
from an older document. If a route is not listed here, it does not exist.

## Running it

From the repository root, `npm run dev` starts this and the frontend together.
Alone:

```
cd api
npm install
npm run db:fresh    # wipe, migrate, seed
npm run dev         # nodemon on :5173
```

Development runs on **SQLite** — no service to install, and `db:fresh` is a
file delete. Every deployed environment runs Postgres. That split is the single
most important thing to know about this codebase; see *Dialect drift* below.

| Command | Does |
|---|---|
| `npm run dev` | nodemon on `BE_PORT` (5173) |
| `npm start` | plain node, same thing |
| `npm run db:migrate` / `db:migrate:prod` | migrations, dev / production |
| `npm run db:seed` / `db:seed:prod` | seeders, dev / production |
| `npm run db:fresh` | delete the SQLite file, migrate, seed |
| `npm run admin:grant` / `admin:revoke` / `admin:list` | manage the admin role |

## Layout

```
api/
  index.js              builds and exports the app; listens only in local dev
  vercel.json           one function, one entry point
  config/config.js      the only place a connection is configured
  migrations/           17 migrations, run in filename order
  seeders/              tags, then orgs, events, volunteers, admin
  src/
    db/database.js      the single Sequelize instance
    models/             Sequelize models
    middleware/         authenticate, authorization, load, validate, rate limit
    routes/             events, organizations, users, auth, uploads
    schemas/            Zod request validation
    services/           buildEventQuery (search), storage (R2)
    seedCredentials.js  decides whether seeded accounts get real passwords
```

## Auth

**Session cookies, not JWTs.** A session id lives in an `httpOnly`, `Secure`,
`SameSite=Lax` cookie named `sid`; the session itself is a row in the
`Sessions` table, so it survives the serverless instance that created it.

There is no `Authorization: Bearer` header anywhere. Send credentials with
`fetch(..., { credentials: 'include' })`.

Users and organizations are separate principals in separate tables. The session
records which (`{ kind: 'user' | 'org', id }`), and middleware enforces which
kind a route accepts.

**Login is rate limited** to 10 attempts per IP per 15 minutes, counted in the
`login_attempts` table rather than in memory — an in-process counter is close to
useless on a platform that resets it on every cold start and spreads requests
across instances. A successful login clears the counter. The limiter fails open
if its own table misbehaves.

There is **no password reset**. It was removed before launch: no mail transport
was ever wired up, so the endpoint minted a token, returned 200 and sent
nothing, which is worse than not offering it.

---

## Routes

All paths are prefixed `/api`. "Owner" means the organization that owns the
record, with admins allowed through.

### `GET /` — health

Returns `{ status: 'ok', service: 'benevola-api' }`. Useful for telling
"deployed" from "deployed and talking to the database".

### Events — `/api/events`

| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | — |
| `GET` | `/search` | — |
| `GET` | `/:eid` | — |
| `PUT` | `/:eid` | owner |
| `PATCH` | `/:eid` | owner |
| `DELETE` | `/:eid` | owner |
| `GET` | `/tags` | — |
| `POST` | `/tags` | **admin** |
| `DELETE` | `/tags/:slug` | **admin** |
| `GET` | `/:eid/attendees` | owner |
| `POST` | `/:eid/attendees` | volunteer — signs *yourself* up |
| `DELETE` | `/:eid/attendees/me` | volunteer — cancels your own RSVP |
| `POST` | `/:eid/gallery` | owner |
| `DELETE` | `/:eid/gallery/:imageId` | owner |

`/` and `/search` are the same handler under two names: a keyword is one more
filter, so it combines with the others rather than replacing them. Both return
`{ message, results, total, data }`, and `total` is what the frontend paginates
against.

**Search is SQL**, built in `src/services/buildEventQuery.js`. There is no
Elasticsearch. Every parameter is optional and composable:

| Parameter | Notes |
|---|---|
| `q` | keyword over title and description. `ILIKE` on Postgres, `LIKE` on SQLite; `%` and `_` are escaped |
| `tags` | repeated, not comma-separated: `?tags=environment&tags=outdoor` |
| `date` | exact day |
| `beforeDate` / `afterDate` | inclusive bounds |
| `beforeTime` / `afterTime` | time of day, `HH:mm` |
| `lat` / `lng` / `radius` | geographic filter |
| `sort` / `order` | `date` or `createdAt`; `asc` or `desc` |
| `limit` / `offset` | pagination |

Gallery images are recorded, not uploaded, here: the client signs an upload at
`POST /api/uploads/sign`, PUTs the file to R2, then posts the resulting public
URLs to `/:eid/gallery`. Removing one deletes the R2 object too. Ten per event.

### Organizations — `/api/orgs`

| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | — |
| `POST` | `/` | **admin** |
| `GET` | `/:oid` | — |
| `PUT` / `PATCH` | `/:oid` | owner |
| `DELETE` | `/:oid` | owner |
| `GET` | `/:oid/events` | — |
| `POST` | `/:oid/events` | owner |

Organizations register through `/api/auth/register/org`. `POST /api/orgs` is an
admin tool, not the signup path.

### Users — `/api/users`

| Method | Path | Auth |
|---|---|---|
| `GET` | `/` | **admin** — lists every user, emails included |
| `POST` | `/` | **admin** |
| `GET` | `/:uid` | — |
| `PUT` / `PATCH` | `/:uid` | self |
| `DELETE` | `/:uid` | self |
| `GET` | `/:uid/events` | — |

`role` cannot be changed over HTTP. Promotion happens through the seeder or
`npm run admin:grant`.

**There is no availability API.** A `user_availabilities` table and model exist,
but nothing exposes them and no query reads them. Schedule-based filtering is
not implemented.

### Auth — `/api/auth`

| Method | Path |
|---|---|
| `POST` | `/register/user` |
| `POST` | `/register/org` |
| `POST` | `/login/user` — email *or* username |
| `POST` | `/login/org` — email only |
| `POST` | `/logout` |
| `GET` | `/me` |

### Uploads — `/api/uploads`

| Method | Path | Auth |
|---|---|---|
| `GET` | `/status` | — — whether a bucket is configured at all |
| `POST` | `/sign` | yes — presigned direct-to-R2 URL |
| `POST` | `/:kind` | yes — proxied upload, for small images |

Storage is **Cloudflare R2**, addressed with the S3 SDK because R2 speaks the
S3 API. There is no AWS account involved. `kind` is one of `event-image`,
`org-banner`, `org-icon`, `profile-pic`; content type and length are part of the
signature, so the browser cannot substitute a different or larger file.

---

## Dialect drift

Development is SQLite and production is Postgres, and they disagree in ways
that only surface after deploy:

- SQLite treats `VARCHAR(255)` as a hint and stores any length. Postgres
  enforces it. This has bitten twice — once on `events.description`, once on
  `events.cover_photo`, where a 321-character Wikimedia URL failed to insert.
  Both are `TEXT` now.
- SQLite's `LIKE` is case-insensitive for ASCII; Postgres's is not, hence
  `ILIKE`.
- SQLite has `date()` and `time()`; Postgres needs `CAST(x AS DATE)`.

**Working locally is not proof.** To check a change against real Postgres
without a hosted database, point `DATABASE_URL` at a local one with
`?sslmode=disable` — that suffix is the only thing that turns TLS off, and Neon
refuses unencrypted connections, so it cannot follow you into production.

## Seed data

Six North Carolina organizations, twenty events spread across six months, seven
volunteers with RSVPs, and one admin. Every seeder is idempotent and seeders are
recorded in `SequelizeData`, so `db:seed` twice is a no-op.

Whether the seeded accounts can be *signed into* is separate from whether they
exist. See [`SEEDED_ACCOUNTS.md`](../SEEDED_ACCOUNTS.md) and
`src/seedCredentials.js`.

Event dates are computed when the seeder runs, so they age. Six months after
seeding, the listing is empty again unless you reseed.

## Deploying

See [`DEPLOY.md`](../DEPLOY.md). This directory is its own Vercel project with
Root Directory `api`; `vercel.json` builds `index.js` as one function.
`index.js` exports the app and only calls `listen()` under
`require.main === module`, which is what makes it work in both places.

Migrations do not run on deploy. Run `npm run db:migrate:prod` yourself.
