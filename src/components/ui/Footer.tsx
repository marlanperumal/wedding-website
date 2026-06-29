import Link from "next/link";
import { FOOTER_LINKS } from "./navLinks";

export function Footer() {
  return (
    <footer
      className="bg-gold-deep text-center"
      style={{ padding: "clamp(36px,5vw,52px) clamp(20px,5vw,40px)" }}
    >
      <div className="font-script text-[38px] text-footer-name leading-none">
        Marlan &amp; Tramaine
      </div>
      <div className="font-label text-[11px] tracking-[.24em] text-footer-date mt-2">
        26 &amp; 27 NOVEMBER 2026 · CAPE TOWN
      </div>
      <div className="flex flex-wrap justify-center gap-x-[22px] gap-y-[10px] mt-[22px]">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-label text-[10.5px] tracking-[.14em] text-footer-link hover:text-footer-name transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
