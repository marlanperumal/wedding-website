// Dev-only: the pamphlet for the print shop — one A5 page with 3mm bleed (154 × 216mm).
import { notFound } from 'next/navigation'
import { Pamphlet } from '../Pamphlet'
import '../ideas.css'
import './print-shop.css'

export const metadata = { title: 'Pamphlet for the print shop' }

export default function PamphletPrintShop() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="pi shop-sheet">
      <Pamphlet version="shop" />
    </div>
  )
}
