// Double-rule photo frame motif: outer gold rule + 6px padding (5px on mobile)
// wrapping an inner gold rule. Used for hero, couple photo, attire images, map.
export function PhotoFrame({
  children,
  className = "",
  inner = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** When false, the caller supplies its own inner rule (e.g. an <img>). */
  inner?: boolean;
}) {
  return (
    <div
      className={`p-[5px] sm:p-[6px] ${className}`}
      style={{ border: "1px solid rgba(176,138,54,.55)" }}
    >
      {inner ? (
        <div style={{ border: "1px solid rgba(176,138,54,.35)" }}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
