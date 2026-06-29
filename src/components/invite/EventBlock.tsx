import { Diamond, EventPill } from "@/components/ui";

interface EventData {
  id: string;
  name: string;
  date: Date;
  venue: string;
  sortOrder: number;
}

interface EventBlockProps {
  events: EventData[];
}

export function EventBlock({ events }: EventBlockProps) {
  // Group by calendar date (YYYY-MM-DD)
  const grouped = new Map<string, EventData[]>();
  for (const event of [...events].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const key = event.date.toISOString().split("T")[0];
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(event);
  }

  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 680, padding: "clamp(28px,4vw,40px) clamp(20px,5vw,40px) 0" }}
    >
      <div className="text-center mb-8">
        <div className="font-label text-[11px] tracking-[.3em] text-gold-deep">
          YOU&rsquo;RE INVITED TO
        </div>
        <Diamond className="mt-3" />
      </div>

      <div className="flex flex-col gap-6">
        {[...grouped.entries()].map(([dateKey, dayEvents]) => {
          const date = new Date(dateKey + "T00:00:00Z");
          const dayLabel = date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          });
          return (
            <div
              key={dateKey}
              className="bg-paper-card rounded-[6px]"
              style={{ border: "1px solid rgba(176,138,54,.35)", padding: "18px 22px" }}
            >
              <div className="font-label text-[11px] tracking-[.2em] text-gold-mid">
                {dayLabel.toUpperCase()}
              </div>
              <div className="font-serif text-[16px] text-ink-muted mt-0.5 mb-3">
                {dayEvents[0].venue}
              </div>
              <div className="flex flex-wrap gap-2">
                {dayEvents.map((e) => (
                  <EventPill key={e.id} name={e.name} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
