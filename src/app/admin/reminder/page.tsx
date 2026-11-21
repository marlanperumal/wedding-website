import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { getReminderRecipients, renderReminder } from '@/lib/reminder'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { EmailFrame } from '@/components/admin/EmailFrame'
import { sendTestReminderAction } from './actions'
import { sampleRecipient } from './sample'

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
  searchParams: Promise<{ invite?: string; width?: string; sent?: string }>
}) {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  const { invite, width, sent } = await searchParams
  const recipients = await getReminderRecipients()
  const sample = await sampleRecipient()
  const selected = recipients.find((r) => r.inviteId === invite) ?? sample
  const { subject, html, text } = renderReminder(selected)
  const phone = width === 'phone'
  const transport = transportLabel()
  const withEmail = recipients.filter((r) => r.email).length

  const href = (params: Record<string, string | undefined>) => {
    const merged = { invite: selected.inviteId, width, ...params }
    const qs = new URLSearchParams(
      Object.entries(merged).filter((e): e is [string, string] => !!e[1]),
    )
    return `/admin/reminder?${qs}`
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminTopBar />
      <div
        className="mx-auto grid gap-8 lg:grid-cols-[300px_1fr]"
        style={{ maxWidth: 1180, padding: '28px clamp(18px,4vw,36px)' }}
      >
        {/* Households */}
        <aside>
          <h1 className="font-label text-[12px] tracking-[.24em] text-gold-deep">REMINDER EMAIL</h1>
          <p className="font-serif text-[15px] text-ink-soft mt-2 leading-snug">
            {recipients.length} households said yes to at least one event; {withEmail} have an
            email address. Pick one to see their version.
          </p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {[sample, ...recipients].map((r) => {
              const active = r.inviteId === selected.inviteId
              return (
                <li key={r.inviteId}>
                  <Link
                    href={href({ invite: r.inviteId, sent: undefined })}
                    className={`block px-3 py-2 transition-colors ${
                      active ? 'bg-paper-card' : 'hover:bg-paper-panel'
                    }`}
                    style={{
                      border: '1px solid rgba(176,138,54,.3)',
                      borderLeft: active ? '3px solid #9e6bb5' : undefined,
                    }}
                  >
                    <span className="font-serif text-[16px] text-ink">{r.label}</span>
                    <span className="block font-serif text-[13px] text-ink-muted">
                      {r.inviteId === 'sample' ? 'every event' : r.events.map((e) => e.name).join(', ')}
                    </span>
                    {r.inviteId !== 'sample' && !r.email && (
                      <span className="block font-label text-[9px] tracking-[.14em] text-acc-rust mt-0.5">
                        NO EMAIL
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Preview */}
        <main className="min-w-0">
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

          <EmailFrame key={`${selected.inviteId}-${phone}`} html={html} width={phone ? 375 : '100%'} />

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
            <input type="hidden" name="invite" value={selected.inviteId} />
            <label className="font-label text-[10px] tracking-[.16em] text-gold-deep" htmlFor="to">
              SEND A TEST OF THIS VERSION TO
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
              Goes to the address above only, never to the household. Transport: {transport.name}.
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
