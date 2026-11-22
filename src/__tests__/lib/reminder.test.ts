import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invite: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/email', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/email')>()),
  deliver: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { deliver } from '@/lib/email'
import { sendReminderToInvite } from '@/lib/reminder'

const wedding = { id: 'e-wedding', name: 'Wedding & Reception', date: new Date('2026-11-27T13:00:00Z'), sortOrder: 4 }

function invite(overrides: Record<string, unknown> = {}) {
  return {
    id: 'invite-1',
    label: 'The Naidoo Family',
    email: 'naidoo@example.com',
    reminderSentAt: null,
    guests: [{ rsvps: [{ event: wedding }] }],
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.invite.findMany).mockResolvedValue([invite()] as any)
  vi.mocked(prisma.invite.updateMany).mockResolvedValue({ count: 1 } as any)
  vi.mocked(deliver).mockResolvedValue(undefined)
})

describe('sendReminderToInvite', () => {
  it('marks the invite as sent and emails its address', async () => {
    const result = await sendReminderToInvite('invite-1')

    expect(result.status).toBe('sent')
    expect(prisma.invite.updateMany).toHaveBeenCalledWith({
      where: { id: 'invite-1', reminderSentAt: null },
      data: { reminderSentAt: expect.any(Date) },
    })
    expect(deliver).toHaveBeenCalledOnce()
    expect(vi.mocked(deliver).mock.calls[0][0].to).toBe('naidoo@example.com')
  })

  it('does not send again when another request already claimed the invite', async () => {
    vi.mocked(prisma.invite.updateMany).mockResolvedValueOnce({ count: 0 } as any)

    const result = await sendReminderToInvite('invite-1')

    expect(result.status).toBe('already-sent')
    expect(deliver).not.toHaveBeenCalled()
  })

  it('refuses an invite with no email address', async () => {
    vi.mocked(prisma.invite.findMany).mockResolvedValue([invite({ email: null })] as any)

    const result = await sendReminderToInvite('invite-1')

    expect(result.status).toBe('no-email')
    expect(prisma.invite.updateMany).not.toHaveBeenCalled()
    expect(deliver).not.toHaveBeenCalled()
  })

  it('refuses an invite where nobody is attending anything', async () => {
    vi.mocked(prisma.invite.findMany).mockResolvedValue([invite({ guests: [{ rsvps: [] }] })] as any)

    const result = await sendReminderToInvite('invite-1')

    expect(result.status).toBe('not-attending')
    expect(deliver).not.toHaveBeenCalled()
  })

  it('clears the sent mark when the email fails, so it can be retried', async () => {
    vi.mocked(deliver).mockRejectedValueOnce(new Error('Resend down'))

    const result = await sendReminderToInvite('invite-1')

    expect(result.status).toBe('failed')
    expect(prisma.invite.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'invite-1', reminderSentAt: expect.any(Date) },
      data: { reminderSentAt: null },
    })
  })
  it('resends to an invite already sent when asked to, and updates the time', async () => {
    const earlier = new Date('2026-11-22T10:00:00Z')
    vi.mocked(prisma.invite.findMany).mockResolvedValue([invite({ reminderSentAt: earlier })] as any)

    const result = await sendReminderToInvite('invite-1', { resend: true })

    expect(result.status).toBe('sent')
    expect(prisma.invite.updateMany).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { reminderSentAt: expect.any(Date) },
    })
    expect(deliver).toHaveBeenCalledOnce()
  })

  it('puts back the earlier time when a resend fails', async () => {
    const earlier = new Date('2026-11-22T10:00:00Z')
    vi.mocked(prisma.invite.findMany).mockResolvedValue([invite({ reminderSentAt: earlier })] as any)
    vi.mocked(deliver).mockRejectedValueOnce(new Error('Resend down'))

    const result = await sendReminderToInvite('invite-1', { resend: true })

    expect(result.status).toBe('failed')
    expect(prisma.invite.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'invite-1', reminderSentAt: expect.any(Date) },
      data: { reminderSentAt: earlier },
    })
  })
})
