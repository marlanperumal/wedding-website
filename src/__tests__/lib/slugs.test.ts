import { describe, it, expect } from 'vitest'
import { labelToSlugBase, generateInviteSlug } from '@/lib/slugs'

describe('labelToSlugBase', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(labelToSlugBase('The Naidoo Family')).toBe('the-naidoo-family')
  })

  it('removes leading articles and special chars', () => {
    expect(labelToSlugBase("O'Brien & Partners")).toBe('obrien-partners')
  })

  it('collapses multiple dashes', () => {
    expect(labelToSlugBase('A  B')).toBe('a-b')
  })

  it('trims leading and trailing dashes', () => {
    expect(labelToSlugBase(' Hello ')).toBe('hello')
  })
})

describe('generateInviteSlug', () => {
  it('starts with the label base', () => {
    const slug = generateInviteSlug('Naidoo Family')
    expect(slug.startsWith('naidoo-family-')).toBe(true)
  })

  it('has a 4-char alphanumeric suffix', () => {
    const slug = generateInviteSlug('Naidoo Family')
    const suffix = slug.split('-').pop()!
    expect(suffix).toMatch(/^[a-z0-9]{4}$/)
  })

  it('generates unique slugs', () => {
    const slugs = new Set(Array.from({ length: 10 }, () => generateInviteSlug('Test')))
    expect(slugs.size).toBeGreaterThan(1)
  })
})
