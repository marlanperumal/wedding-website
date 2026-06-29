# RSVP Nav Item + Code-Entry Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an RSVP link (with a completion badge) to the site nav, and make `/rsvp` show an invitation-code input when the visitor isn't identified, routing identified guests to the form or their submitted summary, with edits locked after a global deadline.

**Architecture:** `/rsvp` becomes a server-side router: no cookie → render a code-entry client component; identified → branch on a global `isRsvpClosed()` deadline and `Invite.submitted` to either the shared form section or the `/rsvp/confirmed` summary. A new `/rsvp/edit` route reuses the same form section. A server wrapper `SiteNavServer` reads the cookie + submitted status and feeds a new `rsvpStatus` prop into the existing client `SiteNav`.

**Tech Stack:** Next.js 16 App Router (Server Components + Server Actions), Prisma v7, Tailwind v4, Vitest, React 19 `useActionState`.

## Global Constraints

- Guests are identified by their invite **slug** (no schema change); look up `Invite` by `slug`.
- The `guestInviteId` cookie stores the signed invite **id** (not the slug). Cookie options must match `acceptInvite`: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `maxAge: 60 * 60 * 24 * 90`, `path: '/'`.
- Deadline is a single global env var `RSVP_DEADLINE` (ISO 8601 datetime). Unset/invalid ⇒ never closed.
- All data fetching in Server Components; mutations via Server Actions. No client-side data fetching.
- Match the existing visual style: `bg-cream`, `text-near-black`, `text-purple-orchid`, `text-teal-deep`, `orange-soft`, serif italic headings, `font-sans` uppercase tracked labels.
- Prisma client is the singleton from `@/lib/prisma`. Cookie helpers are `signValue` / `extractGuestInviteId` from `@/lib/cookies`.
- Tests use Vitest with `vi.mock('@/lib/prisma', ...)` (see `src/__tests__/lib/rsvp.test.ts`). `environment: 'node'`, `globals: true`.

---

### Task 1: Deadline config (`src/lib/deadline.ts`)

**Files:**
- Create: `src/lib/deadline.ts`
- Test: `src/__tests__/lib/deadline.test.ts`
- Modify: `.env.example`, `CLAUDE.md`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `getRsvpDeadline(): Date | null` — parsed `RSVP_DEADLINE`, or `null` if unset/invalid.
  - `isRsvpClosed(now?: Date): boolean` — `false` when no valid deadline; else `now > deadline`. `now` defaults to `new Date()`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/lib/deadline.test.ts
import { describe, it, expect, afterEach } from 'vitest'
import { getRsvpDeadline, isRsvpClosed } from '@/lib/deadline'

const ORIGINAL = process.env.RSVP_DEADLINE

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.RSVP_DEADLINE
  else process.env.RSVP_DEADLINE = ORIGINAL
})

describe('getRsvpDeadline', () => {
  it('returns null when unset', () => {
    delete process.env.RSVP_DEADLINE
    expect(getRsvpDeadline()).toBeNull()
  })

  it('returns null when malformed', () => {
    process.env.RSVP_DEADLINE = 'not-a-date'
    expect(getRsvpDeadline()).toBeNull()
  })

  it('parses a valid ISO datetime', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(getRsvpDeadline()?.toISOString()).toBe('2026-10-15T21:59:59.000Z')
  })
})

describe('isRsvpClosed', () => {
  it('is open when no deadline configured', () => {
    delete process.env.RSVP_DEADLINE
    expect(isRsvpClosed(new Date('2099-01-01T00:00:00Z'))).toBe(false)
  })

  it('is open before the deadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(isRsvpClosed(new Date('2026-10-01T00:00:00Z'))).toBe(false)
  })

  it('is closed after the deadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(isRsvpClosed(new Date('2026-11-01T00:00:00Z'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/lib/deadline.test.ts`
Expected: FAIL — cannot find module `@/lib/deadline`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/deadline.ts

/** Parsed RSVP_DEADLINE, or null when unset/invalid. */
export function getRsvpDeadline(): Date | null {
  const raw = process.env.RSVP_DEADLINE
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

/** True once the global RSVP deadline has passed. Open when no deadline is set. */
export function isRsvpClosed(now: Date = new Date()): boolean {
  const deadline = getRsvpDeadline()
  if (!deadline) return false
  return now.getTime() > deadline.getTime()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/__tests__/lib/deadline.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Document the env var**

Add to `.env.example` (after the `NEXT_PUBLIC_BASE_URL` line):

```bash

# RSVP edit/submit deadline (ISO 8601). After this, the RSVP form is read-only
# and guests see only their summary. Leave unset locally to keep RSVP always open.
RSVP_DEADLINE="2026-10-15T23:59:59+02:00"
```

In `CLAUDE.md`, under "## Environment Variables", add this bullet after the `SMTP_HOST` bullet:

```markdown
- `RSVP_DEADLINE` — ISO 8601 datetime after which RSVPs become read-only (form hidden, summary only). Unset ⇒ RSVP always open (dev default).
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/deadline.ts src/__tests__/lib/deadline.test.ts .env.example CLAUDE.md
git commit -m "feat: add global RSVP deadline config"
```

---

### Task 2: `enterInviteCode` server action

**Files:**
- Modify: `src/app/rsvp/actions.ts`
- Test: `src/__tests__/app/rsvp-enter.test.ts`

**Interfaces:**
- Consumes: `prisma` (`@/lib/prisma`), `signValue` (`@/lib/cookies`), `cookies` (`next/headers`), `redirect` (`next/navigation`).
- Produces:
  - `type EnterCodeState = { error?: string }`
  - `enterInviteCode(prevState: EnterCodeState, formData: FormData): Promise<EnterCodeState>` — normalizes the `code` field (trim + lowercase), looks up the invite by slug; on miss returns `{ error }` (no cookie set); on hit sets the signed `guestInviteId` cookie and `redirect('/rsvp')`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/app/rsvp-enter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { invite: { findUnique: vi.fn() } },
}))

const cookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: cookieSet, get: vi.fn() })),
}))

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}))

import { prisma } from '@/lib/prisma'
import { enterInviteCode } from '@/app/rsvp/actions'

function fd(code: string) {
  const f = new FormData()
  f.set('code', code)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.COOKIE_SECRET = 'test-secret-please-change-0123456789abcdef'
})

describe('enterInviteCode', () => {
  it('returns an error and sets no cookie when the code is unknown', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    const result = await enterInviteCode({}, fd('nope-1234'))
    expect(result.error).toBeTruthy()
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('normalizes the code (trim + lowercase) before lookup', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await enterInviteCode({}, fd('  Smith-AB12  '))
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: { slug: 'smith-ab12' },
    })
  })

  it('sets the signed cookie and redirects to /rsvp on a hit', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue({ id: 'invite-1' } as any)
    await expect(enterInviteCode({}, fd('smith-ab12'))).rejects.toThrow(
      'NEXT_REDIRECT:/rsvp',
    )
    expect(cookieSet).toHaveBeenCalledWith(
      'guestInviteId',
      expect.stringContaining('invite-1.'),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    )
  })

  it('returns an error for an empty code', async () => {
    const result = await enterInviteCode({}, fd('   '))
    expect(result.error).toBeTruthy()
    expect(prisma.invite.findUnique).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/app/rsvp-enter.test.ts`
Expected: FAIL — `enterInviteCode` is not exported.

- [ ] **Step 3: Write minimal implementation**

Add to the top imports of `src/app/rsvp/actions.ts` (alongside existing imports):

```ts
import { signValue } from '@/lib/cookies'
```

Append to `src/app/rsvp/actions.ts`:

```ts
export type EnterCodeState = { error?: string }

export async function enterInviteCode(
  _prevState: EnterCodeState,
  formData: FormData,
): Promise<EnterCodeState> {
  const code = String(formData.get('code') ?? '')
    .trim()
    .toLowerCase()
  if (!code) {
    return { error: 'Please enter your invitation code.' }
  }

  const invite = await prisma.invite.findUnique({ where: { slug: code } })
  if (!invite) {
    return { error: "We couldn't find an invitation with that code." }
  }

  const signed = await signValue(invite.id, process.env.COOKIE_SECRET!)
  const cookieStore = await cookies()
  cookieStore.set('guestInviteId', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
    path: '/',
  })

  redirect('/rsvp')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/__tests__/app/rsvp-enter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/rsvp/actions.ts src/__tests__/app/rsvp-enter.test.ts
git commit -m "feat: add enterInviteCode action for slug-based RSVP entry"
```

---

### Task 3: `RsvpEntry` code-entry component

**Files:**
- Create: `src/components/rsvp/RsvpEntry.tsx`
- Test: `src/__tests__/components/rsvp-entry.test.tsx`

**Interfaces:**
- Consumes: `enterInviteCode`, `EnterCodeState` (`@/app/rsvp/actions`).
- Produces: `RsvpEntry` (default-styled client component, no props).

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/rsvp-entry.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/app/rsvp/actions', () => ({
  enterInviteCode: vi.fn(),
}))

import { RsvpEntry } from '@/components/rsvp/RsvpEntry'

describe('RsvpEntry', () => {
  it('renders a labelled code input and submit button', () => {
    const html = renderToStaticMarkup(<RsvpEntry />)
    expect(html).toContain('name="code"')
    expect(html.toLowerCase()).toContain('invitation code')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/components/rsvp-entry.test.tsx`
Expected: FAIL — cannot find module `@/components/rsvp/RsvpEntry`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/rsvp/RsvpEntry.tsx
'use client'
import { useActionState } from 'react'
import { enterInviteCode, type EnterCodeState } from '@/app/rsvp/actions'
import { AccentBar } from '@/components/ui'

const initialState: EnterCodeState = {}

export function RsvpEntry() {
  const [state, formAction, pending] = useActionState(enterInviteCode, initialState)

  return (
    <div className="relative">
      <AccentBar />
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-3">
          RSVP
        </p>
        <h1 className="font-serif text-3xl italic text-near-black mb-3">
          Find your invitation
        </h1>
        <p className="font-sans text-sm text-near-black/60 leading-relaxed mb-8">
          Enter the invitation code from your invite link or card to view and
          confirm your RSVP.
        </p>

        <form action={formAction} className="text-left">
          <label
            htmlFor="rsvp-code"
            className="block text-[10px] tracking-[3px] text-teal-deep uppercase font-sans mb-2"
          >
            Invitation code
          </label>
          <input
            id="rsvp-code"
            name="code"
            type="text"
            required
            autoComplete="off"
            placeholder="e.g. smith-family-ab12"
            className="w-full border border-near-black/20 px-3.5 py-2.5 text-sm font-sans bg-white outline-none focus:border-orange-soft"
          />

          {state.error && (
            <p className="mt-3 text-sm font-sans text-red-700" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full bg-orange-soft text-white py-4 text-xs tracking-[3px] uppercase font-sans disabled:opacity-60"
          >
            {pending ? 'Looking…' : 'Continue'}
          </button>
        </form>
      </div>
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/__tests__/components/rsvp-entry.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/rsvp/RsvpEntry.tsx src/__tests__/components/rsvp-entry.test.tsx
git commit -m "feat: add RsvpEntry code-entry component"
```

---

### Task 4: `RsvpFormSection` shared server helper

**Files:**
- Create: `src/components/rsvp/RsvpFormSection.tsx`

**Interfaces:**
- Consumes: `prisma`, `redirect`, `RsvpForm`, `AccentBar`.
- Produces: `async function RsvpFormSection({ inviteId }: { inviteId: string }): Promise<JSX.Element>` — loads the invite + existing RSVPs, renders the greeting header + `<RsvpForm>`. Redirects to `/rsvp` if the invite no longer exists.

This extracts the body currently inline in `src/app/rsvp/page.tsx` so `/rsvp` and `/rsvp/edit` share one implementation (DRY).

- [ ] **Step 1: Create the component**

```tsx
// src/components/rsvp/RsvpFormSection.tsx
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/ui'
import { RsvpForm } from '@/components/rsvp/RsvpForm'

export async function RsvpFormSection({ inviteId }: { inviteId: string }) {
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: true,
      events: { include: { event: true } },
    },
  })

  if (!invite) redirect('/rsvp')

  const events = invite.events
    .map((ie) => ie.event)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const existingRsvps = await prisma.rsvp.findMany({
    where: { guestId: { in: invite.guests.map((g) => g.id) } },
  })

  const guestNames = invite.guests.map((g) => g.name)
  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(', ') + ' & ' + guestNames.at(-1)

  return (
    <div className="relative">
      <AccentBar />
      <div className="text-center py-12 px-6">
        <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-3">
          You are invited
        </p>
        <h1 className="font-serif text-4xl italic text-near-black mb-2">
          Marlan &amp; Tramaine
        </h1>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-orange-soft" />
          <span className="text-orange-soft text-sm">✦</span>
          <div className="h-px w-10 bg-orange-soft" />
        </div>
        <p className="font-serif text-2xl italic text-near-black/80">Dear {greeting}</p>
      </div>

      <RsvpForm
        guests={invite.guests}
        events={events}
        existingRsvps={existingRsvps.map((r) => ({
          ...r,
          dietaryNotes: r.dietaryNotes ?? null,
        }))}
        initialEmail={invite.email ?? ''}
      />
      <AccentBar />
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/rsvp/RsvpFormSection.tsx
git commit -m "refactor: extract RsvpFormSection shared server helper"
```

---

### Task 5: `/rsvp` becomes a router

**Files:**
- Modify: `src/app/rsvp/page.tsx` (replace entire file)

**Interfaces:**
- Consumes: `extractGuestInviteId`, `prisma`, `isRsvpClosed`, `RsvpEntry`, `RsvpFormSection`.
- Produces: the new routing behaviour for `/rsvp`.

- [ ] **Step 1: Replace the page**

```tsx
// src/app/rsvp/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { isRsvpClosed } from '@/lib/deadline'
import { RsvpEntry } from '@/components/rsvp/RsvpEntry'
import { RsvpFormSection } from '@/components/rsvp/RsvpFormSection'

export default async function RsvpPage() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  // Not identified — show the code-entry input instead of redirecting away.
  if (!inviteId) return <RsvpEntry />

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    select: { submitted: true },
  })

  // Stale cookie (invite removed) — fall back to code entry.
  if (!invite) return <RsvpEntry />

  // After the deadline, or already submitted: send to the read-only summary.
  if (isRsvpClosed() || invite.submitted) redirect('/rsvp/confirmed')

  return <RsvpFormSection inviteId={inviteId} />
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification**

With the dev DB seeded (`pnpm prisma db seed`) and `pnpm dev` running:
- Visit `/rsvp` in a fresh/incognito window (no cookie) → the **code-entry** screen appears.
- Enter `test-invite-dev1` → redirected to the RSVP **form** (invite not yet submitted).
- Enter a bogus code → inline error, no navigation.

Expected: all three behave as described.

- [ ] **Step 4: Commit**

```bash
git add src/app/rsvp/page.tsx
git commit -m "feat: route /rsvp to code-entry, form, or summary"
```

---

### Task 6: `/rsvp/edit` route

**Files:**
- Create: `src/app/rsvp/edit/page.tsx`

**Interfaces:**
- Consumes: `extractGuestInviteId`, `isRsvpClosed`, `RsvpFormSection`.
- Produces: the editable form for an already-submitted guest, gated by the deadline.

- [ ] **Step 1: Create the route**

```tsx
// src/app/rsvp/edit/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { isRsvpClosed } from '@/lib/deadline'
import { RsvpFormSection } from '@/components/rsvp/RsvpFormSection'

export default async function RsvpEditPage() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  // Not identified — send to the entry input.
  if (!inviteId) redirect('/rsvp')

  // No editing after the deadline.
  if (isRsvpClosed()) redirect('/rsvp/confirmed')

  return <RsvpFormSection inviteId={inviteId} />
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/rsvp/edit/page.tsx
git commit -m "feat: add /rsvp/edit route for re-editing a submitted RSVP"
```

---

### Task 7: Summary page — edit link, closed state, redirect target

**Files:**
- Modify: `src/app/rsvp/confirmed/page.tsx`

**Interfaces:**
- Consumes: `isRsvpClosed`.
- Produces: an "Edit my RSVP" link (hidden after deadline), a closed/no-response empty state, and `/rsvp` as the no-cookie redirect.

- [ ] **Step 1: Update imports and data load**

In `src/app/rsvp/confirmed/page.tsx`, add the deadline import after the existing imports:

```ts
import { isRsvpClosed } from '@/lib/deadline'
```

Change the no-cookie redirect (line ~10) from `/` to `/rsvp`:

```ts
  if (!inviteId) redirect('/rsvp')
```

Change the invite-not-found redirect (line ~16) likewise:

```ts
  if (!invite) redirect('/rsvp')
```

Include `submitted` on the invite query so we can detect "no response on record":

```ts
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    select: { id: true, submitted: true, guests: true },
  })
  if (!invite) redirect('/rsvp')

  const closed = isRsvpClosed()
```

- [ ] **Step 2: Add the Edit link and closed empty-state**

Replace the existing `attendedEvents.length === 0` block (the "won't be attending" paragraph) with branching that distinguishes "declined" from "no response", and add an Edit link below the intro paragraph.

After the intro paragraph (the `<p>` ending "We look forward to celebrating with you.") insert:

```tsx
        {!closed && (
          <p className="mb-12 -mt-8">
            <a
              href="/rsvp/edit"
              className="text-xs tracking-[2px] uppercase font-sans text-teal-deep underline underline-offset-4"
            >
              Edit my RSVP
            </a>
          </p>
        )}
```

Replace the existing empty-state block:

```tsx
        {attendedEvents.length === 0 && (
          <p className="font-sans text-sm text-near-black/60 italic">
            You have indicated that you won&apos;t be attending. We&apos;ll miss you!
          </p>
        )}
```

with:

```tsx
        {attendedEvents.length === 0 && invite.submitted && (
          <p className="font-sans text-sm text-near-black/60 italic">
            You have indicated that you won&apos;t be attending. We&apos;ll miss you!
          </p>
        )}

        {attendedEvents.length === 0 && !invite.submitted && (
          <p className="font-sans text-sm text-near-black/60 italic">
            {closed
              ? "RSVP is now closed and we don't have a response on record for you."
              : 'We don’t have an RSVP from you yet.'}
          </p>
        )}
```

Note: keep the existing `attendingRsvps` / `eventMap` / `grouped` logic unchanged; only the invite query `select` and the two blocks above change.

- [ ] **Step 3: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors. (If TS complains that `guests` is missing from the `select`, confirm `guests: true` is present — it is required by the `attendingRsvps` query.)

- [ ] **Step 4: Manual verification**

With dev running and `test-invite-dev1` submitted (complete an RSVP first):
- Visit `/rsvp` → redirected to `/rsvp/confirmed`, summary shows attended events and an **Edit my RSVP** link.
- Click **Edit my RSVP** → the pre-filled form (`/rsvp/edit`) loads.
- Set `RSVP_DEADLINE` to a past datetime in `.env.local`, restart dev → `/rsvp/edit` redirects to `/rsvp/confirmed` and the Edit link is gone.

Expected: as described.

- [ ] **Step 5: Commit**

```bash
git add src/app/rsvp/confirmed/page.tsx
git commit -m "feat: add edit link + closed state to RSVP summary"
```

---

### Task 8: `SiteNav` — RSVP link + status badge

**Files:**
- Modify: `src/components/ui/SiteNav.tsx`
- Modify: `src/__tests__/components/ui.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `SiteNav` now accepts `{ rsvpStatus?: 'none' | 'pending' | 'submitted' }` (default `'none'`), renders an `/rsvp` link in both desktop and mobile menus, and shows a `✓` badge on the RSVP link when `rsvpStatus === 'submitted'`.

- [ ] **Step 1: Write the failing test**

Replace the `SiteNav` describe block in `src/__tests__/components/ui.test.tsx` with:

```tsx
describe('SiteNav', () => {
  it('renders the couple name wordmark', () => {
    const html = renderToStaticMarkup(<SiteNav />)
    expect(html).toContain('Liedeman')
    expect(html).toContain('Perumal')
  })

  it('renders an RSVP link', () => {
    const html = renderToStaticMarkup(<SiteNav />)
    expect(html).toContain('href="/rsvp"')
    expect(html).toContain('RSVP')
  })

  it('shows a completion badge when rsvpStatus is submitted', () => {
    const html = renderToStaticMarkup(<SiteNav rsvpStatus="submitted" />)
    expect(html).toContain('✓')
  })

  it('shows no completion badge when rsvpStatus is none', () => {
    const html = renderToStaticMarkup(<SiteNav rsvpStatus="none" />)
    expect(html).not.toContain('✓')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/components/ui.test.tsx`
Expected: FAIL — no `/rsvp` link / no `✓` / `rsvpStatus` prop unknown.

- [ ] **Step 3: Implement the prop, link, and badge**

In `src/components/ui/SiteNav.tsx`:

Add `"/rsvp"` to `navLinks` (append after FAQs):

```ts
const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/venue", label: "Venue" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/attire", label: "Attire" },
  { href: "/faqs", label: "FAQs" },
  { href: "/rsvp", label: "RSVP" },
];
```

Change the signature and add a badge helper:

```tsx
type RsvpStatus = 'none' | 'pending' | 'submitted'

export function SiteNav({ rsvpStatus = 'none' }: { rsvpStatus?: RsvpStatus }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function badge(href: string) {
    if (href !== '/rsvp' || rsvpStatus !== 'submitted') return null;
    return (
      <span
        aria-label="RSVP complete"
        className="ml-1.5 text-teal-deep"
      >
        ✓
      </span>
    );
  }
```

In the **desktop** links `<Link>…{link.label}</Link>`, render the badge after the label:

```tsx
              >
                {link.label}
                {badge(link.href)}
              </Link>
```

In the **mobile** menu `<Link>…{link.label}</Link>`, do the same:

```tsx
              >
                {link.label}
                {badge(link.href)}
              </Link>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/__tests__/components/ui.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/SiteNav.tsx src/__tests__/components/ui.test.tsx
git commit -m "feat: add RSVP nav link with completion badge"
```

---

### Task 9: `SiteNavServer` wrapper + layout wiring

**Files:**
- Create: `src/components/ui/SiteNavServer.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `cookies`, `extractGuestInviteId`, `prisma`, `SiteNav`.
- Produces: `async function SiteNavServer(): Promise<JSX.Element>` — derives `rsvpStatus` from the cookie + `Invite.submitted` and renders `<SiteNav rsvpStatus={…} />`. Exported from `@/components/ui`.

- [ ] **Step 1: Create the server wrapper**

```tsx
// src/components/ui/SiteNavServer.tsx
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { SiteNav } from './SiteNav'

export async function SiteNavServer() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  let rsvpStatus: 'none' | 'pending' | 'submitted' = 'none'
  if (inviteId) {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      select: { submitted: true },
    })
    if (invite) rsvpStatus = invite.submitted ? 'submitted' : 'pending'
  }

  return <SiteNav rsvpStatus={rsvpStatus} />
}
```

- [ ] **Step 2: Export it**

In `src/components/ui/index.ts`, add:

```ts
export { SiteNavServer } from './SiteNavServer'
```

- [ ] **Step 3: Wire it into the layout**

In `src/app/layout.tsx`, change the import and usage:

```tsx
import { SiteNavServer } from "@/components/ui";
```

```tsx
      <body className="bg-cream text-near-black antialiased">
        <SiteNavServer />
        <main>{children}</main>
      </body>
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `pnpm tsc --noEmit`
Expected: no errors.

Run: `pnpm test`
Expected: all tests PASS.

- [ ] **Step 5: Manual verification**

With dev running:
- Fresh window (no cookie) → nav shows a plain **RSVP** link, no badge.
- After submitting `test-invite-dev1` → nav shows **RSVP ✓**.

Expected: badge appears only after submission.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/SiteNavServer.tsx src/components/ui/index.ts src/app/layout.tsx
git commit -m "feat: render RSVP nav status via SiteNavServer wrapper"
```

---

### Task 10: `proxy.ts` cleanup + middleware test

**Files:**
- Modify: `src/proxy.ts`
- Modify: `src/__tests__/middleware.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `/rsvp` (entry) and `/rsvp/confirmed` are no longer redirected by the proxy on missing cookie; page-level redirects remain the guard. Admin protection unchanged. The matcher narrows to `/rsvp/edit/:path*` (the only path that should bounce a cookieless visitor at the edge; `/rsvp` must stay public).

Rationale: page-level logic already routes cookieless visitors correctly (`/rsvp` → entry, `/rsvp/confirmed` → `/rsvp`, `/rsvp/edit` → `/rsvp`). The proxy is currently inert (no root `middleware.ts`), so this change keeps it correct for if/when it is wired up, without ever blocking the public entry page.

- [ ] **Step 1: Update the failing test first**

Replace the three `/rsvp` matcher assertions in `src/__tests__/middleware.test.ts` with edit-scoped expectations, and add a guard that bare `/rsvp` is NOT in the matcher:

```ts
  it('matcher includes /rsvp/edit/:path*', () => {
    expect(config.matcher).toContain('/rsvp/edit/:path*')
  })

  it('does not gate the public /rsvp entry page', () => {
    expect(config.matcher).not.toContain('/rsvp/:path*')
  })
```

(Delete the old `it('matcher includes /rsvp/:path*', …)` test.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/middleware.test.ts`
Expected: FAIL — matcher still contains `/rsvp/:path*`, not `/rsvp/edit/:path*`.

- [ ] **Step 3: Update the proxy**

```ts
// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/rsvp/edit')) {
    if (!request.cookies.has('guestInviteId')) {
      return NextResponse.redirect(new URL('/rsvp', request.url))
    }
  }

  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/guests')) {
    if (!request.cookies.has('adminSession')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rsvp/edit/:path*', '/admin/dashboard/:path*', '/admin/guests/:path*'],
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/__tests__/middleware.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/proxy.ts src/__tests__/middleware.test.ts
git commit -m "refactor: keep /rsvp entry public, gate only /rsvp/edit in proxy"
```

---

### Task 11: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `pnpm test`
Expected: all tests PASS (including the new deadline, enter-code, RsvpEntry, ui, and middleware tests).

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `pnpm build`
Expected: build succeeds. (Note: `/rsvp`, `/rsvp/edit`, `/rsvp/confirmed`, and all pages render dynamically now because the root layout reads cookies — this is expected.)

- [ ] **Step 4: End-to-end manual walk-through**

With `pnpm dev` and a seeded DB, in an incognito window:
1. `/rsvp` (no cookie) → code-entry screen; nav shows plain **RSVP**.
2. Enter `test-invite-dev1` → RSVP form.
3. Submit → `/rsvp/confirmed` summary with **Edit my RSVP**; nav shows **RSVP ✓**.
4. `/rsvp` again → redirects to `/rsvp/confirmed` (already submitted).
5. **Edit my RSVP** → `/rsvp/edit` pre-filled form; change something, resubmit.
6. Set `RSVP_DEADLINE` to a past time, restart → `/rsvp` and `/rsvp/edit` both land on `/rsvp/confirmed`; Edit link gone.

Expected: every step behaves as described.

- [ ] **Step 5: Final commit (if any verification fixups were needed)**

```bash
git add -A
git commit -m "chore: verification fixups for RSVP nav + code entry"
```

---

## Notes for the implementer

- **`useActionState` arity:** `enterInviteCode(prevState, formData)` — the action signature must keep `prevState` first even though it's unused, or `useActionState` will pass `formData` into the wrong slot.
- **Redirect in actions throws:** `redirect()` works by throwing `NEXT_REDIRECT`; never wrap the cookie-set + redirect in a `try/catch` that swallows it.
- **Dynamic rendering:** reading `cookies()` in the root layout (via `SiteNavServer`) makes all pages dynamic. This is intended and acceptable for this DB-driven site; do not try to "fix" it by moving the cookie read out of the layout.
- **Slug normalization:** invite slugs are generated lowercase with a hex suffix (`labelToSlugBase` + `randomSuffix`), so `trim().toLowerCase()` on input is the correct and sufficient normalization.
