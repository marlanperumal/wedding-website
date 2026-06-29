interface Detail {
  label: string;
  value: React.ReactNode;
}

interface EventCardProps {
  name: string;
  who: string;
  /** Accent colour for the left bar and the `who` tag. */
  color: string;
  desc: React.ReactNode;
  details: Detail[];
  /** Border alpha — the Friday cards use a slightly stronger rule. */
  borderAlpha?: number;
}

// A single event card with a coloured left accent. Used on the Events page.
export function EventCard({
  name,
  who,
  color,
  desc,
  details,
  borderAlpha = 0.35,
}: EventCardProps) {
  return (
    <article
      className="bg-paper-card rounded-[6px]"
      style={{
        border: `1px solid rgba(176,138,54,${borderAlpha})`,
        borderLeft: `4px solid ${color}`,
        padding: "clamp(20px,3vw,26px)",
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 mb-2">
        <span
          className="font-serif italic text-ink"
          style={{ fontSize: "clamp(26px,4vw,30px)" }}
        >
          {name}
        </span>
        <span
          className="font-label text-[10px] tracking-[.16em]"
          style={{ color }}
        >
          {who}
        </span>
      </div>
      <p
        className="font-serif text-ink-soft leading-[1.6] mb-3.5"
        style={{ fontSize: "clamp(16px,2.2vw,18px)" }}
      >
        {desc}
      </p>
      <dl className="flex flex-col gap-[5px]">
        {details.map((d) => (
          <div key={d.label} className="flex gap-2.5">
            <dt className="shrink-0 basis-16 font-label text-[10px] tracking-[.1em] text-gold-soft pt-[3px]">
              {d.label}
            </dt>
            <dd className="font-serif text-[17px] text-ink">{d.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
