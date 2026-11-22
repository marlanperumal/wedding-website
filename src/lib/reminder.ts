import { prisma } from '@/lib/prisma'
import { createElement } from 'react'
import { FROM, deliver, renderEmailLayout } from '@/lib/email'
import { ReminderEmail, eyebrow, subject } from '@/emails/reminder'

export interface ReminderEvent {
  name: string
  date: Date
}

export interface ReminderRecipient {
  inviteId: string
  label: string
  email: string | null
  /** When the reminder was sent to this invite, or null if not yet. */
  reminderSentAt: Date | null
  /** Events at least one guest on the invite said yes to, in programme order. */
  events: ReminderEvent[]
}

/**
 * Every invite with at least one guest attending at least one event, or just
 * the one invite when `inviteId` is given. Invites without an email are
 * included (the admin preview shows them) but can't be sent to.
 */
export async function getReminderRecipients(inviteId?: string): Promise<ReminderRecipient[]> {
  const invites = await prisma.invite.findMany({
    where: inviteId ? { id: inviteId } : undefined,
    orderBy: { label: 'asc' },
    include: {
      guests: {
        include: {
          rsvps: { where: { attending: true }, include: { event: true } },
        },
      },
    },
  })

  return invites
    .map((invite) => {
      const byId = new Map<string, { name: string; date: Date; sortOrder: number }>()
      for (const guest of invite.guests) {
        for (const rsvp of guest.rsvps) byId.set(rsvp.event.id, rsvp.event)
      }
      const events = [...byId.values()]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ name, date }) => ({ name, date }))
      return {
        inviteId: invite.id,
        label: invite.label,
        email: invite.email,
        reminderSentAt: invite.reminderSentAt,
        events,
      }
    })
    .filter((r) => r.events.length > 0)
}

export async function renderReminder(recipient: Pick<ReminderRecipient, 'label'>) {
  // Imported lazily: Next.js doesn't allow react-dom/server as a static import
  // in server components.
  const { renderToStaticMarkup } = await import('react-dom/server')
  const body = renderToStaticMarkup(createElement(ReminderEmail, { name: recipient.label }))
  return {
    subject,
    html: renderEmailLayout({ eyebrow, body }),
    text: htmlToText(body),
  }
}

/** Plain-text fallback derived from the same content, so the two never drift apart. */
function htmlToText(html: string) {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '$2 ($1)')
    .replace(/<br\s*\/?>/g, '\u2028') // kept apart from source line breaks until the end
    .replace(/<\/(p|h2)>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/([^\n])\n(?=[^\n])/g, '$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ ?\u2028 ?/g, '\n')
    .trim()
}

/** Sends a copy of the reminder for `recipient` to `to`. Records nothing — used for test sends. */
export async function sendReminder(recipient: Pick<ReminderRecipient, 'label'>, to: string) {
  const { subject, html, text } = await renderReminder(recipient)
  await deliver({ from: FROM, to, subject, html, text })
}

export type ReminderSendResult =
  | { status: 'sent'; sentAt: Date }
  | { status: 'already-sent' | 'no-email' | 'not-attending' | 'failed' }

/**
 * Sends the reminder to an invite's own email address, at most once.
 *
 * The invite is marked as sent before the email goes out, and only if it
 * wasn't already, so two clicks (or the bulk command running alongside the
 * admin page) can't both send. If delivery fails the mark is cleared so it
 * can be retried.
 */
export async function sendReminderToInvite(inviteId: string): Promise<ReminderSendResult> {
  const [recipient] = await getReminderRecipients(inviteId)
  if (!recipient) return { status: 'not-attending' }
  if (!recipient.email) return { status: 'no-email' }

  const sentAt = new Date()
  const claimed = await prisma.invite.updateMany({
    where: { id: inviteId, reminderSentAt: null },
    data: { reminderSentAt: sentAt },
  })
  if (claimed.count === 0) return { status: 'already-sent' }

  try {
    await sendReminder(recipient, recipient.email)
    return { status: 'sent', sentAt }
  } catch (err) {
    console.error(`Reminder to invite ${inviteId} failed:`, err)
    await prisma.invite.updateMany({
      where: { id: inviteId, reminderSentAt: sentAt },
      data: { reminderSentAt: null },
    })
    return { status: 'failed' }
  }
}
