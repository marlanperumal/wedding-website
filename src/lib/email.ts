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
    // The Resend SDK does not throw on API errors — it returns { data, error }.
    // Throw so the caller's try/catch can log the failure instead of silently swallowing it.
    const { error } = await resend.emails.send(message)
    if (error) {
      throw new Error(`Resend send failed: ${error.name} — ${error.message}`)
    }
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
  inviteLabel: string
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
  inviteLabel,
  guests,
}: RsvpConfirmationParams) {
  const greeting = inviteLabel

  // Everyone in the party has declined every event — swap the celebratory
  // framing for something appropriate.
  const allDeclined =
    guests.length > 0 && guests.every((g) => g.attendingEvents.length === 0)

  const eyebrow = allDeclined ? 'We&rsquo;ll miss you' : 'You&rsquo;re confirmed'
  const introHtml = allDeclined
    ? 'Thank you for letting us know. We&rsquo;re sorry you can&rsquo;t join us, but you&rsquo;ll be in our thoughts on the day.'
    : 'Thank you for your RSVP &mdash; we are so excited to celebrate with you.'
  const ctaHtml = allDeclined
    ? 'If you declined by mistake, you can edit your RSVP on the website.'
    : 'Full venue addresses and links to add each event to Google Calendar are on your confirmation page.'
  const introText = allDeclined
    ? 'Thank you for letting us know. We’re sorry you can’t join us, but you’ll be in our thoughts on the day.'
    : 'Thank you for your RSVP! We are so excited to celebrate with you.'
  const ctaText = allDeclined
    ? `If you declined by mistake, you can edit your RSVP on the website: ${BASE_URL}/rsvp/confirmed`
    : `Full venue addresses and links to add each event to Google Calendar: ${BASE_URL}/rsvp/confirmed`
  const subject = allDeclined
    ? `We'll miss you — Marlan & Tramaine's Wedding, November 2026`
    : `You're confirmed for our Wedding, November 2026`

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

  // Brand palette + type mirroring the website (see src/app/globals.css).
  // Web fonts are progressive enhancement (Apple Mail); everything falls back
  // to Georgia/serif, which most email clients render.
  const serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
  const label = "'Cinzel', Georgia, serif"
  const script = "'Parisienne', 'Snell Roundhand', Georgia, cursive"

  const diamond = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 22px auto;">
        <tr>
          <td style="width: 64px; height: 1px; background: #b08a36; font-size: 0; line-height: 0;">&nbsp;</td>
          <td style="padding: 0 10px; color: #b08a36; font-size: 11px; line-height: 1;">&#9670;</td>
          <td style="width: 64px; height: 1px; background: #b08a36; font-size: 0; line-height: 0;">&nbsp;</td>
        </tr>
      </table>`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Parisienne&display=swap');
  </style>
</head>
<body style="font-family: ${serif}; background: #f4ecda; margin: 0; padding: 0; -webkit-text-size-adjust: 100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f4ecda;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Double gold hairline frame (echoes the site's invitation card) -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; background: #f6efdf; border: 1px solid #c2a14e;">
          <tr>
            <td style="padding: 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #faf4e6; border: 1px solid #d3bd85;">
                <tr>
                  <td style="padding: 44px 40px 40px;">

                    <!-- Header -->
                    <p style="font-family: ${label}; font-size: 12px; letter-spacing: 5px; color: #7c5c14; text-transform: uppercase; text-align: center; margin: 0;">${eyebrow}</p>
                    <p style="font-family: ${script}; font-size: 44px; font-style: italic; color: #8a5f10; text-align: center; line-height: 1.1; margin: 10px 0 0;">Marlan &amp; Tramaine&rsquo;s<br>Wedding</p>
                    ${diamond}
                    <p style="font-family: ${label}; font-size: 13px; letter-spacing: 3px; color: #7c5c14; text-transform: uppercase; text-align: center; margin: 0;">26 &amp; 27 November 2026</p>
                    <p style="font-family: ${serif}; font-size: 17px; color: #856312; text-align: center; margin: 5px 0 0;">Cape Town, South Africa</p>

                    <!-- Greeting -->
                    <p style="font-family: ${serif}; font-style: italic; font-size: 22px; color: #7c5c14; text-align: center; margin: 30px 0 0;">Dear ${greeting},</p>
                    <p style="font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6; text-align: center; margin: 12px 0 30px;">
                      ${introHtml}
                    </p>

                    ${guests
                      .map((guest) => {
                        const dietary = formatDietary(guest)
                        return `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 22px;">
                      <tr><td style="border-top: 1px solid rgba(176,138,54,.28); padding: 18px 2px 0;">
                        <p style="font-family: ${label}; font-size: 11px; letter-spacing: 2.5px; color: #2e7d7a; text-transform: uppercase; margin: 0 0 12px;">${guest.name}</p>
                        ${
                          guest.attendingEvents.length > 0
                            ? guest.attendingEvents
                                .map(
                                  (e) => `
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 9px;">
                          <tr>
                            <td valign="middle"><span style="display: inline-block; font-family: ${label}; font-size: 9px; letter-spacing: 1px; color: #7c5c14; text-transform: uppercase; background: #f1e7cd; border: 1px solid #d9c48a; border-radius: 11px; padding: 4px 10px; white-space: nowrap;">${e.name}</span></td>
                            <td valign="middle" style="padding-left: 10px; font-family: ${serif}; font-size: 16px; color: #5c4e2e;">${formatEventDate(e.date)} &middot; ${e.venue}</td>
                          </tr>
                        </table>`,
                                )
                                .join('')
                            : `<p style="font-family: ${serif}; font-style: italic; font-size: 16px; color: #7c6a44; margin: 0;">Not attending &mdash; we&rsquo;ll miss you!</p>`
                        }
                        ${
                          dietary
                            ? `<p style="font-family: ${serif}; font-size: 15px; color: #5c4e2e; margin: 8px 0 0;"><span style="font-family: ${label}; font-size: 10px; letter-spacing: 1.5px; color: #9e6bb5; text-transform: uppercase;">Dietary</span> &nbsp;${dietary}</p>`
                            : ''
                        }
                      </td></tr>
                    </table>`
                      })
                      .join('')}

                    <!-- Call to action -->
                    <p style="font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6; text-align: center; margin: 30px 0 22px;">
                      ${ctaHtml}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                      <tr><td style="background: #7c5c14; border-radius: 2px;">
                        <a href="${BASE_URL}/rsvp/confirmed" style="display: inline-block; font-family: ${label}; font-size: 12px; letter-spacing: 3px; color: #f6efdf; text-transform: uppercase; text-decoration: none; padding: 14px 40px;">View Confirmation</a>
                      </td></tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer band (mirrors the site footer) -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; background: #7c5c14;">
          <tr>
            <td align="center" style="padding: 30px 24px;">
              <p style="font-family: ${script}; font-size: 30px; font-style: italic; color: #f6ecd0; line-height: 1; margin: 0;">Marlan &amp; Tramaine</p>
              <p style="font-family: ${label}; font-size: 11px; letter-spacing: 3px; color: #dcc99a; text-transform: uppercase; margin: 10px 0 0;">26 &amp; 27 November 2026 &middot; Cape Town</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `Dear ${greeting},\n\n${introText}\n\n${guestTextSections}\n\n${ctaText}\n\nWith love,\nMarlan & Tramaine`

  await deliver({
    from: FROM,
    to,
    subject,
    html,
    text,
  })
}
