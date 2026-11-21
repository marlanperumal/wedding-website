'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { extractAdminSession } from '@/lib/cookies'
import { getReminderRecipients, sendReminder } from '@/lib/reminder'
import { sampleRecipient } from './sample'

/**
 * Sends one copy of the reminder, rendered for the chosen household, to the
 * address typed in the form — never to the household itself.
 */
export async function sendTestReminderAction(formData: FormData) {
  const cookieStore = await cookies()
  if (!(await extractAdminSession(cookieStore.get('adminSession')?.value))) redirect('/admin')

  const inviteId = String(formData.get('invite') ?? '')
  const to = z.string().trim().email().safeParse(formData.get('to'))
  const back = (status: string) =>
    redirect(`/admin/reminder?${new URLSearchParams({ invite: inviteId, sent: status })}`)

  if (!to.success) back('bad-address')

  const recipients = await getReminderRecipients()
  const recipient =
    recipients.find((r) => r.inviteId === inviteId) ?? (await sampleRecipient())

  try {
    await sendReminder(recipient, to.data!)
  } catch (err) {
    console.error('Test reminder failed:', err)
    back('error')
  }
  back(`ok:${to.data}`)
}
