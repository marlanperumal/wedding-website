import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const FROM = 'Marlan & Tramaine <wedding@liedeman.perumal.co.za>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://wedding.liedeman.perumal.co.za'

interface EmailMessage {
  from: string
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Sends an email via whichever transport is configured:
 * - SMTP_HOST set → a local SMTP catcher (e.g. Mailpit in dev). Takes precedence.
 * - else RESEND_API_KEY set → Resend (production).
 * - else → logged and skipped (no transport configured).
 */
async function deliver(message: EmailMessage) {
  if (process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
    await transport.sendMail(message)
    return
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send(message)
    return
  }

  console.warn('[email] No SMTP_HOST or RESEND_API_KEY set — skipping email')
}

interface AttendingEvent {
  name: string
  venue: string
  date: Date
}

interface GuestConfirmation {
  name: string
  attendingEvents: AttendingEvent[]
  dietary: string[]
  dietaryNotes?: string
}

interface RsvpConfirmationParams {
  to: string
  guests: GuestConfirmation[]
}

function formatEventDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

function formatDietary(guest: GuestConfirmation) {
  const parts = [...guest.dietary]
  if (guest.dietaryNotes?.trim()) parts.push(guest.dietaryNotes.trim())
  return parts.join(', ')
}

export async function sendRsvpConfirmation({
  to,
  guests,
}: RsvpConfirmationParams) {
  const guestNames = guests.map((g) => g.name)
  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(', ') + ' & ' + guestNames.at(-1)

  const guestTextSections = guests
    .map((guest) => {
      const lines = [guest.name]
      if (guest.attendingEvents.length > 0) {
        lines.push(
          ...guest.attendingEvents.map(
            (e) => `  • ${e.name} — ${formatEventDate(e.date)} at ${e.venue}`,
          ),
        )
      } else {
        lines.push('  Not attending — we’ll miss you!')
      }
      const dietary = formatDietary(guest)
      if (dietary) lines.push(`  Dietary: ${dietary}`)
      return lines.join('\n')
    })
    .join('\n\n')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; background: #FAF4EE; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: white; border: 1px solid #F4A261;">
    <div style="height: 4px; background: linear-gradient(90deg, #7A4C8C, #F4A261, #3DA4A1, #F4A261, #7A4C8C);"></div>
    <div style="padding: 40px;">
      <p style="font-size: 11px; letter-spacing: 5px; color: #9E6BB5; text-transform: uppercase; font-family: sans-serif; margin: 0 0 12px;">You&rsquo;re confirmed</p>
      <h1 style="font-size: 32px; font-style: italic; color: #2E1A10; margin: 0 0 8px;">Marlan &amp; Tramaine</h1>
      <div style="height: 1px; background: #F4A261; margin: 16px 0;"></div>
      <p style="font-size: 15px; color: #2E1A10; margin: 0 0 20px;">Dear ${greeting},</p>
      <p style="font-size: 14px; color: #2E1A10; line-height: 1.6; margin: 0 0 24px;">
        Thank you for your RSVP! We are so excited to celebrate with you.
      </p>
      ${guests
        .map((guest) => {
          const dietary = formatDietary(guest)
          return `
      <div style="margin: 0 0 28px; padding: 0 0 4px;">
        <p style="font-size: 11px; letter-spacing: 3px; color: #3DA4A1; text-transform: uppercase; font-family: sans-serif; margin: 0 0 10px;">${guest.name}</p>
        ${
          guest.attendingEvents.length > 0
            ? `<ul style="font-size: 14px; color: #2E1A10; line-height: 2; padding-left: 20px; margin: 0 0 8px;">
        ${guest.attendingEvents
          .map(
            (e) =>
              `<li><strong>${e.name}</strong> — ${formatEventDate(e.date)}, ${e.venue}</li>`,
          )
          .join('')}
      </ul>`
            : `<p style="font-size: 14px; color: #2E1A10; font-style: italic; margin: 0 0 8px;">Not attending &mdash; we&rsquo;ll miss you!</p>`
        }
        ${
          dietary
            ? `<p style="font-size: 13px; color: #2E1A10; font-family: sans-serif; margin: 0; padding-left: 20px;"><span style="color: #9E6BB5;">Dietary:</span> ${dietary}</p>`
            : ''
        }
      </div>`
        })
        .join('')}
      <p style="font-size: 14px; color: #2E1A10; line-height: 1.6; margin: 0 0 24px;">
        Full venue addresses and calendar downloads are available on your confirmation page:
      </p>
      <a href="${BASE_URL}/rsvp/confirmed"
         style="display: inline-block; background: #F4A261; color: white; padding: 14px 28px; font-family: sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
        View Confirmation
      </a>
      <div style="height: 1px; background: #eee; margin: 32px 0 24px;"></div>
      <p style="font-size: 12px; color: #999; font-family: sans-serif; margin: 0;">
        With love,<br>Marlan &amp; Tramaine
      </p>
    </div>
    <div style="height: 4px; background: linear-gradient(90deg, #7A4C8C, #F4A261, #3DA4A1, #F4A261, #7A4C8C);"></div>
  </div>
</body>
</html>`

  const text = `Dear ${greeting},\n\nThank you for your RSVP! We are so excited to celebrate with you.\n\n${guestTextSections}\n\nFull venue addresses and .ics calendar downloads: ${BASE_URL}/rsvp/confirmed\n\nWith love,\nMarlan & Tramaine`

  await deliver({
    from: FROM,
    to,
    subject: `You're confirmed — Marlan & Tramaine, November 2026`,
    html,
    text,
  })
}
