import { Hero } from "@/components/ui";

interface InviteHeroProps {
  guestNames: string[];
  /** RSVP call-to-action (the acceptInvite form button). */
  cta: React.ReactNode;
}

export function InviteHero({ guestNames, cta }: InviteHeroProps) {
  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(", ") + " & " + guestNames.at(-1);

  return <Hero dearNames={greeting} cta={cta} />;
}
