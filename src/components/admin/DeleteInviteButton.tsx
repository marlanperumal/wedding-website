'use client'
import { deleteInviteAction } from '@/app/admin/guests/[inviteId]/actions'

interface Props {
  inviteId: string
  label: string
  guestCount: number
  rsvpCount: number
}

export function DeleteInviteButton({ inviteId, label, guestCount, rsvpCount }: Props) {
  async function handleClick() {
    if (
      !confirm(
        `Delete "${label}"? This permanently removes ${guestCount} guest${guestCount === 1 ? '' : 's'} and ${rsvpCount} RSVP response${rsvpCount === 1 ? '' : 's'}.`,
      )
    )
      return
    await deleteInviteAction(inviteId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-label text-[11px] tracking-[.2em] text-paper-raised bg-acc-rust transition-opacity hover:opacity-85"
      style={{ padding: '12px 28px', border: 'none', cursor: 'pointer' }}
    >
      DELETE INVITE
    </button>
  )
}
