// Build a Google Calendar "add event" URL from an event.
// Most events default to a 4-hour block; a few have a known longer run.

const DEFAULT_DURATION_HOURS = 4

// Per-event overrides where the website states a specific end time.
// Wedding & Reception: arrive 15:00 → reception until ~23:30 (8.5 hours).
const DURATION_HOURS_BY_NAME: Record<string, number> = {
  'Wedding & Reception': 8.5,
  // Mehndi and Nelengu run 10:00 → 13:00.
  Mehndi: 3,
  Nelengu: 3,
}

type CalendarEvent = {
  name: string
  date: Date
  address: string
}

// Google Calendar expects UTC basic format: YYYYMMDDTHHMMSSZ
function formatUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const start = event.date
  const durationHours = DURATION_HOURS_BY_NAME[event.name] ?? DEFAULT_DURATION_HOURS
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.name} — Marlan & Tramaine`,
    dates: `${formatUtc(start)}/${formatUtc(end)}`,
    location: event.address,
    details: `You are invited to the ${event.name} celebration of Marlan Perumal and Tramaine Liedeman.`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
