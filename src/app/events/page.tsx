import Link from "next/link";

import { AccentBar } from "@/components/ui";

export const metadata = { title: "Events — Marlan & Tramaine" };

export default function EventsPage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="font-serif text-4xl italic text-near-black mb-6">
            Events
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-orange-soft" />
            <span className="text-orange-soft text-sm">✦</span>
            <div className="h-px w-10 bg-orange-soft" />
          </div>
        </header>

        <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-12 text-center">
          Our celebration spans two days. The Thursday events are completely
          optional, but we&rsquo;d love to have you share in them with us.
        </p>

        {/* Day 1 */}
        <DayHeading day="Thursday, 26 November 2026" note="Optional events" />

        <div className="space-y-8 mb-14">
          <Event
            name="Mehndi"
            who="Bride"
            time="From 10am"
            venue="11 Orient Road, Wynberg"
            attire="Bright, festive colours (yellows & oranges). Casual or semi-formal — Eastern if you prefer."
          >
            A joyful pre-wedding gathering for the bride, where henna (mehndi) is
            applied in intricate designs to her hands and feet. It&rsquo;s a
            relaxed, celebratory occasion filled with family, colour and good
            food.
          </Event>

          <Event
            name="Nelengu"
            who="Groom"
            time="From 10am"
            venue="1 Belle Constantia Close, Kreupelbosch"
            attire="Bright, festive colours (yellows & oranges). Casual or semi-formal — Eastern if you prefer."
          >
            The groom&rsquo;s equivalent celebration — a traditional blessing
            ceremony where family come together to bless and prepare the groom
            ahead of the wedding day.
          </Event>

          <Event
            name="Sangeet"
            who="Couple"
            time="From 5pm — pop in anytime before 9pm"
            venue="11 Orient Road, Wynberg"
            attire="Come as you are — wear whatever you're most comfortable in."
          >
            Traditionally a lively evening of music and dancing that brings both
            families together before the wedding. Ours will be a relaxed,
            informal gathering at our home — pop in for a bite, a glass and some
            time with us before the formal stuff the next day.
          </Event>
        </div>

        {/* Day 2 */}
        <DayHeading day="Friday, 27 November 2026" />

        <div className="space-y-8">
          <Event
            name="Wedding"
            who="Ceremony"
            time="Ceremony at 3:30pm — please arrive by 3pm"
            venue="Goedgeleven, Klipheuwel Road, Durbanville"
            attire="Traditional Indian attire. Please avoid pure white, red & gold, and jeans."
          >
            The heart of the celebration. Please allow at least an hour to travel
            to the venue — see the{" "}
            <EventLink href="/venue">Venue page</EventLink> for directions and
            the <EventLink href="/attire">Attire page</EventLink> for full dress
            details.
          </Event>

          <Event
            name="Reception"
            who="Couple"
            time="Following the ceremony — until 11:30pm"
            venue="Goedgeleven, Klipheuwel Road, Durbanville"
            attire="As for the ceremony — traditional Indian attire."
          >
            After the ceremony, welcome drinks and canapés are served while we
            take photos, followed by dinner, speeches and dancing. Come ready to
            celebrate!
          </Event>
        </div>
      </div>

      <AccentBar />
    </div>
  );
}

function DayHeading({ day, note }: { day: string; note?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-2xl italic text-purple-deep">{day}</h2>
      {note ? (
        <p className="font-sans text-xs tracking-[1px] uppercase text-purple-orchid mt-1">
          {note}
        </p>
      ) : null}
      <div className="h-px w-full bg-orange-soft/40 mt-3" />
    </div>
  );
}

function Event({
  name,
  who,
  time,
  venue,
  attire,
  children,
}: {
  name: string;
  who: string;
  time: string;
  venue: string;
  attire: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <div className="flex items-baseline gap-3 mb-2">
        <h3 className="font-serif text-xl italic text-near-black">{name}</h3>
        <span className="font-sans text-xs tracking-[1px] uppercase text-purple-orchid">
          {who}
        </span>
      </div>

      <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-3">
        {children}
      </p>

      <dl className="font-sans text-sm space-y-1">
        <Detail label="When">{time}</Detail>
        <Detail label="Where">{venue}</Detail>
        <Detail label="Attire">{attire}</Detail>
      </dl>
    </article>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 w-16 text-near-black/50">{label}</dt>
      <dd className="text-near-black/80">{children}</dd>
    </div>
  );
}

function EventLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
    >
      {children}
    </Link>
  );
}
