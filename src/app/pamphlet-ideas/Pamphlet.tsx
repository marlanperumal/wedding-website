// The printed Ceremonies pamphlet at A5. Styles live in ideas.css.
//
// Two versions:
//   home: 148 × 210mm with a 5mm white border, since home printers can't print to the edge.
//   shop: 154 × 216mm, i.e. A5 plus the print shop's 3mm bleed on every side; the paper
//         and artwork run into the bleed and are trimmed back to A5.
import { ceremonies } from './content'
import { CuspedArchFrame, PaperGrain, Strand } from './motifs'
import bouquet from './assets/marigold-bouquet.png'

// Hanging strands in each top corner: [distance from the page edge, length] in mm.
// Each clears the arch's curve and the scroll at its spring, and sits inside the
// white border.
const STRANDS: [number, number][] = [[9, 40], [17, 36], [25, 24]]

export type PrintVersion = 'home' | 'shop'

export function Pamphlet({ version = 'home' }: { version?: PrintVersion }) {
  const above = version === 'shop' ? 3 : 0
  return (
    <div className={`page ${version}`}>
      {/* The cream paper: inset by the white border at home, out to the bleed for the shop. Artwork is clipped to it. */}
      <div className="paper">
        <PaperGrain />
        <div className="layer">
          <CuspedArchFrame />
          <svg className="strands" viewBox="0 0 148 210" aria-hidden="true">
            {STRANDS.map(([x, len], i) => <Strand key={`l${i}`} x={x} length={len} seed={i} above={above} />)}
            {STRANDS.map(([x, len], i) => <Strand key={`r${i}`} x={148 - x} length={len} seed={i + 1} above={above} />)}
          </svg>
          <img className="bouquet left" src={bouquet.src} alt="" />
          <img className="bouquet right" src={bouquet.src} alt="" />
        </div>
      </div>
      <div className="content">
        <p className="title">Marlan &amp; Tramaine</p>
        <p className="date">FRIDAY · 27 NOVEMBER 2026</p>
        {ceremonies.map((c) => (
          <section key={c.title}>
            <p className="sec" style={{ color: c.colour }}>{c.title.toUpperCase()}</p>
            <p className="lead">{c.lead}</p>
            {c.steps.map((s) => (
              <div key={s.name} className="step">
                <p className="name">{s.name}</p>
                {s.body && <p className="body">{s.body}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
