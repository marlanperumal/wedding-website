import { describe, it, expect } from 'vitest'
import { RsvpSchema, AdminLoginSchema, AddInviteSchema, DIETARY_OPTIONS } from '@/lib/schemas'

describe('DIETARY_OPTIONS', () => {
  it('includes the 6 fixed options', () => {
    expect(DIETARY_OPTIONS).toContain('Vegetarian')
    expect(DIETARY_OPTIONS).toContain('Vegan')
    expect(DIETARY_OPTIONS).toContain('Halal')
    expect(DIETARY_OPTIONS).toContain('Gluten-free')
    expect(DIETARY_OPTIONS).toContain('Nut allergy')
    expect(DIETARY_OPTIONS).toContain('Other')
    expect(DIETARY_OPTIONS).toHaveLength(6)
  })
})

describe('RsvpSchema', () => {
  const validRsvp = {
    email: 'guest@example.com',
    rsvps: [
      {
        guestId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
        eventId: 'clyyyyyyyyyyyyyyyyyyyyyyyyy',
        attending: true,
        dietary: ['Vegetarian'],
      },
    ],
  }

  it('accepts a valid RSVP', () => {
    const result = RsvpSchema.safeParse(validRsvp)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = RsvpSchema.safeParse({ ...validRsvp, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty rsvps array', () => {
    const result = RsvpSchema.safeParse({ ...validRsvp, rsvps: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid dietary option', () => {
    const result = RsvpSchema.safeParse({
      ...validRsvp,
      rsvps: [{ ...validRsvp.rsvps[0], dietary: ['NotADiet'] }],
    })
    expect(result.success).toBe(false)
  })

  it('defaults dietary to empty array when omitted', () => {
    const { dietary: _d, ...rsvpWithoutDietary } = validRsvp.rsvps[0]
    const result = RsvpSchema.safeParse({ ...validRsvp, rsvps: [rsvpWithoutDietary] })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rsvps[0].dietary).toEqual([])
    }
  })
})

describe('AdminLoginSchema', () => {
  it('accepts a non-empty passphrase', () => {
    expect(AdminLoginSchema.safeParse({ passphrase: 'secret' }).success).toBe(true)
  })

  it('rejects an empty passphrase', () => {
    expect(AdminLoginSchema.safeParse({ passphrase: '' }).success).toBe(false)
  })
})

describe('AddInviteSchema', () => {
  const valid = {
    label: 'The Naidoo Family',
    guestNames: ['Priya Naidoo'],
    eventIds: ['clzzzzzzzzzzzzzzzzzzzzzzzzz'],
  }

  it('accepts a valid invite without email', () => {
    expect(AddInviteSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a valid invite with email', () => {
    expect(AddInviteSchema.safeParse({ ...valid, email: 'priya@example.com' }).success).toBe(true)
  })

  it('accepts an empty string email (treat as absent)', () => {
    expect(AddInviteSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(AddInviteSchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false)
  })

  it('rejects empty label', () => {
    expect(AddInviteSchema.safeParse({ ...valid, label: '' }).success).toBe(false)
  })

  it('rejects empty guestNames array', () => {
    expect(AddInviteSchema.safeParse({ ...valid, guestNames: [] }).success).toBe(false)
  })

  it('rejects empty eventIds array', () => {
    expect(AddInviteSchema.safeParse({ ...valid, eventIds: [] }).success).toBe(false)
  })
})
