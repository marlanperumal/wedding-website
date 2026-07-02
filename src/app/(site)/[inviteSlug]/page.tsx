import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
    <div className="pb-16">
      <InviteHero
        guestNames={invite.guests.map((g) => g.name)}
        cta={
          <form action={acceptInvite}>
            <input type="hidden" name="inviteId" value={invite.id} />
            <button
              type="submit"
              className="inline-block font-label text-[12px] tracking-[.2em] text-paper-raised bg-gold-deep rounded-[2px] transition-colors hover:bg-[#6a4e10]"
              style={{ padding: '14px 40px' }}
            >
              RSVP
            </button>
          </form>
        }
      />
      <EventBlock events={events} />
    </div>
  )
}
