import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processRsvp } from '@/lib/rsvp'

// Mock the prisma singleton
vi.mock('@/lib/prisma', () => ({
  prisma: {
    invite: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    rsvp: {
      upsert: vi.fn(),
    },
  },
}))

// Import the mock AFTER vi.mock
import { prisma } from '@/lib/prisma'

const mockInvite = {
  id: 'invite-1',
  slug: 'test-slug',
  label: 'Test Family',
  email: null,
  submitted: false,
  submittedAt: null,
  createdAt: new Date(),
  guests: [
    { id: 'guest-1', name: 'Alice', inviteId: 'invite-1' },
    { id: 'guest-2', name: 'Bob', inviteId: 'invite-1' },
  ],
  events: [
    { inviteId: 'invite-1', eventId: 'event-1' },
    { inviteId: 'invite-1', eventId: 'event-2' },
  ],
}

const mockRsvpInputs = [
  { guestId: 'guest-1', eventId: 'event-1', attending: true, dietary: ['Vegetarian'] },
  { guestId: 'guest-1', eventId: 'event-2', attending: false, dietary: [] },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.invite.findUnique).mockResolvedValue(mockInvite as any)
  vi.mocked(prisma.rsvp.upsert).mockResolvedValue({} as any)
  vi.mocked(prisma.invite.update).mockResolvedValue({
    ...mockInvite,
    submitted: true,
    email: 'alice@example.com',
  } as any)
})

describe('processRsvp', () => {
  it('upserts one Rsvp row per input', async () => {
    await processRsvp('invite-1', 'alice@example.com', mockRsvpInputs)
    expect(prisma.rsvp.upsert).toHaveBeenCalledTimes(2)
  })

  it('marks the invite as submitted with email', async () => {
    await processRsvp('invite-1', 'alice@example.com', mockRsvpInputs)
    expect(prisma.invite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'invite-1' },
        data: expect.objectContaining({ submitted: true, email: 'alice@example.com' }),
      }),
    )
  })

  it('throws if invite not found', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await expect(
      processRsvp('bad-id', 'alice@example.com', mockRsvpInputs),
    ).rejects.toThrow('Invite not found')
  })

  it('throws if guestId does not belong to invite', async () => {
    const bad = [{ guestId: 'wrong-guest', eventId: 'event-1', attending: true, dietary: [] }]
    await expect(processRsvp('invite-1', 'a@b.com', bad)).rejects.toThrow()
  })

  it('throws if eventId is not in invite', async () => {
    const bad = [{ guestId: 'guest-1', eventId: 'wrong-event', attending: true, dietary: [] }]
    await expect(processRsvp('invite-1', 'a@b.com', bad)).rejects.toThrow()
  })

  it('returns the updated invite', async () => {
    const result = await processRsvp('invite-1', 'alice@example.com', mockRsvpInputs)
    expect(result.submitted).toBe(true)
  })
})
