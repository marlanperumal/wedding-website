'use client'
import { removeGuestAction } from '@/app/admin/guests/[inviteId]/actions'

interface Props {
  inviteId: string
  guestId: string
  guestName: string
  rsvpCount: number
}

export function RemoveGuestButton({ inviteId, guestId, guestName, rsvpCount }: Props) {
  async function handleClick() {
    const suffix =
      rsvpCount > 0
        ? ` This will also delete ${rsvpCount} RSVP response${rsvpCount === 1 ? '' : 's'} for this guest.`
        : ''
    if (!confirm(`Remove ${guestName}?${suffix}`)) return
    await removeGuestAction(inviteId, guestId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Remove ${guestName}`}
      className="font-label text-[13px] text-acc-rust hover:opacity-70"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
    >
      ✕
    </button>
  )
}
