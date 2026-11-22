// Dev-only: the print-shop pamphlet with the shop's template lines drawn on top,
// and the area outside the cutting line shaded, to preview what survives the trim.
import { notFound } from 'next/navigation'
import { Pamphlet } from '../Pamphlet'
import '../ideas.css'
import './proof.css'

export const metadata = { title: 'Pamphlet print proof' }

export default function PamphletPrintProof() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="pi proof-sheet">
      <p className="proof-title">PRINT PROOF · NOT FOR PRINTING</p>
      <div className="proof-frame">
        <Pamphlet version="shop" />
        {/* Shade what the trim removes: the 3mm bleed outside the cutting line. */}
        <div className="trim-shade" />
        <div className="guide bleed" />
        <div className="guide cut" />
        <div className="guide margin" />
      </div>
      <ul className="key">
        <li><i className="bleed" /><b>Bleed edge</b> (154 × 216mm): the edge of the file. Background artwork runs to here.</li>
        <li><i className="cut" /><b>Cutting line</b> (A5, 148 × 210mm): the finished pamphlet. The shaded band outside it is trimmed off.</li>
        <li><i className="margin" /><b>Margin</b> (10mm inside the cut): the shop recommends keeping artwork inside this line.</li>
      </ul>
    </div>
  )
}
