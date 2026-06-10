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
      className="text-xs font-sans text-teal-deep hover:underline"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
