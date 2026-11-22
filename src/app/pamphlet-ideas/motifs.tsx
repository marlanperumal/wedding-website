// Artwork for the pamphlet mockup, drawn in A5 millimetres (viewBox 148 × 210):
// paper grain, a gold cusped arch, brass bells, and strands of marigold heads
// cut from a public-domain print (see assets/CREDITS.md).
import marigoldOrange from './assets/marigold-orange.png'
import marigoldRed from './assets/marigold-red.png'

/** Fine paper grain and soft mottling, drawn with SVG noise so it stays crisp in print. */
export function PaperGrain() {
  return (
    <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.2  0 0 0 0.55 -0.18" />
        </filter>
        <filter id="mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="3" />
          <feColorMatrix values="0 0 0 0 0.78  0 0 0 0 0.66  0 0 0 0 0.45  0 0 0 0.5 -0.12" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#mottle)" opacity="0.55" />
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5" />
    </svg>
  )
}

/** A brass temple bell, `w` mm wide, hanging from (x, y). */
function Bell({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x - w / 2} ${y}) scale(${w / 20})`}>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a2a" />
          <stop offset="0.35" stopColor="#e2c27a" />
          <stop offset="0.55" stopColor="#c9a24f" />
          <stop offset="1" stopColor="#6e521c" />
        </linearGradient>
      </defs>
      <rect x="9" y="0" width="2" height="3" rx="0.6" fill="url(#brass)" />
      <circle cx="10" cy="4" r="2" fill="url(#brass)" />
      <path d="M6 7 Q 10 4.6 14 7 L 15.2 17 Q 18 19.5 19 21.5 L 1 21.5 Q 2 19.5 4.8 17 Z" fill="url(#brass)" />
      {[9.5, 13, 16.5].map((yy) => (
        <path
          key={yy}
          d={`M${5.6 - (yy - 9.5) * 0.08} ${yy} Q 10 ${yy + 1.2} ${14.4 + (yy - 9.5) * 0.08} ${yy}`}
          stroke="#6e521c"
          strokeWidth="0.35"
          fill="none"
          opacity="0.7"
        />
      ))}
      <rect x="0.6" y="21.3" width="18.8" height="1.6" rx="0.8" fill="#7a5c22" />
      <circle cx="10" cy="24.4" r="1.6" fill="url(#brass)" />
    </g>
  )
}

/**
 * A string of marigold heads hanging straight down from the top edge, ending in a bell.
 * `above` adds beads above the edge (into a print shop's bleed) without moving the bell.
 */
export function Strand({ x, length, bead = 4.4, bell = 6, seed = 0, above = 0 }: { x: number; length: number; bead?: number; bell?: number; seed?: number; above?: number }) {
  const step = bead * 0.86
  const count = Math.max(1, Math.floor(length / step))
  const first = -Math.ceil(above / step)
  const beads = []
  for (let i = first; i < count; i++) {
    const k = i + 100 // keep the pseudo-random maths non-negative for beads above the edge
    const red = (k + seed) % 2 === 1
    const rot = ((k * 47 + seed * 31) % 360) - 180
    const s = bead * (0.92 + ((k * 13 + seed * 7) % 10) / 100)
    beads.push(
      <image
        key={i}
        href={red ? marigoldRed.src : marigoldOrange.src}
        x={x - s / 2}
        y={i * step - s * 0.2}
        width={s}
        height={s}
        transform={`rotate(${rot} ${x} ${i * step + s * 0.3})`}
      />,
    )
  }
  const end = count * step
  return (
    <g>
      <line x1={x} y1={first * step} x2={x} y2={end + 1} stroke="#7a5c22" strokeWidth="0.3" />
      {beads}
      <Bell x={x} y={end - 0.6} w={bell} />
    </g>
  )
}

/** Outline of a cusped (scalloped) arch: straight sides from `bottom` up to `spring`, lobes up to `apex`. */
function cuspedArchPath(left: number, right: number, spring: number, apex: number, bottom: number, lobes = 9) {
  const pts: [number, number][] = []
  for (let i = 0; i <= lobes; i++) {
    const t = i / lobes
    // a slightly pointed arch: sine profile sharpened towards the top
    const y = spring - (spring - apex) * Math.pow(Math.sin(Math.PI * t), 0.75)
    pts.push([left + (right - left) * t, y])
  }
  let d = `M ${left} ${bottom} L ${left} ${spring}`
  for (let i = 0; i < lobes; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const r = Math.hypot(x2 - x1, y2 - y1) * 0.62
    d += ` A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }
  return d + ` L ${right} ${bottom} Z`
}

/** A small gold scroll (spiral with a tail). */
function Scroll({ x, y, s, flip = false }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="none" stroke="#b08a36" strokeWidth={0.32 / s} strokeLinecap="round">
      <path d="M0 0 C 2 -3, 7 -3, 8 0 C 9 3, 5 4.5, 4 2.2 C 3.4 0.8, 5 0, 5.8 1" />
      <path d="M0 0 C -2 2, -2 5, 0 7" />
      <circle cx="5.8" cy="1" r="0.35" fill="#b08a36" stroke="none" />
    </g>
  )
}

/** Where the arch sits on the A5 page, in mm. */
export const ARCH = { left: 12, right: 136, spring: 58, apex: 12, bottom: 201 }

/** Double gold cusped arch over a lighter panel, with scrolls at the springs and a finial at the apex. */
export function CuspedArchFrame() {
  const { left, right, spring, apex, bottom } = ARCH
  const outer = cuspedArchPath(left, right, spring, apex, bottom)
  const inner = cuspedArchPath(left + 2.2, right - 2.2, spring, apex + 2.6, bottom - 2.2)
  return (
    <svg viewBox="0 0 148 210" width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      <path d={outer} fill="#fcf8ee" fillOpacity="0.82" stroke="#b08a36" strokeWidth="0.45" />
      <path d={inner} fill="none" stroke="#d3bd85" strokeWidth="0.25" />
      <Scroll x={left} y={spring} s={0.8} flip />
      <Scroll x={right} y={spring} s={0.8} />
      <g transform={`translate(74 ${apex})`}>
        <path d="M0 -5 C 1.4 -3, 1.4 -1.7, 0 -0.5 C -1.4 -1.7, -1.4 -3, 0 -5Z" fill="#c9a24f" />
        <circle cx="0" cy="-5.9" r="0.6" fill="#c9a24f" />
      </g>
      {[left, right].map((x) => (
        <path key={x} d={`M${x} ${bottom - 2} l1.4 2 l-1.4 2 l-1.4 -2 Z`} fill="#c9a24f" />
      ))}
    </svg>
  )
}
