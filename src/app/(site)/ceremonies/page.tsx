import { PageHeader } from "@/components/ui";

export const metadata = { title: "Ceremonies — Marlan & Tramaine" };

export default function CeremoniesPage() {
  return (
    <div
      className="ceremony-programme mx-auto"
      style={{ maxWidth: 740, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader
        eyebrow="ORDER OF SERVICE"
        title="Our Ceremonies"
        subtitle="Friday, 27 November 2026"
        titleClamp="clamp(34px,6vw,48px)"
      />

      <Intro>
        Our wedding brings together a Christian ceremony and a Hindu ceremony.
        Here&rsquo;s what happens, and what each part means.
      </Intro>

      <Section title="Before You Arrive">
        <Item name="Sandana Nalangu">
          <em>Nalangu</em> means anointing, and <em>sandanam</em> is sandalwood
          paste. Following the previous day&rsquo;s Mehndi and Nelengu, three
          married women give us a final blessing before the wedding. They circle{" "}
          <em>aalam</em>{" "}water (turmeric and lime juice) around us to shield us
          from negative energy, jealousy and the &ldquo;evil eye&rdquo; that
          comes with being the centre of attention. They apply sandanam to
          purify us, bless us with <em>vibuthi</em> (holy ash) and red{" "}
          <em>kumkum</em> powder, and sprinkle rose water to wish us a long and
          happy married life.
        </Item>
      </Section>

      <Section title="The Procession">
        <p className="programme-lead">
          To traditional, auspicious <em>nadaswaram</em> music:
        </p>
        <ol className="programme-procession">
          <li>
            Our sisters &mdash; Delisha, carrying the holy lamp, and Nasreen,
            carrying the bridal garlands
          </li>
          <li>Our mothers &mdash; Maggie and Virginia</li>
          <li>Marlan</li>
          <li>Tramaine, walked down the aisle by her son, Travis</li>
        </ol>
      </Section>

      <Section title="The Christian Ceremony" startsBackPage>
        <Item name="Opening Prayer">
          James Chapman leads the ceremony and opens with a prayer.
        </Item>
        <Item name="Bible Reading">
          Travis reads Colossians 3:12&ndash;15.
        </Item>
        <Item name="Unity Candle">
          At the start of the ceremony, our mothers light two taper candles.
          They represent each of us as individuals, with our own histories,
          values and families. Together we light the centre candle, which stands
          for the shared life and household we create as we become &ldquo;one
          flesh&rdquo; (Genesis 2:24). Our mothers then put out the tapers, a
          sign that they support and bless our union.
        </Item>
        <Item name="Blessing of the Rings & Exchange of Vows">
          James blesses our wedding rings, and we make our vows to each other.
        </Item>
        <p className="programme-transition">
          We then move across to the <em>pandhal</em> (wedding canopy) for the
          Hindu ceremony.
        </p>
      </Section>

      <Section title="The Hindu Ceremony">
        <Item name="Invocation">
          We offer prayers to Lord Ganesha, the elephant-headed god and remover
          of obstacles.
        </Item>
        <Item name="Havan (Fire Ceremony)">
          We offer <em>havan samagri</em> (a herbal mixture with ghee and
          sandalwood) into the fire, so that Agni, the fire god, bears witness
          to our marriage.
        </Item>
        <Item name="Tray Exchange">
          Seven women from each of our families exchange trays filled with gifts
          for us. The exchange marks the agreement, mutual respect and lifelong
          bond between our families. It ends with the elders bowing to one
          another, embracing or touching feet to seek blessings: our two
          households are now one extended family.
        </Item>
        <Item name="Pheras">
          We walk around the fire seven times, making seven vows: love, trust,
          respect, family, prosperity, friendship and lifelong commitment. No
          inauspicious sounds should interrupt this, so please ring the bells
          provided to drown out any that might.
        </Item>
        <Item name="Tying of the Thali">
          Marlan places kumkum (a red dot) on Tramaine&rsquo;s forehead and ties
          the <em>thali</em> (a sacred thread and pendant) around her neck with
          three knots, for duty, love and fidelity.
        </Item>
        <Item name="Exchange of Garlands">
          We exchange garlands three times, affirming that we are one in mind,
          body and spirit.
        </Item>
      </Section>
    </div>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="programme-intro font-serif text-ink-soft leading-[1.65] text-center mx-auto mb-10"
      style={{ fontSize: "clamp(18px,2.4vw,20px)", maxWidth: 620 }}
    >
      {children}
    </p>
  );
}

function Section({
  title,
  startsBackPage = false,
  children,
}: {
  title: string;
  /** In print, start this section on the back of the A5 pamphlet. */
  startsBackPage?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`programme-section mb-12 last:mb-0 ${startsBackPage ? "programme-back-page" : ""}`}
    >
      <h2 className="programme-section-title font-label text-[13px] tracking-[.24em] text-acc-purple uppercase text-center mb-6">
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Item({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="programme-item">
      <h3
        className="programme-item-name font-serif italic text-gold-deep mb-1.5"
        style={{ fontSize: "clamp(22px,3vw,26px)" }}
      >
        {name}
      </h3>
      <p
        className="programme-item-body font-serif text-ink-soft leading-[1.65]"
        style={{ fontSize: "clamp(17px,2.2vw,19px)" }}
      >
        {children}
      </p>
    </div>
  );
}
