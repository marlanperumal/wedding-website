# Wedding Website Design Spec
**Marlan & Tramaine — wedding.liedeman.perumal.co.za**
Date: 2026-06-10

---

## Overview

A wedding website for Marlan Perumal and Tramaine Liedeman. South Indian traditional aesthetic with a modern touch. Guests receive personalised invite links; the site handles digital invitations and per-person RSVPs across five events over two days in Cape Town, November 2026.

**Hosted at:** `wedding.liedeman.perumal.co.za`
**DNS:** CNAME `wedding.liedeman.perumal.co.za` → `cname.vercel-dns.com` (managed at domains.co.za)

---

## Events

| Day | Date | Events | Venue |
|-----|------|--------|-------|
| Thursday | 26 November 2026 | Mehndi, Nelengu, Sangeeth | 11 Orient Road, Wynberg, Cape Town |
| Friday | 27 November 2026 | Wedding, Reception | Goedgeleven, Durbanville, Cape Town |

Full venue addresses are withheld from the public invite page and revealed only in the RSVP confirmation email and `/rsvp/confirmed` page.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js (App Router) |
| Database | Prisma Postgres (Vercel managed, prod) / Docker Postgres (local dev) |
| ORM | Prisma |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Forms & validation | Next.js Server Actions + Zod |
| Email | Resend (free tier) |
| Auth — admin | Single passphrase (env var), signed HttpOnly cookie |
| Auth — guests | Signed HttpOnly cookie set on invite link visit |

---

## Design System

**Style:** Modern South Indian — warm ivory base, paisley watermarks, contemporary layout.

**Colour palette:**

| Role | Colour | Hex |
|------|--------|-----|
| Primary / CTA | Soft Orange | `#F4A261` |
| Warm Apricot | — | `#FFB07C` |
| Sunset Orange | — | `#F28C38` |
| Golden Amber | — | `#E07A29` |
| Peach Glow | — | `#FFC8A2` |
| Accent — Orchid Purple | — | `#9E6BB5` |
| Accent — Deep Violet | — | `#7A4C8C` |
| Accent — Turquoise Teal | — | `#3DA4A1` |
| Accent — Deep Teal | — | `#2E7D7A` |
| Accent — Leaf Green | — | `#5FAE7E` |
| Background | Warm Cream | `#FAF4EE` |
| Body text | Near-black | `#2E1A10` |

**Typography:** Georgia (serif) for names and headings; system sans-serif for labels and UI chrome.

**Decorative motifs:** Paisley watermarks (CSS border-radius technique), horizontal gradient accent bars (purple → orange → teal), event colour pills.

**Event colour mapping:**
- Mehndi → Deep Violet `#7A4C8C`
- Nelengu → Sunset Orange `#E07A29`
- Sangeeth → Orchid Purple `#9E6BB5`
- Wedding → Turquoise Teal `#3DA4A1`
- Reception → Leaf Green `#5FAE7E`

---

## Data Model (Prisma)

```prisma
model Invite {
  id          String    @id @default(cuid())
  slug        String    @unique   // "naidoo-family-x3f"
  label       String              // "The Naidoo Family" (admin display)
  email       String?             // contact email; set by admin or filled at RSVP
  submitted   Boolean   @default(false)
  submittedAt DateTime?
  createdAt   DateTime  @default(now())

  guests      Guest[]
  events      InviteEvent[]
}

model Guest {
  id       String  @id @default(cuid())
  name     String
  inviteId String
  invite   Invite  @relation(fields: [inviteId], references: [id])

  rsvps    Rsvp[]
}

model Event {
  id        String   @id @default(cuid())
  name      String   // "Mehndi" | "Nelengu" | "Sangeeth" | "Wedding" | "Reception"
  date      DateTime
  venue     String   // display name e.g. "Goedgeleven"
  address   String   // full address, revealed post-RSVP only
  sortOrder Int      @default(0)

  invites   InviteEvent[]
  rsvps     Rsvp[]
}

model InviteEvent {
  inviteId String
  eventId  String
  invite   Invite @relation(fields: [inviteId], references: [id])
  event    Event  @relation(fields: [eventId], references: [id])

  @@id([inviteId, eventId])
}

model Rsvp {
  id           String   @id @default(cuid())
  guestId      String
  eventId      String
  attending    Boolean
  dietary      String[] // ["Vegetarian", "Gluten-free", ...]
  dietaryNotes String?  // free-text for "Other"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  guest        Guest @relation(fields: [guestId], references: [id])
  event        Event @relation(fields: [eventId], references: [id])

  @@unique([guestId, eventId])
}
```

**Fixed dietary options:** `Vegetarian`, `Vegan`, `Halal`, `Gluten-free`, `Nut allergy`, `Other` (triggers `dietaryNotes` free-text field).

---

## Routing

| Route | Description |
|-------|-------------|
| `/[inviteSlug]` | Invite landing page. Validates slug, sets `guestInviteId` cookie, renders personalised invite. 404 if slug unknown. |
| `/rsvp` | RSVP form. Protected by middleware — redirects to `/` if no cookie. |
| `/rsvp/confirmed` | Post-submission confirmation. Shows venue addresses + `.ics` download links. |
| `/admin` | Admin passphrase login page. |
| `/admin/dashboard` | RSVP counts per event, dietary totals. Protected by middleware. |
| `/admin/guests` | Guest/invite management — add, edit, copy invite links. Protected by middleware. |

### Middleware (`middleware.ts`)

- `/rsvp*` — no `guestInviteId` cookie → redirect to `/`
- `/admin/dashboard*`, `/admin/guests*` — no valid `adminSession` cookie → redirect to `/admin`

---

## Key Flows

### Invite Flow
1. Guest visits `wedding.liedeman.perumal.co.za/naidoo-family-x3f`
2. Server Component looks up `Invite` by slug
3. Route Handler sets signed HttpOnly `guestInviteId=<invite.id>` cookie (90-day expiry)
4. Renders invite page: personalised greeting, events they're invited to grouped by day, venue names (not addresses), RSVP CTA

### RSVP Flow
1. Guest navigates to `/rsvp`; middleware verifies `guestInviteId` cookie
2. Server Component loads `Invite` → `guests` + `InviteEvent` records + any existing `Rsvp` rows (supports editing)
3. Renders one card per `Guest` showing only their invited events, grouped by Thursday / Friday
4. Guest checks attendance per event, selects dietary requirements per person, enters contact email
5. Submit → Server Action → Zod validation → upsert `Rsvp` rows → set `Invite.submitted = true` + `email` → send confirmation email (Resend) → redirect to `/rsvp/confirmed`
6. `/rsvp/confirmed` reveals full venue addresses and `.ics` calendar links per event

### Admin Flow
1. `/admin` — passphrase form; Server Action compares `bcrypt.compare(input, ADMIN_PASSPHRASE_HASH)` → sets signed `adminSession` cookie → redirect to `/admin/dashboard`
2. `/admin/dashboard` — Server Component: RSVP counts per event (attending / not attending / no response), dietary breakdown totals
3. `/admin/guests` — full invite table with RSVP status badge per invite; expandable row shows per-person per-event attendance; actions: Add Guest, Edit Invite, Copy Invite Link, Regenerate Slug

### Invite Slug Format
`[name-slug]-[4-char alphanumeric]` e.g. `naidoo-family-x3f2`
- Name slug generated from `label` on creation (admin-editable)
- 4-char suffix is cryptographically random, generated once on create
- Full slug stored as single unique `slug` column

---

## Local Development

**Requirements:** Node.js 20+, Docker (for local Postgres)

```bash
# Start local Postgres
docker-compose up -d

# Install dependencies
npm install

# Sync schema and seed events + test invite
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

**Seed data:** 5 events with correct dates/venues, one test invite (`test-invite-dev1`) with 2 guests invited to all events.

---

## Environment Variables

```env
DATABASE_URL            # postgres://... (Docker local / Prisma Postgres prod)
ADMIN_PASSPHRASE_HASH   # bcrypt hash of admin passphrase
COOKIE_SECRET           # random 32-byte hex string, signs cookies
RESEND_API_KEY          # from resend.com
NEXT_PUBLIC_BASE_URL    # https://wedding.liedeman.perumal.co.za
```

---

## Deployment

1. Push to `main` → Vercel auto-deploys
2. `prisma migrate deploy` runs in Vercel build step
3. Preview deployments from `dev` branch use a separate preview DB
4. DNS at domains.co.za: add CNAME `wedding` under `liedeman.perumal.co.za` → `cname.vercel-dns.com`

> **Note on DNS:** `liedeman.perumal.co.za` is a subdomain of `perumal.co.za`. You'll need to first delegate `liedeman.perumal.co.za` as a subdomain zone (or simply add a CNAME for `wedding.liedeman` under `perumal.co.za` — check what domains.co.za supports for nested subdomain CNAMEs).

---

## Future Expansion (out of scope for v1)

The data model and routing are designed to support these without structural changes:
- Venue detail pages (add content to `Event` records)
- Wedding registry (new page, no DB changes)
- Gallery & photo upload (new `Photo` model, Vercel Blob storage)
- Additional info pages (static Next.js pages)
