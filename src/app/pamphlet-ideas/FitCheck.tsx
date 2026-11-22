'use client'
import { useEffect, useState } from 'react'

const PX_PER_MM = 96 / 25.4

/** Measures whether the pamphlet's text runs past the bottom of its A5 page. */
export function FitCheck() {
  const [overMm, setOverMm] = useState<number | null>(null)

  useEffect(() => {
    document.fonts.ready.then(() => {
      const page = document.querySelector('.pi .page')
      const content = page?.querySelector('.content')
      if (!page || !content) return
      const bottom = content.getBoundingClientRect().bottom
      const last = content.lastElementChild?.getBoundingClientRect().bottom ?? 0
      setOverMm(Math.max(last - bottom, content.scrollHeight - content.clientHeight) / PX_PER_MM)
    })
  }, [])

  if (overMm === null) return null
  return overMm > 0.5 ? (
    <span className="fit no">OVER BY {overMm.toFixed(0)}MM</span>
  ) : (
    <span className="fit ok">FITS</span>
  )
}
