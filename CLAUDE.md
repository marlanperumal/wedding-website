# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding website for Marlan Perumal and Tramaine Liedeman.
Hosted at wedding.liedeman.perumal.co.za. Guests receive personalised invite links with per-person per-event RSVP.

## Workflow

Work directly on `master` — commit and push there unless told otherwise. No feature branches or PRs by default.

## Commands

Tasks are run via [`just`](https://github.com/casey/just). Run `just` (or `just --list`) to see all recipes. `just` does NOT load `.env.local`; Next.js loads it for dev/build and `prisma.config.ts` loads it for the Prisma recipes.

### Setup
```bash
just setup                          # First-time: install, env, db-up, migrate, generate, seed
just install                        # Install dependencies (pnpm)
just env                            # Copy .env.example → .env.local if missing
just secret                         # Generate a random COOKIE_SECRET
just hash "my passphrase"           # Generate a bcrypt ADMIN_PASSPHRASE_HASH
```

### Development
```bash
just db-up                          # Start local services (Postgres :5433 + Mailpit)
just db-down                        # Stop local services
just dev                            # Start dev server (localhost:3000)
just mail                           # Open the Mailpit web inbox (captured dev emails)
```

### Testing & Build
```bash
just test                           # Run all tests (Vitest)
pnpm test src/__tests__/lib/cookies.test.ts   # Run a single test file
just typecheck                      # Type-check only (tsc --noEmit)
just build                          # Production build
```

### Prisma
```bash
just migrate                        # Apply migrations (prisma migrate deploy)
just generate                       # Regenerate the Prisma client
just seed                           # Seed events + test invite
just studio                         # Open Prisma Studio
```

To create a new migration during local dev, use `pnpm prisma migrate dev`.

## Architecture

Next.js 16 App Router. All data fetching in Server Components. Mutations via Server Actions. No client-side data fetching library.

### Key directories

- `src/app/` — App Router pages and Server Actions
  - `[inviteSlug]/` — Invite landing page (sets guestInviteId cookie)
  - `rsvp/` — RSVP form, confirmation page, Server Actions
  - `admin/` — Admin login, dashboard, guest management
  - `api/calendar/[eventId]/` — .ics calendar file Route Handler
  - Static content pages: `events/`, `venue/`, `accommodation/`, `attire/`, `faqs/`
- `src/components/` — Shared UI components
  - `ui/` — layout + presentational primitives (Hero, PageHeader, SiteNav/SiteNavServer, Footer, EventCard, EventPill, Timeline, AccentBar, Diamond, PhotoFrame, SectionBand, ComingSoon; `navLinks.ts`, `index.ts` barrel)
  - `invite/` — InviteHero, EventBlock
  - `rsvp/` — RsvpForm, GuestCard, RsvpEntry, RsvpFormSection (client)
  - `admin/` — DashboardStats, InviteTable, CopyLinkButton, AdminTopBar (client)
  - `attire/` — ExpandableImage (client)
- `src/lib/` — Pure utility modules
  - `prisma.ts` — Prisma client singleton
  - `cookies.ts` — HMAC-SHA256 cookie sign/verify (Web Crypto API)
  - `slugs.ts` — Invite slug generation
  - `schemas.ts` — Zod validation schemas
  - `rsvp.ts` — processRsvp business logic
  - `deadline.ts` — RSVP_DEADLINE parsing / read-only cutoff helper
  - `email.ts` — confirmation email; transport switch: `SMTP_HOST` (Mailpit, dev) → Resend (prod) → skip

### Auth

- **Guest auth**: Unique invite URL (`/[slug]`) sets a signed `guestInviteId` HttpOnly cookie containing the Invite ID. Middleware checks for cookie presence on `/rsvp*`. Server Components do full HMAC signature verification.
- **Admin auth**: Passphrase compared with bcrypt against `ADMIN_PASSPHRASE_HASH` env var. Sets signed `adminSession` cookie. Middleware protects `/admin/dashboard*` and `/admin/guests*`.

### Prisma v7 notes

Prisma v7 requires a driver adapter. The singleton in `src/lib/prisma.ts` uses `PrismaPg` from `@prisma/adapter-pg`. Pool is capped at 2 connections per instance (Vercel function safety). `prisma.config.ts` configures migrations and seeding.

### Tailwind v4 notes

No `tailwind.config.ts`. All design tokens defined in `src/app/globals.css` using `@theme inline`. Custom color classes: `bg-cream`, `text-near-black`, `bg-orange-soft`, `text-purple-orchid`, `text-teal-deep`, `text-purple-deep`, etc. Component classes defined directly in CSS: `.accent-bar`, `.paisley-watermark`, `.event-day-label`.

## Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSPHRASE_HASH` — bcrypt hash of admin passphrase (generate with `node -e "require('bcryptjs').hash('yourpassphrase', 10).then(console.log)"`)
- `COOKIE_SECRET` — 32+ byte random hex string for HMAC signing
- `RESEND_API_KEY` — from resend.com (used in production; ignored locally when `SMTP_HOST` is set)
- `NEXT_PUBLIC_BASE_URL` — `https://wedding.liedeman.perumal.co.za`
- `SMTP_HOST` / `SMTP_PORT` — local email catcher (Mailpit on `localhost:1025`); when set, email goes to SMTP instead of Resend. Inbox UI at `http://localhost:8025`. Unset in production.
- `RSVP_DEADLINE` — ISO 8601 datetime after which RSVPs become read-only (form hidden, summary only). Unset ⇒ RSVP always open (dev default).

## Test Invite

The seed creates a test invite at `/test-invite-dev1` with 2 guests invited to all 5 events. Use this to test the invite and RSVP flows locally.
