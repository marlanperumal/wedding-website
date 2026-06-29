import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccentBar } from '@/components/ui/AccentBar'
import { EventPill } from '@/components/ui/EventPill'
import { SiteNav } from '@/components/ui/SiteNav'

describe('AccentBar', () => {
  it('renders without error', () => {
    const html = renderToStaticMarkup(<AccentBar />)
    expect(html).toContain('accent-bar')
  })
})

describe('EventPill', () => {
  it('renders the event name', () => {
    const html = renderToStaticMarkup(<EventPill name="Mehndi" />)
    expect(html).toContain('Mehndi')
  })

  it('applies the correct colour for Mehndi', () => {
    const html = renderToStaticMarkup(<EventPill name="Mehndi" />)
    expect(html).toContain('#7A4C8C')
  })

  it('applies the correct colour for Wedding', () => {
    const html = renderToStaticMarkup(<EventPill name="Wedding" />)
    expect(html).toContain('#3DA4A1')
  })

  it('falls back to orchid purple for unknown events', () => {
    const html = renderToStaticMarkup(<EventPill name="Unknown" />)
    expect(html).toContain('#9E6BB5')
  })
})

describe('SiteNav', () => {
  it('renders the couple name wordmark', () => {
    const html = renderToStaticMarkup(<SiteNav />)
    expect(html).toContain('Liedeman')
    expect(html).toContain('Perumal')
  })

  it('renders an RSVP link', () => {
    const html = renderToStaticMarkup(<SiteNav />)
    expect(html).toContain('href="/rsvp"')
    expect(html).toContain('RSVP')
  })

  it('shows a completion badge when rsvpStatus is submitted', () => {
    const html = renderToStaticMarkup(<SiteNav rsvpStatus="submitted" />)
    expect(html).toContain('✓')
  })

  it('shows no completion badge when rsvpStatus is none', () => {
    const html = renderToStaticMarkup(<SiteNav rsvpStatus="none" />)
    expect(html).not.toContain('✓')
  })
})
