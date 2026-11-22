// Dev-only mockup of the printed Ceremonies pamphlet. Not served in production.
import { notFound } from 'next/navigation'
import { Pamphlet } from './Pamphlet'
import { FitCheck } from './FitCheck'
import './ideas.css'

export const metadata = { title: 'Pamphlet mockup' }

export default function PamphletMockupPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="pi">
      <h1 className="doc">
        CEREMONIES PAMPHLET · MOCKUP <FitCheck />
      </h1>
      <p className="lede">True A5 size. Marigolds: Wellcome Collection, 1879, public domain. Arch, bells and paper grain drawn in code.</p>
      <Pamphlet />
    </div>
  )
}
