// Shortened Ceremonies wording for the pamphlet mockup: one or two lines per step.
import type { ReactNode } from 'react'

export interface Step {
  name: string
  body?: ReactNode
}

export interface Ceremony {
  title: string
  lead: string
  colour: string
  steps: Step[]
}

export const christian: Ceremony = {
  title: 'The Christian Ceremony',
  lead: 'Led by Lay Minister James',
  colour: '#c9661f',
  steps: [
    { name: 'Opening Prayer', body: 'To bless everyone present and seek a harmonious wedding ceremony.' },
    { name: 'Bible Reading – Colossians 3:12–15' },
    {
      name: 'Unity Candle',
      body: 'Our mothers light a candle each for us as individuals. We light the centre candle together for our shared life, and our mothers put the individual ones out in blessing.',
    },
    { name: 'Blessing and Exchange of Rings & Vows' },
  ],
}

export const hindu: Ceremony = {
  title: 'The Hindu Ceremony',
  lead: 'Led by Guru Krishna',
  colour: '#c9661f',
  steps: [
    { name: 'Invocation', body: 'We pray to Lord Ganesha, remover of obstacles, for a peaceful and happy marriage.' },
    { name: 'Havan', body: 'We offer herbs, ghee and sandalwood to Agni, the fire god, as our witness.' },
    {
      name: 'Tray Exchange',
      body: 'Seven women from each family exchange trays of gifts, marking the respect and lifelong bond between our families.',
    },
    {
      name: 'Pheras',
      body: (
        <>
          We circle the fire seven times, making seven vows: love, trust, respect, family, prosperity, friendship and lifelong
          commitment. To drown out inauspicious sounds,
          <br />
          <span className="call-out">please ring the bells provided.</span>
        </>
      ),
    },
    {
      name: 'Tying of the Thali',
      body: (
        <>
          Marlan places <i>kumkum</i> (a red dot) on Tramaine’s forehead and ties the <i>thali</i> (sacred thread and pendant) with
          three knots: duty, love and fidelity.
        </>
      ),
    },
    {
      name: 'Toe Rings',
      body: (
        <>
          Marlan places <i>metti</i> (toe rings) on Tramaine’s second toes as her foot rests on a grinding stone, for steadfastness in
          marriage.
        </>
      ),
    },
    { name: 'Exchange of Garlands', body: 'We exchange garlands three times, affirming that we are one in mind, body and spirit.' },
  ],
}

export const ceremonies = [christian, hindu]
