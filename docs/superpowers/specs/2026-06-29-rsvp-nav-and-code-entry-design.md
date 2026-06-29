# RSVP Nav Item + Code-Entry Fallback — Design

**Date:** 2026-06-29
**Status:** Approved (pending spec review)

## Goal

Make the RSVP page a first-class, navigable destination:

1. Add an explicit **RSVP** link to the site navigation, with a status badge showing
   when the current guest has already completed their RSVP.
2. When a guest reaches `/rsvp` **without** an identifying cookie (and without coming
   from their unique invite link), show an **input where they can enter their invitation
   code** (their invite slug), then route them to the right place.
3. Once identified, route the guest to:
   - the **RSVP form** if they have not yet submitted, or
   - the **summary** of what they selected if they have already submitted.
4. Editing a submitted RSVP is allowed **only until a global RSVP deadline**; after the
   deadline the RSVP is read-only.

## Background (current behaviour)

- `SiteNav` ([src/components/ui/SiteNav.tsx](../../../src/components/ui/SiteNav.tsx)) is a
  client component with 5 info links (Events, Venue, Accommodation, Attire, FAQs). No RSVP
  link. Rendered directly in the root [layout.tsx](../../../src/app/layout.tsx).
- `/rsvp` ([src/app/rsvp/page.tsx](../../../src/app/rsvp/page.tsx)) reads a signed
  `guestInviteId` cookie (the invite **id**). With no valid cookie it `redirect('/')`.
- Guests reach `/rsvp` only via their unique link `/[inviteSlug]`, whose `acceptInvite`
  action signs the invite id, sets the cookie (90-day, httpOnly), and redirects to `/rsvp`.
- `/rsvp/confirmed` ([src/app/rsvp/confirmed/page.tsx](../../../src/app/rsvp/confirmed/page.tsx))
  shows attended events + calendar links; same cookie gate.
- `Invite.submitted` (boolean) marks a completed RSVP; existing `Rsvp` rows pre-fill the form.
- `proxy.ts` exists but is **not wired as Next middleware** (no root `middleware.ts`; only its
  own test imports it). The real gate is the page-level `redirect('/')`.
- There is **no deadline concept** in the schema or env today.

## Decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| What does a guest type to identify themselves? | Their **invite slug** (no schema change; look up `Invite` by `slug`). |
| Where do submitted guests land? | The **summary** (`/rsvp/confirmed`), with an "Edit my RSVP" option. |
| Editing window | Allowed **only until the RSVP deadline**. |
| Deadline source | A **single global config date** via env var. |
| Status display | **Nav badge + the page itself.** |
| Re-edit routing | **Dedicated `/rsvp/edit` route** (option A). |

## Architecture

### 1. `/rsvp` becomes a router

[src/app/rsvp/page.tsx](../../../src/app/rsvp/page.tsx):

- Read + verify `guestInviteId` cookie → `inviteId`.
- **No valid cookie / invite not found** → render `<RsvpEntry />` (do **not** redirect to `/`).
- **Identified:**
  - `isRsvpClosed()` → `redirect('/rsvp/confirmed')` (read-only after deadline, regardless of state).
  - `invite.submitted` → `redirect('/rsvp/confirmed')`.
  - otherwise → render the RSVP form.

The invite-loading + greeting + `<RsvpForm>` rendering is extracted into a shared server
helper `RsvpFormSection` (new file under `src/components/rsvp/`) so `/rsvp` and `/rsvp/edit`
share one implementation and don't duplicate the data fetch.

### 2. Code-entry component + action

- `RsvpEntry` — new client component (`src/components/rsvp/RsvpEntry.tsx`): a single
  "Enter your invitation code" text input + submit button, styled to match the existing
  cream/orange/serif aesthetic. Uses `useActionState` to surface a validation error inline.
- `enterInviteCode(formData)` — new server action in
  [src/app/rsvp/actions.ts](../../../src/app/rsvp/actions.ts):
  - Read `code`, trim, lowercase.
  - `prisma.invite.findUnique({ where: { slug: code } })`.
  - **Not found** → return `{ error: "We couldn't find an invitation with that code." }`.
  - **Found** → `signValue(invite.id, COOKIE_SECRET)`, set the same `guestInviteId` cookie as
    `acceptInvite` (httpOnly, 90-day, `sameSite: 'lax'`, `secure` in prod), then
    `redirect('/rsvp')`. The action stays "dumb" — the page's own branching decides
    form vs summary.

### 3. Deadline config

- New `src/lib/deadline.ts`:
  - Reads `RSVP_DEADLINE` (ISO 8601 datetime, e.g. `2026-10-15T23:59:59+02:00`).
  - `getRsvpDeadline(): Date | null` — `null` when the env var is unset/invalid.
  - `isRsvpClosed(): boolean` — `false` when no deadline is configured (safe dev default);
    otherwise `now > deadline`.
- Documented in `.env.example` and `CLAUDE.md` (Environment Variables section).

### 4. `/rsvp/edit` route (option A)

- New `src/app/rsvp/edit/page.tsx`:
  - No cookie/invite → `redirect('/rsvp')` (so they hit the entry input).
  - `isRsvpClosed()` → `redirect('/rsvp/confirmed')` (no editing after deadline).
  - otherwise → render the shared `RsvpFormSection` (form pre-filled with existing RSVPs).

### 5. Summary page changes

[src/app/rsvp/confirmed/page.tsx](../../../src/app/rsvp/confirmed/page.tsx):

- Add an **"Edit my RSVP"** link → `/rsvp/edit`, shown only when `!isRsvpClosed()`.
- Add a **closed / no-response empty state** for a guest who reaches the summary after the
  deadline with no `Rsvp` rows on record ("RSVP is now closed.").
- No cookie → `redirect('/rsvp')` (changed from `/`) so they can enter their code.

### 6. Nav badge

- New server wrapper `src/components/ui/SiteNavServer.tsx`:
  - Reads + verifies the `guestInviteId` cookie; if present, loads `invite.submitted`.
  - Computes `rsvpStatus: 'none' | 'pending' | 'submitted'`.
  - Renders the existing client `<SiteNav rsvpStatus={...} />`.
- [src/app/layout.tsx](../../../src/app/layout.tsx) renders `<SiteNavServer />` instead of
  `<SiteNav />`.
- `SiteNav` ([src/components/ui/SiteNav.tsx](../../../src/components/ui/SiteNav.tsx)):
  - Accepts a `rsvpStatus` prop (default `'none'`).
  - Adds `{ href: "/rsvp", label: "RSVP" }` to `navLinks`, **visible to everyone**.
  - Renders a `✓` badge next to the RSVP link when `rsvpStatus === 'submitted'`. A subtle dot
    for `'pending'` is optional and may be dropped to keep it simple.
- **Tradeoff:** reading the cookie in a layout-level server component opts the app into
  dynamic rendering. Acceptable for this small, DB-driven site. The cookie read +
  single indexed lookup only runs when a cookie is present.

### 7. proxy.ts cleanup

- [src/proxy.ts](../../../src/proxy.ts): bare `/rsvp` must be publicly reachable (to show the
  entry input), so it must **not** be redirected for missing cookie. Keep admin protection
  unchanged. Page-level redirects remain the real guard for `/rsvp/edit` and `/rsvp/confirmed`.
- Update `src/__tests__/middleware.test.ts` to reflect that `/rsvp` is no longer redirected.

## Data flow

```
Guest clicks nav "RSVP"  ───────────────►  /rsvp
                                             │
                          cookie present? ───┤
                                  no         │  yes
                                  │          │
                          <RsvpEntry/>       ├─ closed?  ──► /rsvp/confirmed (read-only)
                                  │          ├─ submitted? ─► /rsvp/confirmed (+ Edit link)
                          enter slug         └─ else ──────► RSVP form (RsvpFormSection)
                                  │
                       enterInviteCode()
                          ┌───────┴────────┐
                     not found          found → set cookie → redirect /rsvp
                          │
                   inline error
```

## Components / units (and their responsibilities)

- `RsvpEntry` (client) — collect a code, show validation error. Depends on `enterInviteCode`.
- `enterInviteCode` (server action) — resolve slug → set cookie → redirect. Depends on Prisma,
  `signValue`.
- `RsvpFormSection` (server) — load invite + existing RSVPs, render greeting + `<RsvpForm>`.
  Shared by `/rsvp` and `/rsvp/edit`.
- `deadline.ts` (pure) — `getRsvpDeadline()`, `isRsvpClosed()`. Depends only on env + clock.
- `SiteNavServer` (server) — derive `rsvpStatus`, render `SiteNav`. Depends on cookie + Prisma.
- `SiteNav` (client) — render links + badge. Pure presentation given `rsvpStatus`.

## Error handling

- Unknown code → inline, non-destructive error in `RsvpEntry`; cookie not set.
- Stale cookie (invite deleted) → treated as "not identified": `/rsvp` shows the entry input
  rather than erroring. (Improvement over today's `redirect('/')`.)
- Deadline env unset/malformed → `isRsvpClosed()` returns `false` (never blocks dev/local).

## Testing

- `enterInviteCode`: found (cookie set, redirect), not-found (error, no cookie), case/space
  normalisation.
- `deadline.ts`: before deadline, after deadline, unset env, malformed env.
- `/rsvp` routing branches: no cookie → entry; submitted → confirmed; closed → confirmed;
  open + not submitted → form.
- `/rsvp/edit`: no cookie → `/rsvp`; closed → `/rsvp/confirmed`; open → form.
- Update existing nav test (`src/__tests__/components/ui.test.tsx`) for the new RSVP link +
  badge prop.
- Update `src/__tests__/middleware.test.ts` for the relaxed `/rsvp` rule.

## Out of scope

- A separate human-friendly short code (decided: reuse the slug).
- Per-invite or per-event deadlines (decided: single global).
- Admin UI for setting the deadline (it's an env var).
- Rate-limiting code-entry attempts. Slugs are `label-XXXX` with only a 4-hex-char
  (~16-bit) random suffix on a known family label, so they are not strongly unguessable.
  We accept this for now (low-value target, small known guest list) but flag it as a
  candidate for follow-up (rate limit or longer suffix) if abuse is a concern.
