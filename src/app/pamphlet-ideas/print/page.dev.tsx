// Dev-only: two home-print pamphlets (5mm white border) side by side on A4 landscape, at true A5 size.
import { notFound } from 'next/navigation'
import { Pamphlet } from '../Pamphlet'
import '../ideas.css'
import './print.css'

export const metadata = { title: 'Pamphlet print sheet' }

export default function PamphletPrintSheet() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="pi sheet">
      <Pamphlet version="home" />
      <Pamphlet version="home" />
    </div>
  )
}
