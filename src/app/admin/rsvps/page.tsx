import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { RsvpResponsesTable } from '@/components/admin/RsvpResponsesTable'

const dateFmt = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
})

export default async function AdminRsvpsPage() {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  const invites = await prisma.invite.findMany({
    include: {
      guests: {
        orderBy: { name: 'asc' },
        include: {
          rsvps: { include: { event: true } },
        },
      },
      events: { include: { event: true } },
    },
  })

  // Submitted invites first (most recent submission at top), then those still
  // awaiting a response (oldest invite first).
  invites.sort((a, b) => {
    if (a.submittedAt && b.submittedAt) {
      return b.submittedAt.getTime() - a.submittedAt.getTime()
    }
    if (a.submittedAt) return -1
    if (b.submittedAt) return 1
    return a.createdAt.getTime() - b.createdAt.getTime()
  })

  const rows = invites.map((invite) => ({
    id: invite.id,
    label: invite.label,
    submitted: invite.submitted,
    submittedAt: invite.submittedAt ? dateFmt.format(invite.submittedAt) : null,
    guests: invite.guests.map((guest) => {
      const rsvpByEvent = new Map(guest.rsvps.map((r) => [r.eventId, r]))

      // One entry per invited event, so declined (rsvp exists, not attending)
      // is distinct from awaiting (no rsvp) — and events the invite was never
      // asked to are simply absent.
      const events = invite.events
        .map((ie) => ie.event)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((event) => {
          const r = rsvpByEvent.get(event.id)
          const status: 'attending' | 'declined' | 'awaiting' = !r
            ? 'awaiting'
            : r.attending
              ? 'attending'
              : 'declined'
          return { id: event.id, name: event.name, status }
        })

      const dietary = new Set<string>()
      const notes = new Set<string>()
      for (const r of guest.rsvps) {
        if (!r.attending) continue
        for (const d of r.dietary) dietary.add(d)
        const trimmed = r.dietaryNotes?.trim()
        if (trimmed) notes.add(trimmed)
      }

      return {
        id: guest.id,
        name: guest.name,
        events,
        dietary: [...dietary],
        notes: [...notes],
      }
    }),
  }))

  const submittedCount = invites.filter((i) => i.submitted).length

  return (
    <div>
      <AdminTopBar />
      <div
        className="mx-auto"
        style={{ maxWidth: 1040, padding: 'clamp(28px,4vw,48px) clamp(18px,4vw,36px)' }}
      >
        <div className="mb-[30px]">
          <div className="font-label text-[11px] tracking-[.3em] text-gold-soft">
            MANAGE
          </div>
          <h1
            className="font-serif italic text-ink mt-1"
            style={{ fontSize: 'clamp(32px,5vw,42px)' }}
          >
            RSVP Responses
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div className="font-label text-[11px] tracking-[.22em] text-acc-teal-deep">
            {submittedCount} SUBMITTED · {invites.length} INVITES
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-label text-[9px] tracking-[.08em] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="rounded-[11px]"
                style={{
                  background: 'rgba(176,138,54,.14)',
                  border: '1px solid rgba(176,138,54,.3)',
                  padding: '3px 9px',
                  color: '#7c5c14',
                }}
              >
                ATTENDING
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="rounded-[11px]"
                style={{
                  border: '1px solid rgba(154,145,132,.4)',
                  padding: '3px 9px',
                  color: '#9a9184',
                  textDecoration: 'line-through',
                }}
              >
                DECLINED
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="rounded-[11px]"
                style={{
                  border: '1px dashed rgba(176,138,54,.5)',
                  padding: '3px 9px',
                  color: '#b0925a',
                }}
              >
                AWAITING
              </span>
            </span>
            <span>· not invited = absent</span>
          </div>
        </div>
        <RsvpResponsesTable invites={rows} />
      </div>
    </div>
  )
}
