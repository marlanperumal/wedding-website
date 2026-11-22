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

const base = 'font-label text-[9.5px] tracking-[.14em] whitespace-nowrap'
const box = { padding: '6px 12px', border: '1px solid rgba(176,138,54,.5)' }

/**
 * Sends the one-week reminder to one invite. The first click asks for
 * confirmation; the second sends. Once sent it turns into a disabled "Sent".
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
  const sentAt = savedSentAt ?? justSentAt
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (sentAt) {
    return (
      <button type="button" disabled className={`${base} text-acc-teal-deep cursor-default`} style={{ ...box, borderColor: 'rgba(46,125,122,.35)', background: 'rgba(46,125,122,.08)' }}>
        SENT · {sentFmt.format(new Date(sentAt))}
      </button>
    )
  }

  function send() {
    setError(null)
    startTransition(async () => {
      const result = await sendReminderAction(inviteId)
      setConfirming(false)
      if (result.status === 'sent') setJustSentAt(result.sentAt)
      else if (result.status !== 'already-sent') setError(result.status === 'failed' ? 'Sending failed — try again' : 'Can’t send to this invite')
    })
  }

  return (
    <div>
      {confirming ? (
        <div className="flex gap-1.5">
          <button type="button" onClick={send} disabled={pending} className={`${base} text-paper-raised bg-acc-rust disabled:opacity-60`} style={{ ...box, borderColor: 'transparent' }}>
            {pending ? 'SENDING…' : 'CONFIRM SEND'}
          </button>
          {!pending && (
            <button type="button" onClick={() => setConfirming(false)} className={`${base} text-ink-muted hover:text-acc-rust`} style={box}>
              CANCEL
            </button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${base} text-gold-deep hover:text-acc-rust`} style={box}>
          SEND
        </button>
      )}
      {error && <div className="font-serif text-[13px] text-acc-rust mt-1">{error}</div>}
    </div>
  )
}
