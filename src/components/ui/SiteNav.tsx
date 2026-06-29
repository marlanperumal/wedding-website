import Link from "next/link";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/venue", label: "Venue" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/attire", label: "Attire" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteNav() {
  return (
    <nav className="bg-cream border-b border-orange-soft px-8 py-3.5 flex justify-between items-center">
      <Link
        href="/"
        className="text-xs tracking-[4px] text-purple-deep uppercase font-sans"
      >
        Liedeman · Perumal
      </Link>
      <ul className="flex items-center gap-6">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-xs tracking-[2px] text-near-black/70 uppercase font-sans hover:text-purple-orchid transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
