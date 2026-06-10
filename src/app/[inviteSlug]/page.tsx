import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/ui'
import { InviteHero } from '@/components/invite/InviteHero'
import { EventBlock } from '@/components/invite/EventBlock'
import { acceptInvite } from './actions'

interface Props {
  params: Promise<{ inviteSlug: string }>
}

export default async function InvitePage({ params }: Props) {
  const { inviteSlug } = await params

  const invite = await prisma.invite.findUnique({
    where: { slug: inviteSlug },
    include: {
      guests: true,
      events: {
        include: { event: true },
      },
    },
  })

  if (!invite) notFound()

  const events = invite.events
    .map((ie) => ie.event)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="relative">
      <AccentBar />
      <InviteHero guestNames={invite.guests.map((g) => g.name)} />
      <EventBlock events={events} />
      <div className="max-w-xl mx-auto px-6 pb-20 text-center">
        <form action={acceptInvite}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <button
            type="submit"
            className="bg-orange-soft text-white px-8 py-4 text-xs tracking-[3px] uppercase font-sans w-full max-w-xs hover:opacity-90 transition-colors"
          >
            RSVP Now
          </button>
        </form>
      </div>
      <AccentBar />
    </div>
  )
}
