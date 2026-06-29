import Link from "next/link";
import Image from "next/image";

import {
  Hero,
  SectionBand,
  PhotoFrame,
  Timeline,
  type TimelineDay,
} from "@/components/ui";

const TIMELINE: TimelineDay[] = [
  {
    num: "26",
    label: "THURSDAY",
    note: "optional — come if you can",
    noteColor: "#9e6bb5",
    cards: [
      {
        name: "Mehndi",
        meta: "FROM 10AM",
        metaColor: "#e07a29",
        sub: "Henna for the bride · Wynberg",
        accent: "#e07a29",
      },
      {
        name: "Nelengu",
        meta: "FROM 10AM",
        metaColor: "#9e6bb5",
        sub: "Groom's blessing · Constantia",
        accent: "#9e6bb5",
      },
      {
        name: "Sangeet",
        meta: "FROM 5PM",
        metaColor: "#2e7d7a",
        sub: "Music & dancing at our home · Wynberg",
        accent: "#3da4a1",
      },
    ],
  },
  {
    num: "27",
    label: "FRIDAY",
    note: "the main event",
    noteColor: "#5fae7e",
    filledNode: true,
    strongBorder: true,
    cards: [
      {
        name: "Wedding Ceremony",
        meta: "3:30PM · ARRIVE BY 3",
        metaColor: "#7c5c14",
        sub: "Goedgeleven · Durbanville",
        accent: "#b08a36",
      },
      {
        name: "Reception",
        meta: "TO FOLLOW · TILL 11:30",
        metaColor: "#7c5c14",
        sub: "Dinner, speeches & dancing",
        accent: "#b08a36",
      },
    ],
  },
];

const EXPLORE = [
  { href: "/venue", eyebrow: "FIND US", color: "#9e6bb5", title: "Venue & Directions" },
  { href: "/accommodation", eyebrow: "STAY OVER", color: "#2e7d7a", title: "Accommodation" },
  { href: "/attire", eyebrow: "WHAT TO WEAR", color: "#e07a29", title: "Attire Guide" },
  { href: "/faqs", eyebrow: "GOOD TO KNOW", color: "#5fae7e", title: "FAQs" },
];

export default function HomePage() {
  return (
    <div>
      <Hero
        cta={
          <Link
            href="/rsvp"
            className="inline-block font-label text-[12px] tracking-[.2em] text-paper-raised bg-gold-deep rounded-[2px] transition-colors hover:bg-[#6a4e10]"
            style={{ padding: "14px 40px" }}
          >
            RSVP
          </Link>
        }
      />

      {/* Our story + couple photo */}
      <SectionBand bg="panel" maxWidth={1040} padding="clamp(36px,6vw,64px) clamp(20px,5vw,60px)">
        <div className="flex flex-wrap items-center gap-x-[44px] gap-y-8">
          <PhotoFrame className="flex-1 basis-80">
            <Image
              src="/couple.jpg"
              alt="Marlan & Tramaine"
              width={1200}
              height={1600}
              className="block w-full h-auto"
              sizes="(max-width: 760px) 100vw, 500px"
              priority
            />
          </PhotoFrame>

          <div className="flex-1 basis-80">
            <div className="font-label text-[11px] tracking-[.3em] text-gold-deep">
              OUR STORY
            </div>
            <div
              className="font-serif italic text-ink leading-[1.25] mt-2.5 mb-3.5"
              style={{ fontSize: "clamp(26px,4vw,34px)" }}
            >
              Two days, both families, and everyone we love in one place.
            </div>
            <p
              className="font-serif text-ink-soft leading-[1.65]"
              style={{ fontSize: "clamp(17px,2.2vw,19px)" }}
            >
              We&rsquo;re bringing everyone together in Cape Town for a Mehndi, a
              Nelengu, a Sangeet, and the wedding itself. The Thursday gatherings
              are completely optional &mdash; but we&rsquo;d love to have you
              share in them with us.
            </p>
            <Link
              href="/events"
              className="inline-block mt-5 font-label text-[11px] tracking-[.18em] text-gold-deep transition-colors hover:text-acc-rust"
              style={{ border: "1px solid rgba(176,138,54,.6)", padding: "11px 26px" }}
            >
              SEE THE EVENTS
            </Link>
          </div>
        </div>
      </SectionBand>

      {/* Two-day timeline */}
      <SectionBand bg="gradient-top-60" padding="clamp(40px,6vw,58px) clamp(20px,5vw,60px)">
        <div className="text-center mb-[42px]">
          <div
            className="font-serif italic text-ink"
            style={{ fontSize: "clamp(30px,5vw,38px)" }}
          >
            A two-day celebration
          </div>
          <div className="font-label text-[12px] tracking-[.3em] text-gold-deep mt-2">
            NOVEMBER 2026
          </div>
        </div>
        <Timeline days={TIMELINE} />
      </SectionBand>

      {/* Explore grid */}
      <SectionBand bg="panel" maxWidth={1040} padding="clamp(36px,6vw,56px) clamp(20px,5vw,60px)">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {EXPLORE.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block text-center bg-paper-card no-underline transition-shadow hover:shadow-[0_4px_18px_-12px_rgba(120,90,30,.5)]"
              style={{ border: "1px solid rgba(176,138,54,.4)", padding: 24 }}
            >
              <div
                className="font-label text-[10px] tracking-[.2em]"
                style={{ color: card.color }}
              >
                {card.eyebrow}
              </div>
              <div className="font-serif italic text-[26px] text-ink mt-1.5">
                {card.title}
              </div>
            </Link>
          ))}
        </div>
      </SectionBand>

      {/* RSVP band */}
      <SectionBand bg="gradient-bottom" padding="clamp(40px,6vw,60px) clamp(20px,5vw,60px)" className="text-center">
        <div
          className="inline-block bg-paper-card"
          style={{
            border: "1px solid rgba(176,138,54,.5)",
            padding: "clamp(28px,4vw,36px) clamp(28px,5vw,60px)",
          }}
        >
          <div className="font-label text-[14px] tracking-[.3em] text-gold-deep">
            KINDLY RSVP
          </div>
          <div className="font-serif text-ink" style={{ margin: "10px 0 14px" }}>
            <span className="italic text-[20px]">by </span>
            <span className="font-semibold" style={{ fontSize: "clamp(28px,4vw,34px)" }}>
              30 September 2026
            </span>
          </div>
          <p
            className="font-serif text-[18px] text-ink-muted leading-[1.5] mx-auto"
            style={{ maxWidth: 420, marginBottom: 24 }}
          >
            Use the personalised link from your invitation, where you&rsquo;ll
            also find full event details.
          </p>
          <Link
            href="/rsvp"
            className="inline-block font-label text-[12px] tracking-[.2em] text-paper-raised bg-gold-deep rounded-[2px] transition-colors hover:bg-[#6a4e10]"
            style={{ padding: "14px 42px" }}
          >
            RSVP NOW
          </Link>
        </div>
      </SectionBand>
    </div>
  );
}
