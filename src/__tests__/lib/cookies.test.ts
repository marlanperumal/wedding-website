// src/__tests__/lib/cookies.test.ts
import { describe, it, expect } from 'vitest'
import { signValue, verifyValue } from '@/lib/cookies'

const SECRET = 'test-secret-32-bytes-long-enough!!'

describe('signValue', () => {
  it('returns a string with a dot separator', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    expect(signed).toContain('.')
  })

  it('includes the original value before the dot', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    expect(signed.split('.')[0]).toBe('invite-id-123')
  })
})

describe('verifyValue', () => {
  it('returns the original value for a valid signed string', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const result = await verifyValue(signed, SECRET)
    expect(result).toBe('invite-id-123')
  })

  it('returns null for a tampered value', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const tampered = 'evil-id.' + signed.split('.')[1]
    const result = await verifyValue(tampered, SECRET)
    expect(result).toBeNull()
  })

  it('returns null for a missing signature', async () => {
    const result = await verifyValue('no-dot-here', SECRET)
    expect(result).toBeNull()
  })

  it('returns null when signed with a different secret', async () => {
    const signed = await signValue('invite-id-123', SECRET)
    const result = await verifyValue(signed, 'wrong-secret')
    expect(result).toBeNull()
  })
})
