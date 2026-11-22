'use client'
import { useState, useTransition } from 'react'
import { sendReminderAction } from '@/app/admin/guests/actions'

const sentFmt = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
})

const base = 'font-label text-[9.5px] tracking-[.14em] whitespace-nowrap disabled:opacity-60'
const box = { padding: '6px 12px', border: '1px solid rgba(176,138,54,.5)' }

/**
 * Sends the reminder email to one invite. Once sent it shows the time, with a
 * ↻ button to send it again.
 */
export function SendReminderButton({
  inviteId,
  sentAt: savedSentAt,
}: {
  inviteId: string
  sentAt: Date | null
}) {
  // The saved time arrives with the page refresh that follows the action;
  // until then, show the time the action returned.
  const [justSentAt, setJustSentAt] = useState<Date | null>(null)
  const sentAt = justSentAt ?? savedSentAt
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function send(resend: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await sendReminderAction(inviteId, { resend })
      if (result.status === 'sent') setJustSentAt(result.sentAt)
      else if (result.status !== 'already-sent')
        setError(result.status === 'failed' ? 'Sending failed — try again' : 'Can’t send to this invite')
    })
  }

  return (
    <div>
      {sentAt ? (
        <div className="flex items-center gap-1.5">
          <span
            className={`${base} text-acc-teal-deep`}
            style={{ ...box, borderColor: 'rgba(46,125,122,.35)', background: 'rgba(46,125,122,.08)' }}
          >
            {pending ? 'SENDING…' : `SENT · ${sentFmt.format(new Date(sentAt))}`}
          </span>
          <button
            type="button"
            onClick={() => send(true)}
            disabled={pending}
            title="Send again"
            aria-label="Send the reminder again"
            className={`${base} text-gold-deep hover:text-acc-rust text-[13px] leading-none`}
            style={{ ...box, padding: '5px 9px' }}
          >
            ↻
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => send(false)}
          disabled={pending}
          className={`${base} text-gold-deep hover:text-acc-rust`}
          style={box}
        >
          {pending ? 'SENDING…' : 'SEND'}
        </button>
      )}
      {error && <div className="font-serif text-[13px] text-acc-rust mt-1">{error}</div>}
    </div>
  )
}
