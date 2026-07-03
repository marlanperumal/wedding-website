'use client'
import type { FormEvent } from 'react'
import { updateInviteEventsAction } from '@/app/admin/guests/[inviteId]/actions'

interface EventOption {
  id: string
  name: string
  assigned: boolean
  rsvpCount: number
}

interface Props {
  inviteId: string
  events: EventOption[]
}

export function InviteEventsForm({ inviteId, events }: Props) {
  const action = updateInviteEventsAction.bind(null, inviteId)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const checked = new Set(
      Array.from(
        e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="eventIds"]:checked'),
      ).map((i) => i.value),
    )
    if (checked.size === 0) {
      alert('An invite must have at least one event.')
      e.preventDefault()
      return
    }
    const losing = events.filter((ev) => ev.assigned && !checked.has(ev.id) && ev.rsvpCount > 0)
    if (losing.length === 0) return
    const total = losing.reduce((n, ev) => n + ev.rsvpCount, 0)
    const names = losing.map((ev) => ev.name).join(', ')
    if (
      !confirm(
        `Unassigning ${names} will delete ${total} RSVP response${total === 1 ? '' : 's'}. Continue?`,
      )
    ) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-5">
        {events.map((ev) => (
          <label
            key={ev.id}
            className="flex items-center gap-2 font-serif text-[17px] text-ink-soft cursor-pointer"
          >
            <input
              type="checkbox"
              name="eventIds"
              value={ev.id}
              defaultChecked={ev.assigned}
              className="w-[15px] h-[15px] accent-[#7c5c14]"
            />
            {ev.name}
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="font-label text-[11px] tracking-[.2em] text-paper-raised bg-gold-deep transition-colors hover:bg-[#6a4e10]"
        style={{ padding: '12px 28px', border: 'none' }}
      >
        SAVE EVENTS
      </button>
    </form>
  )
}
