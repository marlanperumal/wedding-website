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
