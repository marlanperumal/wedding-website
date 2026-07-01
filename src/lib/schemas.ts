import { z } from 'zod'

export const DIETARY_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Dairy free',
  'Gluten free',
  'Halaal',
  'Allergies (please specify)',
] as const

export type DietaryOption = (typeof DIETARY_OPTIONS)[number]

export const RsvpSchema = z.object({
  email: z.string().email(),
  rsvps: z
    .array(
      z.object({
        guestId: z.string().cuid(),
        eventId: z.string().cuid(),
        attending: z.boolean(),
        dietary: z.array(z.enum(DIETARY_OPTIONS)).default([]),
        dietaryNotes: z.string().max(500).optional(),
      }),
    )
    .min(1),
})

export const AdminLoginSchema = z.object({
  passphrase: z.string().min(1),
})

export const AddInviteSchema = z.object({
  label: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  guestNames: z.array(z.string().min(1)).min(1),
  eventIds: z.array(z.string().cuid()).min(1),
})
