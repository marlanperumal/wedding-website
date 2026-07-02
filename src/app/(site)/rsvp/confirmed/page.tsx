import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { Diamond, EventPill } from '@/components/ui'
import { isRsvpClosed } from '@/lib/deadline'
import { googleCalendarUrl } from '@/lib/calendar'

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

  // Submitted, but nobody is attending anything — the whole party declined.
  const allDeclined = invite.submitted && attendedEvents.length === 0

  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 640, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,40px)' }}
    >
      {/* Confirmation header */}
      <div className="text-center">
        <div className="font-label text-[12px] tracking-[.3em] text-gold-deep">
          {allDeclined ? 'WE’LL MISS YOU' : 'YOU’RE CONFIRMED'}
        </div>
        <h1
          className="font-serif italic text-ink mt-2"
          style={{ fontSize: 'clamp(34px,6vw,46px)' }}
        >
          {allDeclined ? `Thank you, ${greeting}` : `See you there, ${greeting}!`}
        </h1>
        <Diamond className="mt-3.5 mb-5" />
        <p className="font-serif text-[18px] text-ink-soft leading-[1.55] mb-3">
          {allDeclined
            ? 'A confirmation email will be on its way. We’re sorry you can’t join us, but you’ll be in our thoughts on the day.'
            : 'A confirmation email will be on its way. We look forward to celebrating with you.'}
        </p>
        {!closed && (
          <p className="mb-10">
            <a
              href="/rsvp/edit"
              className="font-label text-[11px] tracking-[.12em] text-acc-purple underline underline-offset-4 hover:text-gold-deep transition-colors"
            >
              EDIT MY RSVP
            </a>
          </p>
        )}
      </div>

      {/* Event details */}
      {attendedEvents.length > 0 && (
        <div
          className="bg-paper-card"
          style={{ border: '1px solid rgba(176,138,54,.5)', padding: 'clamp(24px,4vw,34px)' }}
        >
          <div className="font-label text-[11px] tracking-[.22em] text-acc-teal-deep mb-5">
            EVENT DETAILS
          </div>
          <div className="flex flex-col gap-7">
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
                  <div className="font-label text-[11px] tracking-[.2em] text-gold-mid">
                    {dayLabel.toUpperCase()}
                  </div>
                  <div className="font-serif text-[16px] text-ink-muted mt-0.5">
                    {dayEvents[0].venue}
                  </div>
                  <div className="font-serif text-[16px] text-ink-soft mb-3">
                    {dayEvents[0].address}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-2.5">
                        <EventPill name={event.name} />
                        <a
                          href={googleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-label text-[9.5px] tracking-[.1em] text-acc-purple underline underline-offset-2 hover:text-gold-deep transition-colors"
                        >
                          ADD TO GOOGLE CALENDAR
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {attendedEvents.length === 0 && !invite.submitted && (
        <p className="font-serif italic text-[17px] text-ink-muted text-center">
          {closed
            ? "RSVP is now closed and we don't have a response on record for you."
            : 'We don’t have an RSVP from you yet.'}
        </p>
      )}

      {/* Invite guests to explore the rest of the site */}
      <div className="text-center mt-12 pt-8" style={{ borderTop: '1px solid rgba(176,138,54,.25)' }}>
        <p className="font-serif italic text-[17px] text-ink-muted mb-4">
          There&rsquo;s plenty more to explore before the big day — venue and
          directions, where to stay, what to wear, and answers to common
          questions.
        </p>
        <a
          href="/"
          className="font-label text-[11px] tracking-[.12em] text-acc-purple underline underline-offset-4 hover:text-gold-deep transition-colors"
        >
          EXPLORE THE WEBSITE
        </a>
      </div>
    </div>
  )
}
