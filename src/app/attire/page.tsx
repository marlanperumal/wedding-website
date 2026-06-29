import Link from "next/link";

import { AccentBar } from "@/components/ui";

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

const capeTownShops = [
  {
    name: "Shahzadi — Home of Indian Attire",
    detail: "65 Ernest Road, Rylands — men's & women's eastern wear",
    href: "https://www.instagram.com/shahzadi_indian_attire/",
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

export default function AttirePage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="font-serif text-4xl italic text-near-black mb-6">
            Attire
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-orange-soft" />
            <span className="text-orange-soft text-sm">✦</span>
            <div className="h-px w-10 bg-orange-soft" />
          </div>
        </header>

        {/* Intro */}
        <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-3">
          For the wedding we encourage traditional Indian attire in bright,
          festive colours. You don&rsquo;t need to be Indian to join in &mdash;
          we&rsquo;d love to see everyone dressed for the occasion. Below are a
          few of the most common options to give you some ideas.
        </p>
        <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-12">
          Please avoid pure white (worn for funerals), red &amp; gold
          (that&rsquo;s what the bride will be wearing), and jeans. The Thursday
          events are more relaxed &mdash; see the{" "}
          <AttireLink href="/events">Events page</AttireLink> for the dress code
          for each.
        </p>

        {/* Women */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl italic text-purple-deep mb-5">
            For the women
          </h2>
          <div className="space-y-8">
            {womensWear.map((g) => (
              <Garment key={g.name} {...g} />
            ))}
          </div>
        </section>

        {/* Men */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl italic text-purple-deep mb-5">
            For the men
          </h2>
          <div className="space-y-8">
            {mensWear.map((g) => (
              <Garment key={g.name} {...g} />
            ))}
          </div>
        </section>

        {/* Where to find it */}
        <section>
          <h2 className="font-serif text-2xl italic text-purple-deep mb-3">
            Where to find it
          </h2>
          <p className="font-sans text-sm text-near-black/75 leading-relaxed mb-5">
            If you don&rsquo;t already have something suitable, here are a few
            places to start. We&rsquo;ll add more as we come across them.
          </p>

          <h3 className="font-sans text-xs tracking-[1px] uppercase text-purple-orchid mb-2">
            In Cape Town
          </h3>
          <ul className="space-y-2 mb-3">
            {capeTownShops.map((s) => (
              <li key={s.name} className="font-sans text-sm">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
                >
                  {s.name}
                </a>
                <span className="text-near-black/60"> &mdash; {s.detail}</span>
              </li>
            ))}
          </ul>
          <p className="font-sans text-sm text-near-black/60 leading-relaxed mb-6">
            The Rylands and Athlone area is the hub for eastern wear in Cape
            Town, with several boutiques worth a browse in person.
          </p>

          <h3 className="font-sans text-xs tracking-[1px] uppercase text-purple-orchid mb-2">
            Online (ships within South Africa)
          </h3>
          <ul className="space-y-2 font-sans text-sm">
            {onlineShops.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-orchid underline underline-offset-2 hover:text-purple-deep transition-colors"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Image credits */}
        <footer className="mt-14 pt-5 border-t border-orange-soft/30">
          <p className="font-sans text-[11px] leading-relaxed text-near-black/40">
            Image credits:{" "}
            {credits.map((c, i) => (
              <span key={c.label}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-near-black/70 underline underline-offset-2"
                >
                  {c.label}
                </a>{" "}
                ({c.by}){i < credits.length - 1 ? "; " : "."}
              </span>
            ))}
          </p>
        </footer>
      </div>

      <AccentBar />
    </div>
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
    <article className="flex flex-col sm:flex-row gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt={alt}
        loading="lazy"
        className="w-full sm:w-40 h-56 sm:h-52 object-cover rounded-lg border border-orange-soft shadow-sm shrink-0"
      />
      <div>
        <h3 className="font-serif text-xl italic text-near-black mb-1.5">
          {name}
        </h3>
        <p className="font-sans text-sm text-near-black/75 leading-relaxed">
          {blurb}
        </p>
      </div>
    </article>
  );
}

function AttireLink({
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
