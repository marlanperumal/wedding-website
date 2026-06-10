/**
 * Proxy smoke test.
 *
 * next/server relies on the Next.js Edge runtime and cannot be executed in
 * Vitest's Node environment, so it is mocked here. Full route-guard behaviour
 * is covered by E2E tests (Playwright / integration).
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url: URL) => ({ type: 'redirect', url })),
    next: vi.fn(() => ({ type: 'next' })),
  },
}))

import { proxy, config } from '@/proxy'

describe('proxy exports', () => {
  it('exports a proxy function', () => {
    expect(typeof proxy).toBe('function')
  })

  it('exports a config with a matcher array', () => {
    expect(config.matcher).toBeDefined()
    expect(Array.isArray(config.matcher)).toBe(true)
  })

  it('matcher includes /rsvp/:path*', () => {
    expect(config.matcher).toContain('/rsvp/:path*')
  })

  it('matcher includes /admin/dashboard/:path*', () => {
    expect(config.matcher).toContain('/admin/dashboard/:path*')
  })

  it('matcher includes /admin/guests/:path*', () => {
    expect(config.matcher).toContain('/admin/guests/:path*')
  })
})
