import Link from "next/link";

import { PageHeader, EventCard } from "@/components/ui";

export const metadata = { title: "Events — Marlan & Tramaine" };

const ACCENT = {
  mehndi: "#e07a29",
  nelengu: "#9e6bb5",
  sangeet: "#3da4a1",
  friday: "#b08a36",
};

function EventLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-acc-purple underline underline-offset-2 hover:text-gold-deep transition-colors"
    >
      {children}
    </Link>
  );
}

export default function EventsPage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 780, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader eyebrow="THE CELEBRATION" title="Events" />

      <p
        className="font-serif text-ink-soft leading-[1.65] text-center mx-auto mb-11"
        style={{ fontSize: "clamp(18px,2.4vw,20px)", maxWidth: 600 }}
      >
        Our celebration spans two days. The Thursday events are completely
        optional, but we&rsquo;d love to have you share in them with us.
      </p>

      {/* Day 1 */}
      <DayHeading
        num="26"
        day="Thursday"
        sublabel="OPTIONAL EVENTS"
        sublabelColor={ACCENT.nelengu}
      />
      <div className="flex flex-col gap-[22px] mb-12">
        <EventCard
          name="Mehndi"
          who="BRIDE"
          color={ACCENT.mehndi}
          desc="A joyful pre-wedding gathering for the bride, where henna (mehndi) is applied in intricate designs to her hands and feet. It's a relaxed, celebratory occasion filled with family, colour and good food."
          details={[
            { label: "WHEN", value: "From 10am" },
            { label: "WHERE", value: "11 Orient Road, Wynberg" },
            {
              label: "ATTIRE",
              value:
                "Bright, festive colours (yellows & oranges). Casual or semi-formal — Eastern if you prefer.",
            },
          ]}
        />
        <EventCard
          name="Nelengu"
          who="GROOM"
          color={ACCENT.nelengu}
          desc="The groom's equivalent celebration — a traditional blessing ceremony where family come together to bless and prepare the groom ahead of the wedding day."
          details={[
            { label: "WHEN", value: "From 10am" },
            { label: "WHERE", value: "1 Belle Constantia Close, Kreupelbosch" },
            {
              label: "ATTIRE",
              value:
                "Bright, festive colours (yellows & oranges). Casual or semi-formal — Eastern if you prefer.",
            },
          ]}
        />
        <EventCard
          name="Sangeet"
          who="COUPLE"
          color={ACCENT.sangeet}
          desc="Traditionally a lively evening of music and dancing that brings both families together before the wedding. Ours will be a relaxed, informal gathering at our home — pop in for a bite, a glass and some time with us before the formal stuff the next day."
          details={[
            { label: "WHEN", value: "From 5pm — pop in anytime before 9pm" },
            { label: "WHERE", value: "11 Orient Road, Wynberg" },
            {
              label: "ATTIRE",
              value: "Come as you are — wear whatever you're most comfortable in.",
            },
          ]}
        />
      </div>

      {/* Day 2 */}
      <DayHeading
        num="27"
        day="Friday"
        sublabel="THE MAIN EVENT"
        sublabelColor="#5fae7e"
      />
      <div className="flex flex-col gap-[22px]">
        <EventCard
          name="Wedding"
          who="CEREMONY"
          color={ACCENT.friday}
          borderAlpha={0.45}
          desc={
            <>
              The heart of the celebration. Please allow at least an hour to
              travel to the venue — see the{" "}
              <EventLink href="/venue">Venue page</EventLink> for directions and
              the <EventLink href="/attire">Attire page</EventLink> for full
              dress details.
            </>
          }
          details={[
            { label: "WHEN", value: "Ceremony at 3:30pm — please arrive by 3pm" },
            { label: "WHERE", value: "Goedgeleven, Klipheuwel Road, Durbanville" },
            {
              label: "ATTIRE",
              value:
                "Traditional Indian attire. Please avoid pure white, red & gold, and jeans.",
            },
          ]}
        />
        <EventCard
          name="Reception"
          who="COUPLE"
          color={ACCENT.friday}
          borderAlpha={0.45}
          desc="After the ceremony, welcome drinks and canapés are served while we take photos, followed by dinner, speeches and dancing. Come ready to celebrate!"
          details={[
            { label: "WHEN", value: "Following the ceremony — until 11:30pm" },
            { label: "WHERE", value: "Goedgeleven, Klipheuwel Road, Durbanville" },
            { label: "ATTIRE", value: "As for the ceremony — traditional Indian attire." },
          ]}
        />
      </div>
    </div>
  );
}

function DayHeading({
  num,
  day,
  sublabel,
  sublabelColor,
}: {
  num: string;
  day: string;
  sublabel: string;
  sublabelColor: string;
}) {
  return (
    <div className="mb-[26px]">
      <div className="flex items-baseline gap-3.5 mb-1.5">
        <span
          className="font-label font-bold text-gold-deep"
          style={{ fontSize: "clamp(30px,5vw,40px)" }}
        >
          {num}
        </span>
        <span
          className="font-serif italic text-gold-deep"
          style={{ fontSize: "clamp(22px,3vw,28px)" }}
        >
          {day}
        </span>
      </div>
      <div
        className="font-label text-[11px] tracking-[.2em] mb-1.5"
        style={{ color: sublabelColor }}
      >
        {sublabel}
      </div>
      <div className="h-px" style={{ background: "rgba(176,138,54,.4)" }} />
    </div>
  );
}
