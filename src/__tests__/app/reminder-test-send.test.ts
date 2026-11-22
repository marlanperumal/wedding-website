import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: 'signed' }) })),
}))
vi.mock('@/lib/cookies', () => ({ extractAdminSession: vi.fn(async () => true) }))
vi.mock('@/lib/email', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/email')>()),
  deliver: vi.fn(),
}))
// Any database access from a test send would be a bug: it must never look up
// guests' addresses or mark invites as sent.
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_, key) => { throw new Error(`test send touched prisma.${String(key)}`) } }),
}))

import { deliver } from '@/lib/email'
import { extractAdminSession } from '@/lib/cookies'
import { sendTestReminderAction } from '@/app/admin/reminder/actions'

function form(to: string) {
  const data = new FormData()
  data.set('to', to)
  return data
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(deliver).mockResolvedValue(undefined)
})

describe('sendTestReminderAction', () => {
  it('sends exactly one email, to the typed address only', async () => {
    await expect(sendTestReminderAction(form('me@example.test'))).rejects.toThrow('REDIRECT:/admin/reminder?sent=ok')

    expect(deliver).toHaveBeenCalledOnce()
    expect(vi.mocked(deliver).mock.calls[0][0].to).toBe('me@example.test')
  })

  it('sends nothing for an invalid address', async () => {
    await expect(sendTestReminderAction(form('not an email'))).rejects.toThrow('sent=bad-address')
    expect(deliver).not.toHaveBeenCalled()
  })

  it('sends nothing without an admin login', async () => {
    vi.mocked(extractAdminSession).mockResolvedValueOnce(false)
    await expect(sendTestReminderAction(form('me@example.test'))).rejects.toThrow('REDIRECT:/admin')
    expect(deliver).not.toHaveBeenCalled()
  })
})
