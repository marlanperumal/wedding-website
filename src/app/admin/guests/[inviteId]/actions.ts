'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { UpdateInviteSchema } from '@/lib/schemas'
import * as invites from '@/lib/invites'

async function requireAdmin() {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')
}

function revalidate(inviteId: string) {
  revalidatePath(`/admin/guests/${inviteId}`)
  revalidatePath('/admin/guests')
}

export async function updateInviteDetailsAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const parsed = UpdateInviteSchema.safeParse({
    label: formData.get('label'),
    email: formData.get('email') || undefined,
  })
  if (!parsed.success) {
    console.error('updateInviteDetails validation error:', parsed.error.flatten())
    return
  }
  await invites.updateInviteDetails(inviteId, {
    label: parsed.data.label,
    email: parsed.data.email || null,
  })
  revalidate(inviteId)
}

export async function addGuestAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const name = ((formData.get('name') as string) ?? '').trim()
  if (!name) return
  await invites.addGuest(inviteId, name)
  revalidate(inviteId)
}

export async function renameGuestAction(
  inviteId: string,
  guestId: string,
  formData: FormData,
) {
  await requireAdmin()
  const name = ((formData.get('name') as string) ?? '').trim()
  if (!name) return
  await invites.renameGuest(guestId, name)
  revalidate(inviteId)
}

export async function removeGuestAction(inviteId: string, guestId: string) {
  await requireAdmin()
  await invites.removeGuest(guestId)
  revalidate(inviteId)
}

export async function updateInviteEventsAction(inviteId: string, formData: FormData) {
  await requireAdmin()
  const eventIds = formData.getAll('eventIds').map(String)
  if (eventIds.length === 0) return
  await invites.updateInviteEvents(inviteId, eventIds)
  revalidate(inviteId)
}

export async function regenerateSlugAction(inviteId: string) {
  await requireAdmin()
  await invites.regenerateSlug(inviteId)
  revalidate(inviteId)
}

export async function deleteInviteAction(inviteId: string) {
  await requireAdmin()
  await invites.deleteInvite(inviteId)
  revalidatePath('/admin/guests')
  redirect('/admin/guests')
}
