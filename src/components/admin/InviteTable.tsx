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

const th =
  'text-left p-[12px_18px] font-label text-[9.5px] tracking-[.14em] text-gold-soft'
const td = 'p-[14px_18px] align-top'

export function InviteTable({ invites }: InviteTableProps) {
  if (invites.length === 0) {
    return (
      <div
        className="bg-paper-card text-center font-serif italic text-[17px] text-ink-muted"
        style={{ border: '1px solid rgba(176,138,54,.4)', padding: '48px 18px' }}
      >
        No invites yet.
      </div>
    )
  }

  return (
    <div
      className="bg-paper-card overflow-x-auto"
      style={{ border: '1px solid rgba(176,138,54,.4)' }}
    >
      <table className="w-full border-collapse" style={{ minWidth: 720 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(176,138,54,.4)' }}>
            {['INVITE', 'GUESTS', 'EVENTS', 'STATUS', 'LINK'].map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr key={invite.id} style={{ borderBottom: '1px solid rgba(176,138,54,.18)' }}>
              <td className={td}>
                <div className="font-serif text-[18px] font-semibold text-ink">
                  {invite.label}
                </div>
                {invite.email && (
                  <div className="font-serif text-[14px] text-gold-soft">
                    {invite.email}
                  </div>
                )}
              </td>
              <td className={`${td} font-serif text-[16px] text-ink-soft`}>
                {invite.guests.map((g) => g.name).join(', ')}
              </td>
              <td className={td}>
                <div className="flex flex-wrap gap-1.5">
                  {invite.events.map(({ event }) => (
                    <EventPill key={event.id} name={event.name} />
                  ))}
                </div>
              </td>
              <td className={td}>
                <span
                  className="font-label text-[9px] tracking-[.1em]"
                  style={
                    invite.submitted
                      ? { color: '#2e7d7a', background: 'rgba(46,125,122,.12)', padding: '4px 10px' }
                      : { color: '#c0631f', background: 'rgba(224,122,41,.12)', padding: '4px 10px' }
                  }
                >
                  {invite.submitted ? 'SUBMITTED' : 'PENDING'}
                </span>
              </td>
              <td className={td}>
                <CopyLinkButton slug={invite.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
