'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId } from '@/lib/cookies'
import { processRsvp, RsvpInput } from '@/lib/rsvp'
import { sendRsvpConfirmation } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function submitRsvp(email: string, rsvps: RsvpInput[]) {
  const cookieStore = await cookies()
  const inviteId = await extractGuestInviteId(cookieStore.get('guestInviteId')?.value)

  if (!inviteId) {
    redirect('/')
  }

  const updatedInvite = await processRsvp(inviteId, email, rsvps)

  // Best-effort email — don't block the redirect on failure
  try {
    if (updatedInvite.email) {
      // Fetch invite with guests and their attending RSVPs
      const invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        include: { guests: true },
      })
      const attendingRsvps = await prisma.rsvp.findMany({
        where: {
          guestId: { in: invite?.guests.map((g) => g.id) ?? [] },
          attending: true,
        },
        include: { event: true },
        distinct: ['eventId'],
        orderBy: { event: { sortOrder: 'asc' } },
      })
      const uniqueEvents = [...new Map(attendingRsvps.map((r) => [r.event.id, r.event])).values()]
      await sendRsvpConfirmation({
        to: updatedInvite.email,
        guestNames: invite?.guests.map((g) => g.name) ?? [],
        attendingEvents: uniqueEvents,
      })
    }
  } catch (err) {
    console.error('[email] Failed to send RSVP confirmation:', err)
  }

  redirect('/rsvp/confirmed')
}
