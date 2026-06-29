interface EventPillProps {
  name: string;
}

// Small gold-tinted tag listing an event. Used in admin tables, the confirmed
// page and the invite event list.
export function EventPill({ name }: EventPillProps) {
  return (
    <span
      className="font-label text-[9px] tracking-[.08em] text-gold-deep rounded-[11px] whitespace-nowrap"
      style={{
        background: "rgba(176,138,54,.14)",
        border: "1px solid rgba(176,138,54,.3)",
        padding: "3px 9px",
      }}
    >
      {name}
    </span>
  );
}
