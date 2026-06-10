import { prisma } from './prisma'

export interface RsvpInput {
  guestId: string
  eventId: string
  attending: boolean
  dietary: string[]
  dietaryNotes?: string
}

export async function processRsvp(
  inviteId: string,
  email: string,
  rsvps: RsvpInput[],
) {
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: { guests: true, events: true },
  })

  if (!invite) throw new Error('Invite not found')

  const validGuestIds = new Set(invite.guests.map((g) => g.id))
  const validEventIds = new Set(invite.events.map((ie) => ie.eventId))

  for (const rsvp of rsvps) {
    if (!validGuestIds.has(rsvp.guestId)) {
      throw new Error(`Guest ${rsvp.guestId} does not belong to this invite`)
    }
    if (!validEventIds.has(rsvp.eventId)) {
      throw new Error(`Event ${rsvp.eventId} is not included in this invite`)
    }
  }

  await Promise.all(
    rsvps.map((rsvp) =>
      prisma.rsvp.upsert({
        where: { guestId_eventId: { guestId: rsvp.guestId, eventId: rsvp.eventId } },
        create: {
          guestId: rsvp.guestId,
          eventId: rsvp.eventId,
          attending: rsvp.attending,
          dietary: rsvp.dietary,
          dietaryNotes: rsvp.dietaryNotes,
        },
        update: {
          attending: rsvp.attending,
          dietary: rsvp.dietary,
          dietaryNotes: rsvp.dietaryNotes,
        },
      }),
    ),
  )

  return prisma.invite.update({
    where: { id: inviteId },
    data: {
      submitted: true,
      submittedAt: new Date(),
      ...(email ? { email } : {}),
    },
  })
}
