'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ExpandableImageProps {
  src: string
  alt: string
  /** Garment name, shown as the heading in the expanded overlay. */
  caption: string
  /** Full description, shown beneath the heading in the expanded overlay. */
  description: string
}

export function ExpandableImage({ src, alt, caption, description }: ExpandableImageProps) {
  const [open, setOpen] = useState(false)

  // Close on Escape and lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block shrink-0 cursor-zoom-in transition-opacity hover:opacity-90"
        style={{ border: '1px solid rgba(176,138,54,.5)', padding: 5 }}
        aria-label={`Expand image: ${caption}`}
      >
        <Image
          src={src}
          alt={alt}
          width={170}
          height={220}
          className="block object-cover"
          style={{ width: 170, height: 220 }}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={caption}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center"
          style={{ background: 'rgba(20,12,4,.85)', padding: 'clamp(24px,5vw,56px)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 font-serif leading-none transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-footer-name)', fontSize: 38 }}
          >
            &times;
          </button>
          <figure className="flex max-h-full flex-col items-center">
            <Image
              src={src}
              alt={alt}
              width={900}
              height={1200}
              className="block object-contain"
              style={{
                maxWidth: 'min(90vw, 560px)',
                maxHeight: '78vh',
                width: 'auto',
                height: 'auto',
                border: '1px solid rgba(176,138,54,.55)',
                padding: 6,
                background: 'var(--color-paper-card)',
              }}
            />
            <figcaption className="mt-5 text-center" style={{ maxWidth: 560 }}>
              <span
                className="block font-serif italic"
                style={{ color: 'var(--color-footer-name)', fontSize: 'clamp(20px,3vw,26px)' }}
              >
                {caption}
              </span>
              <span
                className="mt-2 block font-serif leading-[1.6]"
                style={{ color: 'var(--color-footer-body)', fontSize: 'clamp(15px,2.2vw,17px)' }}
              >
                {description}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
