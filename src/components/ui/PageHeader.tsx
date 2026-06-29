import { Diamond } from "./Diamond";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  /** Optional smaller italic sub-title shown above the diamond. */
  subtitle?: string;
  /** Optional plain line under the subtitle (e.g. an address). */
  subline?: string;
  /** Override the title size (the FAQ page runs a touch smaller). */
  titleClamp?: string;
}

// Eyebrow (Cinzel caps) + italic serif title + diamond divider. The shared
// header motif across Events / Venue / Accommodation / Attire / FAQs.
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  subline,
  titleClamp = "clamp(38px,7vw,52px)",
}: PageHeaderProps) {
  return (
    <header className="text-center mb-[30px]">
      <div className="font-label text-[12px] tracking-[.3em] text-gold-deep">
        {eyebrow}
      </div>
      <h1
        className="font-serif italic text-ink mt-2 leading-[1.1]"
        style={{ fontSize: titleClamp }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          className="font-serif italic text-gold-deep mt-2"
          style={{ fontSize: "clamp(22px,3vw,26px)" }}
        >
          {subtitle}
        </div>
      )}
      {subline && (
        <div className="font-serif text-[19px] text-ink-soft mt-1">
          {subline}
        </div>
      )}
      <Diamond className="mt-3.5" />
    </header>
  );
}
