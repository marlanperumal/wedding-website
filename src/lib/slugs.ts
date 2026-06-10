import { randomBytes } from 'crypto'

export function labelToSlugBase(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function randomSuffix(): string {
  return randomBytes(3).toString('hex').slice(0, 4)
}

export function generateInviteSlug(label: string): string {
  return `${labelToSlugBase(label)}-${randomSuffix()}`
}
