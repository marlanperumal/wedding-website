'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractGuestInviteId, signValue } from '@/lib/cookies'
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
      // Fetch each guest with their attending RSVPs (events + dietary)
      const invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        include: {
          guests: {
            include: {
              rsvps: {
                where: { attending: true },
                include: { event: true },
                orderBy: { event: { sortOrder: 'asc' } },
              },
            },
          },
        },
      })
      const guests = (invite?.guests ?? []).map((g) => ({
        name: g.name,
        attendingEvents: g.rsvps.map((r) => ({
          name: r.event.name,
          venue: r.event.venue,
          date: r.event.date,
        })),
        dietary: [...new Set(g.rsvps.flatMap((r) => r.dietary))],
        dietaryNotes: g.rsvps.map((r) => r.dietaryNotes).find((n) => n?.trim()) ?? undefined,
      }))
      await sendRsvpConfirmation({
        to: updatedInvite.email,
        guests,
      })
    }
  } catch (err) {
    console.error('[email] Failed to send RSVP confirmation:', err)
  }

  redirect('/rsvp/confirmed')
}

export type EnterCodeState = { error?: string }

export async function enterInviteCode(
  _prevState: EnterCodeState,
  formData: FormData,
): Promise<EnterCodeState> {
  const code = String(formData.get('code') ?? '')
    .trim()
    .toLowerCase()
  if (!code) {
    return { error: 'Please enter your invitation code.' }
  }

  const invite = await prisma.invite.findUnique({ where: { slug: code } })
  if (!invite) {
    return { error: "We couldn't find an invitation with that code." }
  }

  const signed = await signValue(invite.id, process.env.COOKIE_SECRET!)
  const cookieStore = await cookies()
  cookieStore.set('guestInviteId', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
    path: '/',
  })

  redirect('/rsvp')
}
