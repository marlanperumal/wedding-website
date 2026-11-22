import { prisma } from '@/lib/prisma'
import { FROM, deliver, label, renderEmailLayout, serif } from '@/lib/email'
import * as reminderContent from '@/emails/reminder'

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

// Inline styles for each tag/class the content file may use. Inline because
// most email clients strip <style> blocks.
const text = `font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6;`
const centred = `${text} text-align: center;`
const PARAGRAPH_STYLES: Record<string, string> = {
  greeting: `font-family: ${serif}; font-style: italic; font-size: 22px; color: #7c5c14; text-align: center; margin: 30px 0 0;`,
  intro: `${centred} margin: 12px 0 30px;`,
  when: `font-family: ${serif}; font-style: italic; font-size: 16px; color: #7c5c14; margin: 2px 0 10px;`,
  closing: `${centred} margin: 30px 0 14px;`,
  'sign-off': `font-family: ${serif}; font-style: italic; font-size: 20px; color: #7c5c14; text-align: center; margin: 0 0 26px;`,
}
const paragraph = `${text} margin: 0 0 10px;`
const heading = `font-family: ${label}; font-size: 11px; font-weight: normal; letter-spacing: 2.5px; color: #2e7d7a; text-transform: uppercase; margin: 22px 0 0; padding-top: 18px; border-top: 1px solid rgba(176,138,54,.28);`
const link = `color: #9e6bb5; text-decoration: underline;`

const button = (href: string, label_: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
  <tr><td style="background: #7c5c14; border-radius: 2px;">
    <a style="display: inline-block; font-family: ${label}; font-size: 12px; letter-spacing: 3px; color: #f6efdf; text-transform: uppercase; text-decoration: none; padding: 14px 40px;" href="${href}">${label_}</a>
  </td></tr>
</table>`

/** Adds the email styling to the plain HTML in src/emails/reminder.ts. */
function styleBody(html: string) {
  return html
    .replace(/<a class="button" href="([^"]*)">([\s\S]*?)<\/a>/g, (_, href, text) => button(href, text.trim()))
    .replace(/<h2>/g, `<h2 style="${heading}">`)
    .replace(/<p class="([^"]*)">/g, (_, cls: string) => {
      const style = PARAGRAPH_STYLES[cls]
      if (!style) throw new Error(`Unknown class "${cls}" in src/emails/reminder.ts`)
      return `<p style="${style}">`
    })
    .replace(/<p>/g, `<p style="${paragraph}">`)
    .replace(/<a href=/g, `<a style="${link}" href=`)
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function renderReminder(recipient: Pick<ReminderRecipient, 'label'>) {
  const content = reminderContent.body(escapeHtml(recipient.label))
  return {
    subject: reminderContent.subject,
    html: renderEmailLayout({ eyebrow: reminderContent.eyebrow, body: styleBody(content) }),
    text: htmlToText(content),
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
  const { subject, html, text } = renderReminder(recipient)
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
