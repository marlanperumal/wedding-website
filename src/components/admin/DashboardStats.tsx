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

export function DashboardStats({
  eventStats,
  dietaryCounts,
  totalInvites,
  submittedInvites,
}: DashboardStatsProps) {
  return (
    <div className="space-y-10">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Invites', value: totalInvites },
          { label: 'Responded', value: submittedInvites },
          {
            label: 'Pending',
            value: totalInvites - submittedInvites,
          },
          {
            label: 'Response Rate',
            value:
              totalInvites > 0
                ? `${Math.round((submittedInvites / totalInvites) * 100)}%`
                : '—',
          },
        ].map(({ label, value }) => (
          <div key={label} className="border border-orange-soft/40 p-4 text-center">
            <p className="font-serif text-3xl text-near-black mb-1">{value}</p>
            <p className="text-[10px] tracking-[2px] text-near-black/50 uppercase font-sans">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Per-event RSVP table */}
      <div>
        <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans mb-4">
          RSVPs per Event
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-orange-soft/30">
                {['Event', 'Invited', 'Attending', 'Declined', 'Pending'].map((h) => (
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
              {eventStats.map((stat) => (
                <tr key={stat.id} className="border-b border-near-black/5">
                  <td className="py-3 px-3 font-medium text-near-black">{stat.name}</td>
                  <td className="py-3 px-3 text-near-black/70">{stat.invited}</td>
                  <td className="py-3 px-3 text-teal-deep font-medium">{stat.attending}</td>
                  <td className="py-3 px-3 text-near-black/50">{stat.notAttending}</td>
                  <td className="py-3 px-3 text-orange-soft">{stat.noResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dietary breakdown */}
      {Object.keys(dietaryCounts).length > 0 && (
        <div>
          <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans mb-4">
            Dietary Requirements (attending guests)
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(dietaryCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([option, count]) => (
                <div
                  key={option}
                  className="border border-orange-soft/40 px-4 py-2 text-center min-w-[100px]"
                >
                  <p className="font-serif text-2xl text-near-black">{count}</p>
                  <p className="text-[10px] tracking-[1px] text-near-black/50 uppercase font-sans">
                    {option}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
