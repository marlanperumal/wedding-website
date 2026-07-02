'use client'
import { useState } from 'react'
import { GuestCard } from './GuestCard'
import { submitRsvp } from '@/app/(site)/rsvp/actions'
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
  greeting: string
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

export function RsvpForm({ guests, events, existingRsvps, initialEmail, greeting }: RsvpFormProps) {
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

  function handleAllAttendingChange(guestId: string, val: boolean) {
    setAttending((prev) => {
      const next: Record<string, boolean> = {}
      for (const event of events) next[event.id] = val
      return { ...prev, [guestId]: next }
    })
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
    <form
      onSubmit={handleSubmit}
      className="mx-auto bg-paper-card"
      style={{
        maxWidth: 640,
        marginTop: 30,
        border: '1px solid rgba(176,138,54,.5)',
        padding: 'clamp(24px,4vw,34px)',
      }}
    >
      <div className="font-serif italic text-[24px] text-ink mb-1">
        Dear {greeting}
      </div>
      <div className="font-label text-[10px] tracking-[.14em] text-gold-soft mb-[22px]">
        YOUR PERSONAL INVITATION · {guests.length} GUEST{guests.length === 1 ? '' : 'S'}
      </div>

      {guests.map((guest) => (
        <GuestCard
          key={guest.id}
          guestId={guest.id}
          guestName={guest.name}
          events={events}
          attending={attending[guest.id] ?? {}}
          dietary={dietary[guest.id] ?? []}
          dietaryNotes={dietaryNotes[guest.id] ?? ''}
          onAttendingChange={(eventId, val) => handleAttendingChange(guest.id, eventId, val)}
          onAllAttendingChange={(val) => handleAllAttendingChange(guest.id, val)}
          onDietaryChange={(option, checked) => handleDietaryChange(guest.id, option, checked)}
          onDietaryNotesChange={(notes) =>
            setDietaryNotes((prev) => ({ ...prev, [guest.id]: notes }))
          }
        />
      ))}

      {/* Contact email + submit */}
      <div style={{ borderTop: '1px solid rgba(176,138,54,.3)', paddingTop: 18 }}>
        <label className="block font-label text-[10px] tracking-[.12em] text-gold-soft mb-2">
          CONTACT EMAIL · FOR CONFIRMATION &amp; UPDATES
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full font-serif text-[16px] text-ink outline-none mb-4"
          style={{
            background: '#fffdf7',
            border: '1px solid rgba(176,138,54,.45)',
            padding: '11px 14px',
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full font-label text-[13px] tracking-[.2em] text-paper-raised bg-gold-deep disabled:opacity-60 transition-colors hover:bg-[#6a4e10]"
          style={{ padding: 16, border: 'none' }}
        >
          {pending ? 'SENDING…' : 'SEND OUR RSVP'}
        </button>
      </div>
    </form>
  )
}
