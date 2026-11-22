'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { extractAdminSession } from '@/lib/cookies'
import { sendReminder } from '@/lib/reminder'
import { PREVIEW_NAME } from './preview-name'

/** Sends one copy of the reminder to the address typed in the form, and nobody else. */
export async function sendTestReminderAction(formData: FormData) {
  const cookieStore = await cookies()
  if (!(await extractAdminSession(cookieStore.get('adminSession')?.value))) redirect('/admin')

  const to = z.string().trim().email().safeParse(formData.get('to'))
  const back = (status: string) => redirect(`/admin/reminder?${new URLSearchParams({ sent: status })}`)

  if (!to.success) back('bad-address')

  try {
    await sendReminder({ label: PREVIEW_NAME }, to.data!)
  } catch (err) {
    console.error('Test reminder failed:', err)
    back('error')
  }
  back(`ok:${to.data}`)
}
