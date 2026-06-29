# Handoff: Wedding Website — "Marigold Paper" Redesign

## Overview

A full visual redesign of the **Marlan & Tramaine** wedding website (`wedding-website/`, Next.js + Tailwind v4 + Prisma). The information architecture and copy are unchanged — this is a **styling + layout** overhaul that replaces the current flat cream-and-rainbow-bar look with an elegant warm "marigold paper" system inspired by the couple's printed invitation and their décor colour board (jewel-toned paper lanterns + blooms: soft orange, purple, teal, green).

The redesign covers the key journey first: **Home / Invite → Events → Venue → Accommodation → Attire → FAQs → RSVP**, plus the internal **admin** area (Login, Dashboard, Guests).

---

## About the design files

The files in `reference/` are **design references built in HTML**, not production code to copy verbatim. `Wedding Site.dc.html` is the source of truth for the new look; it is a self-contained prototype (it uses a small in-house template runtime — `<sc-if>`, `<sc-for>`, `{{ … }}` holes, `support.js`, `image-slot.js` — none of which should ship). `Wedding Website - Options.dc.html` contains the earlier exploration (directions 1a/1b/1c) plus the chosen direction **2a**, kept for context.

**Your task:** recreate this design inside the **existing `wedding-website/` Next.js app**, using its established patterns — App Router pages, server components, the `SiteNav` component, Tailwind v4 `@theme` tokens, `next/font/google`, `next/image`, and the existing Prisma-backed RSVP server actions. Do **not** introduce the DC runtime, and do **not** rebuild the data layer; only the presentation changes.

Open `reference/Wedding Site.dc.html` in a browser to click through all pages. Note: the prototype navigates via internal state (one file); the real app keeps its **route-based** navigation (`/events`, `/venue`, …).

## Fidelity

**High-fidelity.** Exact colours, fonts, sizes, spacing, borders and motion are specified below and should be matched closely. Where the prototype uses fluid `clamp(min, vw, max)` values, reproduce them (they ARE the responsive behaviour — there are no breakpoints beyond flex/grid wrapping).

---

## Design tokens

### Fonts (Google Fonts via `next/font/google`)

| Role | Family | Weights / styles | Used for |
|---|---|---|---|
| Script display | **Parisienne** | 400 | Couple's names, "Will you join us?", footer name |
| Serif (primary) | **Cormorant Garamond** | 400/500/600/700, **italic heavily used** | Headings, body copy, event names |
| Caps / label | **Cinzel** | 400/500/600/700 | Eyebrows, nav, dates, meta labels, buttons |

Replace the current Geist + Georgia stack in `layout.tsx`. Body default = Cormorant Garamond, `color:#46370f`.

### Colour palette

**Paper / surfaces**
| Token | Hex | Use |
|---|---|---|
| `paper` | `#f4ecda` | Page background (body) |
| `paper-raised` | `#f6efdf` | Sticky nav, day-26 timeline node |
| `paper-panel` | `#efe6d2` | Alternating section bands |
| `paper-card` | `#faf4e6` | Cards, RSVP box, hero gradient top |
| `paper-card-warm` | `#fbf5e8` | Home timeline cards |
| `paper-input` | `#fffdf7` | Form inputs |
| hero gradient | `radial-gradient(120% 80% at 50% 0%, #faf4e6 0%, #f1e7d1 100%)` | Hero & light bands |

**Gold / ink (brand neutrals)**
| Token | Hex | Use |
|---|---|---|
| `gold-deep` | `#7c5c14` | Primary: buttons, eyebrows, section headings, day-27 node |
| `gold-mid` | `#856312` / `#8a6f2e` | Secondary labels, inactive nav |
| `gold-soft` | `#a08648` | Small meta labels (WHEN/WHERE) |
| `gold-line` | `#b08a36` | Rules, diamond, borders (use at alpha .3–.6, e.g. `rgba(176,138,54,.4)`) |
| `gold-spine` | `#c2a14e` | Timeline vertical line |
| `script-gold` | `#8a5f10` | Parisienne names |
| `amp-gold` | `#b08a36` | Ampersand between names |
| `ink` | `#46370f` | Headings & dark body |
| `ink-soft` | `#5c4e2e` | Body copy |
| `ink-muted` | `#7c6a44` | Tertiary text |
| `ink-eyebrow` | `#6a5016` | "Together with their families" |

**Accent colours (from the décor colour board — used to colour-code events)**
| Token | Hex | Maps to |
|---|---|---|
| `acc-orange` | `#e07a29` | **Mehndi**, traffic note bar |
| `acc-purple` | `#9e6bb5` | **Nelengu**, sub-labels, secondary links, active states |
| `acc-teal` | `#3da4a1` | **Sangeet** |
| `acc-green` | `#5fae7e` | Friday / "the main event", RSVP accept |
| `acc-rust` | `#b0451f` | **Active nav link** + underline |
| `acc-gold` | `#b08a36` | Friday cards (Wedding/Reception) left accent |

**Footer**: bg `#7c5c14`, name `#f6ecd0`, date `#dcc99a`, links `#e7d3a6`, body `#f1e3c4`.

**Garland decoration** stripes: `#e9a23f` / `#d98a2e` (placeholder — see Assets).

### Spacing, borders, radius, shadow

- **Section padding:** vertical `clamp(40px,6vw,64px)`, horizontal `clamp(20px,5vw,40–60px)`.
- **Container max-widths:** nav `1080`, home bands `1040`, hero card `760`, home timeline `680`, Events/Venue `780`, Attire `820`, Accommodation/FAQs `740`, RSVP `640`. All `margin:0 auto`.
- **Borders:** `1px solid rgba(176,138,54,.3–.6)`. Section bands separated by `border-top:1px solid rgba(176,138,54,.3)`.
- **Radius:** cards `6px`; buttons `2px`; pills/chips `20px`; photos square (framed). Timeline nodes & accent dots `50%`.
- **Shadows:** mostly flat. Nav only: `0 4px 18px -12px rgba(120,90,30,.4)`.
- **Photo frame motif (double rule):** outer `1px solid rgba(176,138,54,.55)` + `padding:6px` (5px on mobile) wrapping an inner element with `1px solid rgba(176,138,54,.35)`. Used for hero, couple photo, attire images, map.
- **Diamond divider:** `flex` row — `1px` line `linear-gradient(90deg,transparent,#b08a36)` · `◆` glyph `#b08a36` 10px · `1px` line `linear-gradient(90deg,#b08a36,transparent)`; lines `60–70px` wide.

### Type scale (key sizes)

- Hero names — Parisienne `clamp(52px,11vw,92px)`, line-height 1.02; ampersand `clamp(28px,5vw,44px)` `#b08a36`.
- Page title (Events/Venue/Attire/Accommodation) — Cormorant **italic** `clamp(38px,7vw,52px)` `#46370f`.
- FAQ page title — `clamp(34px,6vw,48px)`.
- Section heading — Cormorant italic `clamp(26px,4vw,32px)` `#7c5c14`.
- Eyebrow — Cinzel `11–12px`, `letter-spacing:.3em`, `#7c5c14`, uppercase.
- Body — Cormorant `clamp(16–18px, 2.2vw, 18–20px)`, line-height 1.6–1.65, `#5c4e2e`.
- Event/card name — Cormorant italic `24–30px` `#46370f`.
- Meta label (WHEN/WHERE/ATTIRE, FROM 10AM) — Cinzel `10–11px`, `letter-spacing:.1–.16em`.
- Nav — links Cinzel `11px`/`.14em`; logo `13px`/`.22em` `#7c5c14`.
- Date line — Cinzel `clamp(13px,2vw,16px)` `.26em`.

### Motion (keyframes)

```css
@keyframes sway     { 0%,100%{transform:rotate(-2.5deg)} 50%{transform:rotate(2.5deg)} }
@keyframes swaySlow { 0%,100%{transform:rotate(1.8deg)}  50%{transform:rotate(-1.8deg)} }
```
Applied to the two hero garland decorations (`transform-origin:top center`, durations 6s / 6.5s, `ease-in-out infinite`). Keep motion subtle; respect `prefers-reduced-motion` (disable in real app). No other animation.

---

## Global changes (do these first)

1. **`src/app/layout.tsx`** — swap fonts to Parisienne / Cormorant Garamond / Cinzel via `next/font/google`, expose as CSS vars. Body: `bg-[#f4ecda] text-[#46370f]` + Cormorant default.
2. **`src/app/globals.css`** — replace the `@theme inline` colour tokens with the palette above. Remove `--accent-gradient`, `.accent-bar`, `.paisley-watermark`, `.event-day-label`. Add the two `@keyframes` and a custom scrollbar (thumb `#cdb47a`, track `#efe6d2`) if desired.
3. **`src/components/ui/AccentBar.tsx`** — the rainbow gradient bar is **removed** from the new design. Either delete it and its usages, or repurpose as a thin `#b08a36` rule. Replace its visual role with the **diamond divider** under page headers.
4. Build a few small shared components (new): `PageHeader` (eyebrow + italic title + diamond), `Diamond`, `EventCard` (left-accent), `Timeline` (spine + day nodes + cards), `Garland` (swaying decoration), `PhotoFrame` (double-rule wrapper), `SectionBand`.

---

## Screens / views

> Container, padding, type and colour come from the tokens above. Map each to its existing repo file.

### 1. Site navigation — `src/components/ui/SiteNav.tsx`
- **Layout:** sticky top, `z-40`, bg `#f6efdf`, `border-bottom:1px solid rgba(176,138,54,.4)`, shadow `0 4px 18px -12px rgba(120,90,30,.4)`. Inner row `max-width:1080`, `padding:14px clamp(18px,4vw,40px)`, `flex` + `flex-wrap` + `justify-content:space-between`, `gap:10px 24px`.
- **Left:** logo `LIEDEMAN · PERUMAL`, Cinzel `13px` `.22em` `#7c5c14`, links to `/`.
- **Right:** links `Events · Venue · Accommodation (label "Stay") · Attire · FAQs`, Cinzel `11px` `.14em`. Inactive `#8a6f2e`; **active `#b0451f`** with a `1.5px` rust underline bar. Then an **RSVP** button: Cinzel `11px` `.16em`, `#f6efdf` on `#7c5c14`, `padding:9px 20px`, radius `2px`.
- **Behaviour:** keep route-based active detection (current `isActive`). The prototype's mobile hamburger is dropped — links simply wrap to a second line on narrow screens. (You may keep the repo's existing hamburger if preferred; restyle to these colours.)

### 2. Home — `src/app/page.tsx` (and the personalised `src/app/[inviteSlug]/page.tsx` + `InviteHero`)
Stacked full-width bands:

**a. Hero** (`max-width:760` centred card, hero gradient, double-rule frame `padding:clamp(40px,7vw,64px) clamp(24px,5vw,60px)`, `text-align:center`):
- Eyebrow line — Cormorant **italic** `clamp(18px,3vw,24px)` `#6a5016`: "Together with their families".
- Names — Parisienne, `#8a5f10`: "Marlan" / "&" (`#b08a36`) / "Tramaine", sizes per scale.
- Sub — Cormorant `clamp(17px,2.4vw,22px)` `#46370f`: "joyfully request the pleasure of your company / to share in their wedding celebrations".
- Diamond divider.
- Date — Cinzel `clamp(13px,2vw,16px)` `.26em` `#7c5c14`: "26 & 27 NOVEMBER 2026"; then "Cape Town, South Africa" Cormorant `18px` `#856312`.
- **RSVP** button (gold, → `/rsvp` or invite RSVP action).
- **Garlands:** two swaying decorations pinned `top:18px`, `left/right:clamp(14px,4vw,60px)`, `width:clamp(90px,14vw,160px)`, `pointer-events:none`. *Replace the striped placeholder with a real marigold-garland PNG.*
- For `[inviteSlug]` / `InviteHero`: add "Dear {guestNames}" (Cormorant italic) below the sub-line, as today.

**b. Our story + couple photo** (band `#efe6d2`, `max-width:1040`, `flex` wrap, `gap:clamp(24px,4vw,44px)`):
- Left: couple photo in double-rule frame, `flex:1 1 320px`, height `clamp(240px,32vw,340px)`, `object-fit:cover`. *Use `next/image`; add `/public/couple.jpg`.* (In the prototype this is a drag-drop `image-slot` — that's design-only.)
- Right (`flex:1 1 320px`): eyebrow "OUR STORY" Cinzel `.3em` `#7c5c14`; italic headline `clamp(26px,4vw,34px)` "Two days, both families, and everyone we love in one place."; body `clamp(17px,2.2vw,19px)`; outline button "SEE THE EVENTS" → `/events` (`border:1px solid rgba(176,138,54,.6)`, Cinzel `11px`).

**c. Two-day timeline** (light gradient band) — see Timeline pattern below. Heading: italic "A two-day celebration" `clamp(30px,5vw,38px)` + Cinzel "NOVEMBER 2026" `.3em`.

**d. Explore grid** (band `#efe6d2`, `max-width:1040`, `display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px`): four cards (`#faf4e6`, gold border, `padding:24px`, centred) → Venue / Accommodation / Attire / FAQs. Each: a Cinzel `.2em` `10px` eyebrow in an accent colour (purple/teal/orange/green respectively) + italic `26px` title.

**e. RSVP band** (light gradient): centred bordered box (`#faf4e6`, gold border, `padding:clamp(28px,4vw,36px) clamp(28px,5vw,60px)`): "KINDLY RSVP" Cinzel `.3em 14px`; "by **30 September 2026**" (italic "by" `20px` + bold `clamp(28px,4vw,34px)`); body `18px` `#7c6a44`; gold "RSVP NOW" button.

### 3. Events — `src/app/events/page.tsx`
- `PageHeader`: eyebrow "THE CELEBRATION", title "Events", diamond. Intro paragraph centred (`max-width:600`).
- **Day group**: big Cinzel numeral `clamp(30px,5vw,40px)` `#7c5c14` + italic day name `clamp(22px,3vw,28px)`; sub-label Cinzel `.2em 11px` ("OPTIONAL EVENTS" `#9e6bb5` / "THE MAIN EVENT" `#5fae7e`); `1px` gold rule.
- **EventCard** (one per event, `gap:22px`): `#faf4e6`, gold border, `border-left:4px solid {accent}`, radius `6px`, `padding:clamp(20px,3vw,26px)`:
  - Header row: italic name `clamp(26px,4vw,30px)` + Cinzel `who` tag `10px .16em` in the accent colour.
  - Description paragraph `clamp(16px,2.2vw,18px)`.
  - Detail rows: label column `flex:0 0 64px` Cinzel `10px` `#a08648` (WHEN / WHERE / ATTIRE) + value Cormorant `17px` `#46370f`.
- Data (names, who, accent, when, where, attire, desc) is in the logic block of `Wedding Site.dc.html` (`day1`, `day2`) — copy verbatim. Accents: Mehndi `#e07a29`, Nelengu `#9e6bb5`, Sangeet `#3da4a1`, Wedding & Reception `#b08a36`.

### 4. Venue — `src/app/venue/page.tsx`
- `PageHeader` ("FIND US" / "Venue"), then italic "Wedding & Reception" + "Goedgeleven · Klipheuwel Road, Durbanville", diamond.
- **Map**: existing `<iframe>` (same `src`) inside a double-rule frame, `height:300px`. Keep "OPEN IN GOOGLE MAPS →" link (Cinzel `11px` `#9e6bb5`, link `https://maps.app.goo.gl/wgQ6Qnsvks1ivaHaA`).
- **Getting there**: italic section heading; two sub-blocks (Cinzel `.14em 11px` `#9e6bb5` titles "FROM CAPE TOWN CBD" / "FROM CAPE TOWN INTERNATIONAL AIRPORT") with ordered lists `18px` `#5c4e2e`. Steps copy is in the reference file.
- **Traffic note**: callout `bg:#fbf0d9; border-left:3px solid #e07a29; padding:14px 18px`.
- **Other events**: italic heading + two entries (Mehndi & Sangeet — 11 Orient Road, Wynberg; Nelengu — 1 Belle Constantia Close, Kreupelbosch) each with a Google Maps search link.

### 5. Accommodation — `src/app/accommodation/page.tsx`
- `PageHeader` ("STAY OVER" / "Accommodation").
- Intro paragraph + ordered list (3 options, bold lead words). Copy in reference.
- "Near the wedding venue" italic heading + paragraph + three link cards (`#faf4e6`, gold border, `border-left:4px` in teal / purple / orange): **Alo Accommodation** — at Goedgeleven (`aloaccommodation.com/rooms`), **Dilisca Guest House** (`dilisca.co.za`), **Spes Bona Guest House** (`spesbonaguesthouse.com`). Names italic `24px`.

### 6. Attire — `src/app/attire/page.tsx`
- `PageHeader` ("WHAT TO WEAR" / "Attire") + two intro paragraphs (second in `#7c6a44`).
- **"For the women" / "For the men"** italic section headings, each a column of **garment rows** (`flex` wrap, `gap:22px`): framed image `170×220` `object-fit:cover` (double-rule frame) + text block (`flex:1 1 240px`) with italic name `26px` + blurb `18px`.
  - Women: Sari, Lehenga, Anarkali / Salwar Kameez. Men: Kurta, Sherwani. Images already exist in `wedding-website/public/attire/` (`sari.jpg`, `lehenga.jpg`, `anarkali.jpg`, `kurta.jpg`, `sherwani.jpg`) — use `next/image`. Blurbs in reference. Keep the existing image credits footer.
- **"Where to find it"**: "IN CAPE TOWN" → Shahzadi (Instagram link) + address line; "ONLINE (SHIPS WITHIN SOUTH AFRICA)" → Jayshrees/Rivaz, Shringar, The Maharani's Closet, Raja Rani's (links in reference). Inline links underlined `#46370f`.

### 7. FAQs — `src/app/faqs/page.tsx`
- `PageHeader` ("GOOD TO KNOW" / "Frequently Asked Questions").
- Column (`gap:30px`) of Q&A: question Cormorant **italic** `clamp(22px,3vw,26px)` `#7c5c14`; answer `clamp(17px,2.2vw,19px)` `#5c4e2e`. Three FAQs include a jump link ("See the Events / Attire / Accommodation page →", Cinzel `10px` `#9e6bb5`). All 11 Q&A copy is in the `faqs` array in the reference. (Open list — no accordion. An accordion is optional; not required.)

### 8. RSVP — `src/app/rsvp/page.tsx` + `src/components/rsvp/RsvpForm.tsx`
**Keep all existing logic / server actions / Prisma wiring** — restyle only.
- Header: "KINDLY RSVP" eyebrow; **Parisienne** "Will you join us?" `clamp(42px,8vw,58px)` `#8a5f10`; diamond; "respond by **30 September 2026**" paragraph.
- Form card: `#faf4e6`, gold border, `padding:clamp(24px,4vw,34px)`. "Dear {names}" italic `24px` + Cinzel sub "YOUR PERSONAL INVITATION · N GUESTS".
- **Per guest** (separated by `border-top:1px solid rgba(176,138,54,.3)`, `padding:18px 0`): name `22px`; a two-button accept/decline group — **JOYFULLY ACCEPTS** = `#f6efdf` on `#5fae7e`; **REGRETFULLY DECLINES** = outline (`border:1px solid rgba(176,138,54,.5)`, `#a08648`), Cinzel `10px .12em`, `padding:9px 18px` (these are the selected/unselected states — wire to existing attendance state). "ATTENDING" label, then **event pills** (`border-radius:20px`, `padding:6px 16px`, Cormorant `16px`) with per-event border colour (Mehndi orange / Nelengu purple / Sangeet teal / Wedding `#7c5c14`); selected pill = filled `#7c5c14` white. Dietary `text` input (`#fffdf7`, gold border).
- Footer of card: email input + full-width **SEND OUR RSVP** button (`#7c5c14`, white, Cinzel `.2em 13px`, `padding:16px`).
- Existing confirmed page (`rsvp/confirmed`) and `RsvpForm` validation stay; apply the same tokens.

### 9. Footer (global) — add to `layout.tsx`
Band `bg:#7c5c14`, centred: Parisienne name `38px` `#f6ecd0`; Cinzel date `11px .24em` `#dcc99a`; wrapped row of nav links Cinzel `10.5px .14em` `#e7d3a6`.

---

## Admin area (internal — `reference/Wedding Admin.dc.html`)

A quieter, **utilitarian** take on the same marigold system — optimised for scanning and editing, not romance. No garlands or diamond dividers; flat gold rules, serif numerals for figures, Cinzel labels. Desktop-first (tables scroll horizontally on narrow screens). Same tokens as above. **All existing auth, server actions and Prisma queries stay** — restyle only.

### A. Login — `src/app/admin/page.tsx`
Centred, `max-width:380`, no top bar. "ADMIN" eyebrow (Cinzel `.3em` `#a08648`); italic "Marlan & Tramaine" `34px`; small diamond. Card `#faf4e6` + gold border, `padding:28px 26px`: "PASSPHRASE" label, password input (`#fffdf7`, gold border), full-width gold **SIGN IN** button. Keep the existing error state — render incorrect-passphrase message in `#b0451f` above the card.

### B. Admin top bar (Dashboard + Guests share it)
Sticky, identical chrome to the public nav: bg `#f6efdf`, gold bottom border, shadow. Left: `LIEDEMAN · PERUMAL` + a small Cinzel `ADMIN` tag `#a08648`. Right: **OVERVIEW** / **GUESTS** tabs (active `#b0451f` + 1.5px underline, inactive `#8a6f2e`) + a bordered **SIGN OUT** button (`white-space:nowrap`). Replaces the current ad-hoc header nav.

### C. Dashboard — `src/app/admin/dashboard/page.tsx` + `DashboardStats.tsx`
- Page label "OVERVIEW" + italic "Dashboard" `clamp(32px,5vw,42px)`.
- **Summary cards** — `grid` `repeat(auto-fit,minmax(150px,1fr))`, gap 14px. Each: `#faf4e6` + gold border, big **serif numeral** `44px` `#46370f`, Cinzel `.16em 9.5px` label `#a08648`. Four cards: Total Invites / Responded / Pending / Response Rate (matches existing data).
- **RSVPs per event table** — wrapped in a `#faf4e6` gold-bordered box (`overflow-x:auto`, `min-width:520px`). Header row Cinzel `9.5px` `#a08648`, bottom gold rule; numeric columns right-aligned. Each row: event name (serif `18px`) prefixed by a `7px` accent dot (Mehndi orange / Nelengu purple / Sangeet teal / Wedding & Reception `#b08a36`); **Attending** in green `#2e7d5a` (weight 600), **Pending** in orange `#e07a29`, Declined muted `#a08648`, rows separated by `rgba(176,138,54,.18)`.
- **Dietary requirements** — Cinzel `.22em` teal `#2e7d7a` heading; wrap row of count chips (`#faf4e6` + gold border, serif `30px` count + Cinzel label, `min-width:108px`). Only render when non-empty (as today).

### D. Guests — `src/app/admin/guests/page.tsx` + `InviteTable.tsx` + `CopyLinkButton.tsx`
- Page label "MANAGE" + italic "Guests".
- **Add Invite** panel — `#faf4e6` + gold border; Cinzel teal "ADD INVITE" heading. Fields use Cinzel `9px` `#a08648` labels over `#fffdf7` inputs (gold border): Invite label + Contact email in a `repeat(auto-fit,minmax(220px,1fr))` grid; Guest-names `textarea` (rows 3, `resize:none`); Events as a wrap of checkbox labels (custom `15px` box, checked = `#7c5c14` fill with cream ✓). Gold **ADD INVITE** submit.
- **All invites table** — "ALL INVITES · N" teal heading; `#faf4e6` gold-bordered box (`overflow-x:auto`, `min-width:720px`). Columns: **Invite** (label serif `18px` 600 + email `14px` `#a08648`), **Guests** (comma-joined names `16px`), **Events** (wrap of small pills — Cinzel `9px` `#7c5c14`, `bg:rgba(176,138,54,.14)`, gold border, `border-radius:11px`), **Status** (chip: Submitted = `#2e7d7a` on `rgba(46,125,122,.12)`; Pending = `#c0631f` on `rgba(224,122,41,.12)`), **Link** (bordered "📋 COPY LINK" button, `#9e6bb5` — wire to the existing `CopyLinkButton` clipboard logic; keep its copied-confirmation state). Empty state: centred muted "No invites yet."
- Reuse the existing `EventPill` component — restyle to the pill spec above.

---

## Interactions & behaviour
- **Navigation:** route-based (App Router). Active link → `#b0451f` + underline. On `go`, the prototype scrolls to top; with real routes Next handles this.
- **Hover/focus (add in real app — prototype omits):** nav/links lighten toward `#b0451f`; buttons ~92% opacity or shift `#7c5c14`→`#6a4e10`; cards may add the nav-style soft shadow. Keep subtle.
- **Garland sway:** CSS only; gate behind `prefers-reduced-motion: no-preference`.
- **Map:** keep iframe lazy-loaded.
- **RSVP:** existing server action submission, validation, optimistic/disabled states — unchanged.

## State management
No new app state. Page routing is the router. The only interactive state is the **RSVP form** (per-guest attendance + per-event attendance + dietary + email), which already exists in `RsvpForm.tsx` / `rsvp/actions.ts` / Prisma — reuse as-is. (The prototype's `state.page` is a single-file artifact and is not needed.)

## Assets
- `assets/attire/*.jpg` — five garment photos (already in `wedding-website/public/attire/`). CC-attributed; keep the credits footer on the Attire page.
- `assets/colour-board.png` — the couple's décor palette (lanterns + blooms). Source of the accent hues; reference, not shipped.
- `assets/wedding-invite-background.jpeg` — the printed invite (ornate gold arch, **marigold garlands**, bells, elephant + florals). **Recommended:** crop a real marigold-garland element from this (or supply a PNG) to replace the striped garland placeholders in the hero. Also a good source for an optional subtle paper texture.
- **Needed from couple:** `couple.jpg` (Our Story / hero) and optionally venue/Sangeet photos.

## Files
- `reference/Wedding Site.dc.html` — **source of truth** for the full redesign (all 7 pages + nav + footer). Inline styles = exact spec; the `<script data-dc-script>` block holds all page **copy/data** (events, attire blurbs, FAQs).
- `reference/Wedding Website - Options.dc.html` — earlier explorations (1a Lantern Glow, 1b Marigold Paper, 1c Modern Bloom) + chosen **2a**.
- `reference/Wedding Admin.dc.html` — the internal **admin** redesign (Login, Dashboard, Guests) with sample data; logic block holds the table/stat structure.
- `reference/support.js`, `reference/image-slot.js` — prototype runtime only; **do not ship**.
- `assets/` — images described above.

### Target files to modify in the repo
`src/app/layout.tsx` · `src/app/globals.css` · `src/components/ui/SiteNav.tsx` · `src/components/ui/AccentBar.tsx` (remove/repurpose) · `src/app/page.tsx` · `src/app/[inviteSlug]/page.tsx` · `src/components/invite/InviteHero.tsx` · `src/components/invite/EventBlock.tsx` · `src/app/events/page.tsx` · `src/app/venue/page.tsx` · `src/app/accommodation/page.tsx` · `src/app/attire/page.tsx` · `src/app/faqs/page.tsx` · `src/app/rsvp/page.tsx` · `src/components/rsvp/RsvpForm.tsx` · `src/components/rsvp/GuestCard.tsx`. **Admin:** `src/app/admin/page.tsx` · `src/app/admin/dashboard/page.tsx` · `src/app/admin/guests/page.tsx` · `src/components/admin/DashboardStats.tsx` · `src/components/admin/InviteTable.tsx` · `src/components/admin/CopyLinkButton.tsx` · `src/components/ui/EventPill.tsx`. New shared UI: `PageHeader`, `Diamond`, `EventCard`, `Timeline`, `Garland`, `PhotoFrame`, `SectionBand`.
