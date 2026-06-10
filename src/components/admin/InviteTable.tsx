import { EventPill } from '@/components/ui'
import { CopyLinkButton } from './CopyLinkButton'

interface GuestData {
  id: string
  name: string
}

interface EventData {
  id: string
  name: string
}

interface InviteData {
  id: string
  slug: string
  label: string
  email: string | null
  submitted: boolean
  guests: GuestData[]
  events: { event: EventData }[]
}

interface InviteTableProps {
  invites: InviteData[]
}

export function InviteTable({ invites }: InviteTableProps) {
  if (invites.length === 0) {
    return (
      <p className="text-sm font-sans text-near-black/50 text-center py-12">
        No invites yet. Add the first one above.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-orange-soft/30">
            {['Invite', 'Guests', 'Events', 'Status', 'Link'].map((h) => (
              <th
                key={h}
                className="py-2 px-3 text-left text-[10px] tracking-[2px] text-near-black/50 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr key={invite.id} className="border-b border-near-black/5 hover:bg-orange-soft/5">
              <td className="py-3 px-3">
                <p className="font-medium text-near-black">{invite.label}</p>
                {invite.email && (
                  <p className="text-xs text-near-black/50">{invite.email}</p>
                )}
              </td>
              <td className="py-3 px-3 text-near-black/70">
                {invite.guests.map((g) => g.name).join(', ')}
              </td>
              <td className="py-3 px-3">
                <div className="flex flex-wrap gap-1">
                  {invite.events.map(({ event }) => (
                    <EventPill key={event.id} name={event.name} />
                  ))}
                </div>
              </td>
              <td className="py-3 px-3">
                <span
                  className={`text-[10px] tracking-wider uppercase font-sans px-2 py-0.5 ${
                    invite.submitted
                      ? 'bg-teal-deep/10 text-teal-deep'
                      : 'bg-orange-soft/10 text-orange-soft'
                  }`}
                >
                  {invite.submitted ? 'Submitted' : 'Pending'}
                </span>
              </td>
              <td className="py-3 px-3">
                <CopyLinkButton slug={invite.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
