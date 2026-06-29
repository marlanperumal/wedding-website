import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { extractAdminSession } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { InviteTable } from '@/components/admin/InviteTable'
import { addInvite } from './actions'

const fieldLabel =
  'block font-label text-[9px] tracking-[.16em] text-gold-soft mb-1.5'
const fieldInput =
  'w-full font-serif text-[16px] text-ink outline-none'
const fieldInputStyle = {
  background: '#fffdf7',
  border: '1px solid rgba(176,138,54,.45)',
  padding: '10px 13px',
}

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
      <AdminTopBar />
      <div
        className="mx-auto"
        style={{ maxWidth: 1040, padding: 'clamp(28px,4vw,48px) clamp(18px,4vw,36px)' }}
      >
        {/* Header */}
        <div className="mb-[30px]">
          <div className="font-label text-[11px] tracking-[.3em] text-gold-soft">
            MANAGE
          </div>
          <h1
            className="font-serif italic text-ink mt-1"
            style={{ fontSize: 'clamp(32px,5vw,42px)' }}
          >
            Guests
          </h1>
        </div>

        {/* Add Invite Form */}
        <div
          className="bg-paper-card mb-10"
          style={{ border: '1px solid rgba(176,138,54,.4)', padding: 'clamp(20px,3vw,28px)' }}
        >
          <div className="font-label text-[11px] tracking-[.22em] text-acc-teal-deep mb-5">
            ADD INVITE
          </div>
          <form action={addInvite}>
            <div
              className="grid gap-4 mb-4"
              style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
            >
              <div>
                <label className={fieldLabel}>INVITE LABEL *</label>
                <input
                  name="label"
                  required
                  placeholder="The Naidoo Family"
                  className={fieldInput}
                  style={fieldInputStyle}
                />
              </div>
              <div>
                <label className={fieldLabel}>CONTACT EMAIL</label>
                <input
                  name="email"
                  type="email"
                  placeholder="guest@example.com"
                  className={fieldInput}
                  style={fieldInputStyle}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={fieldLabel}>GUEST NAMES · ONE PER LINE *</label>
              <textarea
                name="guestNames"
                required
                rows={3}
                placeholder={'Priya Naidoo\nRajan Naidoo'}
                className={`${fieldInput} resize-none`}
                style={fieldInputStyle}
              />
            </div>

            <div className="mb-5">
              <label className={fieldLabel}>EVENTS *</label>
              <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 font-serif text-[17px] text-ink-soft cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="eventIds"
                      value={event.id}
                      defaultChecked
                      className="w-[15px] h-[15px] accent-[#7c5c14]"
                    />
                    {event.name}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="font-label text-[11px] tracking-[.2em] text-paper-raised bg-gold-deep transition-colors hover:bg-[#6a4e10]"
              style={{ padding: '12px 28px', border: 'none' }}
            >
              ADD INVITE
            </button>
          </form>
        </div>

        {/* Invite table */}
        <div className="font-label text-[11px] tracking-[.22em] text-acc-teal-deep mb-3.5">
          ALL INVITES · {invites.length}
        </div>
        <InviteTable invites={invites} />
      </div>
    </div>
  )
}
