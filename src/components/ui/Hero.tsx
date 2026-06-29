import { Diamond } from "./Diamond";

interface HeroProps {
  /** When present, renders a personalised "Dear …" line (invite landing). */
  dearNames?: string;
  /** The RSVP call-to-action (a link on home, a form submit on the invite). */
  cta: React.ReactNode;
}

// The invitation hero: a centred card with the couple's names. Shared by the
// public Home page and the personalised invite landing page.
export function Hero({ dearNames, cta }: HeroProps) {
  return (
    <div style={{ padding: "clamp(20px,4vw,40px)" }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: 760,
          border: "1px solid rgba(176,138,54,.55)",
          padding: 6,
          background:
            "radial-gradient(120% 80% at 50% 0%, #faf4e6 0%, #f1e7d1 100%)",
        }}
      >
        <div
          className="text-center"
          style={{
            border: "1px solid rgba(176,138,54,.4)",
            padding: "clamp(40px,7vw,64px) clamp(24px,5vw,60px)",
          }}
        >
          <div
            className="font-serif italic text-ink-eyebrow"
            style={{ fontSize: "clamp(18px,3vw,24px)" }}
          >
            Together with their families
          </div>

          <div
            className="font-script text-script-gold leading-[1.02]"
            style={{ margin: "14px 0 6px" }}
          >
            <div style={{ fontSize: "clamp(52px,11vw,92px)" }}>Marlan</div>
            <div
              className="text-acc-gold"
              style={{ fontSize: "clamp(28px,5vw,44px)", margin: "-4px 0" }}
            >
              &amp;
            </div>
            <div style={{ fontSize: "clamp(52px,11vw,92px)" }}>Tramaine</div>
          </div>

          <div
            className="font-serif text-ink leading-[1.5] mt-3"
            style={{ fontSize: "clamp(17px,2.4vw,22px)" }}
          >
            joyfully request the pleasure of your company
            <br />
            to share in their wedding celebrations
          </div>

          {dearNames && (
            <div className="font-serif italic text-gold-deep text-[22px] mt-3.5">
              Dear {dearNames}
            </div>
          )}

          <Diamond width={70} className="my-5" />

          <div className="font-label tracking-[.26em] text-gold-deep" style={{ fontSize: "clamp(13px,2vw,16px)" }}>
            26 &amp; 27 NOVEMBER 2026
          </div>
          <div className="font-serif text-[18px] text-gold-mid mt-1">
            Cape Town, South Africa
          </div>

          <div className="mt-[26px]">{cta}</div>
        </div>
      </div>
    </div>
  );
}
