import { prisma } from '@/lib/prisma'
import type { ReminderRecipient } from '@/lib/reminder'

/** A made-up household attending every event, so every section shows. */
export async function sampleRecipient(): Promise<ReminderRecipient> {
  const events = await prisma.event.findMany({ orderBy: { sortOrder: 'asc' } })
  return {
    inviteId: 'sample',
    label: 'Sample Family',
    email: null,
    events: events.map(({ name, date }) => ({ name, date })),
  }
}
