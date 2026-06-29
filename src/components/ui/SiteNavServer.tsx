// src/components/ui/SiteNavServer.tsx
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { SiteNav } from './SiteNav'

export async function SiteNavServer() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  let rsvpStatus: 'none' | 'pending' | 'submitted' = 'none'
  if (inviteId) {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      select: { submitted: true },
    })
    if (invite) rsvpStatus = invite.submitted ? 'submitted' : 'pending'
  }

  return <SiteNav rsvpStatus={rsvpStatus} />
}
