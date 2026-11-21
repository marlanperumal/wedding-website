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
        title="The Ceremonies"
        subtitle="Friday, 27 November 2026"
        titleClamp="clamp(34px,6vw,48px)"
      />

      <Intro>
        Our wedding ceremony will be part Christian, part Hindu and part Us.
        Here&rsquo;s what will happen, and what each part means.
      </Intro>

      <Section title="The Christian Ceremony" leader="Led by Lay Minister James">
        <Item name="Opening Prayer">
          To bless everyone present and seek a harmonious wedding ceremony.
        </Item>
        <Item name="Bible Reading – Colossians 3:12–15" />
        <Item name="Unity Candle">
          Our mothers light two taper candles.
          They represent each of us as individuals, with our own histories,
          values and families. Together we light the centre candle, which stands
          for the shared life and household we create as we become one.
          Our mothers then put out the tapers, a
          sign that they support and bless our union.
        </Item>
        <Item name="Blessing and Exchange of Rings & Vows" />
      </Section>

      <Section title="The Hindu Ceremony" leader="Led by Guru Krishna">
        <Item name="Invocation">
          We offer prayers to Lord Ganesha, remover
          of obstacles, seeking blessing for a peaceful and happy marriage.
        </Item>
        <Item name="Havan">
          We offer a herbal mixture with ghee and
          sandalwood into the fire, so that Agni, the fire god, bears witness
          to our marriage.
        </Item>
        <Item name="Tray Exchange">
          Seven women from each of our families exchange trays filled with gifts.
          The exchange marks the agreement, mutual respect and lifelong
          bond between our families.
        </Item>
        <Item name="Pheras">
          We walk around the fire seven times, making seven vows: love, trust,
          respect, family, prosperity, friendship and lifelong commitment. No
          inauspicious sounds should interrupt this, so <strong>please ring the bells
          provided</strong> to drown out any that might.
        </Item>
        <Item name="Tying of the Thali">
          Marlan places <em>kumkum</em> (red dot) on Tramaine&rsquo;s forehead and ties
          the <em>thali</em> (a sacred thread and pendant) around her neck with
          three knots, for duty, love and fidelity.
        </Item>
        <Item name="Toe Rings">
          Marlan places <em>metti</em> (toe rings) on Tramaine&rsquo;s second toes, while her foot rests
          on a grinding stone, signifying her steadfastness in marriage.
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
  leader,
  children,
}: {
  title: string;
  /** Who leads this part, shown under the title. */
  leader: string;
  children: React.ReactNode;
}) {
  return (
    <section className="programme-section mb-12 last:mb-0">
      <header className="programme-section-header text-center mb-6">
        <h2 className="programme-section-title font-label text-[13px] tracking-[.24em] text-acc-purple uppercase">
          {title}
        </h2>
        <p className="programme-section-leader font-serif italic text-ink-soft text-[17px] mt-1">
          {leader}
        </p>
      </header>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Item({ name, children }: { name: string; children?: React.ReactNode }) {
  return (
    <div className="programme-item">
      <h3
        className="programme-item-name font-serif italic text-gold-deep mb-1.5"
        style={{ fontSize: "clamp(22px,3vw,26px)" }}
      >
        {name}
      </h3>
      {children && (
        <p
          className="programme-item-body font-serif text-ink-soft leading-[1.65]"
          style={{ fontSize: "clamp(17px,2.2vw,19px)" }}
        >
          {children}
        </p>
      )}
    </div>
  );
}
