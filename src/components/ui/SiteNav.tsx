'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/venue", label: "Venue" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/attire", label: "Attire" },
  { href: "/faqs", label: "FAQs" },
  { href: "/rsvp", label: "RSVP" },
];

type RsvpStatus = 'none' | 'pending' | 'submitted'

export function SiteNav({ rsvpStatus = 'none' }: { rsvpStatus?: RsvpStatus }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
  }

  function badge(href: string) {
    if (href !== '/rsvp' || rsvpStatus !== 'submitted') return null;
    return (
      <span
        aria-label="RSVP complete"
        className="ml-1.5 text-teal-deep"
      >
        ✓
      </span>
    );
  }

  return (
    <nav className="bg-cream border-b border-orange-soft relative z-50">
      <div className="px-5 sm:px-8 py-3.5 flex justify-between items-center">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-xs tracking-[3px] sm:tracking-[4px] text-purple-deep uppercase font-sans"
        >
          Liedeman · Perumal
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-xs tracking-[2px] uppercase font-sans transition-colors hover:text-purple-orchid ${
                  isActive(link.href)
                    ? "text-purple-orchid"
                    : "text-near-black/70"
                }`}
              >
                {link.label}
                {badge(link.href)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden -mr-2 p-2 text-purple-deep"
        >
          <span className="sr-only">Menu</span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="5" y1="5" x2="17" y2="17" />
                <line x1="17" y1="5" x2="5" y2="17" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul
          id="site-nav-menu"
          className="md:hidden border-t border-orange-soft/30 px-5 sm:px-8 pb-2"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block py-3 text-sm tracking-[2px] uppercase font-sans transition-colors ${
                  isActive(link.href)
                    ? "text-purple-orchid"
                    : "text-near-black/70"
                }`}
              >
                {link.label}
                {badge(link.href)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
