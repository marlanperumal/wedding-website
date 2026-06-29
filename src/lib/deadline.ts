/** Parsed RSVP_DEADLINE, or null when unset/invalid. */
export function getRsvpDeadline(): Date | null {
  const raw = process.env.RSVP_DEADLINE
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

/** True once the global RSVP deadline has passed. Open when no deadline is set. */
export function isRsvpClosed(now: Date = new Date()): boolean {
  const deadline = getRsvpDeadline()
  if (!deadline) return false
  return now.getTime() > deadline.getTime()
}
