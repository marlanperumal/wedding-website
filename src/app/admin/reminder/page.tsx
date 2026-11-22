import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { getReminderRecipients, renderReminder } from '@/lib/reminder'
import { PREVIEW_NAME } from './preview-name'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { EmailFrame } from '@/components/admin/EmailFrame'
import { sendTestReminderAction } from './actions'

export const dynamic = 'force-dynamic'

// Which transport a test send will use — mirrors deliver() in src/lib/email.ts.
function transportLabel() {
  if (process.env.SMTP_HOST) return { name: 'Mailpit (local inbox only)', real: false }
  if (process.env.RESEND_API_KEY) return { name: 'Resend — this sends a real email', real: true }
  return { name: 'none configured — nothing will be sent', real: false }
}

export default async function AdminReminderPage({
  searchParams,
}: {
  searchParams: Promise<{ width?: string; sent?: string }>
}) {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  const { width, sent } = await searchParams
  const recipients = await getReminderRecipients()
  const { subject, html, text } = await renderReminder({ label: PREVIEW_NAME })
  const phone = width === 'phone'
  const transport = transportLabel()
  const withEmail = recipients.filter((r) => r.email).length

  const href = (params: Record<string, string | undefined>) => {
    const merged = { width, ...params }
    const qs = new URLSearchParams(
      Object.entries(merged).filter((e): e is [string, string] => !!e[1]),
    )
    return `/admin/reminder?${qs}`
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminTopBar />
      <div
        className="mx-auto"
        style={{ maxWidth: 820, padding: '28px clamp(18px,4vw,36px)' }}
      >
        <main className="min-w-0">
          <h1 className="font-label text-[12px] tracking-[.24em] text-gold-deep">REMINDER EMAIL</h1>
          <p className="font-serif text-[15px] text-ink-soft mt-1 mb-5 leading-snug">
            Edit the wording in <code className="text-[14px]">src/emails/reminder.ts</code> and reload.
            It goes to {withEmail} of the {recipients.length} invites where someone said yes;
            only the &ldquo;Dear &hellip;&rdquo; line changes.
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-serif text-[17px] text-ink">
              <span className="font-label text-[10px] tracking-[.16em] text-gold-deep mr-2">SUBJECT</span>
              {subject}
            </p>
            <div className="flex gap-3 font-label text-[10px] tracking-[.14em]">
              <Link href={href({ width: undefined, sent: undefined })} className={phone ? 'text-gold-mid' : 'text-acc-rust'}>
                DESKTOP
              </Link>
              <Link href={href({ width: 'phone', sent: undefined })} className={phone ? 'text-acc-rust' : 'text-gold-mid'}>
                PHONE
              </Link>
            </div>
          </div>

          <EmailFrame key={String(phone)} html={html} width={phone ? 375 : '100%'} />

          <details className="mt-4">
            <summary className="font-label text-[10px] tracking-[.16em] text-gold-deep cursor-pointer">
              PLAIN-TEXT VERSION
            </summary>
            <pre className="mt-2 whitespace-pre-wrap font-serif text-[15px] text-ink-soft bg-paper-card p-4">
              {text}
            </pre>
          </details>

          {/* Test send */}
          <form
            action={sendTestReminderAction}
            className="mt-6 p-4 bg-paper-card"
            style={{ border: '1px solid rgba(176,138,54,.3)' }}
          >
            <label className="font-label text-[10px] tracking-[.16em] text-gold-deep" htmlFor="to">
              SEND A TEST TO
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="to"
                name="to"
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 min-w-[220px] bg-paper-input px-3 py-2 font-serif text-[16px]"
                style={{ border: '1px solid rgba(176,138,54,.4)' }}
              />
              <button
                type="submit"
                className="font-label text-[11px] tracking-[.16em] text-paper-raised bg-gold-deep px-5 py-2 hover:bg-[#6a4e10]"
              >
                SEND TEST
              </button>
            </div>
            <p className={`font-serif text-[14px] mt-2 ${transport.real ? 'text-acc-rust' : 'text-ink-muted'}`}>
              Goes to this address only. Transport: {transport.name}.
            </p>
            {sent?.startsWith('ok:') && (
              <p className="font-serif text-[15px] text-acc-teal-deep mt-2">Sent to {sent.slice(3)}.</p>
            )}
            {sent === 'error' && (
              <p className="font-serif text-[15px] text-acc-rust mt-2">Sending failed — check the server log.</p>
            )}
            {sent === 'bad-address' && (
              <p className="font-serif text-[15px] text-acc-rust mt-2">That email address doesn&rsquo;t look right.</p>
            )}
          </form>
        </main>
      </div>
    </div>
  )
}
