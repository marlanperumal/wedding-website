interface EventStat {
  id: string
  name: string
  invited: number
  attending: number
  notAttending: number
  noResponse: number
}

interface DashboardStatsProps {
  eventStats: EventStat[]
  dietaryCounts: Record<string, number>
  totalInvites: number
  submittedInvites: number
}

const EVENT_DOT: Record<string, string> = {
  Mehndi: '#e07a29',
  Nelengu: '#9e6bb5',
  Sangeet: '#3da4a1',
  Wedding: '#b08a36',
  Reception: '#b08a36',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-label text-[11px] tracking-[.22em] text-acc-teal-deep mb-3.5">
      {children}
    </div>
  )
}

export function DashboardStats({
  eventStats,
  dietaryCounts,
  totalInvites,
  submittedInvites,
}: DashboardStatsProps) {
  const summary = [
    { label: 'TOTAL INVITES', value: totalInvites },
    { label: 'RESPONDED', value: submittedInvites },
    { label: 'PENDING', value: totalInvites - submittedInvites },
    {
      label: 'RESPONSE RATE',
      value:
        totalInvites > 0
          ? `${Math.round((submittedInvites / totalInvites) * 100)}%`
          : '—',
    },
  ]

  const th =
    'text-right p-[12px_18px] font-label text-[9.5px] tracking-[.14em] text-gold-soft'

  return (
    <div>
      {/* Summary cards */}
      <div
        className="grid gap-3.5 mb-10"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}
      >
        {summary.map(({ label, value }) => (
          <div
            key={label}
            className="bg-paper-card text-center"
            style={{ border: '1px solid rgba(176,138,54,.4)', padding: '22px 16px' }}
          >
            <div className="font-serif text-[44px] leading-none text-ink">{value}</div>
            <div className="font-label text-[9.5px] tracking-[.16em] text-gold-soft mt-2">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Per-event RSVP table */}
      <SectionLabel>RSVPS PER EVENT</SectionLabel>
      <div
        className="bg-paper-card overflow-x-auto mb-10"
        style={{ border: '1px solid rgba(176,138,54,.4)' }}
      >
        <table className="w-full border-collapse" style={{ minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(176,138,54,.4)' }}>
              <th className="text-left p-[12px_18px] font-label text-[9.5px] tracking-[.14em] text-gold-soft">
                EVENT
              </th>
              {['INVITED', 'ATTENDING', 'DECLINED', 'PENDING'].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eventStats.map((stat) => (
              <tr key={stat.id} style={{ borderBottom: '1px solid rgba(176,138,54,.18)' }}>
                <td className="p-[13px_18px] font-serif text-[18px] text-ink">
                  <span
                    className="inline-block w-[7px] h-[7px] rounded-full mr-[9px] align-middle"
                    style={{ background: EVENT_DOT[stat.name] ?? '#b08a36' }}
                  />
                  {stat.name}
                </td>
                <td className="p-[13px_18px] text-right font-serif text-[18px] text-ink-muted">
                  {stat.invited}
                </td>
                <td className="p-[13px_18px] text-right font-serif text-[18px] font-semibold text-acc-green-deep">
                  {stat.attending}
                </td>
                <td className="p-[13px_18px] text-right font-serif text-[18px] text-gold-soft">
                  {stat.notAttending}
                </td>
                <td className="p-[13px_18px] text-right font-serif text-[18px] text-acc-orange">
                  {stat.noResponse}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dietary breakdown */}
      {Object.keys(dietaryCounts).length > 0 && (
        <>
          <SectionLabel>DIETARY REQUIREMENTS · ATTENDING GUESTS</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {Object.entries(dietaryCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([option, count]) => (
                <div
                  key={option}
                  className="bg-paper-card text-center"
                  style={{
                    border: '1px solid rgba(176,138,54,.4)',
                    padding: '14px 20px',
                    minWidth: 108,
                  }}
                >
                  <div className="font-serif text-[30px] leading-none text-ink">
                    {count}
                  </div>
                  <div className="font-label text-[9px] tracking-[.1em] text-gold-soft mt-1.5">
                    {option.toUpperCase()}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
