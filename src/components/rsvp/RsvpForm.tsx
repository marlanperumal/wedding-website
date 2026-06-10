'use client'
import { useState } from 'react'
import { GuestCard } from './GuestCard'
import { submitRsvp } from '@/app/rsvp/actions'
import type { RsvpInput } from '@/lib/rsvp'

interface GuestData {
  id: string
  name: string
}

interface EventData {
  id: string
  name: string
  date: Date
  sortOrder: number
}

interface ExistingRsvp {
  guestId: string
  eventId: string
  attending: boolean
  dietary: string[]
  dietaryNotes: string | null
}

interface RsvpFormProps {
  guests: GuestData[]
  events: EventData[]
  existingRsvps: ExistingRsvp[]
  initialEmail: string
}

function buildInitialState(
  guests: GuestData[],
  events: EventData[],
  existingRsvps: ExistingRsvp[],
) {
  const attending: Record<string, Record<string, boolean>> = {}
  const dietary: Record<string, string[]> = {}
  const dietaryNotes: Record<string, string> = {}

  for (const guest of guests) {
    attending[guest.id] = {}
    dietary[guest.id] = []
    dietaryNotes[guest.id] = ''
    for (const event of events) {
      attending[guest.id][event.id] = true // default: attending
    }
  }

  for (const rsvp of existingRsvps) {
    if (attending[rsvp.guestId]) {
      attending[rsvp.guestId][rsvp.eventId] = rsvp.attending
    }
    if (rsvp.dietary.length) dietary[rsvp.guestId] = rsvp.dietary
    if (rsvp.dietaryNotes) dietaryNotes[rsvp.guestId] = rsvp.dietaryNotes
  }

  return { attending, dietary, dietaryNotes }
}

export function RsvpForm({ guests, events, existingRsvps, initialEmail }: RsvpFormProps) {
  const initial = buildInitialState(guests, events, existingRsvps)
  const [attending, setAttending] = useState(initial.attending)
  const [dietary, setDietary] = useState(initial.dietary)
  const [dietaryNotes, setDietaryNotes] = useState(initial.dietaryNotes)
  const [email, setEmail] = useState(initialEmail)
  const [pending, setPending] = useState(false)

  function handleAttendingChange(guestId: string, eventId: string, val: boolean) {
    setAttending((prev) => ({
      ...prev,
      [guestId]: { ...prev[guestId], [eventId]: val },
    }))
  }

  function handleDietaryChange(guestId: string, option: string, checked: boolean) {
    setDietary((prev) => ({
      ...prev,
      [guestId]: checked
        ? [...(prev[guestId] ?? []), option]
        : (prev[guestId] ?? []).filter((o) => o !== option),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)

    const rsvps: RsvpInput[] = []
    for (const guest of guests) {
      for (const event of events) {
        rsvps.push({
          guestId: guest.id,
          eventId: event.id,
          attending: attending[guest.id]?.[event.id] ?? true,
          dietary: dietary[guest.id] ?? [],
          dietaryNotes: dietaryNotes[guest.id] || undefined,
        })
      }
    }

    await submitRsvp(email, rsvps)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 pb-20">
      <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans mb-4">
        Please confirm attendance for each event
      </p>

      {guests.map((guest, idx) => (
        <GuestCard
          key={guest.id}
          guestId={guest.id}
          guestName={guest.name}
          events={events}
          attending={attending[guest.id] ?? {}}
          dietary={dietary[guest.id] ?? []}
          dietaryNotes={dietaryNotes[guest.id] ?? ''}
          onAttendingChange={(eventId, val) => handleAttendingChange(guest.id, eventId, val)}
          onDietaryChange={(option, checked) => handleDietaryChange(guest.id, option, checked)}
          onDietaryNotesChange={(notes) =>
            setDietaryNotes((prev) => ({ ...prev, [guest.id]: notes }))
          }
          cardIndex={idx}
        />
      ))}

      {/* Contact email */}
      <div className="mb-6">
        <label className="block text-[10px] tracking-[3px] text-teal-deep uppercase font-sans mb-2">
          Contact email (for confirmation &amp; updates)
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-near-black/20 px-3.5 py-2.5 text-sm font-sans bg-white outline-none focus:border-orange-soft"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange-soft text-white py-4 text-xs tracking-[3px] uppercase font-sans disabled:opacity-60"
      >
        {pending ? 'Submitting...' : 'Confirm RSVP'}
      </button>
    </form>
  )
}
