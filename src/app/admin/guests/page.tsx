import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AccentBar } from '@/components/ui'
import { InviteTable } from '@/components/admin/InviteTable'
import { addInvite } from './actions'

export default async function AdminGuestsPage() {
  const cookieStore = await cookies()
  const isAdmin = await extractAdminSession(cookieStore.get('adminSession')?.value)
  if (!isAdmin) redirect('/admin')

  const [invites, events] = await Promise.all([
    prisma.invite.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        guests: true,
        events: { include: { event: true } },
      },
    }),
    prisma.event.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <div>
      <AccentBar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-2">
              Admin
            </p>
            <h1 className="font-serif text-3xl italic text-near-black">Guests</h1>
          </div>
          <nav className="flex gap-6 text-xs font-sans tracking-wider text-near-black/50">
            <a href="/admin/dashboard" className="hover:text-near-black">
              Overview
            </a>
            <span className="text-orange-soft font-medium">Guests</span>
          </nav>
        </div>

        {/* Add Invite Form */}
        <div className="border border-orange-soft/40 p-6 mb-10">
          <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans mb-5">
            Add Invite
          </p>
          <form action={addInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[2px] text-near-black/60 uppercase font-sans mb-1.5">
                  Invite label *
                </label>
                <input
                  name="label"
                  required
                  placeholder="The Naidoo Family"
                  className="w-full border border-near-black/20 px-3 py-2 text-sm font-sans bg-white outline-none focus:border-orange-soft"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[2px] text-near-black/60 uppercase font-sans mb-1.5">
                  Contact email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="guest@example.com"
                  className="w-full border border-near-black/20 px-3 py-2 text-sm font-sans bg-white outline-none focus:border-orange-soft"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[2px] text-near-black/60 uppercase font-sans mb-1.5">
                Guest names (one per line) *
              </label>
              <textarea
                name="guestNames"
                required
                rows={3}
                placeholder={"Priya Naidoo\nRajan Naidoo"}
                className="w-full border border-near-black/20 px-3 py-2 text-sm font-sans bg-white outline-none focus:border-orange-soft resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[2px] text-near-black/60 uppercase font-sans mb-2">
                Events *
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 text-sm font-sans text-near-black/70 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="eventIds"
                      value={event.id}
                      defaultChecked
                      className="w-3.5 h-3.5"
                    />
                    {event.name}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-orange-soft text-white px-6 py-2.5 text-xs tracking-[3px] uppercase font-sans"
            >
              Add Invite
            </button>
          </form>
        </div>

        {/* Invite table */}
        <div>
          <p className="text-xs tracking-[3px] text-teal-deep uppercase font-sans mb-4">
            All Invites ({invites.length})
          </p>
          <InviteTable invites={invites} />
        </div>
      </div>
    </div>
  )
}
