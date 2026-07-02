import { PageHeader } from "@/components/ui";
import { ExpandableImage } from "@/components/attire/ExpandableImage";

export const metadata = { title: "Attire — Marlan & Tramaine" };

const womensWear = [
  {
    name: "Sari",
    img: "/attire/saree-v2.jpg",
    alt: "Woman wearing a mauve and gold silk saree",
    blurb:
      "A length of fabric draped elegantly around the body over a fitted blouse (choli). Timeless and endlessly versatile — if you're new to draping, the shops below can help, and many offer tutorials.",
  },
  {
    name: "Lehenga",
    img: "/attire/lehenga.jpeg",
    alt: "Woman wearing an olive-green embroidered lehenga with dupatta",
    blurb:
      "A long, often embellished skirt worn with a cropped blouse and a flowing dupatta (scarf). A celebratory, festive choice that's perfect for the wedding.",
  },
  {
    name: "Anarkali",
    img: "/attire/anarkali-v2.jpeg",
    alt: "Woman wearing a yellow floor-length Anarkali gown with gold embroidery and a matching dupatta",
    blurb:
      "A long, floor-length dress with a fitted bodice that flares into a full, flowing skirt, worn with a dupatta. Elegant and graceful — a striking, dressed-up option that's perfect for the wedding.",
  },
  {
    name: "Salwar Kameez",
    img: "/attire/salwar-kameez.jpeg",
    alt: "Woman wearing a teal salwar kameez with a matching dupatta",
    blurb:
      "A tunic (kameez) worn over matching trousers (salwar or churidar) with a dupatta. Comfortable and easy to wear — a lovely option if you'd prefer not to drape a sari.",
  },
  {
    name: "Panjabi / Patiala Suit",
    img: "/attire/panjabi.jpg",
    alt: "Woman wearing a royal-blue Panjabi suit with patiala salwar and a net dupatta",
    blurb:
      "A short kurti worn with gathered, pleated trousers (patiala salwar) and a dupatta. Easy to move in and full of colour — a comfortable, festive alternative to draping a sari.",
  },
];

const mensWear = [
  {
    name: "Kurta",
    img: "/attire/kurta.jpeg",
    alt: "Man wearing a cream embroidered kurta",
    blurb:
      "A long tunic worn over loose or fitted trousers (the kurta pyjama). Light, comfortable and easy to wear — ideal for the more relaxed Thursday events.",
  },
  {
    name: "Nehru Jacket",
    img: "/attire/nehru-jacket.jpeg",
    alt: "Man wearing a cream Nehru jacket over a kurta",
    blurb:
      "A short, collared waistcoat worn over a kurta to dress the look up a little. An easy way to add a more polished, festive touch without committing to a full suit.",
  },
  {
    name: "Bandhgala / Nehru Suit",
    img: "/attire/bandhgala-suit.jpeg",
    alt: "Man wearing a brown bandhgala suit",
    blurb:
      "A structured, mandarin-collared jacket worn with matching trousers for a sharp, formal look. A great choice to dress up for the wedding.",
  },
  {
    name: "Dhoti",
    img: "/attire/dhoti.jpeg",
    alt: "Man wearing a white dhoti with a gold border and a linen shirt",
    blurb:
      "A length of cloth wrapped around the legs and knotted at the waist, worn with a shirt or kurta. A relaxed, traditional option that's especially fitting for the Thursday events.",
  },
];

const shops = [
  {
    name: "Khan's Punjabies",
    href: "https://www.facebook.com/p/Khans-Punjabies-100088188561066/",
    address: "39 Hadji Ebrahim Cres, Athlone, Cape Town, 7764",
    note: "Men's and women's wear.",
  },
  {
    name: "Jayshrees",
    href: "https://jayshrees.co.za/",
    note: "Men's and women's wear.",
  },
  {
    name: "Sahar",
    href: "https://www.instagram.com/sahar_southafrica/",
    note: "Women's wear.",
  },
  {
    name: "Yaga",
    href: "https://www.yaga.co.za/",
    note: "Pre-loved men's and women's wear — a great option if you're hesitant to buy Eastern wear for a single occasion, or you'd like to support a circular economy.",
  },
];

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink underline underline-offset-2 hover:text-gold-deep transition-colors"
    >
      {children}
    </a>
  );
}

export default function AttirePage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 820, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader eyebrow="WHAT TO WEAR" title="Attire" />

      <p
        className="font-serif text-ink-soft leading-[1.65] text-center mx-auto mb-3"
        style={{ fontSize: "clamp(18px,2.4vw,20px)", maxWidth: 620 }}
      >
        For the wedding we encourage traditional Indian attire in bright, festive
        colours. You don&rsquo;t need to be Indian to join in &mdash; we&rsquo;d
        love to see everyone dressed for the occasion. Below are a few of the
        most common options to give you some ideas.
      </p>
      <p
        className="font-serif text-ink-muted leading-[1.6] text-center mx-auto mb-12"
        style={{ fontSize: "18px", maxWidth: 620 }}
      >
        Please avoid pure white (worn for funerals), red or gold (the
        bride&rsquo;s colours), and denim. The Thursday events are more relaxed.
      </p>

      <SectionHeading>For the women</SectionHeading>
      <div className="flex flex-col gap-[26px] mb-12">
        {womensWear.map((g) => (
          <Garment key={g.name} {...g} />
        ))}
      </div>

      <SectionHeading>For the men</SectionHeading>
      <div className="flex flex-col gap-[26px] mb-12">
        {mensWear.map((g) => (
          <Garment key={g.name} {...g} />
        ))}
      </div>

      <SectionHeading>Where to find it</SectionHeading>
      <div className="flex flex-col gap-5">
        {shops.map((s) => (
          <div key={s.name}>
            <div className="font-serif italic text-[22px] text-ink mb-0.5">
              <InlineLink href={s.href}>{s.name}</InlineLink>
            </div>
            {s.address && (
              <p className="font-serif text-[16px] leading-[1.55] text-ink-muted">
                {s.address}
              </p>
            )}
            <p className="font-serif text-[18px] leading-[1.6] text-ink-soft">
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif italic text-gold-deep mb-[22px]"
      style={{ fontSize: "clamp(26px,4vw,32px)" }}
    >
      {children}
    </h2>
  );
}

function Garment({
  name,
  img,
  alt,
  blurb,
}: {
  name: string;
  img: string;
  alt: string;
  blurb: string;
}) {
  return (
    <article className="flex flex-wrap gap-[22px] items-start justify-center sm:justify-start">
      <ExpandableImage src={img} alt={alt} caption={name} description={blurb} />
      <div className="flex-1 basis-60">
        <div className="font-serif italic text-[26px] text-ink mb-1.5">{name}</div>
        <p className="font-serif text-[18px] leading-[1.6] text-ink-soft">
          {blurb}
        </p>
      </div>
    </article>
  );
}
