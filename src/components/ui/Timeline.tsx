export interface TimelineCard {
  name: string;
  /** Right-aligned Cinzel meta (e.g. "FROM 10AM"). */
  meta: string;
  metaColor: string;
  sub: string;
  accent: string;
}

export interface TimelineDay {
  num: string;
  label: string;
  note: string;
  noteColor: string;
  /** Friday's node is a filled gold disc; Thursday's is outlined. */
  filledNode?: boolean;
  /** Stronger card rule for the main-event day. */
  strongBorder?: boolean;
  cards: TimelineCard[];
}

// Vertical two-day timeline: a gold spine with day nodes and event cards.
// Used on the Home page.
export function Timeline({ days }: { days: TimelineDay[] }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 680, paddingLeft: 84 }}>
      <div
        className="absolute"
        style={{
          left: 31,
          top: 14,
          bottom: 14,
          width: 2,
          background:
            "linear-gradient(180deg,transparent,#c2a14e 8%,#c2a14e 92%,transparent)",
        }}
      />
      {days.map((day, di) => (
        <div key={day.num}>
          <div className="relative mb-[18px]">
            <div
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: -84,
                top: -2,
                width: 64,
                height: 64,
                background: day.filledNode ? "#7c5c14" : "#f6efdf",
                border: day.filledNode
                  ? undefined
                  : "1px solid rgba(176,138,54,.55)",
              }}
            >
              <span
                className="font-label font-bold text-[26px]"
                style={{ color: day.filledNode ? "#f6efdf" : "#7c5c14" }}
              >
                {day.num}
              </span>
            </div>
            <div className="font-label tracking-[.22em] text-[13px] text-gold-mid pt-1.5">
              {day.label}
            </div>
            <div
              className="font-serif italic text-[17px]"
              style={{ color: day.noteColor }}
            >
              {day.note}
            </div>
          </div>

          <div
            className={`flex flex-col gap-3.5 ${
              di < days.length - 1 ? "mb-[34px]" : ""
            }`}
          >
            {day.cards.map((card) => (
              <div
                key={card.name}
                className="bg-paper-card-warm rounded-[6px]"
                style={{
                  border: `1px solid rgba(176,138,54,${
                    day.strongBorder ? 0.45 : 0.3
                  })`,
                  borderLeft: `4px solid ${card.accent}`,
                  padding: "16px 20px",
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="font-serif italic text-[24px] text-ink">
                    {card.name}
                  </span>
                  <span
                    className="font-label tracking-[.12em] text-[11px]"
                    style={{ color: card.metaColor }}
                  >
                    {card.meta}
                  </span>
                </div>
                <div className="font-serif text-[17px] text-ink-muted mt-0.5">
                  {card.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
