import { PageHeader } from "@/components/ui";

export const metadata = { title: "Accommodation — Marlan & Tramaine" };

const venueStays = [
  {
    name: "Alo Accommodation",
    note: "at Goedgeleven",
    href: "https://aloaccommodation.com/rooms",
    accent: "#3da4a1",
  },
  {
    name: "Dilisca Guest House",
    href: "https://www.dilisca.co.za",
    accent: "#9e6bb5",
  },
  {
    name: "Spes Bona Guest House",
    href: "https://www.spesbonaguestfarm.co.za/",
    accent: "#e07a29",
  },
];

export default function AccommodationPage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 740, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader eyebrow="STAY OVER" title="Accommodation" />

      <p
        className="font-serif text-ink-soft leading-[1.65] mb-[18px]"
        style={{ fontSize: "clamp(18px,2.4vw,20px)" }}
      >
        The wedding venue is about 40 minutes outside Cape Town (over an hour in
        traffic) and the Thursday events are in the Southern Suburbs. If
        you&rsquo;re coming from out of town, figuring out where to stay might be
        a little tricky. Your main options are probably:
      </p>

      <ol className="list-decimal pl-[22px] space-y-2.5 font-serif text-[18px] leading-[1.6] text-ink-soft marker:text-gold-soft mb-11">
        <li>
          Stay somewhere near us in the{" "}
          <b className="font-semibold">Southern Suburbs</b>{" "}
          (Wynberg, Constantia, Tokai, Kenilworth) &mdash; near the Thursday
          events, and drive through for the wedding.
        </li>
        <li>
          Stay near the <b className="font-semibold">wedding venue</b>{" "}
          &mdash; there is limited accommodation at the venue itself (likely
          only available for the night of the wedding), a few guest houses
          nearby, or anywhere in Durbanville should be close enough.
        </li>
        <li>
          Stay somewhere <b className="font-semibold">in the middle</b>{" "}
          &mdash; Cape Town CBD, Rondebosch or Century City.
        </li>
      </ol>

      <h2
        className="font-serif italic text-gold-deep mb-3"
        style={{ fontSize: "clamp(26px,4vw,32px)" }}
      >
        Near the wedding venue
      </h2>
      <p className="font-serif text-[18px] leading-[1.6] text-ink-soft mb-[22px]">
        A few options near the venue in Durbanville. We&rsquo;ll add more if we
        find them &mdash; but we have no control over actual availability.
      </p>

      <div className="flex flex-col gap-4">
        {venueStays.map((stay) => (
          <a
            key={stay.href}
            href={stay.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-paper-card no-underline transition-shadow hover:shadow-[0_4px_18px_-12px_rgba(120,90,30,.5)]"
            style={{
              border: "1px solid rgba(176,138,54,.4)",
              borderLeft: `4px solid ${stay.accent}`,
              padding: "18px 22px",
            }}
          >
            <span className="font-serif italic text-[24px] text-ink">
              {stay.name}
            </span>
            {stay.note && (
              <span className="font-serif text-[17px] text-ink-muted">
                {" "}
                &mdash; {stay.note}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
