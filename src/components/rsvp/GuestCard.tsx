'use client'
import { EventPill } from '@/components/ui'
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
  onDietaryChange: (option: string, checked: boolean) => void
  onDietaryNotesChange: (notes: string) => void
  cardIndex: number
}

const CARD_COLORS = ['#F4A261', '#9E6BB5', '#3DA4A1', '#E07A29', '#5FAE7E']

function groupByDate(events: GuestEvent[]): Map<string, GuestEvent[]> {
  const map = new Map<string, GuestEvent[]>()
  for (const e of [...events].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const key = new Date(e.date).toISOString().split('T')[0]
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return map
}

export function GuestCard({
  guestId: _guestId,
  guestName,
  events,
  attending,
  dietary,
  dietaryNotes,
  onAttendingChange,
  onDietaryChange,
  onDietaryNotesChange,
  cardIndex,
}: GuestCardProps) {
  const color = CARD_COLORS[cardIndex % CARD_COLORS.length]
  const grouped = groupByDate(events)

  return (
    <div className="border rounded-sm overflow-hidden mb-4" style={{ borderColor: color }}>
      {/* Header */}
      <div className="px-4 py-2.5" style={{ backgroundColor: color }}>
        <span className="text-white text-sm tracking-wide font-sans">{guestName}</span>
      </div>

      <div className="px-4 py-3.5">
        {/* Events grouped by day */}
        {[...grouped.entries()].map(([dateKey, dayEvents]) => {
          const date = new Date(dateKey + 'T00:00:00Z')
          const dayLabel = date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
          })
          return (
            <div key={dateKey} className="mb-3">
              <p className="text-[10px] tracking-[3px] text-purple-orchid uppercase font-sans mb-2">
                {dayLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {dayEvents.map((event) => (
                  <label key={event.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attending[event.id] ?? true}
                      onChange={(e) => onAttendingChange(event.id, e.target.checked)}
                      className="w-3.5 h-3.5"
                    />
                    <EventPill name={event.name} />
                  </label>
                ))}
              </div>
            </div>
          )
        })}

        {/* Dietary requirements */}
        <div className="border-t border-cream pt-3 mt-1">
          <p className="text-[10px] tracking-[3px] text-purple-orchid uppercase font-sans mb-2">
            Dietary requirements
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {DIETARY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-1.5 font-sans text-xs text-near-black/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dietary.includes(option)}
                  onChange={(e) => onDietaryChange(option, e.target.checked)}
                  className="w-3.5 h-3.5"
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
              className="mt-2 w-full border border-orange-soft/40 px-3 py-2 text-xs font-sans bg-white outline-none focus:border-orange-soft"
              maxLength={500}
            />
          )}
        </div>
      </div>
    </div>
  )
}
