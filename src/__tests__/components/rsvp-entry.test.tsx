import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/app/rsvp/actions', () => ({
  enterInviteCode: vi.fn(),
}))

import { RsvpEntry } from '@/components/rsvp/RsvpEntry'

describe('RsvpEntry', () => {
  it('renders a labelled code input and submit button', () => {
    const html = renderToStaticMarkup(<RsvpEntry />)
    expect(html).toContain('name="code"')
    expect(html.toLowerCase()).toContain('invitation code')
  })
})
