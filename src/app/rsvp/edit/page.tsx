import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { isRsvpClosed } from '@/lib/deadline'
import { RsvpFormSection } from '@/components/rsvp/RsvpFormSection'

export default async function RsvpEditPage() {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  // Not identified — send to the entry input.
  if (!inviteId) redirect('/rsvp')

  // No editing after the deadline.
  if (isRsvpClosed()) redirect('/rsvp/confirmed')

  return <RsvpFormSection inviteId={inviteId} />
}
