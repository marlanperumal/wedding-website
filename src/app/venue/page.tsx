import { AccentBar } from "@/components/ui";

export const metadata = { title: "Venue — Marlan & Tramaine" };

const VENUE_MAP_LINK = "https://maps.app.goo.gl/wgQ6Qnsvks1ivaHaA";
// Marker on Goedgeleven, but centred on the midpoint of all three event
// locations at a zoom that keeps Durbanville, Wynberg and Constantia in frame.
const VENUE_EMBED =
  "https://maps.google.com/maps?q=-33.7790704,18.7078956&ll=-33.9442,18.5392&z=9&output=embed";

export default function VenuePage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Main heading */}
        <header className="text-center mb-10">
          <h1 className="font-serif text-4xl italic text-near-black mb-3">
            Venue
          </h1>
          <h2 className="font-serif text-2xl italic text-purple-deep mb-2">
            Wedding &amp; Reception
          </h2>
          <p className="font-sans text-sm text-near-black/75 tracking-wide">
            Goedgeleven
          </p>
          <p className="font-sans text-sm text-near-black/60 tracking-wide">
            Klipheuwel Road, Durbanville
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-10 bg-orange-soft" />
            <span className="text-orange-soft text-sm">✦</span>
            <div className="h-px w-10 bg-orange-soft" />
          </div>
        </header>

        {/* Embedded map */}
        <div className="overflow-hidden rounded-lg border border-orange-soft shadow-sm">
          <iframe
            title="Map to Goedgeleven"
            src={VENUE_EMBED}
            className="w-full h-72 block"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="text-center mt-3 mb-12">
          <a
            href={VENUE_MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
          >
            Open in Google Maps &rarr;
          </a>
        </p>

        {/* Directions */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl italic text-purple-deep mb-4">
            Getting there
          </h2>

          <Directions title="From Cape Town CBD">
            <li>
              Get onto the N1 heading north, towards Paarl.
            </li>
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

          <Directions title="From Cape Town International Airport">
            <li>
              Leave the airport and follow signs for the R300 heading north,
              towards Bellville / Brackenfell.
            </li>
            <li>
              Take the R300 until it joins the N1, then take the N1 towards Cape
              Town.
            </li>
            <li>
              Take Exit 23 (Okavango Road / R302) towards Durbanville.
            </li>
            <li>
              Follow Okavango Road north into Durbanville, continue onto
              Klipheuwel Road, and follow the map for the final turn to
              Goedgeleven.
            </li>
          </Directions>

          <p className="mt-6 font-sans text-sm text-near-black/75 leading-relaxed bg-orange-soft/15 border-l-2 border-orange-soft pl-4 py-3">
            Please note: travel times on the Friday will be affected by traffic.
            Allow at least an hour to drive to the venue &mdash; or more if
            you&rsquo;re travelling from the Southern Suburbs.
          </p>
        </section>

        {/* Other events */}
        <section>
          <h2 className="font-serif text-2xl italic text-purple-deep mb-4">
            Other events
          </h2>
          <div className="space-y-5">
            <EventVenue
              event="Mehndi"
              address="11 Orient Road, Wynberg"
            />
            <EventVenue
              event="Nelengu"
              address="1 Belle Constantia Close, Kreupelbosch"
            />
            <EventVenue
              event="Sangeet"
              address="11 Orient Road, Wynberg"
            />
          </div>
        </section>
      </div>

      <AccentBar />
    </div>
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
    <div className="mb-6">
      <h3 className="font-sans text-xs tracking-[1px] uppercase text-purple-orchid mb-2">
        {title}
      </h3>
      <ol className="list-decimal pl-5 space-y-1.5 font-sans text-sm text-near-black/75 leading-relaxed marker:text-orange-soft">
        {children}
      </ol>
    </div>
  );
}

function EventVenue({
  event,
  address,
}: {
  event: string;
  address: string;
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
  return (
    <div>
      <h3 className="font-serif text-lg italic text-near-black">{event}</h3>
      <p className="font-sans text-sm text-near-black/75">{address}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-xs text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
      >
        Open in Google Maps &rarr;
      </a>
    </div>
  );
}
