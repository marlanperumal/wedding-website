import { prisma } from '@/lib/prisma'
import type { ReminderRecipient } from '@/lib/reminder'

/** A made-up household for previewing when no real invite has RSVPed yet. */
export async function sampleRecipient(): Promise<ReminderRecipient> {
  const events = await prisma.event.findMany({ orderBy: { sortOrder: 'asc' } })
  return {
    inviteId: 'sample',
    label: 'Sample Family',
    email: null,
    reminderSentAt: null,
    events: events.map(({ name, date }) => ({ name, date })),
  }
}
