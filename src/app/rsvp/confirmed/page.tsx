import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AccentBar, EventPill } from '@/components/ui'
import { isRsvpClosed } from '@/lib/deadline'

export default async function RsvpConfirmedPage() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)
  if (!inviteId) redirect('/rsvp')

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    select: { id: true, submitted: true, guests: true },
  })
  if (!invite) redirect('/rsvp')

  const closed = isRsvpClosed()

  // Load RSVPs that are attending = true, with event details
  const attendingRsvps = await prisma.rsvp.findMany({
    where: {
      guestId: { in: invite.guests.map((g) => g.id) },
      attending: true,
    },
    include: { event: true },
    distinct: ['eventId'],  // one entry per unique event
    orderBy: { event: { sortOrder: 'asc' } },
  })

  // Group unique attended events by date
  const eventMap = new Map<string, typeof attendingRsvps[0]['event']>()
  for (const rsvp of attendingRsvps) {
    eventMap.set(rsvp.event.id, rsvp.event)
  }
  const attendedEvents = [...eventMap.values()].sort((a, b) => a.sortOrder - b.sortOrder)

  // Group by day
  const grouped = new Map<string, typeof attendedEvents>()
  for (const event of attendedEvents) {
    const key = event.date.toISOString().split('T')[0]
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(event)
  }

  const guestNames = invite.guests.map((g) => g.name)
  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(', ') + ' & ' + guestNames.at(-1)

  return (
    <div className="relative">
      <AccentBar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        {/* Confirmation header */}
        <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-4">
          You&apos;re confirmed
        </p>
        <h1 className="font-serif text-4xl italic text-near-black mb-3">
          See you there, {greeting}!
        </h1>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-orange-soft" />
          <span className="text-orange-soft text-sm">✦</span>
          <div className="h-px w-10 bg-orange-soft" />
        </div>
        <p className="font-sans text-sm text-near-black/60 leading-relaxed mb-12">
          A confirmation email will be on its way. We look forward to celebrating with you.
        </p>

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

        {/* Venue details */}
        {attendedEvents.length > 0 && (
          <div className="text-left space-y-8">
            <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans">
              Event details
            </p>
            {[...grouped.entries()].map(([dateKey, dayEvents]) => {
              const date = new Date(dateKey + 'T00:00:00Z')
              const dayLabel = date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })
              return (
                <div key={dateKey}>
                  <p className="event-day-label mb-3">{dayLabel}</p>
                  <p className="font-sans text-xs text-near-black/50 mb-3 uppercase tracking-wide">
                    {dayEvents[0].venue}
                  </p>
                  <p className="font-sans text-sm text-near-black/70 mb-4">
                    {dayEvents[0].address}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-2">
                        <EventPill name={event.name} />
                        <a
                          href={`/api/calendar/${event.id}`}
                          download={`${event.name.toLowerCase()}.ics`}
                          className="text-xs font-sans text-teal-deep underline underline-offset-2"
                        >
                          Add to calendar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

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
      </div>
      <AccentBar />
    </div>
  )
}
