import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/ui'
import { DashboardStats } from '@/components/admin/DashboardStats'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  // Events with sort order
  const events = await prisma.event.findMany({ orderBy: { sortOrder: 'asc' } })

  // Invited guest count per event (via InviteEvent → Invite.guests)
  const inviteEvents = await prisma.inviteEvent.findMany({
    include: { invite: { include: { guests: { select: { id: true } } } } },
  })
  const invitedByEvent: Record<string, number> = {}
  for (const ie of inviteEvents) {
    invitedByEvent[ie.eventId] = (invitedByEvent[ie.eventId] ?? 0) + ie.invite.guests.length
  }

  // RSVP counts per event
  const rsvpGroups = await prisma.rsvp.groupBy({
    by: ['eventId', 'attending'],
    _count: true,
  })
  const attendingByEvent: Record<string, number> = {}
  const notAttendingByEvent: Record<string, number> = {}
  for (const group of rsvpGroups) {
    if (group.attending) {
      attendingByEvent[group.eventId] = group._count
    } else {
      notAttendingByEvent[group.eventId] = group._count
    }
  }

  const eventStats = events.map((event) => {
    const invited = invitedByEvent[event.id] ?? 0
    const attending = attendingByEvent[event.id] ?? 0
    const notAttending = notAttendingByEvent[event.id] ?? 0
    return {
      id: event.id,
      name: event.name,
      invited,
      attending,
      notAttending,
      noResponse: Math.max(0, invited - attending - notAttending),
    }
  })

  // Dietary breakdown
  const attendingRsvps = await prisma.rsvp.findMany({
    where: { attending: true },
    select: { dietary: true },
  })
  const dietaryCounts: Record<string, number> = {}
  for (const rsvp of attendingRsvps) {
    for (const option of rsvp.dietary) {
      dietaryCounts[option] = (dietaryCounts[option] ?? 0) + 1
    }
  }

  // Invite summary
  const [totalInvites, submittedInvites] = await Promise.all([
    prisma.invite.count(),
    prisma.invite.count({ where: { submitted: true } }),
  ])

  return (
    <div>
      <AccentBar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-2">
              Admin
            </p>
            <h1 className="font-serif text-3xl italic text-near-black">Dashboard</h1>
          </div>
          <nav className="flex gap-6 text-xs font-sans tracking-wider text-near-black/50">
            <span className="text-orange-soft font-medium">Overview</span>
            <a href="/admin/guests" className="hover:text-near-black">
              Guests
            </a>
          </nav>
        </div>

        <DashboardStats
          eventStats={eventStats}
          dietaryCounts={dietaryCounts}
          totalInvites={totalInvites}
          submittedInvites={submittedInvites}
        />
      </div>
    </div>
  )
}
