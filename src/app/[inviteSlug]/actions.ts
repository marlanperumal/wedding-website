'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { signValue } from '@/lib/cookies'

export async function acceptInvite(formData: FormData) {
  const inviteId = formData.get('inviteId') as string
  if (!inviteId) return

  const signed = await signValue(inviteId, process.env.COOKIE_SECRET!)
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
