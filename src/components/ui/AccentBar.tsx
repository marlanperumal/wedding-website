// The old rainbow gradient bar is retired in the marigold redesign. Kept as a
// thin gold hairline rule for any remaining structural separators.
export function AccentBar() {
  return (
    <div
      aria-hidden="true"
      className="h-px"
      style={{ background: "rgba(176,138,54,.4)" }}
    />
  );
}
