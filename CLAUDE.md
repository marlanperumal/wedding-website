# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding website for Marlan Perumal and Tramaine Liedeman.
Hosted at wedding.liedeman.perumal.co.za. Guests receive personalised invite links with per-person per-event RSVP.

## Commands

### Development
```bash
docker-compose up -d                 # Start local Postgres (port 5433)
pnpm install                        # Install dependencies
pnpm prisma db push                 # Sync schema to local DB
pnpm prisma db seed                 # Seed events + test invite
pnpm dev                            # Start dev server (localhost:3000)
```

### Testing
```bash
pnpm test                           # Run all tests (Vitest)
pnpm test -- src/__tests__/lib/cookies.test.ts   # Run a single test file
```

### Build
```bash
pnpm build                          # Production build
pnpm tsc --noEmit                   # Type-check only
```

### Prisma
```bash
pnpm prisma generate                # Regenerate Prisma client after schema changes
pnpm prisma migrate dev             # Create a new migration (local dev)
pnpm prisma studio                  # Open Prisma Studio
```

## Architecture

Next.js 16 App Router. All data fetching in Server Components. Mutations via Server Actions. No client-side data fetching library.

### Key directories

- `src/app/` — App Router pages and Server Actions
  - `[inviteSlug]/` — Invite landing page (sets guestInviteId cookie)
  - `rsvp/` — RSVP form, confirmation page, Server Actions
  - `admin/` — Admin login, dashboard, guest management
  - `api/calendar/[eventId]/` — .ics calendar file Route Handler
- `src/components/` — Shared UI components
  - `ui/` — AccentBar, EventPill, SiteNav
  - `invite/` — InviteHero, EventBlock
  - `rsvp/` — RsvpForm (client), GuestCard (client)
  - `admin/` — DashboardStats, InviteTable, CopyLinkButton (client)
- `src/lib/` — Pure utility modules
  - `prisma.ts` — Prisma client singleton
  - `cookies.ts` — HMAC-SHA256 cookie sign/verify (Web Crypto API)
  - `slugs.ts` — Invite slug generation
  - `schemas.ts` — Zod validation schemas
  - `rsvp.ts` — processRsvp business logic
  - `email.ts` — Resend email sending

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
- `RESEND_API_KEY` — from resend.com (email skipped gracefully if absent)
- `NEXT_PUBLIC_BASE_URL` — `https://wedding.liedeman.perumal.co.za`

## Test Invite

The seed creates a test invite at `/test-invite-dev1` with 2 guests invited to all 5 events. Use this to test the invite and RSVP flows locally.
