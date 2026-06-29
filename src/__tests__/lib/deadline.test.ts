import { describe, it, expect, afterEach } from 'vitest'
import { getRsvpDeadline, isRsvpClosed } from '@/lib/deadline'

const ORIGINAL = process.env.RSVP_DEADLINE

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.RSVP_DEADLINE
  else process.env.RSVP_DEADLINE = ORIGINAL
})

describe('getRsvpDeadline', () => {
  it('returns null when unset', () => {
    delete process.env.RSVP_DEADLINE
    expect(getRsvpDeadline()).toBeNull()
  })

  it('returns null when malformed', () => {
    process.env.RSVP_DEADLINE = 'not-a-date'
    expect(getRsvpDeadline()).toBeNull()
  })

  it('parses a valid ISO datetime', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(getRsvpDeadline()?.toISOString()).toBe('2026-10-15T21:59:59.000Z')
  })
})

describe('isRsvpClosed', () => {
  it('is open when no deadline configured', () => {
    delete process.env.RSVP_DEADLINE
    expect(isRsvpClosed(new Date('2099-01-01T00:00:00Z'))).toBe(false)
  })

  it('is open before the deadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(isRsvpClosed(new Date('2026-10-01T00:00:00Z'))).toBe(false)
  })

  it('is closed after the deadline', () => {
    process.env.RSVP_DEADLINE = '2026-10-15T23:59:59+02:00'
    expect(isRsvpClosed(new Date('2026-11-01T00:00:00Z'))).toBe(true)
  })
})
