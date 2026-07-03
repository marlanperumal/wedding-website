'use client'
import { regenerateSlugAction } from '@/app/admin/guests/[inviteId]/actions'

export function RegenerateLinkButton({ inviteId }: { inviteId: string }) {
  async function handleClick() {
    if (!confirm('Regenerate the share link? The old link will stop working.')) return
    await regenerateSlugAction(inviteId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-label text-[11px] tracking-[.2em] text-acc-teal-deep hover:opacity-70"
      style={{ background: 'none', border: '1px solid rgba(46,125,122,.5)', padding: '10px 20px', cursor: 'pointer' }}
    >
      REGENERATE LINK
    </button>
  )
}
