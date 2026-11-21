'use client'
import { useRef, useState } from 'react'

/** Renders an email's HTML in an iframe that grows to fit its content. */
export function EmailFrame({ html, width }: { html: string; width: number | '100%' }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(1200)

  return (
    <iframe
      ref={ref}
      title="Email preview"
      srcDoc={html}
      onLoad={() => {
        const doc = ref.current?.contentDocument
        if (doc) setHeight(doc.documentElement.scrollHeight)
      }}
      className="mt-4 mx-auto block bg-white"
      style={{ width, height, border: '1px solid rgba(176,138,54,.4)' }}
    />
  )
}
