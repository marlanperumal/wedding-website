type BandBg =
  | "paper"
  | "panel"
  | "gradient-top"
  | "gradient-top-60"
  | "gradient-bottom";

const BG: Record<BandBg, string> = {
  paper: "#f4ecda",
  panel: "#efe6d2",
  "gradient-top":
    "radial-gradient(120% 80% at 50% 0%, #faf4e6 0%, #f1e7d1 100%)",
  "gradient-top-60":
    "radial-gradient(120% 60% at 50% 0%, #faf4e6 0%, #f1e7d1 100%)",
  "gradient-bottom":
    "radial-gradient(120% 80% at 50% 100%, #faf4e6 0%, #f1e7d1 100%)",
};

interface SectionBandProps {
  children: React.ReactNode;
  id?: string;
  bg?: BandBg;
  /** Inner container max-width (px). Omit for a full-bleed band. */
  maxWidth?: number;
  topBorder?: boolean;
  padding?: string;
  className?: string;
  innerClassName?: string;
}

// A full-width section band with a gold top rule and an auto-centred inner
// container. The stacking primitive for the Home page.
export function SectionBand({
  children,
  id,
  bg = "paper",
  maxWidth,
  topBorder = true,
  padding = "clamp(40px,6vw,64px) clamp(20px,5vw,60px)",
  className = "",
  innerClassName = "",
}: SectionBandProps) {
  return (
    <section
      id={id}
      className={className}
      style={{
        background: BG[bg],
        padding,
        borderTop: topBorder ? "1px solid rgba(176,138,54,.3)" : undefined,
      }}
    >
      <div
        className={`mx-auto ${innerClassName}`}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </section>
  );
}
