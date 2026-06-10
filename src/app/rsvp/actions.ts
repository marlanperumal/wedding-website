'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { processRsvp, RsvpInput } from '@/lib/rsvp'

export async function submitRsvp(email: string, rsvps: RsvpInput[]) {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  if (!inviteId) {
    redirect('/')
  }

  await processRsvp(inviteId, email, rsvps)
  // Email sending will be added in Task 15
  redirect('/rsvp/confirmed')
}
