import Image from "next/image";

import { PageHeader } from "@/components/ui";

export const metadata = { title: "Attire — Marlan & Tramaine" };

const womensWear = [
  {
    name: "Sari",
    img: "/attire/sari.jpg",
    alt: "Woman wearing a green cotton sari",
    blurb:
      "A length of fabric draped elegantly around the body over a fitted blouse (choli). Timeless and endlessly versatile — if you're new to draping, the shops below can help, and many offer tutorials.",
  },
  {
    name: "Lehenga",
    img: "/attire/lehenga.jpg",
    alt: "Red and gold embroidered lehenga",
    blurb:
      "A long, often embellished skirt worn with a cropped blouse and a flowing dupatta (scarf). A celebratory, festive choice that's perfect for the wedding.",
  },
  {
    name: "Anarkali / Salwar Kameez",
    img: "/attire/anarkali.jpg",
    alt: "Woman in a teal Anarkali suit",
    blurb:
      "A long tunic (kameez) worn over fitted trousers (churidar or salwar) with a dupatta. Comfortable and graceful — a lovely option if you'd prefer not to drape a sari.",
  },
];

const mensWear = [
  {
    name: "Kurta",
    img: "/attire/kurta.jpg",
    alt: "Man wearing a cream kurta",
    blurb:
      "A long tunic worn over loose or fitted trousers (the kurta pyjama). Light, comfortable and easy to wear — ideal for the more relaxed Thursday events. Known as a Panjabi in some communities.",
  },
  {
    name: "Sherwani",
    img: "/attire/sherwani.jpg",
    alt: "Men wearing cream sherwanis",
    blurb:
      "A structured, knee-length coat worn over a kurta, often with fine detailing for a more formal look. A great choice to dress up for the wedding — a Nehru jacket over a kurta works beautifully too.",
  },
];

const onlineShops = [
  { name: "Jayshrees / Rivaz", href: "https://jayshrees.co.za" },
  { name: "Shringar", href: "https://shringar.co.za" },
  { name: "The Maharani's Closet", href: "https://www.maharaniscloset.co.za" },
  { name: "Raja Rani's Eastern Wear", href: "https://www.rajaranis.co.za" },
];

const credits = [
  {
    label: "Sari",
    by: "Yann, CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Sari_2.jpg",
  },
  {
    label: "Lehenga",
    by: "Iwaqarhashmi, CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Close-up_of_a_red_velvet_lehenga_with_intricate_gold_embroidery,_featuring_a_choli_and_a_flowing_skirt.jpg",
  },
  {
    label: "Anarkali",
    by: "Brendan, CC BY 2.0",
    href: "https://commons.wikimedia.org/wiki/File:Yogita_Grover,_Well_Groomed_Fashion_Show_(5420850558).jpg",
  },
  {
    label: "Kurta",
    by: "Fowler&fowler, public domain",
    href: "https://commons.wikimedia.org/wiki/File:Kurta_traditional_front_sandalwood_buttons.jpg",
  },
  {
    label: "Sherwani",
    by: "Pk041, CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Rajput_Sherwani_2014-04-23_04-27.JPG",
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
        bride&rsquo;s colours), and jeans. The Thursday events are more relaxed.
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
      <div className="font-label text-[11px] tracking-[.14em] text-acc-purple mb-2">
        IN CAPE TOWN
      </div>
      <p className="font-serif text-[18px] leading-[1.6] text-ink-soft mb-2">
        <InlineLink href="https://www.instagram.com/shahzadi_indian_attire/">
          Shahzadi — Home of Indian Attire
        </InlineLink>{" "}
        — 65 Ernest Road, Rylands. The Rylands &amp; Athlone area is the hub for
        eastern wear, with several boutiques worth a browse in person.
      </p>
      <div className="font-label text-[11px] tracking-[.14em] text-acc-purple mt-5 mb-2">
        ONLINE (SHIPS WITHIN SOUTH AFRICA)
      </div>
      <div className="flex flex-wrap gap-x-[26px] gap-y-2 font-serif text-[18px]">
        {onlineShops.map((s) => (
          <InlineLink key={s.name} href={s.href}>
            {s.name}
          </InlineLink>
        ))}
      </div>

      {/* Image credits */}
      <footer
        className="mt-14 pt-5"
        style={{ borderTop: "1px solid rgba(176,138,54,.3)" }}
      >
        <p className="font-label text-[10px] tracking-[.06em] leading-relaxed text-gold-soft">
          IMAGE CREDITS:{" "}
          {credits.map((c, i) => (
            <span key={c.label}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gold-deep"
              >
                {c.label}
              </a>{" "}
              ({c.by}){i < credits.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </footer>
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
    <article className="flex flex-wrap gap-[22px] items-start">
      <div
        className="shrink-0"
        style={{ border: "1px solid rgba(176,138,54,.5)", padding: 5 }}
      >
        <Image
          src={img}
          alt={alt}
          width={170}
          height={220}
          className="block object-cover"
          style={{ width: 170, height: 220 }}
        />
      </div>
      <div className="flex-1 basis-60">
        <div className="font-serif italic text-[26px] text-ink mb-1.5">{name}</div>
        <p className="font-serif text-[18px] leading-[1.6] text-ink-soft">
          {blurb}
        </p>
      </div>
    </article>
  );
}
