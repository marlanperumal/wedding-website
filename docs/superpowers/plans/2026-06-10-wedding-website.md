# Wedding Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build wedding.liedeman.perumal.co.za — invite pages, per-person RSVP across five events, and an admin dashboard — for Marlan & Tramaine's November 2026 wedding.

**Architecture:** Next.js 15 App Router with Server Components and Server Actions throughout. Guest identity is established by visiting a unique invite link (`/[inviteSlug]`) which sets a signed HttpOnly cookie; all subsequent pages read that cookie server-side. Admin is protected by a bcrypt-hashed passphrase in env vars. Business logic is extracted into `src/lib/` functions that are unit-tested independently of Next.js internals.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, Prisma 6, PostgreSQL (Docker local / Prisma Postgres prod), Vitest, Resend (email), ics (calendar file generation), bcryptjs

---

## File Map

```
wedding-website/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── vitest.config.ts
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                        # generic landing for people without an invite link
│   │   ├── [inviteSlug]/
│   │   │   └── page.tsx                    # invite landing — sets cookie on RSVP click
│   │   ├── rsvp/
│   │   │   ├── page.tsx                    # RSVP form
│   │   │   ├── actions.ts                  # submitRsvp Server Action
│   │   │   └── confirmed/
│   │   │       └── page.tsx                # post-RSVP confirmation with venue + .ics
│   │   └── admin/
│   │       ├── page.tsx                    # passphrase login
│   │       ├── actions.ts                  # adminLogin Server Action
│   │       ├── dashboard/
│   │       │   └── page.tsx                # RSVP counts + dietary totals
│   │       └── guests/
│   │           ├── page.tsx                # invite/guest management table
│   │           └── actions.ts              # addInvite, editInvite, regenerateSlug
│   ├── components/
│   │   ├── AccentBar.tsx                   # gradient top/bottom accent strip
│   │   ├── EventPill.tsx                   # coloured event label badge
│   │   ├── SiteNav.tsx                     # top navigation bar
│   │   ├── InviteHero.tsx                  # hero section for invite page
│   │   ├── EventBlock.tsx                  # day block with event pills + venue
│   │   ├── GuestCard.tsx                   # per-person card with event checkboxes
│   │   ├── RsvpForm.tsx                    # client component wrapping the RSVP form
│   │   ├── DashboardStats.tsx              # RSVP count cards + dietary table
│   │   └── InviteTable.tsx                 # admin guest/invite list table
│   └── lib/
│       ├── prisma.ts                       # Prisma client singleton
│       ├── cookies.ts                      # HMAC sign/verify + session helpers
│       ├── slugs.ts                        # invite slug generation
│       ├── schemas.ts                      # Zod schemas for all form inputs
│       ├── rsvp.ts                         # processRsvp business logic (DB + validation)
│       └── email.ts                        # Resend email helpers
└── src/__tests__/
    ├── lib/
    │   ├── cookies.test.ts
    │   ├── slugs.test.ts
    │   ├── schemas.test.ts
    │   └── rsvp.test.ts
```

---

## Task 1: Project Initialisation

**Files:**
- Create: all scaffold files via `create-next-app`
- Create: `vitest.config.ts`
- Create: `.gitignore` (update)

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/marlan/Code/wedding-website
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

When prompted: accept all defaults. This installs Next.js 15, TypeScript, Tailwind v3, ESLint.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client bcryptjs resend ics
npm install -D @types/bcryptjs vitest @vitejs/plugin-react @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Add test script to `package.json`**

In `package.json`, add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify the scaffold works**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000 without errors. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialise Next.js 15 project with Tailwind and Vitest"
```

---

## Task 2: Tailwind Design System

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `tailwind.config.ts` with the project palette**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          soft:   '#F4A261',
          warm:   '#FFB07C',
          sunset: '#F28C38',
          amber:  '#E07A29',
          peach:  '#FFC8A2',
        },
        purple: {
          orchid: '#9E6BB5',
          deep:   '#7A4C8C',
        },
        teal: {
          turquoise: '#3DA4A1',
          deep:      '#2E7D7A',
        },
        green: {
          leaf:   '#5FAE7E',
          sage:   '#7BAF9B',
        },
        cream: '#FAF4EE',
        'near-black': '#2E1A10',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent-gradient: linear-gradient(
    90deg,
    #7A4C8C, #F4A261, #3DA4A1, #F4A261, #7A4C8C
  );
}

@layer base {
  body {
    @apply bg-cream text-near-black;
  }
}

@layer components {
  .accent-bar {
    height: 4px;
    background: var(--accent-gradient);
  }

  .paisley-watermark {
    @apply absolute border-[3px] rounded-[60%_0_60%_0] opacity-[0.07];
  }

  .event-day-label {
    @apply text-[10px] tracking-[3px] uppercase font-sans text-green-sage mb-2;
  }
}
```

- [ ] **Step 3: Verify Tailwind picks up the palette**

```bash
npm run dev
```

Open http://localhost:3000 — page renders without build errors. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure Tailwind with South Indian wedding colour palette"
```

---

## Task 3: Docker + Prisma Setup

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env.local`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: wedding
      POSTGRES_PASSWORD: wedding
      POSTGRES_DB: wedding_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 2: Create `.env.example`**

```env
DATABASE_URL="postgresql://wedding:wedding@localhost:5432/wedding_dev"
ADMIN_PASSPHRASE_HASH=""
COOKIE_SECRET="change-me-to-a-random-32-byte-hex-string"
RESEND_API_KEY=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

- [ ] **Step 3: Create `.env.local`**

```env
DATABASE_URL="postgresql://wedding:wedding@localhost:5432/wedding_dev"
ADMIN_PASSPHRASE_HASH=""
COOKIE_SECRET="dev-secret-do-not-use-in-production-00"
RESEND_API_KEY=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

- [ ] **Step 4: Update `.gitignore`** to ensure secrets are excluded

Add these lines if not already present:

```
.env.local
.env*.local
.superpowers/
```

- [ ] **Step 5: Initialise Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 6: Replace `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Invite {
  id          String    @id @default(cuid())
  slug        String    @unique
  label       String
  email       String?
  submitted   Boolean   @default(false)
  submittedAt DateTime?
  createdAt   DateTime  @default(now())

  guests Guest[]
  events InviteEvent[]
}

model Guest {
  id       String @id @default(cuid())
  name     String
  inviteId String
  invite   Invite @relation(fields: [inviteId], references: [id], onDelete: Cascade)

  rsvps Rsvp[]
}

model Event {
  id        String   @id @default(cuid())
  name      String
  date      DateTime @db.Timestamptz
  venue     String
  address   String
  sortOrder Int      @default(0)

  invites InviteEvent[]
  rsvps   Rsvp[]
}

model InviteEvent {
  inviteId String
  eventId  String
  invite   Invite @relation(fields: [inviteId], references: [id], onDelete: Cascade)
  event    Event  @relation(fields: [eventId], references: [id])

  @@id([inviteId, eventId])
}

model Rsvp {
  id           String   @id @default(cuid())
  guestId      String
  eventId      String
  attending    Boolean
  dietary      String[]
  dietaryNotes String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  guest Guest @relation(fields: [guestId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id])

  @@unique([guestId, eventId])
}
```

- [ ] **Step 7: Create `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 8: Start Docker and run the first migration**

```bash
docker-compose up -d
npx prisma migrate dev --name init
```

Expected: migration succeeds, `prisma/migrations/` directory created.

- [ ] **Step 9: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 10: Commit**

```bash
git add docker-compose.yml .env.example prisma/ src/lib/prisma.ts .gitignore
git commit -m "feat: add Prisma schema, Docker Compose local Postgres, and Prisma client"
```

---

## Task 4: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data in order (respects FK constraints)
  await prisma.rsvp.deleteMany()
  await prisma.inviteEvent.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.event.deleteMany()

  // Seed the 5 events
  const mehndi = await prisma.event.create({
    data: {
      name: 'Mehndi',
      date: new Date('2026-11-26T14:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 1,
    },
  })

  const nelengu = await prisma.event.create({
    data: {
      name: 'Nelengu',
      date: new Date('2026-11-26T16:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 2,
    },
  })

  const sangeeth = await prisma.event.create({
    data: {
      name: 'Sangeeth',
      date: new Date('2026-11-26T19:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 3,
    },
  })

  const wedding = await prisma.event.create({
    data: {
      name: 'Wedding',
      date: new Date('2026-11-27T11:00:00+02:00'),
      venue: 'Goedgeleven',
      address: 'Goedgeleven, Durbanville, Cape Town, 7550',
      sortOrder: 4,
    },
  })

  const reception = await prisma.event.create({
    data: {
      name: 'Reception',
      date: new Date('2026-11-27T17:00:00+02:00'),
      venue: 'Goedgeleven',
      address: 'Goedgeleven, Durbanville, Cape Town, 7550',
      sortOrder: 5,
    },
  })

  // Seed a test invite with 2 guests invited to all events
  const testInvite = await prisma.invite.create({
    data: {
      slug: 'test-invite-dev1',
      label: 'Test Family',
      guests: {
        create: [
          { name: 'Test Guest One' },
          { name: 'Test Guest Two' },
        ],
      },
      events: {
        create: [
          { eventId: mehndi.id },
          { eventId: nelengu.id },
          { eventId: sangeeth.id },
          { eventId: wedding.id },
          { eventId: reception.id },
        ],
      },
    },
  })

  console.log('✓ Seeded 5 events')
  console.log(`✓ Test invite: http://localhost:3000/${testInvite.slug}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Add seed config to `package.json`**

In `package.json`, add a top-level `"prisma"` key:

```json
"prisma": {
  "seed": "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Also install `ts-node`:

```bash
npm install -D ts-node
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected output:
```
✓ Seeded 5 events
✓ Test invite: http://localhost:3000/test-invite-dev1
```

- [ ] **Step 4: Verify in Prisma Studio**

```bash
npx prisma studio
```

Open http://localhost:5555. Confirm 5 Event rows, 1 Invite row, 2 Guest rows, 5 InviteEvent rows. Stop Studio with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed 5 wedding events and a test invite"
```

---

## Task 5: Cookie Utilities (TDD)

**Files:**
- Create: `src/lib/cookies.ts`
- Create: `src/__tests__/lib/cookies.test.ts`

The cookie helpers use the Web Crypto API (available in Node 18+) to HMAC-sign values. They do **not** import `next/headers` — that stays in Server Actions and Components.

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/lib/cookies.test.ts
import { describe, it, expect } from 'vitest'
import { signValue, verifyValue } from '@/lib/cookies'

const SECRET = 'test-secret-32-bytes-long-enough!!'

describe('signValue', () => {
  it('returns a string with a dot separator', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    expect(signed).toContain('.')
  })

  it('includes the original value before the dot', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    expect(signed.split('.')[0]).toBe('invite-id-123')
  })
})

describe('verifyValue', () => {
  it('returns the original value for a valid signed string', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const result = await verifyValue(signed, SECRET)
    expect(result).toBe('invite-id-123')
  })

  it('returns null for a tampered value', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const tampered = 'evil-id.' + signed.split('.')[1]
    const result = await verifyValue(tampered, SECRET)
    expect(result).toBeNull()
  })

  it('returns null for a missing signature', async () => {
    const result = await verifyValue('no-dot-here', SECRET)
    expect(result).toBeNull()
  })

  it('returns null when signed with a different secret', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const result = await verifyValue(signed, 'wrong-secret')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
npm test -- src/__tests__/lib/cookies.test.ts
```

Expected: error — `Cannot find module '@/lib/cookies'`

- [ ] **Step 3: Create `src/lib/cookies.ts`**

```typescript
async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Buffer.from(sig).toString('base64url')
}

export async function signValue(value: string, secret: string): Promise<string> {
  const sig = await hmac(value, secret)
  return `${value}.${sig}`
}

export async function verifyValue(signed: string, secret: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return null
  const value = signed.slice(0, lastDot)
  const expected = await signValue(value, secret)
  if (expected !== signed) return null
  return value
}

// Convenience: get the guest invite ID from a raw signed cookie value
export async function extractGuestInviteId(
  cookieValue: string | undefined,
): Promise<string | null> {
  if (!cookieValue) return null
  return verifyValue(cookieValue, process.env.COOKIE_SECRET!)
}

// Convenience: get the admin session status from a raw signed cookie value
export async function extractAdminSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false
  const value = await verifyValue(cookieValue, process.env.COOKIE_SECRET!)
  return value === 'admin'
}
```

- [ ] **Step 4: Run the tests — confirm they pass**

```bash
npm test -- src/__tests__/lib/cookies.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cookies.ts src/__tests__/lib/cookies.test.ts
git commit -m "feat: add HMAC cookie sign/verify utilities with tests"
```

---

## Task 6: Invite Slug Utility (TDD)

**Files:**
- Create: `src/lib/slugs.ts`
- Create: `src/__tests__/lib/slugs.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/lib/slugs.test.ts
import { describe, it, expect } from 'vitest'
import { generateInviteSlug, labelToSlugBase } from '@/lib/slugs'

describe('labelToSlugBase', () => {
  it('lowercases and hyphenates words', () => {
    expect(labelToSlugBase('The Naidoo Family')).toBe('the-naidoo-family')
  })

  it('strips special characters', () => {
    expect(labelToSlugBase("O'Brien & Co")).toBe('obrien-co')
  })

  it('collapses multiple spaces/hyphens', () => {
    expect(labelToSlugBase('Smith  Family')).toBe('smith-family')
  })
})

describe('generateInviteSlug', () => {
  it('starts with the label base', () => {
    const slug = generateInviteSlug('The Naidoo Family')
    expect(slug.startsWith('the-naidoo-family-')).toBe(true)
  })

  it('ends with a 4-character alphanumeric suffix', () => {
    const slug = generateInviteSlug('The Naidoo Family')
    const suffix = slug.split('-').pop()!
    expect(suffix).toMatch(/^[a-z0-9]{4}$/)
  })

  it('produces different slugs on repeated calls', () => {
    const a = generateInviteSlug('Test Family')
    const b = generateInviteSlug('Test Family')
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
npm test -- src/__tests__/lib/slugs.test.ts
```

Expected: error — `Cannot find module '@/lib/slugs'`

- [ ] **Step 3: Create `src/lib/slugs.ts`**

```typescript
export function labelToSlugBase(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

export function generateInviteSlug(label: string): string {
  const base = labelToSlugBase(label)
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 4)
  return `${base}-${suffix}`
}
```

- [ ] **Step 4: Run the tests — confirm they pass**

```bash
npm test -- src/__tests__/lib/slugs.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slugs.ts src/__tests__/lib/slugs.test.ts
git commit -m "feat: add invite slug generation utility with tests"
```

---

## Task 7: Zod Schemas (TDD)

**Files:**
- Create: `src/lib/schemas.ts`
- Create: `src/__tests__/lib/schemas.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/lib/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { RsvpSchema, AdminLoginSchema, AddInviteSchema } from '@/lib/schemas'

describe('RsvpSchema', () => {
  const validData = {
    email: 'guest@example.com',
    responses: [
      {
        guestId: 'guest-1',
        eventId: 'event-1',
        attending: true,
        dietary: ['Vegetarian'],
        dietaryNotes: '',
      },
    ],
  }

  it('accepts valid RSVP data', () => {
    expect(() => RsvpSchema.parse(validData)).not.toThrow()
  })

  it('rejects invalid email', () => {
    const result = RsvpSchema.safeParse({ ...validData, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty responses array', () => {
    const result = RsvpSchema.safeParse({ ...validData, responses: [] })
    expect(result.success).toBe(false)
  })

  it('rejects unknown dietary option', () => {
    const result = RsvpSchema.safeParse({
      ...validData,
      responses: [{ ...validData.responses[0], dietary: ['Keto'] }],
    })
    expect(result.success).toBe(false)
  })

  it('allows empty dietary array', () => {
    const result = RsvpSchema.safeParse({
      ...validData,
      responses: [{ ...validData.responses[0], dietary: [] }],
    })
    expect(result.success).toBe(true)
  })
})

describe('AdminLoginSchema', () => {
  it('accepts a non-empty passphrase', () => {
    expect(() => AdminLoginSchema.parse({ passphrase: 'secret' })).not.toThrow()
  })

  it('rejects an empty passphrase', () => {
    const result = AdminLoginSchema.safeParse({ passphrase: '' })
    expect(result.success).toBe(false)
  })
})

describe('AddInviteSchema', () => {
  it('accepts valid invite data', () => {
    expect(() =>
      AddInviteSchema.parse({
        label: 'The Naidoos',
        guestNames: ['Priya Naidoo', 'Rajan Naidoo'],
        eventIds: ['event-1', 'event-2'],
        email: 'priya@example.com',
      }),
    ).not.toThrow()
  })

  it('requires at least one guest', () => {
    const result = AddInviteSchema.safeParse({
      label: 'The Naidoos',
      guestNames: [],
      eventIds: ['event-1'],
    })
    expect(result.success).toBe(false)
  })

  it('requires at least one event', () => {
    const result = AddInviteSchema.safeParse({
      label: 'The Naidoos',
      guestNames: ['Priya'],
      eventIds: [],
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
npm test -- src/__tests__/lib/schemas.test.ts
```

Expected: error — `Cannot find module '@/lib/schemas'`

- [ ] **Step 3: Create `src/lib/schemas.ts`**

```typescript
import { z } from 'zod'

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-free',
  'Nut allergy',
  'Other',
] as const

export type DietaryOption = (typeof DIETARY_OPTIONS)[number]

const RsvpResponseSchema = z.object({
  guestId: z.string().min(1),
  eventId: z.string().min(1),
  attending: z.boolean(),
  dietary: z.array(z.enum(DIETARY_OPTIONS)),
  dietaryNotes: z.string().optional(),
})

export const RsvpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  responses: z.array(RsvpResponseSchema).min(1),
})

export type RsvpData = z.infer<typeof RsvpSchema>

export const AdminLoginSchema = z.object({
  passphrase: z.string().min(1, 'Passphrase is required'),
})

export type AdminLoginData = z.infer<typeof AdminLoginSchema>

export const AddInviteSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  guestNames: z.array(z.string().min(1)).min(1, 'At least one guest required'),
  eventIds: z.array(z.string().min(1)).min(1, 'At least one event required'),
  email: z.string().email().optional().or(z.literal('')),
})

export type AddInviteData = z.infer<typeof AddInviteSchema>
```

- [ ] **Step 4: Install Zod**

```bash
npm install zod
```

- [ ] **Step 5: Run the tests — confirm they pass**

```bash
npm test -- src/__tests__/lib/schemas.test.ts
```

Expected: 9 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas.ts src/__tests__/lib/schemas.test.ts
git commit -m "feat: add Zod schemas for RSVP, admin login, and invite management"
```

---

## Task 8: Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyValue } from '@/lib/cookies'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /rsvp routes — require guest cookie
  if (pathname.startsWith('/rsvp')) {
    const cookie = request.cookies.get('guestInviteId')?.value
    if (!cookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    const inviteId = await verifyValue(cookie, process.env.COOKIE_SECRET!)
    if (!inviteId) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect /admin routes (except /admin login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const cookie = request.cookies.get('adminSession')?.value
    if (!cookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    const session = await verifyValue(cookie, process.env.COOKIE_SECRET!)
    if (session !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rsvp/:path*', '/admin/:path*'],
}
```

- [ ] **Step 2: Verify middleware compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to middleware.ts (there may be other errors for pages not yet created — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add middleware protecting /rsvp and /admin routes"
```

---

## Task 9: Shared UI Components

**Files:**
- Create: `src/components/AccentBar.tsx`
- Create: `src/components/EventPill.tsx`
- Create: `src/components/SiteNav.tsx`

- [ ] **Step 1: Create `src/components/AccentBar.tsx`**

```typescript
export function AccentBar() {
  return <div className="accent-bar w-full" />
}
```

- [ ] **Step 2: Create `src/components/EventPill.tsx`**

```typescript
const EVENT_COLOURS: Record<string, string> = {
  Mehndi:    'bg-purple-deep',
  Nelengu:   'bg-orange-amber',
  Sangeeth:  'bg-purple-orchid',
  Wedding:   'bg-teal-turquoise',
  Reception: 'bg-green-leaf',
}

interface EventPillProps {
  name: string
  className?: string
}

export function EventPill({ name, className = '' }: EventPillProps) {
  const colour = EVENT_COLOURS[name] ?? 'bg-orange-soft'
  return (
    <span
      className={`inline-block px-4 py-1.5 text-[11px] tracking-[2px] uppercase font-sans text-white ${colour} ${className}`}
    >
      {name}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/SiteNav.tsx`**

```typescript
import Link from 'next/link'

interface SiteNavProps {
  showRsvp?: boolean
}

export function SiteNav({ showRsvp = false }: SiteNavProps) {
  return (
    <nav className="bg-cream border-b border-orange-soft px-8 py-3.5 flex justify-between items-center">
      <span className="text-xs tracking-[4px] text-purple-deep uppercase font-sans">
        Liedeman · Perumal
      </span>
      {showRsvp && (
        <Link
          href="/rsvp"
          className="text-[11px] tracking-[2px] text-orange-amber uppercase font-sans border border-orange-amber px-4 py-1.5"
        >
          RSVP
        </Link>
      )}
    </nav>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add AccentBar, EventPill, and SiteNav shared components"
```

---

## Task 10: Root Layout and Home Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marlan & Tramaine | 26–27 November 2026',
  description: 'Wedding celebration for Marlan Perumal and Tramaine Liedeman',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Replace `src/app/page.tsx`**

```typescript
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs tracking-[5px] uppercase font-sans text-purple-orchid mb-6">
          Marlan &amp; Tramaine
        </p>
        <h1 className="font-serif text-4xl italic text-near-black mb-4">
          26–27 November 2026
        </h1>
        <p className="text-sm font-sans text-purple-orchid tracking-[2px] mb-8">
          Cape Town, South Africa
        </p>
        <p className="text-sm text-gray-500 font-sans">
          Please use your personal invite link to access this website.
        </p>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 3: Verify it renders**

```bash
npm run dev
```

Open http://localhost:3000 — should show the holding page. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add root layout and holding home page"
```

---

## Task 11: Invite Landing Page

**Files:**
- Create: `src/app/[inviteSlug]/page.tsx`
- Create: `src/components/InviteHero.tsx`
- Create: `src/components/EventBlock.tsx`

- [ ] **Step 1: Create `src/components/EventBlock.tsx`**

```typescript
import { EventPill } from './EventPill'

interface Event {
  id: string
  name: string
  date: Date
  venue: string
}

interface EventBlockProps {
  dayLabel: string
  events: Event[]
  accentClass: string
}

export function EventBlock({ dayLabel, events, accentClass }: EventBlockProps) {
  const date = events[0]?.date
  const formattedDate = date
    ? new Intl.DateTimeFormat('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Africa/Johannesburg',
      }).format(date)
    : ''

  return (
    <div className={`border p-5 rounded-sm mb-4 ${accentClass}`}>
      <p className="text-sm font-sans tracking-[2px] uppercase mb-1 font-medium">
        {formattedDate}
      </p>
      <p className="text-xs font-sans text-purple-orchid tracking-[2px] mb-4">
        {events[0]?.venue} · Cape Town
      </p>
      <div className="flex flex-wrap gap-2">
        {events.map((e) => (
          <EventPill key={e.id} name={e.name} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/InviteHero.tsx`**

```typescript
interface InviteHeroProps {
  guestGreeting: string
}

export function InviteHero({ guestGreeting }: InviteHeroProps) {
  return (
    <div className="text-center py-14 px-6 relative overflow-hidden">
      {/* Paisley watermarks */}
      <div className="paisley-watermark border-orange-soft right-[-40px] top-[30px] w-[200px] h-[200px] rotate-[25deg]" />
      <div className="paisley-watermark border-purple-deep left-[-40px] bottom-[40px] w-[180px] h-[180px] rotate-[-20deg]" />

      <p className="text-[11px] tracking-[6px] uppercase font-sans text-purple-orchid mb-5">
        {guestGreeting}
      </p>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 mb-7">
        <div className="h-px w-10 bg-orange-soft" />
        <span className="text-orange-soft text-base">✦</span>
        <div className="h-px w-10 bg-orange-soft" />
      </div>

      <h1 className="font-serif text-5xl italic leading-tight text-near-black mb-1">
        Marlan
      </h1>
      <p className="font-serif text-xl tracking-[4px] text-purple-orchid mb-1">&amp;</p>
      <h1 className="font-serif text-5xl italic text-near-black mb-9">Tramaine</h1>

      {/* Sub-divider */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-12 bg-teal-turquoise" />
        <span className="text-[11px] tracking-[3px] font-sans text-teal-turquoise">
          REQUEST THE HONOUR OF YOUR PRESENCE
        </span>
        <div className="h-px w-12 bg-teal-turquoise" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/[inviteSlug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { signValue } from '@/lib/cookies'
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'
import { InviteHero } from '@/components/InviteHero'
import { EventBlock } from '@/components/EventBlock'

interface Props {
  params: Promise<{ inviteSlug: string }>
}

async function acceptInvite(inviteId: string) {
  'use server'
  const signed = await signValue(inviteId, process.env.COOKIE_SECRET!)
  const cookieStore = await cookies()
  cookieStore.set('guestInviteId', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: '/',
  })
  redirect('/rsvp')
}

export default async function InvitePage({ params }: Props) {
  const { inviteSlug } = await params

  const invite = await prisma.invite.findUnique({
    where: { slug: inviteSlug },
    include: {
      guests: true,
      events: {
        include: {
          event: true,
        },
        orderBy: {
          event: { sortOrder: 'asc' },
        },
      },
    },
  })

  if (!invite) notFound()

  const allEvents = invite.events.map((ie) => ie.event)

  // Group events by date
  const thursday = allEvents.filter(
    (e) => new Date(e.date).toDateString() === new Date('2026-11-26').toDateString(),
  )
  const friday = allEvents.filter(
    (e) => new Date(e.date).toDateString() === new Date('2026-11-27').toDateString(),
  )

  const guestNames = invite.guests.map((g) => g.name)
  const greeting =
    guestNames.length === 1
      ? `Dear ${guestNames[0]}`
      : `Dear ${guestNames.slice(0, -1).join(', ')} & ${guestNames.at(-1)}`

  const acceptAction = acceptInvite.bind(null, invite.id)

  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />

      <main className="flex-1 bg-cream">
        <InviteHero guestGreeting={greeting} />

        <div className="max-w-lg mx-auto px-6 pb-12">
          {thursday.length > 0 && (
            <EventBlock
              dayLabel="Thursday"
              events={thursday}
              accentClass="border-orange-soft bg-orange-soft/5"
            />
          )}
          {friday.length > 0 && (
            <EventBlock
              dayLabel="Friday"
              events={friday}
              accentClass="border-teal-turquoise bg-teal-turquoise/5"
            />
          )}

          <p className="text-[11px] font-sans text-green-sage tracking-[2px] text-center mb-6">
            Full address &amp; details revealed after your RSVP
          </p>

          <form action={acceptAction}>
            <button
              type="submit"
              className="w-full bg-orange-soft text-white py-4 text-[11px] tracking-[3px] uppercase font-sans hover:bg-orange-amber transition-colors"
            >
              RSVP Now
            </button>
          </form>
        </div>
      </main>

      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 4: Test the invite flow manually**

```bash
npm run dev
```

Open http://localhost:3000/test-invite-dev1 — should show the invite page for "Test Guest One & Test Guest Two" with all 5 events. Clicking "RSVP Now" should set a cookie and redirect to `/rsvp` (which redirects back to `/` since the RSVP page doesn't exist yet).

- [ ] **Step 5: Commit**

```bash
git add src/app/\[inviteSlug\]/ src/components/InviteHero.tsx src/components/EventBlock.tsx
git commit -m "feat: add invite landing page with accept action that sets guest cookie"
```

---

## Task 12: RSVP Business Logic (TDD)

**Files:**
- Create: `src/lib/rsvp.ts`
- Create: `src/__tests__/lib/rsvp.test.ts`

This extracts DB-touching logic from the Server Action so it can be unit-tested with a mocked Prisma client.

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/lib/rsvp.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma before importing the module under test
vi.mock('@/lib/prisma', () => ({
  prisma: {
    invite: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    rsvp: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

import { processRsvp } from '@/lib/rsvp'
import { prisma } from '@/lib/prisma'
import type { RsvpData } from '@/lib/schemas'

const mockInvite = {
  id: 'invite-1',
  slug: 'test-x1y2',
  label: 'Test Family',
  email: null,
  submitted: false,
  submittedAt: null,
  createdAt: new Date(),
  guests: [
    { id: 'guest-1', name: 'Test One', inviteId: 'invite-1' },
    { id: 'guest-2', name: 'Test Two', inviteId: 'invite-1' },
  ],
  events: [
    { inviteId: 'invite-1', eventId: 'event-1' },
    { inviteId: 'invite-1', eventId: 'event-2' },
  ],
}

const validRsvpData: RsvpData = {
  email: 'test@example.com',
  responses: [
    { guestId: 'guest-1', eventId: 'event-1', attending: true, dietary: ['Vegetarian'] },
    { guestId: 'guest-1', eventId: 'event-2', attending: false, dietary: [] },
    { guestId: 'guest-2', eventId: 'event-1', attending: true, dietary: [] },
    { guestId: 'guest-2', eventId: 'event-2', attending: true, dietary: ['Halal'] },
  ],
}

describe('processRsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(mockInvite as any)
    vi.mocked(prisma.rsvp.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.invite.update).mockResolvedValue({ ...mockInvite, submitted: true } as any)
  })

  it('throws if invite not found', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await expect(processRsvp('bad-id', validRsvpData)).rejects.toThrow('Invite not found')
  })

  it('throws if a guestId does not belong to the invite', async () => {
    const badData: RsvpData = {
      ...validRsvpData,
      responses: [
        { guestId: 'evil-guest', eventId: 'event-1', attending: true, dietary: [] },
      ],
    }
    await expect(processRsvp('invite-1', badData)).rejects.toThrow('Invalid guest')
  })

  it('throws if an eventId was not invited', async () => {
    const badData: RsvpData = {
      ...validRsvpData,
      responses: [
        { guestId: 'guest-1', eventId: 'uninvited-event', attending: true, dietary: [] },
      ],
    }
    await expect(processRsvp('invite-1', badData)).rejects.toThrow('Invalid event')
  })

  it('calls upsert for each response', async () => {
    await processRsvp('invite-1', validRsvpData)
    expect(prisma.rsvp.upsert).toHaveBeenCalledTimes(4)
  })

  it('marks the invite as submitted with the email', async () => {
    await processRsvp('invite-1', validRsvpData)
    expect(prisma.invite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'invite-1' },
        data: expect.objectContaining({
          submitted: true,
          email: 'test@example.com',
        }),
      }),
    )
  })
})
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
npm test -- src/__tests__/lib/rsvp.test.ts
```

Expected: error — `Cannot find module '@/lib/rsvp'`

- [ ] **Step 3: Create `src/lib/rsvp.ts`**

```typescript
import { prisma } from './prisma'
import type { RsvpData } from './schemas'

export async function processRsvp(inviteId: string, data: RsvpData): Promise<void> {
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: true,
      events: true,
    },
  })

  if (!invite) throw new Error('Invite not found')

  const validGuestIds = new Set(invite.guests.map((g) => g.id))
  const validEventIds = new Set(invite.events.map((ie) => ie.eventId))

  for (const response of data.responses) {
    if (!validGuestIds.has(response.guestId)) {
      throw new Error(`Invalid guest: ${response.guestId}`)
    }
    if (!validEventIds.has(response.eventId)) {
      throw new Error(`Invalid event: ${response.eventId}`)
    }
  }

  await Promise.all(
    data.responses.map((r) =>
      prisma.rsvp.upsert({
        where: { guestId_eventId: { guestId: r.guestId, eventId: r.eventId } },
        create: {
          guestId: r.guestId,
          eventId: r.eventId,
          attending: r.attending,
          dietary: r.dietary,
          dietaryNotes: r.dietaryNotes ?? null,
        },
        update: {
          attending: r.attending,
          dietary: r.dietary,
          dietaryNotes: r.dietaryNotes ?? null,
        },
      }),
    ),
  )

  await prisma.invite.update({
    where: { id: inviteId },
    data: {
      submitted: true,
      submittedAt: new Date(),
      email: data.email,
    },
  })
}
```

- [ ] **Step 4: Run the tests — confirm they pass**

```bash
npm test -- src/__tests__/lib/rsvp.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rsvp.ts src/__tests__/lib/rsvp.test.ts
git commit -m "feat: add processRsvp business logic with validation and upsert, with tests"
```

---

## Task 13: RSVP Page and Server Action

**Files:**
- Create: `src/components/GuestCard.tsx`
- Create: `src/components/RsvpForm.tsx`
- Create: `src/app/rsvp/page.tsx`
- Create: `src/app/rsvp/actions.ts`

- [ ] **Step 1: Create `src/components/GuestCard.tsx`**

```typescript
'use client'

import { DIETARY_OPTIONS } from '@/lib/schemas'
import { EventPill } from './EventPill'

interface Event {
  id: string
  name: string
  date: Date
}

interface GuestCardProps {
  guestId: string
  guestName: string
  thursdayEvents: Event[]
  fridayEvents: Event[]
  existingRsvps: Record<string, { attending: boolean; dietary: string[] }>
}

export function GuestCard({
  guestId,
  guestName,
  thursdayEvents,
  fridayEvents,
  existingRsvps,
}: GuestCardProps) {
  return (
    <div className="border border-orange-soft rounded-sm mb-4 overflow-hidden">
      <div className="bg-orange-soft px-4 py-2.5">
        <span className="text-white text-sm font-sans tracking-wide">{guestName}</span>
      </div>
      <div className="p-4">
        {thursdayEvents.length > 0 && (
          <div className="mb-4">
            <p className="event-day-label">Thu 26 Nov</p>
            <div className="flex flex-wrap gap-3">
              {thursdayEvents.map((event) => (
                <EventCheckbox
                  key={event.id}
                  guestId={guestId}
                  event={event}
                  defaultChecked={existingRsvps[event.id]?.attending ?? true}
                />
              ))}
            </div>
          </div>
        )}
        {fridayEvents.length > 0 && (
          <div className="mb-4">
            <p className="event-day-label">Fri 27 Nov</p>
            <div className="flex flex-wrap gap-3">
              {fridayEvents.map((event) => (
                <EventCheckbox
                  key={event.id}
                  guestId={guestId}
                  event={event}
                  defaultChecked={existingRsvps[event.id]?.attending ?? true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dietary */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-2">
            Dietary requirements
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {DIETARY_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-1.5 text-xs font-sans text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={`dietary-${guestId}`}
                  value={option}
                  defaultChecked={
                    existingRsvps[Object.keys(existingRsvps)[0]]?.dietary?.includes(option) ??
                    false
                  }
                  className="accent-purple-deep"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCheckbox({
  guestId,
  event,
  defaultChecked,
}: {
  guestId: string
  event: { id: string; name: string }
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={`attending-${guestId}-${event.id}`}
        defaultChecked={defaultChecked}
        className="accent-purple-deep"
      />
      <EventPill name={event.name} />
    </label>
  )
}
```

- [ ] **Step 2: Create `src/app/rsvp/actions.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyValue } from '@/lib/cookies'
import { processRsvp } from '@/lib/rsvp'
import { RsvpSchema, DIETARY_OPTIONS } from '@/lib/schemas'
import type { DietaryOption } from '@/lib/schemas'
import { sendRsvpConfirmation } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function submitRsvp(_prevState: unknown, formData: FormData) {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get('guestInviteId')?.value
  const inviteId = rawCookie
    ? await verifyValue(rawCookie, process.env.COOKIE_SECRET!)
    : null

  if (!inviteId) return { error: 'Session expired. Please use your invite link again.' }

  // Load guests and events for this invite to build the responses array
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: true,
      events: { include: { event: true } },
    },
  })

  if (!invite) return { error: 'Invite not found.' }

  const email = formData.get('email') as string
  const responses = invite.guests.flatMap((guest) =>
    invite.events.map((ie) => {
      const attending =
        formData.get(`attending-${guest.id}-${ie.eventId}`) === 'on'
      const dietaryRaw = formData.getAll(`dietary-${guest.id}`) as string[]
      const dietary = dietaryRaw.filter((d): d is DietaryOption =>
        (DIETARY_OPTIONS as readonly string[]).includes(d),
      )
      return {
        guestId: guest.id,
        eventId: ie.eventId,
        attending,
        dietary,
        dietaryNotes: undefined,
      }
    }),
  )

  const parsed = RsvpSchema.safeParse({ email, responses })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid form data.' }
  }

  try {
    await processRsvp(inviteId, parsed.data)
    await sendRsvpConfirmation(invite.label, email, invite.events.map((ie) => ie.event))
  } catch (err) {
    console.error('RSVP submission error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/rsvp/confirmed')
}
```

- [ ] **Step 3: Create `src/app/rsvp/page.tsx`**

```typescript
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyValue } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'
import { GuestCard } from '@/components/GuestCard'
import { submitRsvp } from './actions'

export default async function RsvpPage() {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get('guestInviteId')?.value
  const inviteId = rawCookie
    ? await verifyValue(rawCookie, process.env.COOKIE_SECRET!)
    : null

  if (!inviteId) redirect('/')

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: true,
      events: {
        include: {
          event: true,
        },
        orderBy: { event: { sortOrder: 'asc' } },
      },
      guests: {
        include: {
          rsvps: true,
        },
      },
    },
  })

  if (!invite) redirect('/')

  const allEvents = invite.events.map((ie) => ie.event)
  const thursday = allEvents.filter(
    (e) => new Date(e.date).toDateString() === 'Thu Nov 26 2026',
  )
  const friday = allEvents.filter(
    (e) => new Date(e.date).toDateString() === 'Fri Nov 27 2026',
  )

  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />
      <main className="flex-1 bg-cream">
        <div className="max-w-lg mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-[11px] tracking-[5px] uppercase font-sans text-purple-orchid mb-3">
              You&apos;re invited
            </p>
            <h1 className="font-serif text-3xl italic text-near-black mb-3">
              {invite.guests.map((g) => g.name).join(' & ')}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-orange-soft" />
              <span className="text-orange-soft text-sm">✦</span>
              <div className="h-px w-10 bg-orange-soft" />
            </div>
          </div>

          <form action={submitRsvp}>
            <p className="text-[11px] tracking-[3px] uppercase font-sans text-green-sage mb-4">
              Please confirm attendance for each event
            </p>

            {invite.guests.map((guest) => {
              const existingRsvps = Object.fromEntries(
                guest.rsvps.map((r) => [
                  r.eventId,
                  { attending: r.attending, dietary: r.dietary },
                ]),
              )
              return (
                <GuestCard
                  key={guest.id}
                  guestId={guest.id}
                  guestName={guest.name}
                  thursdayEvents={thursday}
                  fridayEvents={friday}
                  existingRsvps={existingRsvps}
                />
              )
            })}

            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase font-sans text-green-sage mb-2">
                Contact email (for confirmation &amp; updates)
              </label>
              <input
                type="email"
                name="email"
                defaultValue={invite.email ?? ''}
                required
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 bg-white text-sm font-sans focus:outline-none focus:border-orange-soft"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-soft text-white py-4 text-[11px] tracking-[3px] uppercase font-sans hover:bg-orange-amber transition-colors"
            >
              Confirm RSVP
            </button>
          </form>
        </div>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 4: Verify the RSVP page renders**

```bash
npm run dev
```

Visit http://localhost:3000/test-invite-dev1, click "RSVP Now", confirm redirect to `/rsvp` which shows the RSVP form with both test guests and all events.

- [ ] **Step 5: Commit**

```bash
git add src/components/GuestCard.tsx src/app/rsvp/
git commit -m "feat: add RSVP page with per-person per-event form and Server Action"
```

---

## Task 14: RSVP Confirmed Page

**Files:**
- Create: `src/app/rsvp/confirmed/page.tsx`

- [ ] **Step 1: Create `src/app/rsvp/confirmed/page.tsx`**

```typescript
import { cookies } from 'next/headers'
import { verifyValue } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'
import { EventPill } from '@/components/EventPill'

function generateIcsContent(
  title: string,
  date: Date,
  venue: string,
  address: string,
): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  const end = new Date(date.getTime() + 3 * 60 * 60 * 1000)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Liedeman Perumal Wedding//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(date)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Marlan & Tramaine's Wedding — ${title}`,
    `LOCATION:${venue}\\, ${address}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export default async function RsvpConfirmedPage() {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get('guestInviteId')?.value
  const inviteId = rawCookie
    ? await verifyValue(rawCookie, process.env.COOKIE_SECRET!)
    : null

  const invite = inviteId
    ? await prisma.invite.findUnique({
        where: { id: inviteId },
        include: {
          events: {
            include: { event: true },
            orderBy: { event: { sortOrder: 'asc' } },
          },
          guests: {
            include: {
              rsvps: { where: { attending: true } },
            },
          },
        },
      })
    : null

  const attendingEventIds = new Set(
    invite?.guests.flatMap((g) => g.rsvps.map((r) => r.eventId)) ?? [],
  )
  const attendingEvents =
    invite?.events
      .map((ie) => ie.event)
      .filter((e) => attendingEventIds.has(e.id)) ?? []

  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />
      <main className="flex-1 bg-cream">
        <div className="max-w-lg mx-auto px-6 py-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-orange-soft" />
            <span className="text-orange-soft text-base">✦</span>
            <div className="h-px w-10 bg-orange-soft" />
          </div>

          <h1 className="font-serif text-4xl italic text-near-black mb-3">
            See you there!
          </h1>
          <p className="text-sm font-sans text-purple-orchid tracking-[2px] mb-8">
            Your RSVP has been confirmed. A confirmation email is on its way.
          </p>

          {attendingEvents.length > 0 && (
            <div className="text-left mb-10">
              <p className="text-[10px] tracking-[4px] uppercase font-sans text-green-sage mb-4">
                Your events &amp; venue details
              </p>
              {attendingEvents.map((event) => (
                <div key={event.id} className="border border-gray-100 rounded-sm p-4 mb-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <EventPill name={event.name} />
                    <a
                      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                        generateIcsContent(event.name, event.date, event.venue, event.address),
                      )}`}
                      download={`${event.name.toLowerCase()}.ics`}
                      className="text-[10px] tracking-[2px] uppercase font-sans text-teal-turquoise hover:text-teal-deep"
                    >
                      + Add to Calendar
                    </a>
                  </div>
                  <p className="text-sm font-sans text-near-black font-medium mb-1">
                    {event.venue}
                  </p>
                  <p className="text-xs font-sans text-gray-500">{event.address}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs font-sans text-gray-400">
            Questions? Email us at{' '}
            <a
              href="mailto:marlan.tramaine@gmail.com"
              className="text-orange-amber hover:underline"
            >
              marlan.tramaine@gmail.com
            </a>
          </p>
        </div>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 2: Test the full RSVP flow**

```bash
npm run dev
```

1. Visit http://localhost:3000/test-invite-dev1
2. Click "RSVP Now"
3. On `/rsvp`, check some boxes, enter `test@example.com`, click "Confirm RSVP"
4. Confirm redirect to `/rsvp/confirmed` showing venue addresses and calendar links

- [ ] **Step 3: Commit**

```bash
git add src/app/rsvp/confirmed/
git commit -m "feat: add RSVP confirmed page with venue reveal and .ics calendar downloads"
```

---

## Task 15: Email with Resend

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Create `src/lib/email.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WeddingEvent {
  name: string
  date: Date
  venue: string
  address: string
}

export async function sendRsvpConfirmation(
  inviteLabel: string,
  toEmail: string,
  events: WeddingEvent[],
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — skipping email send')
    return
  }

  const eventLines = events
    .map(
      (e) =>
        `<li style="margin-bottom:8px"><strong>${e.name}</strong> — ${e.venue}, ${e.address}</li>`,
    )
    .join('')

  await resend.emails.send({
    from: 'Marlan & Tramaine <wedding@liedeman.perumal.co.za>',
    to: toEmail,
    subject: "You're confirmed! Marlan & Tramaine's Wedding",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2E1A10">
        <div style="height:4px;background:linear-gradient(90deg,#7A4C8C,#F4A261,#3DA4A1,#F4A261,#7A4C8C)"></div>
        <div style="padding:40px 32px">
          <p style="font-size:11px;letter-spacing:5px;color:#9E6BB5;text-transform:uppercase;margin-bottom:16px">
            RSVP Confirmed
          </p>
          <h1 style="font-style:italic;font-size:32px;margin-bottom:8px">
            Marlan &amp; Tramaine
          </h1>
          <p style="font-size:13px;color:#555;margin-bottom:24px">
            Dear ${inviteLabel}, thank you for your RSVP! We look forward to celebrating with you.
          </p>
          <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7BAF9B;margin-bottom:12px">
            Your events
          </p>
          <ul style="padding-left:16px;font-size:13px;color:#444;line-height:1.8">
            ${eventLines}
          </ul>
          <p style="font-size:12px;color:#aaa;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
            26–27 November 2026 · Cape Town, South Africa
          </p>
        </div>
        <div style="height:4px;background:linear-gradient(90deg,#7A4C8C,#F4A261,#3DA4A1,#F4A261,#7A4C8C)"></div>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Verify email skips gracefully without API key**

With `RESEND_API_KEY` empty in `.env.local`, submit an RSVP:

```bash
npm run dev
```

Complete the RSVP flow. Confirm no crash — console should log `[Email] RESEND_API_KEY not set — skipping email send`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add Resend email confirmation, gracefully skips if key not set"
```

---

## Task 16: Admin Login

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/actions.ts`

- [ ] **Step 1: Generate an admin passphrase hash**

Run this once locally to generate the hash you'll put in env vars:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-chosen-passphrase', 10).then(h => console.log(h))"
```

Copy the output hash. Set it in `.env.local`:

```
ADMIN_PASSPHRASE_HASH="$2b$10$..."
```

- [ ] **Step 2: Create `src/app/admin/actions.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signValue } from '@/lib/cookies'
import { AdminLoginSchema } from '@/lib/schemas'

export async function adminLogin(_prevState: unknown, formData: FormData) {
  const parsed = AdminLoginSchema.safeParse({
    passphrase: formData.get('passphrase'),
  })
  if (!parsed.success) return { error: 'Passphrase is required.' }

  const hash = process.env.ADMIN_PASSPHRASE_HASH
  if (!hash) return { error: 'Admin not configured.' }

  const valid = await bcrypt.compare(parsed.data.passphrase, hash)
  if (!valid) return { error: 'Incorrect passphrase.' }

  const signed = await signValue('admin', process.env.COOKIE_SECRET!)
  const cookieStore = await cookies()
  cookieStore.set('adminSession', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  redirect('/admin/dashboard')
}
```

- [ ] **Step 3: Create `src/app/admin/page.tsx`**

```typescript
'use client'

import { useActionState } from 'react'
import { adminLogin } from './actions'
import { AccentBar } from '@/components/AccentBar'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, null)

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AccentBar />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl italic text-near-black text-center mb-8">
            Admin
          </h1>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-2">
                Passphrase
              </label>
              <input
                type="password"
                name="passphrase"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 bg-white text-sm font-sans focus:outline-none focus:border-orange-soft"
              />
            </div>
            {state?.error && (
              <p className="text-red-500 text-xs font-sans">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-soft text-white py-3 text-[11px] tracking-[3px] uppercase font-sans hover:bg-orange-amber transition-colors disabled:opacity-60"
            >
              {isPending ? 'Checking...' : 'Enter'}
            </button>
          </form>
        </div>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 4: Test admin login**

```bash
npm run dev
```

Visit http://localhost:3000/admin. Enter the passphrase you hashed in Step 1. Confirm redirect to `/admin/dashboard` (404 is fine, the page doesn't exist yet). Try a wrong passphrase — confirm error message.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/actions.ts
git commit -m "feat: add admin passphrase login with bcrypt verification and signed cookie"
```

---

## Task 17: Admin Dashboard

**Files:**
- Create: `src/components/DashboardStats.tsx`
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/DashboardStats.tsx`**

```typescript
import { EventPill } from './EventPill'

interface EventStats {
  eventId: string
  eventName: string
  attending: number
  notAttending: number
  noResponse: number
  totalInvited: number
}

interface DietarySummary {
  option: string
  count: number
}

interface DashboardStatsProps {
  eventStats: EventStats[]
  dietarySummary: DietarySummary[]
  totalInvites: number
  respondedInvites: number
}

export function DashboardStats({
  eventStats,
  dietarySummary,
  totalInvites,
  respondedInvites,
}: DashboardStatsProps) {
  return (
    <div className="space-y-8">
      {/* Top-level counts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Invites" value={totalInvites} />
        <StatCard label="Responded" value={respondedInvites} />
        <StatCard label="Awaiting" value={totalInvites - respondedInvites} />
      </div>

      {/* Per-event breakdown */}
      <div>
        <h3 className="text-[10px] tracking-[4px] uppercase font-sans text-green-sage mb-4">
          RSVPs by event
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-[10px] tracking-[2px] uppercase text-gray-400 font-normal">Event</th>
                <th className="text-right py-2 px-2 text-[10px] tracking-[2px] uppercase text-green-leaf font-normal">Yes</th>
                <th className="text-right py-2 px-2 text-[10px] tracking-[2px] uppercase text-red-400 font-normal">No</th>
                <th className="text-right py-2 px-2 text-[10px] tracking-[2px] uppercase text-gray-400 font-normal">Pending</th>
                <th className="text-right py-2 pl-2 text-[10px] tracking-[2px] uppercase text-gray-400 font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {eventStats.map((es) => (
                <tr key={es.eventId} className="border-b border-gray-50">
                  <td className="py-2.5 pr-4">
                    <EventPill name={es.eventName} className="text-[10px]" />
                  </td>
                  <td className="text-right py-2.5 px-2 text-green-leaf font-medium">{es.attending}</td>
                  <td className="text-right py-2.5 px-2 text-red-400">{es.notAttending}</td>
                  <td className="text-right py-2.5 px-2 text-gray-400">{es.noResponse}</td>
                  <td className="text-right py-2.5 pl-2 text-gray-500">{es.totalInvited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dietary summary */}
      {dietarySummary.length > 0 && (
        <div>
          <h3 className="text-[10px] tracking-[4px] uppercase font-sans text-green-sage mb-4">
            Dietary requirements
          </h3>
          <div className="flex flex-wrap gap-3">
            {dietarySummary.map((d) => (
              <div key={d.option} className="bg-white border border-gray-100 rounded-sm px-4 py-2 text-sm font-sans">
                <span className="text-near-black font-medium">{d.count}</span>
                <span className="text-gray-400 ml-1.5">{d.option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm p-4">
      <p className="text-[10px] tracking-[3px] uppercase font-sans text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-serif text-near-black">{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/admin/dashboard/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'
import { DashboardStats } from '@/components/DashboardStats'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [events, invites, rsvps] = await Promise.all([
    prisma.event.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.invite.findMany({ include: { guests: true, events: true } }),
    prisma.rsvp.findMany(),
  ])

  const totalInvites = invites.length
  const respondedInvites = invites.filter((i) => i.submitted).length

  // Per-event stats
  const eventStats = events.map((event) => {
    const invitedGuestIds = new Set(
      invites
        .filter((inv) => inv.events.some((ie) => ie.eventId === event.id))
        .flatMap((inv) => inv.guests.map((g) => g.id)),
    )
    const eventRsvps = rsvps.filter((r) => r.eventId === event.id)
    const attending = eventRsvps.filter((r) => r.attending).length
    const notAttending = eventRsvps.filter((r) => !r.attending).length
    const noResponse = invitedGuestIds.size - attending - notAttending

    return {
      eventId: event.id,
      eventName: event.name,
      attending,
      notAttending,
      noResponse: Math.max(0, noResponse),
      totalInvited: invitedGuestIds.size,
    }
  })

  // Dietary summary
  const dietaryCounts: Record<string, number> = {}
  for (const rsvp of rsvps) {
    if (!rsvp.attending) continue
    for (const option of rsvp.dietary) {
      dietaryCounts[option] = (dietaryCounts[option] ?? 0) + 1
    }
  }
  const dietarySummary = Object.entries(dietaryCounts)
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />
      <main className="flex-1 bg-cream">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl italic text-near-black">Dashboard</h1>
            <Link
              href="/admin/guests"
              className="text-[11px] tracking-[2px] uppercase font-sans text-orange-amber border border-orange-amber px-4 py-1.5 hover:bg-orange-amber hover:text-white transition-colors"
            >
              Manage Guests
            </Link>
          </div>
          <DashboardStats
            eventStats={eventStats}
            dietarySummary={dietarySummary}
            totalInvites={totalInvites}
            respondedInvites={respondedInvites}
          />
        </div>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 3: Verify the dashboard**

```bash
npm run dev
```

Log in at http://localhost:3000/admin, confirm redirect to dashboard. Submit the test RSVP first if you haven't — the dashboard should show counts.

- [ ] **Step 4: Commit**

```bash
git add src/components/DashboardStats.tsx src/app/admin/dashboard/
git commit -m "feat: add admin dashboard with RSVP counts per event and dietary summary"
```

---

## Task 18: Admin Guest Management

**Files:**
- Create: `src/components/InviteTable.tsx`
- Create: `src/app/admin/guests/page.tsx`
- Create: `src/app/admin/guests/actions.ts`

- [ ] **Step 1: Create `src/app/admin/guests/actions.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { generateInviteSlug } from '@/lib/slugs'
import { AddInviteSchema } from '@/lib/schemas'

export async function addInvite(_prevState: unknown, formData: FormData) {
  const guestNamesRaw = formData.get('guestNames') as string
  const eventIdsRaw = formData.getAll('eventIds') as string[]

  const parsed = AddInviteSchema.safeParse({
    label: formData.get('label'),
    guestNames: guestNamesRaw.split('\n').map((n) => n.trim()).filter(Boolean),
    eventIds: eventIdsRaw,
    email: formData.get('email') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid data.' }
  }

  const { label, guestNames, eventIds, email } = parsed.data
  const slug = generateInviteSlug(label)

  await prisma.invite.create({
    data: {
      slug,
      label,
      email: email || null,
      guests: {
        create: guestNames.map((name) => ({ name })),
      },
      events: {
        create: eventIds.map((eventId) => ({ eventId })),
      },
    },
  })

  revalidatePath('/admin/guests')
  return { success: true, slug }
}

export async function regenerateSlug(inviteId: string) {
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } })
  if (!invite) return

  const newSlug = generateInviteSlug(invite.label)
  await prisma.invite.update({
    where: { id: inviteId },
    data: { slug: newSlug },
  })

  revalidatePath('/admin/guests')
}
```

- [ ] **Step 2: Create `src/components/InviteTable.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { EventPill } from './EventPill'

interface Guest {
  id: string
  name: string
  rsvps: { eventId: string; attending: boolean; dietary: string[] }[]
}

interface InviteRow {
  id: string
  slug: string
  label: string
  email: string | null
  submitted: boolean
  guests: Guest[]
  events: { eventId: string; event: { id: string; name: string } }[]
}

interface InviteTableProps {
  invites: InviteRow[]
  baseUrl: string
  onRegenerate: (inviteId: string) => Promise<void>
}

export function InviteTable({ invites, baseUrl, onRegenerate }: InviteTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${baseUrl}/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => (
        <div key={invite.id} className="border border-gray-100 rounded-sm bg-white">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
            onClick={() => toggle(invite.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-sans text-near-black font-medium">{invite.label}</span>
              <span
                className={`text-[10px] tracking-[2px] uppercase font-sans px-2 py-0.5 rounded-sm ${
                  invite.submitted
                    ? 'bg-green-leaf/10 text-green-leaf'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {invite.submitted ? 'Responded' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => copyLink(invite.slug)}
                className="text-[10px] tracking-[1px] uppercase font-sans text-teal-turquoise border border-teal-turquoise px-2.5 py-1 hover:bg-teal-turquoise hover:text-white transition-colors"
              >
                {copied === invite.slug ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => onRegenerate(invite.id)}
                className="text-[10px] tracking-[1px] uppercase font-sans text-gray-400 border border-gray-200 px-2.5 py-1 hover:border-gray-400"
              >
                New Link
              </button>
            </div>
          </div>

          {expanded.has(invite.id) && (
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex flex-wrap gap-1 mb-3">
                {invite.events.map((ie) => (
                  <EventPill key={ie.eventId} name={ie.event.name} className="text-[10px]" />
                ))}
              </div>
              <div className="space-y-2">
                {invite.guests.map((guest) => (
                  <div key={guest.id} className="flex flex-wrap items-center gap-2 text-xs font-sans text-gray-500">
                    <span className="text-near-black">{guest.name}</span>
                    {guest.rsvps.map((rsvp) => {
                      const event = invite.events.find((ie) => ie.eventId === rsvp.eventId)
                      return (
                        <span
                          key={rsvp.eventId}
                          className={`px-2 py-0.5 rounded-sm text-[10px] ${
                            rsvp.attending ? 'bg-green-leaf/10 text-green-leaf' : 'bg-red-50 text-red-400'
                          }`}
                        >
                          {event?.event.name}: {rsvp.attending ? '✓' : '✗'}
                          {rsvp.dietary.length > 0 && ` · ${rsvp.dietary.join(', ')}`}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/admin/guests/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/AccentBar'
import { SiteNav } from '@/components/SiteNav'
import { InviteTable } from '@/components/InviteTable'
import { addInvite, regenerateSlug } from './actions'
import Link from 'next/link'

export default async function AdminGuestsPage() {
  const [invites, events] = await Promise.all([
    prisma.invite.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        guests: {
          include: { rsvps: true },
        },
        events: {
          include: { event: true },
          orderBy: { event: { sortOrder: 'asc' } },
        },
      },
    }),
    prisma.event.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  return (
    <div className="min-h-screen flex flex-col">
      <AccentBar />
      <SiteNav />
      <main className="flex-1 bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl italic text-near-black">Guests</h1>
            <Link
              href="/admin/dashboard"
              className="text-[11px] tracking-[2px] uppercase font-sans text-orange-amber border border-orange-amber px-4 py-1.5"
            >
              Dashboard
            </Link>
          </div>

          {/* Add invite form */}
          <details className="mb-8 border border-orange-soft rounded-sm">
            <summary className="px-4 py-3 cursor-pointer text-sm font-sans text-orange-amber uppercase tracking-[2px]">
              + Add New Invite
            </summary>
            <form action={addInvite} className="px-4 pb-4 space-y-4 border-t border-orange-soft/20 pt-4">
              <div>
                <label className="block text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-1">
                  Label (e.g. "The Naidoo Family")
                </label>
                <input
                  name="label"
                  required
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-sans focus:outline-none focus:border-orange-soft"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-1">
                  Guest names (one per line)
                </label>
                <textarea
                  name="guestNames"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-sans focus:outline-none focus:border-orange-soft"
                  placeholder="Priya Naidoo&#10;Rajan Naidoo"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-2">
                  Invite to events
                </label>
                <div className="flex flex-wrap gap-3">
                  {events.map((event) => (
                    <label key={event.id} className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                      <input type="checkbox" name="eventIds" value={event.id} className="accent-purple-deep" />
                      {event.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[3px] uppercase font-sans text-purple-orchid mb-1">
                  Email (optional)
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-sans focus:outline-none focus:border-orange-soft"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-soft text-white px-6 py-2.5 text-[11px] tracking-[3px] uppercase font-sans hover:bg-orange-amber transition-colors"
              >
                Create Invite
              </button>
            </form>
          </details>

          {/* Invite list */}
          <InviteTable
            invites={invites}
            baseUrl={baseUrl}
            onRegenerate={regenerateSlug}
          />
        </div>
      </main>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 4: Test the admin guests page**

```bash
npm run dev
```

Visit http://localhost:3000/admin, log in, go to http://localhost:3000/admin/guests. Confirm:
- Test invite from seed is listed
- "Copy Link" copies the invite URL to clipboard
- "+" form expands, allows creating a new invite with event checkboxes
- Create a new invite — confirm it appears in the list

- [ ] **Step 5: Commit**

```bash
git add src/components/InviteTable.tsx src/app/admin/guests/
git commit -m "feat: add admin guests page with invite table, add-invite form, and copy-link action"
```

---

## Task 19: Update CLAUDE.md and Deployment Config

**Files:**
- Modify: `CLAUDE.md`
- Create: `vercel.json`

- [ ] **Step 1: Replace `CLAUDE.md`**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start local Postgres
docker-compose up -d

# Install dependencies
npm install

# Sync schema (dev — no migration file)
npx prisma db push

# Create a migration (use when schema changes are production-ready)
npx prisma migrate dev --name <description>

# Seed events and test invite
npx prisma db seed

# Start dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Open Prisma Studio (DB browser)
npx prisma studio
```

## Test invite

After seeding, a test invite is available at:
http://localhost:3000/test-invite-dev1

## Architecture

Next.js 15 App Router. Server Components for data fetching, Server Actions for mutations. No client-side data fetching library.

**Routing:** `/[inviteSlug]` catches invite links and sets a `guestInviteId` cookie on RSVP click. `/rsvp` reads that cookie. Middleware in `src/middleware.ts` protects `/rsvp*` and `/admin*` routes.

**Auth:** Guests are identified by a signed HttpOnly cookie set when they click RSVP on their invite page. Admin uses a bcrypt-hashed passphrase in `ADMIN_PASSPHRASE_HASH` env var.

**Business logic** lives in `src/lib/` and is unit-tested in `src/__tests__/lib/`. Server Actions (`src/app/**/actions.ts`) are thin wrappers that call lib functions.

**Design system:** Tailwind with custom South Indian wedding palette in `tailwind.config.ts`. Shared components in `src/components/`. CSS variables and custom classes in `src/app/globals.css`.

## Environment variables

See `.env.example`. For local dev, copy to `.env.local` and fill in:
- `ADMIN_PASSPHRASE_HASH` — generate with: `node -e "require('bcryptjs').hash('yourpass',10).then(console.log)"`
- `COOKIE_SECRET` — any 32+ character random string for local dev
- `RESEND_API_KEY` — optional for local; email is skipped if unset
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "buildCommand": "prisma migrate deploy && next build",
  "framework": "nextjs"
}
```

- [ ] **Step 3: Run all tests to confirm clean state**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add CLAUDE.md vercel.json
git commit -m "docs: update CLAUDE.md with dev commands and add Vercel build config"
```

---

## Self-Review Checklist

- [x] **Invite flow** — Task 11 covers `/[inviteSlug]` → cookie → redirect to `/rsvp`
- [x] **RSVP per person per event** — GuestCard (Task 13) renders checkboxes per guest per event; `processRsvp` upserts one row per combination
- [x] **Dietary requirements** — GuestCard checkboxes, `Rsvp.dietary String[]`, DIETARY_OPTIONS constant
- [x] **Contact email** — RSVP form email field, stored in `Invite.email` on submit
- [x] **Unique invite codes** — `naidoo-family-x3f2` slug format, Task 6
- [x] **Cookie session** — Tasks 5, 8, 11 cover signing, middleware, and setting
- [x] **Admin passphrase login** — Task 16 with bcrypt
- [x] **Admin dashboard** — Task 17 with per-event counts and dietary totals
- [x] **Admin guest management** — Task 18 with add, copy-link, regenerate-slug
- [x] **Email confirmation** — Task 15 (Resend, graceful skip without key)
- [x] **.ics calendar downloads** — Task 14, inline ICS generation
- [x] **Full address withheld** — only shown on `/rsvp/confirmed`
- [x] **Mobile responsive** — all layouts use Tailwind responsive classes
- [x] **Local dev** — Docker Compose + seed in Tasks 3 & 4
- [x] **Vercel deployment** — Task 19 with `vercel.json` and migrate-on-build
- [x] **DNS note** — covered in design spec (not code, no task needed)
- [x] **Type consistency** — `RsvpData`, `AddInviteData`, `AdminLoginData` defined in `schemas.ts` and used consistently throughout
