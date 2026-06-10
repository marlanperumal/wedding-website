import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Marlan & Tramaine <wedding@liedeman.perumal.co.za>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://wedding.liedeman.perumal.co.za'

interface AttendingEvent {
  name: string
  venue: string
  date: Date
}

interface RsvpConfirmationParams {
  to: string
  guestNames: string[]
  attendingEvents: AttendingEvent[]
}

export async function sendRsvpConfirmation({
  to,
  guestNames,
  attendingEvents,
}: RsvpConfirmationParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping confirmation email')
    return
  }

  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(', ') + ' & ' + guestNames.at(-1)

  const eventLines = attendingEvents
    .map((e) => {
      const dateStr = e.date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
      return `• ${e.name} — ${dateStr} at ${e.venue}`
    })
    .join('\n')

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
      ${
        attendingEvents.length > 0
          ? `
      <p style="font-size: 11px; letter-spacing: 3px; color: #3DA4A1; text-transform: uppercase; font-family: sans-serif; margin: 0 0 12px;">You&rsquo;re attending</p>
      <ul style="font-size: 14px; color: #2E1A10; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
        ${attendingEvents
          .map((e) => {
            const dateStr = e.date.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'UTC',
            })
            return `<li><strong>${e.name}</strong> — ${dateStr}, ${e.venue}</li>`
          })
          .join('')}
      </ul>
      `
          : ''
      }
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

  const text = `Dear ${greeting},\n\nThank you for your RSVP! We are so excited to celebrate with you.\n\n${
    attendingEvents.length > 0 ? `You're attending:\n${eventLines}\n\n` : ''
  }Full venue addresses and .ics calendar downloads: ${BASE_URL}/rsvp/confirmed\n\nWith love,\nMarlan & Tramaine`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're confirmed — Marlan & Tramaine, November 2026`,
    html,
    text,
  })
}
