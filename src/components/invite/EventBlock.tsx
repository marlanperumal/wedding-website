import { EventPill } from '@/components/ui'

interface EventData {
  id: string
  name: string
  date: Date
  venue: string
  sortOrder: number
}

interface EventBlockProps {
  events: EventData[]
}

export function EventBlock({ events }: EventBlockProps) {
  // Group by calendar date (YYYY-MM-DD)
  const grouped = new Map<string, EventData[]>()
  for (const event of [...events].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const key = event.date.toISOString().split('T')[0]
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(event)
  }

  return (
    <div className="max-w-xl mx-auto px-6 mb-12 space-y-8">
      {[...grouped.entries()].map(([dateKey, dayEvents]) => {
        const date = new Date(dateKey + 'T00:00:00Z')
        const dayLabel = date.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
          timeZone: 'UTC',
        })
        return (
          <div key={dateKey}>
            <p className="event-day-label mb-3">{dayLabel}</p>
            <p className="font-sans text-xs text-near-black/50 mb-3 uppercase tracking-wide">
              {dayEvents[0].venue}
            </p>
            <div className="flex flex-wrap gap-2">
              {dayEvents.map((e) => (
                <EventPill key={e.id} name={e.name} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
