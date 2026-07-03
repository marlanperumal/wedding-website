# Edit Invites — Design

**Date:** 2026-07-03
**Status:** Approved

## Goal

Give the admin the ability to edit an existing invite: change its label/email,
add / remove / rename guests, toggle which events the invite is assigned to,
regenerate its share link, and delete the invite entirely. Today the admin can
only *create* invites (`/admin/guests`) and list them; there is no edit path.

## Scope

- **Events means per-invite assignment**, not a global event catalog. Editing an
  invite toggles which of the existing events that invite is invited to (same as
  the checkbox set on the Add Invite form).
- No Prisma schema changes. Every operation maps onto existing models
  (`Invite`, `Guest`, `Event`, `InviteEvent`, `Rsvp`).

## Data-integrity rules

- **Slug is stable.** Editing the label does **not** change the slug — shared
  links keep working. Changing the slug is a separate, explicit "Regenerate
  link" action.
- **Warn, then delete** for destructive edits. Removing a guest, or unassigning
  an event, that already has RSVP responses must show a confirmation stating how
  many responses will be permanently deleted, then delete them on confirm.
  - Removing a guest cascades their `Rsvp` rows (schema `onDelete: Cascade` on
    `Rsvp.guest`).
  - Unassigning an event deletes only the `Rsvp` rows for that event belonging
    to **this invite's** guests (`Rsvp` is keyed by `guestId + eventId`;
    removing the `InviteEvent` link does not cascade RSVPs, so the action must
    delete them explicitly).
- **Delete invite** cascades guests, `InviteEvent` links, and RSVPs (existing
  `onDelete: Cascade` relations), then redirects to the list.

## Route & page

New dynamic route: `src/app/admin/guests/[inviteId]/page.tsx` — a Server
Component.

- Verifies the admin session with `extractAdminSession` (same as
  `/admin/guests`); redirects to `/admin` if not authed.
- Loads the invite with guests, event assignments, and all events, plus a
  **per-guest and per-event RSVP count** for this invite (needed to drive the
  warn-before-delete confirmations).
- If the invite id is not found, `notFound()`.
- The existing `InviteTable` gains an **Edit** link per row pointing to
  `/admin/guests/[inviteId]`. The edit page has a back-link to `/admin/guests`.

Page sections (styled to match the existing gold-bordered `bg-paper-card`
blocks and `font-label` headers):

1. **Invite details** — one form (label, email) + Save. Non-destructive; does
   not touch the slug.
2. **Guests** — one row per guest with an inline-editable name (Save per row via
   `renameGuest`) and a Remove (✕) button; an "add guest" input + button at the
   bottom. Add and remove are immediate actions. Remove is a client button that
   shows a `confirm()` including the guest's RSVP count when > 0.
3. **Events** — checkboxes for all events (checked = assigned) + Save. The Save
   control is a client component that, before submitting, detects newly
   unchecked events that have RSVPs and confirms deletion of those responses.
4. **Share link** — current link + existing `CopyLinkButton` + a "Regenerate
   link" button (`confirm()`: the old link stops working).
5. **Danger zone** — "Delete invite" button (`confirm()` showing total guests +
   RSVPs removed); redirects to `/admin/guests` on success.

## Server actions

New file `src/app/admin/guests/[inviteId]/actions.ts` (the existing `addInvite`
stays in `src/app/admin/guests/actions.ts`). Every action re-verifies the admin
session via `extractAdminSession` before mutating — defense-in-depth beyond the
cookie-presence check in `proxy.ts`. (The current `addInvite` relies on the
middleware only; the new actions add an explicit guard.)

- `updateInviteDetails(inviteId, label, email)` — validated by a new
  `UpdateInviteSchema`.
- `addGuest(inviteId, name)` — creates a `Guest`.
- `removeGuest(guestId)` — deletes the guest; RSVPs cascade.
- `renameGuest(guestId, name)` — updates the guest name.
- `updateInviteEvents(inviteId, eventIds[])` — in a transaction: create missing
  `InviteEvent` rows, delete unchecked ones, and delete orphaned `Rsvp` rows for
  the removed events belonging to this invite's guests.
- `regenerateSlug(inviteId)` — new slug via `generateInviteSlug(invite.label)`.
- `deleteInvite(inviteId)` — deletes the invite (cascades), then
  `redirect('/admin/guests')`.

All non-redirecting actions call `revalidatePath` for both the edit page and
`/admin/guests`.

## Client components (new, `src/components/admin/`)

Mirror the existing `CopyLinkButton` client-component pattern.

- `RemoveGuestButton` — `confirm()` with RSVP count; wraps a form calling
  `removeGuest`.
- `InviteEventsForm` — the events checkbox form plus confirm-on-unassign logic
  (needs the per-event RSVP counts and the current assignment set).
- `RegenerateLinkButton` — `confirm()` wrapper around `regenerateSlug`.
- `DeleteInviteButton` — `confirm()` wrapper around `deleteInvite`.

Guest name editing can be a small per-row server-action form; if it needs
client interactivity (e.g. dirty-state), a `GuestRow` client component may be
added — decided during implementation.

## Validation

New `UpdateInviteSchema` in `src/lib/schemas.ts`:

```ts
UpdateInviteSchema = z.object({
  label: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
})
```

Guest name inputs validated as `z.string().min(1)` at the action boundary.

## Testing

Unit tests following the existing action/lib test style:

- `updateInviteDetails` changes label/email but leaves the slug unchanged.
- `removeGuest` deletes the guest and its RSVPs.
- `updateInviteEvents` unassigning an event deletes only that event's RSVPs for
  this invite's guests, and leaves other invites' RSVPs untouched.
- `updateInviteEvents` assigning a new event creates the `InviteEvent` link.
- `renameGuest` updates the name.
- `regenerateSlug` produces a new, different, unique slug.
- `deleteInvite` removes the invite and cascades guests/links/RSVPs.
- `UpdateInviteSchema` accepts valid input and rejects empty label / bad email.

Then `just typecheck`, `just test`, and `just build` (per the
run-build-before-done convention — build catches RSC client/server boundary
leaks that test/typecheck miss).
