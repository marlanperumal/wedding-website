import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { invite: { findUnique: vi.fn() } },
}))

const cookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: cookieSet, get: vi.fn() })),
}))

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}))

import { prisma } from '@/lib/prisma'
import { enterInviteCode } from '@/app/(site)/rsvp/actions'

function fd(code: string) {
  const f = new FormData()
  f.set('code', code)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.COOKIE_SECRET = 'test-secret-please-change-0123456789abcdef'
})

describe('enterInviteCode', () => {
  it('returns an error and sets no cookie when the code is unknown', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    const result = await enterInviteCode({}, fd('nope-1234'))
    expect(result.error).toBeTruthy()
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('normalizes the code (trim + lowercase) before lookup', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    await enterInviteCode({}, fd('  Smith-AB12  '))
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: { slug: 'smith-ab12' },
    })
  })

  it('sets the signed cookie and redirects to /rsvp on a hit', async () => {
    vi.mocked(prisma.invite.findUnique).mockResolvedValue({ id: 'invite-1' } as any)
    await expect(enterInviteCode({}, fd('smith-ab12'))).rejects.toThrow(
      'NEXT_REDIRECT:/rsvp',
    )
    expect(cookieSet).toHaveBeenCalledWith(
      'guestInviteId',
      expect.stringContaining('invite-1.'),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    )
  })

  it('returns an error for an empty code', async () => {
    const result = await enterInviteCode({}, fd('   '))
    expect(result.error).toBeTruthy()
    expect(prisma.invite.findUnique).not.toHaveBeenCalled()
  })
})
