'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { generateInviteSlug } from '@/lib/slugs'
import { AddInviteSchema } from '@/lib/schemas'

export async function addInvite(formData: FormData) {
  const rawNames = ((formData.get('guestNames') as string) ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const eventIds = formData.getAll('eventIds').map(String)

  const parsed = AddInviteSchema.safeParse({
    label: formData.get('label'),
    email: formData.get('email') || undefined,
    guestNames: rawNames,
    eventIds,
  })

  if (!parsed.success) {
    // In production you'd return the error; for now, silently return
    console.error('addInvite validation error:', parsed.error.flatten())
    return
  }

  const { label, email, guestNames, eventIds: validEventIds } = parsed.data

  const slug = generateInviteSlug(label)

  await prisma.invite.create({
    data: {
      slug,
      label,
      email: email || null,
      guests: {
        create: guestNames.map((name) => ({ name })),
      },
      events: {
        create: validEventIds.map((eventId) => ({ eventId })),
      },
    },
  })

  revalidatePath('/admin/guests')
}
