'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signValue } from '@/lib/cookies'

export async function adminLogin(formData: FormData) {
  const passphrase = (formData.get('passphrase') as string) ?? ''

  const hash = process.env.ADMIN_PASSPHRASE_HASH
  if (!hash) {
    redirect('/admin?error=1')
  }

  const valid = await bcrypt.compare(passphrase, hash)
  if (!valid) {
    redirect('/admin?error=1')
  }

  const signed = await signValue('admin', process.env.COOKIE_SECRET!)
  const cookieStore = await cookies()
  cookieStore.set('adminSession', signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/admin/dashboard')
}
