import { AccentBar } from "@/components/ui";

export const metadata = { title: "Accommodation — Marlan & Tramaine" };

const venueStays = [
  {
    name: "Alo Accommodation",
    note: "at Goedgeleven",
    href: "https://aloaccommodation.com/rooms",
  },
  {
    name: "Dilisca Guest House",
    href: "https://www.dilisca.co.za",
  },
  {
    name: "Spes Bona Guest House",
    href: "https://spesbonaguesthouse.com",
  },
];

export default function AccommodationPage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="font-serif text-4xl italic text-near-black mb-6">
            Accommodation
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-orange-soft" />
            <span className="text-orange-soft text-sm">✦</span>
            <div className="h-px w-10 bg-orange-soft" />
          </div>
        </header>

        {/* Intro */}
        <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-6">
          The wedding venue is ~40 min outside Cape Town (over an hour in
          traffic) and the Thursday events are in the Southern Suburbs. If
          you&rsquo;re coming from out of town, figuring out where to stay might
          be a little tricky. Your main options are probably:
        </p>

        <ol className="list-decimal pl-5 space-y-3 font-sans text-sm text-near-black/75 leading-relaxed marker:text-orange-soft mb-12">
          <li>
            Stay somewhere near us in the Southern Suburbs (Wynberg, Constantia,
            Tokai, Kenilworth, etc.) &mdash; near the Thursday events, and drive
            through for the wedding.
          </li>
          <li>
            Stay near the wedding venue &mdash; there is limited accommodation at
            the venue itself (likely only available for the night of the wedding
            itself), there are a few guest houses nearby, or else anywhere in
            Durbanville should be close enough.
          </li>
          <li>
            Stay somewhere in the middle &mdash; Cape Town CBD, Rondebosch and
            Century City.
          </li>
        </ol>

        {/* Near the venue */}
        <section>
          <h2 className="font-serif text-2xl italic text-purple-deep mb-3">
            Near the wedding venue
          </h2>
          <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-5">
            Below are some accommodation options near the wedding venue in
            Durbanville. We&rsquo;ll add more in if we find some, but we
            obviously have no control over actual availability.
          </p>

          <ul className="space-y-4">
            {venueStays.map((stay) => (
              <li key={stay.href}>
                <a
                  href={stay.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-lg italic text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
                >
                  {stay.name}
                </a>
                {stay.note ? (
                  <span className="font-sans text-sm text-near-black/60">
                    {" "}
                    &mdash; {stay.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AccentBar />
    </div>
  );
}
