import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { isRsvpClosed } from '@/lib/deadline'
import { RsvpEntry } from '@/components/rsvp/RsvpEntry'
import { RsvpFormSection } from '@/components/rsvp/RsvpFormSection'

export default async function RsvpPage() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  // Not identified — show the code-entry input instead of redirecting away.
  if (!inviteId) return <RsvpEntry />

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    select: { submitted: true },
  })

  // Stale cookie (invite removed) — fall back to code entry.
  if (!invite) return <RsvpEntry />

  // After the deadline, or already submitted: send to the read-only summary.
  if (isRsvpClosed() || invite.submitted) redirect('/rsvp/confirmed')

  return <RsvpFormSection inviteId={inviteId} />
}
