'use client'
import { DIETARY_OPTIONS } from '@/lib/schemas'

interface GuestEvent {
  id: string
  name: string
  date: Date
  sortOrder: number
}

interface GuestCardProps {
  guestId: string
  guestName: string
  events: GuestEvent[]
  attending: Record<string, boolean>         // eventId → bool
  dietary: string[]
  dietaryNotes: string
  onAttendingChange: (eventId: string, val: boolean) => void
  onAllAttendingChange: (val: boolean) => void
  onDietaryChange: (option: string, checked: boolean) => void
  onDietaryNotesChange: (notes: string) => void
}

// Per-event accent colour for the unselected event pills.
const PILL_ACCENT: Record<string, string> = {
  Mehndi: '#e07a29',
  Nelengu: '#9e6bb5',
  Sangeet: '#3da4a1',
  Sangeeth: '#3da4a1',
  Wedding: '#7c5c14',
  Reception: '#7c5c14',
}

export function GuestCard({
  guestId: _guestId,
  guestName,
  events,
  attending,
  dietary,
  dietaryNotes,
  onAttendingChange,
  onAllAttendingChange,
  onDietaryChange,
  onDietaryNotesChange,
}: GuestCardProps) {
  const sorted = [...events].sort((a, b) => a.sortOrder - b.sortOrder)
  const anyAttending = sorted.some((e) => attending[e.id])

  return (
    <div
      style={{ borderTop: '1px solid rgba(176,138,54,.3)', padding: '18px 0' }}
    >
      <div className="font-serif text-[22px] text-ink mb-3">{guestName}</div>

      {/* Accept / decline */}
      <div className="flex gap-2.5 mb-3.5">
        <button
          type="button"
          onClick={() => onAllAttendingChange(true)}
          className="font-label text-[10px] tracking-[.12em] transition-colors"
          style={
            anyAttending
              ? { color: '#f6efdf', background: '#5fae7e', padding: '9px 18px' }
              : {
                  color: '#a08648',
                  background: 'transparent',
                  border: '1px solid rgba(176,138,54,.5)',
                  padding: '9px 18px',
                }
          }
        >
          JOYFULLY ACCEPTS
        </button>
        <button
          type="button"
          onClick={() => onAllAttendingChange(false)}
          className="font-label text-[10px] tracking-[.12em] transition-colors"
          style={
            !anyAttending
              ? { color: '#f6efdf', background: '#a08648', padding: '9px 18px' }
              : {
                  color: '#a08648',
                  background: 'transparent',
                  border: '1px solid rgba(176,138,54,.5)',
                  padding: '9px 18px',
                }
          }
        >
          REGRETFULLY DECLINES
        </button>
      </div>

      {/* Event pills */}
      <div className="font-label text-[10px] tracking-[.12em] text-gold-soft mb-2">
        ATTENDING
      </div>
      <div className="flex flex-wrap gap-2 mb-3.5">
        {sorted.map((event) => {
          const on = attending[event.id] ?? false
          const accent = PILL_ACCENT[event.name] ?? '#7c5c14'
          return (
            <button
              key={event.id}
              type="button"
              aria-pressed={on}
              onClick={() => onAttendingChange(event.id, !on)}
              className="font-serif text-[16px] rounded-[20px] transition-colors"
              style={
                on
                  ? {
                      color: '#f6efdf',
                      background: '#7c5c14',
                      border: '1px solid #7c5c14',
                      padding: '6px 16px',
                    }
                  : {
                      color: '#46370f',
                      background: 'transparent',
                      border: `1px solid ${accent}`,
                      padding: '6px 16px',
                    }
              }
            >
              {event.name}
            </button>
          )
        })}
      </div>

      {/* Dietary requirements */}
      <div className="font-label text-[10px] tracking-[.12em] text-gold-soft mb-2">
        DIETARY REQUIREMENTS
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2">
        {DIETARY_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center gap-1.5 font-serif text-[16px] text-ink-soft cursor-pointer"
          >
            <input
              type="checkbox"
              checked={dietary.includes(option)}
              onChange={(e) => onDietaryChange(option, e.target.checked)}
              className="w-3.5 h-3.5 accent-[#7c5c14]"
            />
            {option}
          </label>
        ))}
      </div>
      {dietary.includes('Other') && (
        <input
          type="text"
          value={dietaryNotes}
          onChange={(e) => onDietaryNotesChange(e.target.value)}
          placeholder="Please describe your dietary requirement"
          maxLength={500}
          className="w-full font-serif text-[16px] text-ink outline-none"
          style={{
            background: '#fffdf7',
            border: '1px solid rgba(176,138,54,.45)',
            padding: '11px 14px',
          }}
        />
      )}
    </div>
  )
}
