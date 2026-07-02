import Link from "next/link";

import { PageHeader } from "@/components/ui";

export const metadata = { title: "FAQs — Marlan & Tramaine" };

export default function FaqsPage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 740, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader
        eyebrow="GOOD TO KNOW"
        title="Frequently Asked Questions"
        titleClamp="clamp(34px,6vw,48px)"
      />

      <dl className="flex flex-col gap-[30px]">
        <Faq question="Why are there so many events?">
          <p>
            Traditional Indian weddings tend to be a multi-day combination of
            ceremonies and celebrations, and different communities have different
            names and customs for each. We&rsquo;re keeping it light actually,
            with just 2 days! On the day before (Thursday) the bride and groom
            will be having separate blessing ceremonies in the morning: the
            Mehndi and Nelengu respectively. The night before is generally a big
            party filled with music and dancing called a Sangeet. Ours will be a
            simple, informal gathering at our home, where we invite you to pop
            in, have a bite and a glass, and generally just hang out with us
            before the formal stuff the next day &mdash; the actual wedding and
            reception. The Thursday events are all completely optional, but
            we&rsquo;d love to have you share in them with us. For more details on
            exactly what will be happening, when and where, see the{" "}
            <FaqLink href="/events">Events page</FaqLink>.
          </p>
        </Faq>

        <Faq question="When should I RSVP by?">
          <p>
            Please RSVP by 30 September 2026 and ensure that you complete any
            dietary requirements for each guest on the invite.
          </p>
        </Faq>

        <Faq question="What is the dress code for each event?">
          <EventLine label="Mehndi / Nelengu">
            Bright, festive colours (yellows / oranges). Casual or semi-formal.
            Eastern if you prefer.
          </EventLine>
          <EventLine label="Sangeet">
            It&rsquo;s an informal gathering, so please feel free to wear whatever
            you&rsquo;re most comfortable in.
          </EventLine>
          <EventLine label="Wedding Ceremony">
            Please wear traditional Indian attire (e.g. saris, lehengas, kurtas
            &mdash; see the <FaqLink href="/attire">Attire page</FaqLink>{" "} for full
            details). We encourage bright, festive colours. Please avoid wearing
            pure white (that&rsquo;s for funerals), red or gold (that&rsquo;s
            what the bride will be wearing) and jeans (I made Marlan add this in).
          </EventLine>
        </Faq>

        <Faq question="What time should I arrive?">
          <EventLine label="Mehndi / Nelengu">Arrive at 10am.</EventLine>
          <EventLine label="Sangeet">
            Arrive at 5pm, or whenever you&rsquo;d like to pop in before 9pm.
          </EventLine>
          <EventLine label="Wedding Ceremony">
            Arrive at 3pm, which is 30 minutes before the ceremony begins, to
            allow time for parking, seating, and to ensure the ceremony starts on
            time.
          </EventLine>
        </Faq>

        <Faq question="Can I bring a plus one or additional guests?">
          <p>
            Only guests named on your invitation are invited to celebrate with
            us. We appreciate your understanding as we keep our guest list
            intimate.
          </p>
          <p className="mt-3">
            We love your little ones! However, unless specifically named on your
            invitation, please arrange a sitter.
          </p>
        </Faq>

        <Faq question="Will there be parking?">
          <p>
            Yes, parking will be available at the wedding venue and at our home
            for the Sangeet gathering.
          </p>
        </Faq>

        <Faq question="What happens after the ceremony?">
          <p>
            Following the ceremony, guests will enjoy welcome drinks and
            canap&eacute;s while the couple takes photos.
          </p>
          <p className="mt-3">
            The reception, dinner, speeches, and dancing will follow shortly
            afterwards &mdash; so come ready to celebrate!
          </p>
        </Faq>

        <Faq question="What time will the celebration end?">
          <p>The celebration wraps up at 11:30pm.</p>
        </Faq>

        <Faq question="Is accommodation available nearby?">
          <p>
            We&rsquo;ll add some places near the venue on the{" "}
            <FaqLink href="/accommodation">Accommodation page</FaqLink>. Anywhere
            in Durbanville should be close enough.
          </p>
          <p className="mt-3">
            The Cape Town CBD is 40 minutes away; however, please allow for at
            least an hour in traffic on the day to arrive on time.
          </p>
        </Faq>

        <Faq question="Is there a gift registry?">
          <p>Your presence is the greatest gift we could ask for.</p>
          <p className="mt-3">
            If you would like to celebrate with a gift, we&rsquo;ll be adding
            registry details to the website soon.
          </p>
        </Faq>

        <Faq question="Who do I contact if I have a question?">
          <p>You can reach us on WhatsApp, just like any other time.</p>
        </Faq>
      </dl>
    </div>
  );
}

function Faq({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt
        className="font-serif italic text-gold-deep mb-2"
        style={{ fontSize: "clamp(22px,3vw,26px)" }}
      >
        {question}
      </dt>
      <dd
        className="font-serif text-ink-soft leading-[1.65]"
        style={{ fontSize: "clamp(17px,2.2vw,19px)" }}
      >
        {children}
      </dd>
    </div>
  );
}

function FaqLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-acc-purple underline underline-offset-2 hover:text-gold-deep transition-colors"
    >
      {children}
    </Link>
  );
}

function EventLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 last:mb-0">
      <span
        className="font-label tracking-[.14em] text-acc-purple uppercase font text-sm"
      >
        {label}:
      </span>{" "}
      {children}
    </p>
  );
}
