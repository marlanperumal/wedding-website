# Wedding Website

Wedding website for Marlan Perumal and Tramaine Liedeman, hosted at
[wedding.liedeman.perumal.co.za](https://wedding.liedeman.perumal.co.za).
Guests receive personalised invite links with per-person, per-event RSVP.

Built with Next.js 16 (App Router), Prisma 7 + PostgreSQL, and Tailwind v4.

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) (`corepack enable` or `npm i -g pnpm`)
- [Docker](https://docs.docker.com/get-docker/) (for local Postgres)
- [just](https://github.com/casey/just) (task runner — `brew install just`,
  `cargo install just`, or see the install docs)

## Quick start

First-time setup installs dependencies, creates `.env.local`, starts Postgres,
applies migrations, generates the Prisma client, and seeds test data:

```bash
just setup
```

Before the database steps run, you'll want real secrets in `.env.local`
(see [Environment variables](#environment-variables) below). Then start the dev
server:

```bash
just dev
```

Open [http://localhost:3000](http://localhost:3000). Test the invite and RSVP
flows at [/test-invite-dev1](http://localhost:3000/test-invite-dev1) (created by
the seed).

## Environment variables

`just env` copies `.env.example` to `.env.local`. The defaults work for local
development except for two secrets you must generate:

```bash
# COOKIE_SECRET — 32-byte random hex string for HMAC cookie signing
just secret

# ADMIN_PASSPHRASE_HASH — bcrypt hash of your admin passphrase
just hash "your-admin-passphrase"
```

Copy each output into the matching variable in `.env.local`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (default matches Docker) |
| `ADMIN_PASSPHRASE_HASH` | bcrypt hash gating the admin area |
| `COOKIE_SECRET` | 32+ byte hex key for signing cookies |
| `RESEND_API_KEY` | [Resend](https://resend.com) key (optional — email is skipped if absent) |
| `NEXT_PUBLIC_BASE_URL` | Public base URL (`http://localhost:3000` locally) |

## Common tasks

Run `just` (or `just --list`) to see all recipes.

| Command | Description |
| --- | --- |
| `just setup` | Full first-time setup (deps, env, db, migrate, seed) |
| `just dev` | Start the dev server |
| `just install` | Install dependencies |
| `just db-up` / `just db-down` | Start / stop local Postgres |
| `just migrate` | Apply database migrations |
| `just generate` | Regenerate the Prisma client |
| `just seed` | Seed events + test invite |
| `just studio` | Open Prisma Studio |
| `just test` | Run the test suite |
| `just typecheck` | Type-check only |
| `just build` | Production build |

## Deployment

Deployed on [Vercel](https://vercel.com). See `vercel.json` and `CLAUDE.md` for
architecture and deployment details.
