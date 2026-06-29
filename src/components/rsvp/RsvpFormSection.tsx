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
