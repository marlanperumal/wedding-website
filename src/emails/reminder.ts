/*
 * The reminder email. Everything below `body` is plain HTML — edit freely.
 *
 * The styling (fonts, colours, spacing, the gold frame) is added for you, so
 * only use these tags:
 *
 *   <h2>Title</h2>                 a section heading, with a gold line above it
 *   <p class="when">…</p>          the italic date/time line under a heading
 *   <p>…</p>                       an ordinary paragraph
 *   <a href="…">…</a>              a link
 *   <p class="greeting">…</p>      the "Dear …" line
 *   <p class="intro">…</p>         the centred opening paragraph
 *   <p class="closing">…</p>       the centred closing paragraph
 *   <p class="sign-off">…</p>      "With love, …"
 *   <a class="button" href="…">…</a>   the big gold button
 *   <br>                           a line break inside a paragraph
 *
 * ${name} is replaced with the invite's name (e.g. "Naidoo Family").
 * Type ’ — · & directly; no need for &rsquo; and friends.
 * Don't use backticks (`) anywhere in the text.
 */

export const subject = 'A few days to go — Marlan & Tramaine’s Wedding'

/** The small capitals line above "Marlan & Tramaine's Wedding". */
export const eyebrow = 'A few days to go'

export const body = (name: string) => `

<p class="greeting">Dear ${name},</p>

<p class="intro">
  We can’t believe it’s almost here! Here are a few things to know before the celebrations begin.
</p>


<h2>Mehndi & Nelengu</h2>
<p class="when">Thursday 26 November · 10am</p>

<p>
  The Mehndi is at our home, <a href="https://maps.google.com/?q=11+Orient+Road,+Wynberg">11 Orient Road, Wynberg</a>.
  Parking is available in the parking lot on Orient Road, opposite the Apostolic Church.
</p>

<p>
  The Nelengu is at Sam’s, <a href="https://maps.google.com/?q=1+Belle+Constantia+Close,+Kreupelbosch">1 Belle Constantia Close, Kreupelbosch</a>.
  Parking is on the grass patch behind the house.
</p>


<h2>Sangeet</h2>
<p class="when">Thursday 26 November · 5pm</p>

<p>
  At our home, <a href="https://maps.google.com/?q=11+Orient+Road,+Wynberg">11 Orient Road, Wynberg</a>.
  Parking is available in the parking lot on Orient Road, opposite the Apostolic Church.
</p>

<p>Please do not park on the street or sidewalk.</p>

<p>
  Come whenever suits you — it’s absolutely fine to arrive later or leave earlier,
  but don’t miss out on the Veg Biryani!
</p>


<h2>The Wedding</h2>
<p class="when">Friday 27 November · 3pm</p>

<p>Please arrive by 3pm — the ceremony starts promptly at 3:30pm.</p>

<p>There are road works in the area at the moment, so please leave plenty of time to travel on the day.</p>

<p>
  We’ve put together a <a href="https://wedding.liedeman.perumal.co.za/ceremonies">guide to the ceremonies</a> on the website.
</p>

<p>
  Our wedding song & dance is <a href="https://www.youtube.com/watch?v=usVq_4K_m_w">Panwadi</a> —
  have a look & listen before the day and if you’re up for it, try to learn the steps as we all join in.
</p>


<p class="closing">
  We’re looking forward to seeing you all dressed up, and to sharing these moments with you.
</p>

<p class="sign-off">With love,<br>Marlan & Tramaine</p>

<a class="button" href="https://wedding.liedeman.perumal.co.za/ceremonies">The Ceremonies</a>

`
