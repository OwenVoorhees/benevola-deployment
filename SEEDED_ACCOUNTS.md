# Seeded accounts

Every account the seeders create, so you do not have to read three seeder files
to find a login. Generated from `api/seeders/`; if you change the seed data,
change this too.

**No passwords are listed here, and none should be added.** This repository is
public. Which password these accounts take — if any — depends on the
environment, and is explained at the bottom.

---

## Organizations — 6

Organizations sign in **by email only**.

| Organization | Email | Based in |
|---|---|---|
| Neuse Current Coalition | `hello@neusecurrent.org` | Raleigh, NC |
| Tarheel Table | `volunteer@tarheeltable.org` | Raleigh, NC |
| Piedmont Paws Collective | `team@piedmontpaws.org` | Durham, NC |
| Bull City Book Buddies | `contact@bullcitybuddies.org` | Durham, NC |
| Blue Ridge Trail Crew | `crew@blueridgecrew.org` | Asheville, NC |
| Cape Fear Rebuild | `hello@capefearrebuild.org` | Wilmington, NC |

Each owns 3–4 of the 20 seeded events.

## Volunteers — 7

Volunteers may sign in with **either** their email or their username.

| Name | Username | Email |
|---|---|---|
| Jane Okafor | `jane_okafor` | `jane@example.com` |
| Marcus Reyes | `marcus_reyes` | `marcus@example.com` |
| Priya Shah | `priya_shah` | `priya@example.com` |
| Tom Lindqvist | `tom_lindqvist` | `tom@example.com` |
| Aisha Bello | `aisha_bello` | `aisha@example.com` |
| Dev Ramanathan | `dev_ramanathan` | `dev@example.com` |
| Sofia Marek | `sofia_marek` | `sofia@example.com` |

Their RSVPs are spread deliberately so every roster state is reachable — one
event nearly full, several healthy, several untouched.

## Administrator — 1

| Name | Username | Email |
|---|---|---|
| Site Admin | `site_admin` | `admin@benevola.test` |

An admin can list every registered user's email address and delete the shared
tag vocabulary, so it is gated separately from everything above.

---

## Which password each of these takes

Set nothing and a deployed site is full of content that nobody can sign into.
That is the intended default for a public repository.

| | Local development | Deployed (Postgres) |
|---|---|---|
| Organizations | `demopass123` | `DEMO_PASSWORD`, or no login if unset |
| Volunteers | `demopass123` | `DEMO_PASSWORD`, or no login if unset |
| Admin | `demopass123` | Created only if `ADMIN_PASSWORD` is set |

`DEMO_PASSWORD` and `ADMIN_PASSWORD` are set in the Vercel dashboard and
nowhere else. Neither has any effect locally: SQLite always seeds the known
local password so the dataset stays usable.

Accounts without a working password still exist. They own their events, appear
in listings and fill rosters — they simply cannot be signed into. The seeders
print which of the three cases applied on every production run.

See `api/src/seedCredentials.js`.
