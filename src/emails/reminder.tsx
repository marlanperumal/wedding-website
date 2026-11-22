/*
 * The reminder email. Edit the wording below; the preview at
 * /admin/reminder updates when you save.
 *
 * Building blocks (styling is built in — see ./components.tsx):
 *   <Heading>   section heading with a gold line above it
 *   <When>      italic date/time line under a heading
 *   <P>         ordinary paragraph
 *   <Link href="…">   link
 *   <Greeting> <Intro> <Closing> <SignOff>   the centred lines top and bottom
 *   <Button href="…"> the big gold button
 *   <br />      line break inside a paragraph
 *
 * Keep a <Link> on the same line as the words either side of it: a line
 * break next to a tag swallows the space ("home,11 Orient Road").
 */
import { Button, Closing, Greeting, Heading, Intro, Link, P, SignOff, When } from './components'
import { HOME_MAP_LINK, SAMS_MAP_LINK } from '@/lib/places'

export const subject = 'A few days to go — Marlan & Tramaine’s Wedding'

/** The small capitals line above "Marlan & Tramaine's Wedding". */
export const eyebrow = 'A few days to go'

const HOME_MAP = HOME_MAP_LINK
const SAMS_MAP = SAMS_MAP_LINK
const CEREMONIES = 'https://wedding.liedeman.perumal.co.za/ceremonies'
const PANWADI = 'https://www.youtube.com/watch?v=usVq_4K_m_w'

export function ReminderEmail({ name }: { name: string }) {
  return (
    <>
      <Greeting>Dear {name},</Greeting>

      <Intro>
        We can’t believe it’s almost here! Here are a few things to know before the celebrations begin.
      </Intro>

      <Heading>Mehndi & Nelengu</Heading>
      <When>Thursday 26 November · 10am</When>

      <P>
        The Mehndi is at our home, <Link href={HOME_MAP}>11 Orient Road, Wynberg</Link>. Parking is
        available in the parking lot on Orient Road, opposite the Apostolic Church.
      </P>

      <P>
        The Nelengu is at Sam and Priya’s home, <Link href={SAMS_MAP}>1 Belle Constantia Close, Kreupelbosch</Link>. Parking
        is on the grass patch behind the house.
      </P>

      <Heading>Sangeet</Heading>
      <When>Thursday 26 November · 5pm</When>

      <P>
        At our home, <Link href={HOME_MAP}>11 Orient Road, Wynberg</Link>. Parking is available in the
        parking lot on Orient Road, opposite the Apostolic Church.
      </P>

      <P>Please do not park on the street or sidewalk.</P>

      <P>
        Come whenever suits you — it’s absolutely fine to arrive later or leave earlier, but don’t miss
        out on the veg biryani!
      </P>

      <Heading>The Wedding</Heading>
      <When>Friday 27 November · 3pm</When>

      <P>Please arrive by 3pm — the ceremony starts promptly at 3:30pm.</P>

      <P>There are road works in the area at the moment, so please leave plenty of time to travel on the day.</P>

      <P>
        We’ve put together a <Link href={CEREMONIES}>guide to the ceremonies</Link> on the website. There are also
        pages about the Events, Venue, Attire and Gifts if you haven't had a look yet.
      </P>

      <P>
        We’ve chosen a fun wedding song <Link href={PANWADI}>Panwadi</Link>. Have a look & listen — we’ll
        be playing it a few times at the Sangeet, so if you want to learn the moves to the chorus, we can
        all try it together!
      </P>

      <Closing>
        We’re looking forward to seeing you all dressed up, and to sharing these moments with you.
      </Closing>

      <SignOff>
        With love,
        <br />
        Marlan & Tramaine
      </SignOff>

      <Button href={CEREMONIES}>The Ceremonies</Button>
    </>
  )
}
