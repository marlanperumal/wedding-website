async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Buffer.from(sig).toString('base64url')
}

export async function signValue(value: string, secret: string): Promise<string> {
  const sig = await hmac(value, secret)
  return `${value}.${sig}`
}

export async function verifyValue(signed: string, secret: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return null
  const value = signed.slice(0, lastDot)
  const expected = await signValue(value, secret)
  if (expected !== signed) return null
  return value
}

// Convenience: get the guest invite ID from a raw signed cookie value
export async function extractGuestInviteId(
  cookieValue: string | undefined,
): Promise<string | null> {
  if (!cookieValue) return null
  return verifyValue(cookieValue, process.env.COOKIE_SECRET!)
}

// Convenience: get the admin session status from a raw signed cookie value
export async function extractAdminSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false
  const value = await verifyValue(cookieValue, process.env.COOKIE_SECRET!)
  return value === 'admin'
}
