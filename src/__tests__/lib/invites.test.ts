import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invite: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    guest: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    inviteEvent: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    rsvp: {
      deleteMany: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
import {
  updateInviteDetails,
  addGuest,
  removeGuest,
  renameGuest,
  regenerateSlug,
  deleteInvite,
  updateInviteEvents,
} from '@/lib/invites'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.invite.update).mockResolvedValue({} as any)
  vi.mocked(prisma.invite.delete).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.create).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.update).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.delete).mockResolvedValue({} as any)
  vi.mocked(prisma.guest.findUnique).mockResolvedValue({ inviteId: 'invite-1' } as any)
  // Default: RSVPs remain, so submitted is left untouched unless a test says otherwise.
  vi.mocked(prisma.rsvp.count).mockResolvedValue(1 as any)
  // Route the interactive-transaction callback to the mocked client; pass arrays through.
  vi.mocked(prisma.$transaction).mockImplementation(async (arg: any) =>
    typeof arg === 'function' ? arg(prisma) : arg,
  )
})

describe('updateInviteDetails', () => {
  it('updates label and email without touching the slug', async () => {
    await updateInviteDetails('invite-1', { label: 'New Label', email: 'a@b.com' })
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { label: 'New Label', email: 'a@b.com' },
    })
    const call = vi.mocked(prisma.invite.update).mock.calls[0][0] as any
    expect(call.data).not.toHaveProperty('slug')
  })

  it('persists a null email', async () => {
    await updateInviteDetails('invite-1', { label: 'X', email: null })
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { label: 'X', email: null },
    })
  })
})

describe('addGuest', () => {
  it('creates a guest on the invite', async () => {
    await addGuest('invite-1', 'Priya')
    expect(prisma.guest.create).toHaveBeenCalledWith({
      data: { inviteId: 'invite-1', name: 'Priya' },
    })
  })
})

describe('removeGuest', () => {
  it('deletes the guest (RSVPs cascade via schema)', async () => {
    await removeGuest('guest-1')
    expect(prisma.guest.delete).toHaveBeenCalledWith({ where: { id: 'guest-1' } })
  })

  it('resets submitted/submittedAt when no RSVPs remain on the invite', async () => {
    vi.mocked(prisma.guest.findUnique).mockResolvedValue({ inviteId: 'invite-1' } as any)
    vi.mocked(prisma.rsvp.count).mockResolvedValue(0 as any)
    await removeGuest('guest-1')
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { submitted: false, submittedAt: null },
    })
  })

  it('leaves submitted untouched when RSVPs remain', async () => {
    vi.mocked(prisma.guest.findUnique).mockResolvedValue({ inviteId: 'invite-1' } as any)
    vi.mocked(prisma.rsvp.count).mockResolvedValue(2 as any)
    await removeGuest('guest-1')
    expect(prisma.invite.update).not.toHaveBeenCalled()
  })
})

describe('renameGuest', () => {
  it('updates the guest name', async () => {
    await renameGuest('guest-1', 'Priya Naidoo')
    expect(prisma.guest.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: { name: 'Priya Naidoo' },
    })
  })
})

describe('regenerateSlug', () => {
  it('sets a new slug derived from the label, different from the old one', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: 'invite-1',
      label: 'The Naidoo Family',
      slug: 'the-naidoo-family-aaaa',
    } as any)
    await regenerateSlug('invite-1')
    const call = vi.mocked(prisma.invite.update).mock.calls[0][0] as any
    expect(call.where).toEqual({ id: 'invite-1' })
    expect(call.data.slug).toMatch(/^the-naidoo-family-[0-9a-f]{4}$/)
    expect(call.data.slug).not.toBe('the-naidoo-family-aaaa')
  })

  it('throws if the invite is not found', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await expect(regenerateSlug('bad')).rejects.toThrow('Invite not found')
  })
})

describe('deleteInvite', () => {
  it('deletes the invite (guests/links/rsvps cascade via schema)', async () => {
    await deleteInvite('invite-1')
    expect(prisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'invite-1' } })
  })
})

describe('updateInviteEvents', () => {
  beforeEach(() => {
    vi.mocked(prisma.inviteEvent.findMany).mockResolvedValue([
      { eventId: 'e1' },
      { eventId: 'e2' },
    ] as any)
    vi.mocked(prisma.rsvp.deleteMany).mockReturnValue({} as any)
    vi.mocked(prisma.inviteEvent.deleteMany).mockReturnValue({} as any)
    vi.mocked(prisma.inviteEvent.createMany).mockReturnValue({} as any)
  })

  it('adds newly-checked events and removes unchecked ones', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])

    expect(prisma.inviteEvent.deleteMany).toHaveBeenCalledWith({
      where: { inviteId: 'invite-1', eventId: { in: ['e1'] } },
    })
    expect(prisma.inviteEvent.createMany).toHaveBeenCalledWith({
      data: [{ inviteId: 'invite-1', eventId: 'e3' }],
    })
  })

  it('deletes orphaned RSVPs only for removed events and only for this invite', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])

    expect(prisma.rsvp.deleteMany).toHaveBeenCalledWith({
      where: { eventId: { in: ['e1'] }, guest: { inviteId: 'invite-1' } },
    })
  })

  it('wraps the writes in a single transaction', async () => {
    await updateInviteEvents('invite-1', ['e2', 'e3'])
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('resets submitted/submittedAt when no RSVPs remain after unassigning events', async () => {
    vi.mocked(prisma.rsvp.count).mockResolvedValue(0 as any)
    await updateInviteEvents('invite-1', ['e2'])
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { submitted: false, submittedAt: null },
    })
  })

  it('leaves submitted untouched when RSVPs remain', async () => {
    vi.mocked(prisma.rsvp.count).mockResolvedValue(4 as any)
    await updateInviteEvents('invite-1', ['e2'])
    expect(prisma.invite.update).not.toHaveBeenCalled()
  })
})
