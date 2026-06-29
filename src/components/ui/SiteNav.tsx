'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./navLinks";

type RsvpStatus = 'none' | 'pending' | 'submitted'

export function SiteNav({ rsvpStatus = 'none' }: { rsvpStatus?: RsvpStatus }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
  }

  return (
    <nav
      className="sticky top-0 z-40 bg-paper-raised"
      style={{
        borderBottom: '1px solid rgba(176,138,54,.4)',
        boxShadow: '0 4px 18px -12px rgba(120,90,30,.4)',
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5"
        style={{ maxWidth: 1080, padding: '14px clamp(18px,4vw,40px)' }}
      >
        <Link
          href="/"
          className="font-label text-[13px] tracking-[.22em] text-gold-deep whitespace-nowrap"
        >
          LIEDEMAN · PERUMAL
        </Link>

        <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative font-label text-[11px] tracking-[.14em] whitespace-nowrap pb-[3px] transition-colors hover:text-acc-rust ${
                  active ? "text-acc-rust" : "text-gold-mid"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-acc-rust" />
                )}
              </Link>
            );
          })}

          <Link
            href="/rsvp"
            aria-current={isActive('/rsvp') ? "page" : undefined}
            className="font-label text-[11px] tracking-[.16em] text-paper-raised bg-gold-deep rounded-[2px] whitespace-nowrap transition-colors hover:bg-[#6a4e10]"
            style={{ padding: '9px 20px' }}
          >
            RSVP
            {rsvpStatus === 'submitted' && (
              <span aria-label="RSVP complete" className="ml-1.5">
                ✓
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
