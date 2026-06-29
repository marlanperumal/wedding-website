export interface NavLink {
  href: string;
  label: string;
}

// Right-hand nav links (Accommodation is labelled "Stay"). RSVP is rendered
// separately as a button.
export const NAV_LINKS: NavLink[] = [
  { href: "/events", label: "Events" },
  { href: "/venue", label: "Venue" },
  { href: "/accommodation", label: "Stay" },
  { href: "/attire", label: "Attire" },
  { href: "/faqs", label: "FAQs" },
];

// Footer mirrors the nav but leads with Home.
export const FOOTER_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  ...NAV_LINKS,
];
