# Edit Invites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin edit an existing invite — change label/email, add/remove/rename guests, toggle assigned events, regenerate the share link, and delete the invite — via a dedicated edit page at `/admin/guests/[inviteId]`.

**Architecture:** Business logic lives in a new testable `src/lib/invites.ts` module (mirroring `src/lib/rsvp.ts`), unit-tested with a mocked Prisma singleton. Thin Server Actions in the route folder do auth + parse + delegate + `revalidatePath`. Destructive interactions (remove guest, unassign event with RSVPs, regenerate link, delete invite) use small client components with `confirm()` (mirroring the existing `CopyLinkButton` pattern). No Prisma schema changes.

**Tech Stack:** Next.js 16 App Router (Server Components + Server Actions), Prisma v7, Zod, Vitest, Tailwind v4.

## Global Constraints

- Work directly on `master`; commit frequently (project workflow — no feature branches).
- Slug is **stable**: editing the label must NOT change the slug. Slug changes only via the explicit `regenerateSlug` action.
- Events = per-invite assignment (toggling `InviteEvent` rows), NOT a global event catalog.
- Warn-then-delete: removing a guest or unassigning an event that has RSVP responses must `confirm()` with the affected count before deleting.
- Every Server Action re-verifies admin auth via `extractAdminSession(cookieStore.get('adminSession')?.value)` and `redirect('/admin')` if not authed.
- Run `just typecheck`, `just test`, and `just build` before declaring done — `build` catches RSC client/server boundary leaks that the others miss.
- Follow existing style: `bg-paper-card` gold-bordered blocks, `font-label` uppercase tracked headers, `font-serif` body. Reuse the field-style constants from `src/app/admin/guests/page.tsx`.

---

### Task 1: `UpdateInviteSchema` validation

**Files:**
- Modify: `src/lib/schemas.ts` (append after `AddInviteSchema`)
- Test: `src/__tests__/lib/schemas.test.ts` (append a new `describe`)

**Interfaces:**
- Produces: `UpdateInviteSchema` — `z.object({ label: string(1..100), email: email | '' | undefined })`. Consumed by the `updateInviteDetailsAction` in Task 4.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/lib/schemas.test.ts`. Also add `UpdateInviteSchema` to the import on line 2.

```ts
describe('UpdateInviteSchema', () => {
  const valid = { label: 'The Naidoo Family' }

  it('accepts a valid label without email', () => {
    expect(UpdateInviteSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a valid label with email', () => {
    expect(
      UpdateInviteSchema.safeParse({ ...valid, email: 'priya@example.com' }).success,
    ).toBe(true)
  })

  it('accepts an empty string email (treat as absent)', () => {
    expect(UpdateInviteSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(UpdateInviteSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('rejects an empty label', () => {
    expect(UpdateInviteSchema.safeParse({ label: '' }).success).toBe(false)
  })
})
```

Update the import line to:

```ts
import { RsvpSchema, AdminLoginSchema, AddInviteSchema, UpdateInviteSchema, DIETARY_OPTIONS } from '@/lib/schemas'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/lib/schemas.test.ts`
Expected: FAIL — `UpdateInviteSchema` is `undefined` / not exported.

- [ ] **Step 3: Add the schema**

Append to `src/lib/schemas.ts`:

```ts
export const UpdateInviteSchema = z.object({
  label: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/__tests__/lib/schemas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas.ts src/__tests__/lib/schemas.test.ts
git commit -m "feat: add UpdateInviteSchema for editing invites"
```

---

### Task 2: `src/lib/invites.ts` — simple mutations

**Files:**
- Create: `src/lib/invites.ts`
- Test: `src/__tests__/lib/invites.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`; `generateInviteSlug` from `@/lib/slugs`.
- Produces (all consumed by Task 4 actions):
  - `updateInviteDetails(inviteId: string, data: { label: string; email: string | null }): Promise<Invite>`
  - `addGuest(inviteId: string, name: string): Promise<Guest>`
  - `removeGuest(guestId: string): Promise<Guest>`
  - `renameGuest(guestId: string, name: string): Promise<Guest>`
  - `regenerateSlug(inviteId: string): Promise<Invite>` — throws `'Invite not found'` if missing
  - `deleteInvite(inviteId: string): Promise<Invite>`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/invites.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invite: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    guest: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    inviteEvent: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    rsvp: {
      deleteMany: vi.fn(),
      groupBy: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
import {
  updateInviteDetails,
  addGuest,
  removeGuest,
  renameGuest,
  regenerateSlug,
  deleteInvite,
} from '@/lib/invites'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.invite.update).mockResolvedValue({} as any)
  vi.mocked(prisma.invite.delete).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.create).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.update).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.delete).mockResolvedValue({} as any)
  vi.mocked(prisma.$transaction).mockResolvedValue([] as any)
})

describe('updateInviteDetails', () => {
  it('updates label and email without touching the slug', async () => {
    await updateInviteDetails('invite-1', { label: 'New Label', email: 'a@b.com' })
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { label: 'New Label', email: 'a@b.com' },
    })
    const call = vi.mocked(prisma.invite.update).mock.calls[0][0] as any
    expect(call.data).not.toHaveProperty('slug')
  })

  it('persists a null email', async () => {
    await updateInviteDetails('invite-1', { label: 'X', email: null })
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { label: 'X', email: null },
    })
  })
})

describe('addGuest', () => {
  it('creates a guest on the invite', async () => {
    await addGuest('invite-1', 'Priya')
    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: { inviteId: 'invite-1', name: 'Priya' },
    })
  })
})

describe('removeGuest', () => {
  it('deletes the guest (RSVPs cascade via schema)', async () => {
    await removeGuest('guest-1')
    expect(prisma.guest.delete).toHaveBeenCalledWith({ where: { id: 'guest-1' } })
  })
})

describe('renameGuest', () => {
  it('updates the guest name', async () => {
    await renameGuest('guest-1', 'Priya Naidoo')
    expect(prisma.guest.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: { name: 'Priya Naidoo' },
    })
  })
})

describe('regenerateSlug', () => {
  it('sets a new slug derived from the label, different from the old one', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: 'invite-1',
      label: 'The Naidoo Family',
      slug: 'the-naidoo-family-aaaa',
    } as any)
    await regenerateSlug('invite-1')
    const call = vi.mocked(prisma.invite.update).mock.calls[0][0] as any
    expect(call.where).toEqual({ id: 'invite-1' })
    expect(call.data.slug).toMatch(/^the-naidoo-family-[0-9a-f]{4}$/)
    expect(call.data.slug).not.toBe('the-naidoo-family-aaaa')
  })

  it('throws if the invite is not found', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await expect(regenerateSlug('bad')).rejects.toThrow('Invite not found')
  })
})

describe('deleteInvite', () => {
  it('deletes the invite (guests/links/rsvps cascade via schema)', async () => {
    await deleteInvite('invite-1')
    expect(prisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'invite-1' } })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/lib/invites.test.ts`
Expected: FAIL — cannot resolve `@/lib/invites`.

- [ ] **Step 3: Create the module**

Create `src/lib/invites.ts`:

```ts
import { prisma } from '@/lib/prisma'
import { generateInviteSlug } from '@/lib/slugs'

export async function updateInviteDetails(
  inviteId: string,
  data: { label: string; email: string | null },
) {
  return prisma.invite.update({
    where: { id: inviteId },
    data: { label: data.label, email: data.email },
  })
}

export async function addGuest(inviteId: string, name: string) {
  return prisma.guest.create({ data: { inviteId, name } })
}

export async function removeGuest(guestId: string) {
  return prisma.guest.delete({ where: { id: guestId } })
}

export async function renameGuest(guestId: string, name: string) {
  return prisma.guest.update({ where: { id: guestId }, data: { name } })
}

export async function regenerateSlug(inviteId: string) {
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } })
  if (!invite) throw new Error('Invite not found')
  return prisma.invite.update({
    where: { id: inviteId },
    data: { slug: generateInviteSlug(invite.label) },
  })
}

export async function deleteInvite(inviteId: string) {
  return prisma.invite.delete({ where: { id: inviteId } })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/__tests__/lib/invites.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/invites.ts src/__tests__/lib/invites.test.ts
git commit -m "feat: invite edit mutations (details, guests, slug, delete)"
```

---

### Task 3: `updateInviteEvents` + edit-page loaders

**Files:**
- Modify: `src/lib/invites.ts`
- Test: `src/__tests__/lib/invites.test.ts` (append)

**Interfaces:**
- Produces:
  - `updateInviteEvents(inviteId: string, eventIds: string[]): Promise<void>` — reconciles `InviteEvent` rows; deletes orphaned `Rsvp` rows for removed events belonging to this invite's guests, all in one `$transaction`. Consumed by Task 4.
  - `getInviteForEdit(inviteId: string)` — returns the invite with `guests` (each including `_count.rsvps`) and `events` (`{ eventId }[]`), or `null`. Consumed by Task 6.
  - `getEventRsvpCounts(inviteId: string): Promise<Record<string, number>>` — map of eventId → RSVP count among this invite's guests. Consumed by Task 6.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/lib/invites.test.ts` and add `updateInviteEvents` to the import from `@/lib/invites`:

```ts
describe('updateInviteEvents', () => {
  beforeEach(() => {
    vi.mocked(prisma.inviteEvent.findMany).mockResolvedValue([
      { eventId: 'e1' },
      { eventId: 'e2' },
    ] as any)
    vi.mocked(prisma.rsvp.deleteMany).mockReturnValue({} as any)
    vi.mocked(prisma.inviteEvent.deleteMany).mockReturnValue({} as any)
    vi.mocked(prisma.inviteEvent.createMany).mockReturnValue({} as any)
  })

  it('adds newly-checked events and removes unchecked ones', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])

    expect(prisma.inviteEvent.deleteMany).toHaveBeenCalledWith({
      where: { inviteId: 'invite-1', eventId: { in: ['e1'] } },
    })
    expect(prisma.inviteEvent.createMany).toHaveBeenCalledWith({
      data: [{ inviteId: 'invite-1', eventId: 'e3' }],
    })
  })

  it('deletes orphaned RSVPs only for removed events and only for this invite', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])

    expect(prisma.rsvp.deleteMany).toHaveBeenCalledWith({
      where: { eventId: { in: ['e1'] }, guest: { inviteId: 'invite-1' } },
    })
  })

  it('wraps the writes in a single transaction', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/lib/invites.test.ts`
Expected: FAIL — `updateInviteEvents` is not exported.

- [ ] **Step 3: Implement**

Append to `src/lib/invites.ts`:

```ts
export async function updateInviteEvents(inviteId: string, eventIds: string[]) {
  const current = await prisma.inviteEvent.findMany({
    where: { inviteId },
    select: { eventId: true },
  })
  const currentIds = new Set(current.map((e) => e.eventId))
  const nextIds = new Set(eventIds)

  const toAdd = eventIds.filter((id) => !currentIds.has(id))
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id))

  await prisma.$transaction([
    prisma.rsvp.deleteMany({
      where: { eventId: { in: toRemove }, guest: { inviteId } },
    }),
    prisma.inviteEvent.deleteMany({
      where: { inviteId, eventId: { in: toRemove } },
    }),
    prisma.inviteEvent.createMany({
      data: toAdd.map((eventId) => ({ inviteId, eventId })),
    }),
  ])
}

export async function getInviteForEdit(inviteId: string) {
  return prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { rsvps: true } } },
      },
      events: { select: { eventId: true } },
    },
  })
}

export async function getEventRsvpCounts(
  inviteId: string,
): Promise<Record<string, number>> {
  const rows = await prisma.rsvp.groupBy({
    by: ['eventId'],
    where: { guest: { inviteId } },
    _count: { _all: true },
  })
  return Object.fromEntries(rows.map((r) => [r.eventId, r._count._all]))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/__tests__/lib/invites.test.ts`
Expected: PASS (all `updateInviteEvents` cases green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/invites.ts src/__tests__/lib/invites.test.ts
git commit -m "feat: reconcile invite events + edit-page loaders"
```

---

### Task 4: Thin Server Actions

**Files:**
- Create: `src/app/admin/guests/[inviteId]/actions.ts`

**Interfaces:**
- Consumes: everything from `@/lib/invites`; `UpdateInviteSchema` from `@/lib/schemas`; `extractAdminSession` from `@/lib/cookies`.
- Produces (consumed by Tasks 5 & 6):
  - `updateInviteDetailsAction(inviteId: string, formData: FormData): Promise<void>`
  - `addGuestAction(inviteId: string, formData: FormData): Promise<void>`
  - `renameGuestAction(inviteId: string, guestId: string, formData: FormData): Promise<void>`
  - `removeGuestAction(inviteId: string, guestId: string): Promise<void>`
  - `updateInviteEventsAction(inviteId: string, formData: FormData): Promise<void>`
  - `regenerateSlugAction(inviteId: string): Promise<void>`
  - `deleteInviteAction(inviteId: string): Promise<void>` — redirects to `/admin/guests`

This task has no unit test (the existing `addInvite` action is likewise untested; logic is covered in Tasks 1-3). Verified via `just typecheck` and manual run in Task 7.

- [ ] **Step 1: Create the actions file**

Create `src/app/admin/guests/[inviteId]/actions.ts`:

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { UpdateInviteSchema } from '@/lib/schemas'
import * as invites from '@/lib/invites'

async function requireAdmin() {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')
}

function revalidate(inviteId: string) {
  revalidatePath(`/admin/guests/${inviteId}`)
  revalidatePath('/admin/guests')
}

export async function updateInviteDetailsAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const parsed = UpdateInviteSchema.safeParse({
    label: formData.get('label'),
    email: formData.get('email') || undefined,
  })
  if (!parsed.success) {
    console.error('updateInviteDetails validation error:', parsed.error.flatten())
    return
  }
  await invites.updateInviteDetails(inviteId, {
    label: parsed.data.label,
    email: parsed.data.email || null,
  })
  revalidate(inviteId)
}

export async function addGuestAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const name = ((formData.get('name') as string) ?? '').trim()
  if (!name) return
  await invites.addGuest(inviteId, name)
  revalidate(inviteId)
}

export async function renameGuestAction(
  inviteId: string,
  guestId: string,
  formData: FormData,
) {
  await requireAdmin()
  const name = ((formData.get('name') as string) ?? '').trim()
  if (!name) return
  await invites.renameGuest(guestId, name)
  revalidate(inviteId)
}

export async function removeGuestAction(inviteId: string, guestId: string) {
  await requireAdmin()
  await invites.removeGuest(guestId)
  revalidate(inviteId)
}

export async function updateInviteEventsAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const eventIds = formData.getAll('eventIds').map(String)
  await invites.updateInviteEvents(inviteId, eventIds)
  revalidate(inviteId)
}

export async function regenerateSlugAction(inviteId: string) {
  await requireAdmin()
  await invites.regenerateSlug(inviteId)
  revalidate(inviteId)
}

export async function deleteInviteAction(inviteId: string) {
  await requireAdmin()
  await invites.deleteInvite(inviteId)
  redirect('/admin/guests')
}
```

- [ ] **Step 2: Typecheck**

Run: `just typecheck`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/guests/\[inviteId\]/actions.ts
git commit -m "feat: server actions for editing an invite"
```

---

### Task 5: Client confirm components

**Files:**
- Create: `src/components/admin/RemoveGuestButton.tsx`
- Create: `src/components/admin/InviteEventsForm.tsx`
- Create: `src/components/admin/RegenerateLinkButton.tsx`
- Create: `src/components/admin/DeleteInviteButton.tsx`

**Interfaces:**
- Consumes: the actions from Task 4.
- Produces (consumed by Task 6):
  - `<RemoveGuestButton inviteId guestId guestName rsvpCount />`
  - `<InviteEventsForm inviteId events={{ id, name, assigned, rsvpCount }[]} />`
  - `<RegenerateLinkButton inviteId />`
  - `<DeleteInviteButton inviteId label guestCount rsvpCount />`

- [ ] **Step 1: Create `RemoveGuestButton`**

Create `src/components/admin/RemoveGuestButton.tsx`:

```tsx
'use client'
import { removeGuestAction } from '@/app/admin/guests/[inviteId]/actions'

interface Props {
  inviteId: string
  guestId: string
  guestName: string
  rsvpCount: number
}

export function RemoveGuestButton({ inviteId, guestId, guestName, rsvpCount }: Props) {
  async function handleClick() {
    const suffix =
      rsvpCount > 0
        ? ` This will also delete ${rsvpCount} RSVP response${rsvpCount === 1 ? '' : 's'} for this guest.`
        : ''
    if (!confirm(`Remove ${guestName}?${suffix}`)) return
    await removeGuestAction(inviteId, guestId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Remove ${guestName}`}
      className="font-label text-[13px] text-acc-rust hover:opacity-70"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
    >
      ✕
    </button>
  )
}
```

- [ ] **Step 2: Create `InviteEventsForm`**

Create `src/components/admin/InviteEventsForm.tsx`:

```tsx
'use client'
import type { FormEvent } from 'react'
import { updateInviteEventsAction } from '@/app/admin/guests/[inviteId]/actions'

interface EventOption {
  id: string
  name: string
  assigned: boolean
  rsvpCount: number
}

interface Props {
  inviteId: string
  events: EventOption[]
}

export function InviteEventsForm({ inviteId, events }: Props) {
  const action = updateInviteEventsAction.bind(null, inviteId)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const checked = new Set(
      Array.from(
        e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="eventIds"]:checked'),
      ).map((i) => i.value),
    )
    const losing = events.filter((ev) => ev.assigned && !checked.has(ev.id) && ev.rsvpCount > 0)
    if (losing.length === 0) return
    const total = losing.reduce((n, ev) => n + ev.rsvpCount, 0)
    const names = losing.map((ev) => ev.name).join(', ')
    if (
      !confirm(
        `Unassigning ${names} will delete ${total} RSVP response${total === 1 ? '' : 's'}. Continue?`,
      )
    ) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-5">
        {events.map((ev) => (
          <label
            key={ev.id}
            className="flex items-center gap-2 font-serif text-[17px] text-ink-soft cursor-pointer"
          >
            <input
              type="checkbox"
              name="eventIds"
              value={ev.id}
              defaultChecked={ev.assigned}
              className="w-[15px] h-[15px] accent-[#7c5c14]"
            />
            {ev.name}
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="font-label text-[11px] tracking-[.2em] text-paper-raised bg-gold-deep transition-colors hover:bg-[#6a4e10]"
        style={{ padding: '12px 28px', border: 'none' }}
      >
        SAVE EVENTS
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create `RegenerateLinkButton`**

Create `src/components/admin/RegenerateLinkButton.tsx`:

```tsx
'use client'
import { regenerateSlugAction } from '@/app/admin/guests/[inviteId]/actions'

export function RegenerateLinkButton({ inviteId }: { inviteId: string }) {
  async function handleClick() {
    if (!confirm('Regenerate the share link? The old link will stop working.')) return
    await regenerateSlugAction(inviteId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-label text-[11px] tracking-[.2em] text-acc-teal-deep hover:opacity-70"
      style={{ background: 'none', border: '1px solid rgba(46,125,122,.5)', padding: '10px 20px', cursor: 'pointer' }}
    >
      REGENERATE LINK
    </button>
  )
}
```

- [ ] **Step 4: Create `DeleteInviteButton`**

Create `src/components/admin/DeleteInviteButton.tsx`:

```tsx
'use client'
import { deleteInviteAction } from '@/app/admin/guests/[inviteId]/actions'

interface Props {
  inviteId: string
  label: string
  guestCount: number
  rsvpCount: number
}

export function DeleteInviteButton({ inviteId, label, guestCount, rsvpCount }: Props) {
  async function handleClick() {
    if (
      !confirm(
        `Delete "${label}"? This permanently removes ${guestCount} guest${guestCount === 1 ? '' : 's'} and ${rsvpCount} RSVP response${rsvpCount === 1 ? '' : 's'}.`,
      )
    )
      return
    await deleteInviteAction(inviteId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-label text-[11px] tracking-[.2em] text-paper-raised bg-acc-rust transition-opacity hover:opacity-85"
      style={{ padding: '12px 28px', border: 'none', cursor: 'pointer' }}
    >
      DELETE INVITE
    </button>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `just typecheck`
Expected: PASS. (`text-acc-rust` / `bg-acc-rust` map to the `--color-acc-rust` token in `src/app/globals.css`.)

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/RemoveGuestButton.tsx src/components/admin/InviteEventsForm.tsx src/components/admin/RegenerateLinkButton.tsx src/components/admin/DeleteInviteButton.tsx
git commit -m "feat: client confirm components for invite editing"
```

---

### Task 6: Edit page + Edit link in the invite list

**Files:**
- Create: `src/app/admin/guests/[inviteId]/page.tsx`
- Modify: `src/components/admin/InviteTable.tsx`

**Interfaces:**
- Consumes: `getInviteForEdit`, `getEventRsvpCounts` from `@/lib/invites`; the Task 4 actions; the Task 5 components; `prisma`, `extractAdminSession`, `AdminTopBar`, `CopyLinkButton`.

- [ ] **Step 1: Add the Edit link to `InviteTable`**

In `src/components/admin/InviteTable.tsx`, add the import at the top:

```tsx
import Link from 'next/link'
```

Then in the INVITE cell (the `<td>` rendering `invite.label`), add an Edit link below the email. Replace the label `<td>` block with:

```tsx
<td className={td}>
  <div className="font-serif text-[18px] font-semibold text-ink">
    {invite.label}
  </div>
  {invite.email && (
    <div className="font-serif text-[14px] text-gold-soft">
      {invite.email}
    </div>
  )}
  <Link
    href={`/admin/guests/${invite.id}`}
    className="font-label text-[9.5px] tracking-[.14em] text-acc-teal-deep hover:opacity-70"
  >
    EDIT
  </Link>
</td>
```

- [ ] **Step 2: Create the edit page**

Create `src/app/admin/guests/[inviteId]/page.tsx`:

```tsx
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { getInviteForEdit, getEventRsvpCounts } from '@/lib/invites'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { CopyLinkButton } from '@/components/admin/CopyLinkButton'
import { RemoveGuestButton } from '@/components/admin/RemoveGuestButton'
import { InviteEventsForm } from '@/components/admin/InviteEventsForm'
import { RegenerateLinkButton } from '@/components/admin/RegenerateLinkButton'
import { DeleteInviteButton } from '@/components/admin/DeleteInviteButton'
import {
  updateInviteDetailsAction,
  addGuestAction,
  renameGuestAction,
} from './actions'

const fieldLabel = 'block font-label text-[9px] tracking-[.16em] text-gold-soft mb-1.5'
const fieldInput = 'w-full font-serif text-[16px] text-ink outline-none'
const fieldInputStyle = {
  background: '#fffdf7',
  border: '1px solid rgba(176,138,54,.45)',
  padding: '10px 13px',
}
const cardStyle = { border: '1px solid rgba(176,138,54,.4)', padding: 'clamp(20px,3vw,28px)' }
const sectionLabel = 'font-label text-[11px] tracking-[.22em] text-acc-teal-deep mb-5'
const saveBtn =
  'font-label text-[11px] tracking-[.2em] text-paper-raised bg-gold-deep transition-colors hover:bg-[#6a4e10]'
const saveBtnStyle = { padding: '12px 28px', border: 'none' }

export default async function EditInvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>
}) {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  const { inviteId } = await params

  const [invite, eventCounts, allEvents] = await Promise.all([
    getInviteForEdit(inviteId),
    getEventRsvpCounts(inviteId),
    prisma.event.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  if (!invite) notFound()

  const assignedIds = new Set(invite.events.map((e) => e.eventId))
  const eventOptions = allEvents.map((ev) => ({
    id: ev.id,
    name: ev.name,
    assigned: assignedIds.has(ev.id),
    rsvpCount: eventCounts[ev.id] ?? 0,
  }))
  const totalRsvps = invite.guests.reduce((n, g) => n + g._count.rsvps, 0)

  return (
    <div>
      <AdminTopBar />
      <div
        className="mx-auto"
        style={{ maxWidth: 720, padding: 'clamp(28px,4vw,48px) clamp(18px,4vw,36px)' }}
      >
        {/* Header */}
        <div className="mb-[30px]">
          <Link
            href="/admin/guests"
            className="font-label text-[10px] tracking-[.2em] text-gold-soft hover:opacity-70"
          >
            ← ALL INVITES
          </Link>
          <h1
            className="font-serif italic text-ink mt-2"
            style={{ fontSize: 'clamp(28px,5vw,40px)' }}
          >
            {invite.label}
          </h1>
        </div>

        {/* Invite details */}
        <div className="bg-paper-card mb-8" style={cardStyle}>
          <div className={sectionLabel}>INVITE DETAILS</div>
          <form action={updateInviteDetailsAction.bind(null, invite.id)}>
            <div className="mb-4">
              <label className={fieldLabel}>INVITE LABEL *</label>
              <input
                name="label"
                required
                defaultValue={invite.label}
                className={fieldInput}
                style={fieldInputStyle}
              />
            </div>
            <div className="mb-5">
              <label className={fieldLabel}>CONTACT EMAIL</label>
              <input
                name="email"
                type="email"
                defaultValue={invite.email ?? ''}
                placeholder="guest@example.com"
                className={fieldInput}
                style={fieldInputStyle}
              />
            </div>
            <button type="submit" className={saveBtn} style={saveBtnStyle}>
              SAVE DETAILS
            </button>
          </form>
        </div>

        {/* Guests */}
        <div className="bg-paper-card mb-8" style={cardStyle}>
          <div className={sectionLabel}>GUESTS · {invite.guests.length}</div>
          <div className="flex flex-col gap-3 mb-6">
            {invite.guests.map((guest) => (
              <div key={guest.id} className="flex items-center gap-2">
                <form
                  action={renameGuestAction.bind(null, invite.id, guest.id)}
                  className="flex items-center gap-2 flex-1"
                >
                  <input
                    name="name"
                    required
                    defaultValue={guest.name}
                    className={`${fieldInput} flex-1`}
                    style={fieldInputStyle}
                  />
                  <button
                    type="submit"
                    className="font-label text-[9px] tracking-[.16em] text-acc-teal-deep hover:opacity-70"
                    style={{ background: 'none', border: '1px solid rgba(46,125,122,.4)', padding: '9px 12px', cursor: 'pointer' }}
                  >
                    SAVE
                  </button>
                </form>
                <RemoveGuestButton
                  inviteId={invite.id}
                  guestId={guest.id}
                  guestName={guest.name}
                  rsvpCount={guest._count.rsvps}
                />
              </div>
            ))}
          </div>

          <form
            action={addGuestAction.bind(null, invite.id)}
            className="flex items-center gap-2"
          >
            <input
              name="name"
              required
              placeholder="Add a guest…"
              className={`${fieldInput} flex-1`}
              style={fieldInputStyle}
            />
            <button type="submit" className={saveBtn} style={saveBtnStyle}>
              ADD
            </button>
          </form>
        </div>

        {/* Events */}
        <div className="bg-paper-card mb-8" style={cardStyle}>
          <div className={sectionLabel}>EVENTS</div>
          <InviteEventsForm inviteId={invite.id} events={eventOptions} />
        </div>

        {/* Share link */}
        <div className="bg-paper-card mb-8" style={cardStyle}>
          <div className={sectionLabel}>SHARE LINK</div>
          <div className="flex flex-wrap items-center gap-3">
            <CopyLinkButton slug={invite.slug} />
            <RegenerateLinkButton inviteId={invite.id} />
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-paper-card" style={{ ...cardStyle, borderColor: 'rgba(176,69,31,.5)' }}>
          <div className="font-label text-[11px] tracking-[.22em] text-acc-rust mb-5">
            DANGER ZONE
          </div>
          <DeleteInviteButton
            inviteId={invite.id}
            label={invite.label}
            guestCount={invite.guests.length}
            rsvpCount={totalRsvps}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `just typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/guests/[inviteId]/page.tsx" src/components/admin/InviteTable.tsx
git commit -m "feat: invite edit page with Edit links from the invite list"
```

---

### Task 7: Full verification & manual check

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `just test`
Expected: PASS, including the new `invites.test.ts` and `schemas.test.ts` cases.

- [ ] **Step 2: Typecheck**

Run: `just typecheck`
Expected: PASS.

- [ ] **Step 3: Production build (catches RSC boundary leaks)**

Run: `just build`
Expected: build succeeds. Watch specifically for "You're importing a component that needs ..." server/client boundary errors around the new admin components.

- [ ] **Step 4: Manual smoke test**

```bash
just db-up   # if not already running
just dev
```

Then, logged in as admin (via `/admin`), at `/admin/guests`:
1. Click **EDIT** on the seeded test invite (`/test-invite-dev1`).
2. Change the label → Save details → confirm the list still shows the same share link (slug unchanged).
3. Add a guest; rename a guest; remove a guest with no RSVPs (no warning).
4. Submit an RSVP for a guest/event via `/test-invite-dev1`, return to edit, remove that guest → confirm the warning shows the response count; confirm deletion.
5. Uncheck an event that has an RSVP → Save events → confirm the warning; verify the RSVP is gone and other events untouched.
6. Regenerate link → confirm the slug changes and the old link 404s.
7. Delete the invite → confirm it disappears from `/admin/guests`.

- [ ] **Step 5: Final commit (if any doc/tidy changes)**

```bash
git add -A
git commit -m "chore: edit-invites verification tidy" --allow-empty
```

---

## Self-Review Notes

- **Spec coverage:** details edit (T1,T2,T4,T6) · add/remove/rename guest (T2,T4,T5,T6) · toggle events with orphan-RSVP cleanup (T3,T4,T5) · warn-then-delete (T5 confirms + T3 deletion) · stable slug (T2 test asserts no slug write on details update) · regenerate link (T2,T5,T6) · delete invite (T2,T5,T6) · Edit link (T6) · admin guard on actions (T4) · tests + build (T1-3, T7). All covered.
- **Placeholder scan:** none — all steps carry full code.
- **Type consistency:** action names (`updateInviteDetailsAction`, `addGuestAction`, `renameGuestAction`, `removeGuestAction`, `updateInviteEventsAction`, `regenerateSlugAction`, `deleteInviteAction`), lib names, and component props are used identically across tasks. `getInviteForEdit` returns `guests[]._count.rsvps` and `events[].eventId`, matching page usage.
- **Color tokens verified:** destructive UI uses `acc-rust` / `bg-acc-rust` (`--color-acc-rust` #b0451f in `globals.css`); teal/gold tokens match existing admin usage.
