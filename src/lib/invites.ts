import { prisma } from '@/lib/prisma'
import { generateInviteSlug } from '@/lib/slugs'

export async function updateInviteDetails(
  inviteId: string,
  data: { label: string; email: string | null },
) {
  return prisma.invite.update({
    where: { id: inviteId },
    data: { label: data.label, email: data.email },
  })
}

export async function addGuest(inviteId: string, name: string) {
  return prisma.guest.create({ data: { inviteId, name } })
}

export async function removeGuest(guestId: string) {
  return prisma.guest.delete({ where: { id: guestId } })
}

export async function renameGuest(guestId: string, name: string) {
  return prisma.guest.update({ where: { id: guestId }, data: { name } })
}

export async function regenerateSlug(inviteId: string) {
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } })
  if (!invite) throw new Error('Invite not found')
  return prisma.invite.update({
    where: { id: inviteId },
    data: { slug: generateInviteSlug(invite.label) },
  })
}

export async function deleteInvite(inviteId: string) {
  return prisma.invite.delete({ where: { id: inviteId } })
}

export async function updateInviteEvents(inviteId: string, eventIds: string[]) {
  const current = await prisma.inviteEvent.findMany({
    where: { inviteId },
    select: { eventId: true },
  })
  const currentIds = new Set(current.map((e) => e.eventId))
  const nextIds = new Set(eventIds)

  const toAdd = eventIds.filter((id) => !currentIds.has(id))
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id))

  await prisma.$transaction([
    prisma.rsvp.deleteMany({
      where: { eventId: { in: toRemove }, guest: { inviteId } },
    }),
    prisma.inviteEvent.deleteMany({
      where: { inviteId, eventId: { in: toRemove } },
    }),
    prisma.inviteEvent.createMany({
      data: toAdd.map((eventId) => ({ inviteId, eventId })),
    }),
  ])
}

export async function getInviteForEdit(inviteId: string) {
  return prisma.invite.findUnique({
    where: { id: inviteId },
    include: {
      guests: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { rsvps: true } } },
      },
      events: { select: { eventId: true } },
    },
  })
}

export async function getEventRsvpCounts(
  inviteId: string,
): Promise<Record<string, number>> {
  const rows = await prisma.rsvp.groupBy({
    by: ['eventId'],
    where: { guest: { inviteId } },
    _count: { _all: true },
  })
  return Object.fromEntries(rows.map((r) => [r.eventId, r._count._all]))
}
