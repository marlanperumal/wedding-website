// Diamond divider: a gold rule · ◆ · gold rule. Used under page headers and
// in the hero. `width` controls the length of each side rule (px).
export function Diamond({
  width = 60,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <span
        className="h-px"
        style={{
          width,
          background: "linear-gradient(90deg,transparent,#b08a36)",
        }}
      />
      <span className="text-acc-gold text-[10px] leading-none">&#9670;</span>
      <span
        className="h-px"
        style={{
          width,
          background: "linear-gradient(90deg,#b08a36,transparent)",
        }}
      />
    </div>
  );
}
