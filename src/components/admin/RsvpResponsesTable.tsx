type EventStatus = 'attending' | 'declined' | 'awaiting'

interface GuestRow {
  id: string
  name: string
  events: { id: string; name: string; status: EventStatus }[]
  dietary: string[]
  notes: string[]
}

interface InviteRow {
  id: string
  label: string
  submitted: boolean
  submittedAt: string | null
  guests: GuestRow[]
}

interface RsvpResponsesTableProps {
  invites: InviteRow[]
}

const th =
  'text-left p-[12px_18px] font-label text-[9.5px] tracking-[.14em] text-gold-soft'
const td = 'p-[14px_18px] align-top'

export function RsvpResponsesTable({ invites }: RsvpResponsesTableProps) {
  if (invites.length === 0) {
    return (
      <div
        className="bg-paper-card text-center font-serif italic text-[17px] text-ink-muted"
        style={{ border: '1px solid rgba(176,138,54,.4)', padding: '48px 18px' }}
      >
        No responses yet.
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
            {['GUEST', 'EVENTS', 'DIETARY'].map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <InviteGroup key={invite.id} invite={invite} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const pillBase =
  'font-label text-[9px] tracking-[.08em] rounded-[11px] whitespace-nowrap inline-flex items-center gap-1'
const pillStyles: Record<EventStatus, React.CSSProperties> = {
  attending: {
    color: '#7c5c14',
    background: 'rgba(176,138,54,.14)',
    border: '1px solid rgba(176,138,54,.3)',
    padding: '3px 9px',
  },
  declined: {
    color: '#9a9184',
    background: 'transparent',
    border: '1px solid rgba(154,145,132,.4)',
    padding: '3px 9px',
    textDecoration: 'line-through',
  },
  awaiting: {
    color: '#b0925a',
    background: 'transparent',
    border: '1px dashed rgba(176,138,54,.5)',
    padding: '3px 9px',
  },
}

// One pill per invited event, coloured by RSVP status. Declined events stay
// visible (struck through) so they read differently from events the guest was
// never invited to, which are simply absent from the row.
function StatusPill({ name, status }: { name: string; status: EventStatus }) {
  return (
    <span className={pillBase} style={pillStyles[status]}>
      {name}
    </span>
  )
}

function InviteGroup({ invite }: { invite: InviteRow }) {
  return (
    <>
      {/* Invite header row */}
      <tr style={{ borderTop: '1px solid rgba(176,138,54,.4)' }}>
        <td
          colSpan={3}
          className="p-[14px_18px_10px]"
          style={{ background: 'rgba(176,138,54,.06)' }}
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-[17px] font-semibold text-ink">
              {invite.label}
            </span>
            {invite.submitted ? (
              <span className="font-label text-[9px] tracking-[.14em] text-acc-teal-deep">
                SUBMITTED{invite.submittedAt ? ` · ${invite.submittedAt}` : ''}
              </span>
            ) : (
              <span className="font-label text-[9px] tracking-[.14em] text-acc-rust">
                AWAITING RESPONSE
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* One row per guest */}
      {invite.guests.map((guest) => (
        <tr
          key={guest.id}
          style={{ borderBottom: '1px solid rgba(176,138,54,.18)' }}
        >
          <td className={`${td} font-serif text-[16px] text-ink`}>
            {guest.name}
          </td>
          <td className={td}>
            {guest.events.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {guest.events.map((event) => (
                  <StatusPill key={event.id} name={event.name} status={event.status} />
                ))}
              </div>
            ) : (
              <span className="font-serif text-[15px] text-ink-muted">—</span>
            )}
          </td>
          <td className={td}>
            {guest.dietary.length > 0 || guest.notes.length > 0 ? (
              <div className="font-serif text-[15px] text-ink-soft">
                {guest.dietary.length > 0 && <div>{guest.dietary.join(', ')}</div>}
                {guest.notes.map((note, i) => (
                  <div key={i} className="text-ink-muted italic">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <span className="font-serif text-[15px] text-ink-muted">—</span>
            )}
          </td>
        </tr>
      ))}
    </>
  )
}
