'use client'
import { useState } from 'react'

interface CopyLinkButtonProps {
  slug: string
}

export function CopyLinkButton({ slug }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
    await navigator.clipboard.writeText(`${base}/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-label text-[9px] tracking-[.1em] text-acc-purple whitespace-nowrap transition-colors hover:text-gold-deep"
      style={{ border: '1px solid rgba(158,107,181,.45)', padding: '5px 11px' }}
    >
      {copied ? '✓ COPIED' : '📋 COPY LINK'}
    </button>
  )
}
