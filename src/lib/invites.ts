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
