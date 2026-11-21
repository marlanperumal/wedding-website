import { prisma } from '@/lib/prisma'
import { BASE_URL, FROM, deliver, label, renderEmailLayout, serif } from '@/lib/email'

export interface ReminderEvent {
  name: string
  date: Date
}

export interface ReminderRecipient {
  inviteId: string
  label: string
  email: string | null
  /** Events at least one guest on the invite said yes to, in programme order. */
  events: ReminderEvent[]
}

/**
 * Every invite with at least one guest attending at least one event. Invites
 * without an email are included (the admin preview shows them) but can't be
 * sent to.
 */
export async function getReminderRecipients(): Promise<ReminderRecipient[]> {
  const invites = await prisma.invite.findMany({
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
      return { inviteId: invite.id, label: invite.label, email: invite.email, events }
    })
    .filter((r) => r.events.length > 0)
}

// Event names come from the database; match loosely so "Wedding & Reception"
// and similar variants still land in the right section.
const find = (events: ReminderEvent[], pattern: RegExp) => events.find((e) => pattern.test(e.name))

const when = (date: Date) => {
  const day = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Johannesburg',
  })
  const time = date
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Johannesburg',
    })
    .replace(':00', '')
    .replace(' ', '')
  return `${day} &middot; ${time}`
}

const CEREMONIES_URL = `${BASE_URL}/ceremonies`
const SONG_URL = 'https://www.youtube.com/watch?v=usVq_4K_m_w'

// Styles for the email body. Inline because most email clients strip <style>.
const sectionTitle = `font-family: ${label}; font-size: 11px; letter-spacing: 2.5px; color: #2e7d7a; text-transform: uppercase; margin: 0;`
const sectionWhen = `font-family: ${serif}; font-style: italic; font-size: 16px; color: #7c5c14; margin: 2px 0 10px;`
const para = `font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6; margin: 0 0 10px;`
const link = `color: #9e6bb5; text-decoration: underline;`

function section(title: string, whenHtml: string, paragraphs: string[]) {
  return `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 22px;">
                      <tr><td style="border-top: 1px solid rgba(176,138,54,.28); padding: 18px 2px 0;">
                        <p style="${sectionTitle}">${title}</p>
                        <p style="${sectionWhen}">${whenHtml}</p>
                        ${paragraphs.map((p) => `<p style="${para}">${p}</p>`).join('\n                        ')}
                      </td></tr>
                    </table>`
}

export function renderReminder(recipient: Pick<ReminderRecipient, 'label' | 'events'>) {
  const { events } = recipient
  const mehndi = find(events, /mehndi/i)
  const nelengu = find(events, /nelengu/i)
  const sangeet = find(events, /sangeet/i)
  const wedding = find(events, /wedding/i)

  const parking =
    'Parking is available in the parking lot on Orient Road, opposite the Apostolic Church.'

  // ─── Email content: edit the wording below ───────────────────────────────
  const subject = "One week to go — Marlan & Tramaine's Wedding"
  const eyebrow = 'One week to go'
  const intro =
    'We can&rsquo;t believe it&rsquo;s almost here! Here are a few things to know before the celebrations begin.'

  const sections: string[] = []

  if (mehndi || nelengu) {
    const lines: string[] = []
    if (mehndi) lines.push('The Mehndi is at our home.')
    if (nelengu) lines.push('The Nelengu is at Sam&rsquo;s.')
    if (mehndi) lines.push(parking)
    const title = mehndi && nelengu ? 'Mehndi &amp; Nelengu' : mehndi ? 'Mehndi' : 'Nelengu'
    sections.push(section(title, when((mehndi ?? nelengu)!.date), lines))
  }

  if (sangeet) {
    sections.push(
      section('Sangeet', when(sangeet.date), [
        'Come whenever suits you &mdash; it&rsquo;s absolutely fine to arrive later or leave earlier. We&rsquo;ll be serving vegetarian breyani.',
        ...(mehndi ? [] : [parking]),
      ]),
    )
  }

  if (wedding) {
    sections.push(
      section('The Wedding', when(wedding.date), [
        'Please arrive by 3pm &mdash; the ceremony starts promptly at 3:30pm.',
        'There are road works in the area at the moment, so please leave plenty of time to travel on the day.',
        `Curious about what happens during the ceremony? We&rsquo;ve put together a <a href="${CEREMONIES_URL}" style="${link}">guide to the ceremonies</a> on the website.`,
        `Our wedding song &amp; dance is <a href="${SONG_URL}" style="${link}">Panwadi</a> &mdash; have a listen before the day.`,
      ]),
    )
  }

  const closing =
    'We&rsquo;re looking forward to seeing you all dressed up, and to sharing these moments with you.'
  const signOff = 'With love,<br>Marlan &amp; Tramaine'
  // ─────────────────────────────────────────────────────────────────────────

  const html = renderEmailLayout({
    eyebrow,
    body: `
                    <!-- Greeting -->
                    <p style="font-family: ${serif}; font-style: italic; font-size: 22px; color: #7c5c14; text-align: center; margin: 30px 0 0;">Dear ${recipient.label},</p>
                    <p style="font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6; text-align: center; margin: 12px 0 30px;">
                      ${intro}
                    </p>
${sections.join('\n')}

                    <!-- Closing -->
                    <p style="font-family: ${serif}; font-size: 17px; color: #5c4e2e; line-height: 1.6; text-align: center; margin: 30px 0 14px;">
                      ${closing}
                    </p>
                    <p style="font-family: ${serif}; font-style: italic; font-size: 20px; color: #7c5c14; text-align: center; margin: 0 0 26px;">${signOff}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                      <tr><td style="background: #7c5c14; border-radius: 2px;">
                        <a href="${CEREMONIES_URL}" style="display: inline-block; font-family: ${label}; font-size: 12px; letter-spacing: 3px; color: #f6efdf; text-transform: uppercase; text-decoration: none; padding: 14px 40px;">The Ceremonies</a>
                      </td></tr>
                    </table>
`,
  })

  return { subject, html, text: htmlToText(`Dear ${recipient.label},<br><br>${intro}<br><br>${sections.join('<br>')}<br>${closing}<br><br>${signOff}`) }
}

/** Plain-text fallback derived from the HTML, so the two never drift apart. */
function htmlToText(html: string) {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '$2 ($1)')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '’')
    .replace(/&mdash;/g, '—')
    .replace(/&middot;/g, '·')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function sendReminder(recipient: ReminderRecipient, to: string) {
  const { subject, html, text } = renderReminder(recipient)
  await deliver({ from: FROM, to, subject, html, text })
}
