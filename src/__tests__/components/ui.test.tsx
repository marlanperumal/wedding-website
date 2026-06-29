import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccentBar } from '@/components/ui/AccentBar'
import { EventPill } from '@/components/ui/EventPill'
import { SiteNav } from '@/components/ui/SiteNav'

describe('AccentBar', () => {
  it('renders a decorative hairline rule', () => {
    const html = renderToStaticMarkup(<AccentBar />)
    expect(html).toContain('aria-hidden')
  })
})

describe('EventPill', () => {
  it('renders the event name', () => {
    const html = renderToStaticMarkup(<EventPill name="Mehndi" />)
    expect(html).toContain('Mehndi')
  })

  it('renders any event name as a gold-tinted tag', () => {
    const html = renderToStaticMarkup(<EventPill name="Unknown" />)
    expect(html).toContain('Unknown')
    // Marigold redesign: a single gold-tinted pill, no per-event fill colour.
    expect(html).toContain('rgba(176,138,54,.14)')
  })
})

describe('SiteNav', () => {
  it('renders the couple name wordmark', () => {
    const html = renderToStaticMarkup(<SiteNav />)
    expect(html).toContain('LIEDEMAN')
    expect(html).toContain('PERUMAL')
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
