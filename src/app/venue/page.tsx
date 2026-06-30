import { PageHeader, PhotoFrame } from "@/components/ui";

export const metadata = { title: "Venue — Marlan & Tramaine" };

const VENUE_MAP_LINK = "https://maps.app.goo.gl/wgQ6Qnsvks1ivaHaA";
// Marker on Goedgeleven, but centred on the midpoint of all three event
// locations at a zoom that keeps Durbanville, Wynberg and Constantia in frame.
const VENUE_EMBED =
  "https://maps.google.com/maps?q=-33.7790704,18.7078956&ll=-33.9442,18.5392&z=9&output=embed";

export default function VenuePage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 780, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader
        eyebrow="FIND US"
        title="Venue"
        subtitle="Wedding & Reception"
        subline="Goedgeleven · Klipheuwel Road, Durbanville"
      />

      {/* Embedded map */}
      <PhotoFrame className="bg-paper-card">
        <iframe
          title="Map to Goedgeleven"
          src={VENUE_EMBED}
          className="w-full h-[300px] block border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </PhotoFrame>
      <p className="text-center mt-3.5 mb-11">
        <a
          href={VENUE_MAP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[11px] tracking-[.14em] text-acc-purple border-b border-acc-purple/50 pb-0.5 hover:text-gold-deep transition-colors"
        >
          OPEN IN GOOGLE MAPS &rarr;
        </a>
      </p>

      {/* Directions */}
      <SectionHeading>Getting there</SectionHeading>
      <Directions title="FROM CAPE TOWN CBD">
        <li>Get onto the N1 heading north, towards Paarl.</li>
        <li>
          Stay on the N1 and take Exit 23 (Okavango Road / R302) towards
          Durbanville.
        </li>
        <li>
          Follow Okavango Road north into Durbanville, then continue onto
          Klipheuwel Road heading out of town.
        </li>
        <li>
          Stay on Klipheuwel Road and follow the map for the final turn to
          Goedgeleven.
        </li>
      </Directions>
      <Directions title="FROM CAPE TOWN INTERNATIONAL AIRPORT">
        <li>
          Leave the airport and follow signs for the R300 heading north, towards
          Bellville / Brackenfell.
        </li>
        <li>
          Take the R300 until it joins the N1, then take the N1 towards Cape
          Town.
        </li>
        <li>Take Exit 23 (Okavango Road / R302) towards Durbanville.</li>
        <li>
          Follow Okavango Road north into Durbanville, continue onto Klipheuwel
          Road, and follow the map for the final turn to Goedgeleven.
        </li>
      </Directions>

      <p
        className="font-serif text-[18px] leading-[1.6] text-ink-soft mb-12"
        style={{
          background: "#fbf0d9",
          borderLeft: "3px solid #e07a29",
          padding: "14px 18px",
        }}
      >
        Please note: travel times on the Friday will be affected by traffic.
        Allow at least an hour to drive to the venue &mdash; or more if
        you&rsquo;re travelling from the Southern Suburbs.
      </p>

      {/* Other events */}
      <SectionHeading>Other events</SectionHeading>
      <div className="flex flex-col gap-[18px]">
        <EventVenue event="Mehndi" address="11 Orient Road, Wynberg" />
        <EventVenue
          event="Nelengu"
          address="1 Belle Constantia Close, Kreupelbosch"
          mapLink="https://maps.app.goo.gl/3119DKGR5e9b5uAp7"
        />
        <EventVenue event="Sangeet" address="11 Orient Road, Wynberg" />
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif italic text-gold-deep mb-[18px]"
      style={{ fontSize: "clamp(26px,4vw,32px)" }}
    >
      {children}
    </h2>
  );
}

function Directions({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[26px]">
      <h3 className="font-label text-[11px] tracking-[.14em] text-acc-purple mb-2">
        {title}
      </h3>
      <ol className="list-decimal pl-[22px] space-y-1.5 font-serif text-[18px] leading-[1.55] text-ink-soft marker:text-gold-soft">
        {children}
      </ol>
    </div>
  );
}

function EventVenue({
  event,
  address,
  mapLink,
}: {
  event: string;
  address: string;
  mapLink?: string;
}) {
  const mapsUrl =
    mapLink ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <div>
      <div className="font-serif italic text-[22px] text-ink">{event}</div>
      <div className="font-serif text-[17px] text-ink-soft">{address}</div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-label text-[9.5px] tracking-[.1em] text-acc-purple hover:text-gold-deep transition-colors"
      >
        OPEN IN GOOGLE MAPS &rarr;
      </a>
    </div>
  );
}
