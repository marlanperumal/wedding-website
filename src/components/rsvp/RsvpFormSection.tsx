import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Diamond } from '@/components/ui'
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
    <div
      className="mx-auto"
      style={{ maxWidth: 640, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,40px)' }}
    >
      <div className="text-center mb-3.5">
        <div className="font-label text-[12px] tracking-[.3em] text-gold-deep">
          KINDLY RSVP
        </div>
        <div
          className="font-script text-script-gold leading-[1.05] mt-1.5"
          style={{ fontSize: 'clamp(42px,8vw,58px)' }}
        >
          Will you join us?
        </div>
        <Diamond className="mt-3.5" />
        <p
          className="font-serif text-[18px] text-ink-soft leading-[1.55] mx-auto"
          style={{ maxWidth: 440, marginTop: 16 }}
        >
          Please respond by <b className="font-semibold">30 September 2026</b>.
          Let us know who&rsquo;s coming and add any dietary notes for each guest.
        </p>
      </div>

      <RsvpForm
        guests={invite.guests}
        events={events}
        existingRsvps={existingRsvps.map((r) => ({
          ...r,
          dietaryNotes: r.dietaryNotes ?? null,
        }))}
        initialEmail={invite.email ?? ''}
        greeting={greeting}
      />
    </div>
  )
}
