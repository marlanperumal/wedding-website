import { PageHeader } from "@/components/ui";

export const metadata = { title: "Registry — Marlan & Tramaine" };

const REGISTRY_URL =
  "https://www.myregistry.com/wedding-registry/tramaine-liedeman-and-marlan-perumal-cape-town-western-cape/5509809";

export default function RegistryPage() {
  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 740, padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)" }}
    >
      <PageHeader eyebrow="GIFTS" title="Registry" />

      <p
        className="font-serif text-ink-soft leading-[1.65] text-center mx-auto mb-[18px]"
        style={{ fontSize: "clamp(18px,2.4vw,20px)", maxWidth: 620 }}
      >
        Your presence on the day is the part that matters to us. If you&rsquo;d
        like to give a gift as well, we&rsquo;ve put a registry together to make
        it easier.
      </p>

      <p
        className="font-serif text-ink-muted leading-[1.6] text-center mx-auto mb-10"
        style={{ fontSize: "18px", maxWidth: 620 }}
      >
        It opens on MyRegistry, where you can see what&rsquo;s still available
        and mark off anything you choose.
      </p>

      <div className="flex justify-center">
        <a
          href={REGISTRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-paper-card no-underline transition-shadow hover:shadow-[0_4px_18px_-12px_rgba(120,90,30,.5)]"
          style={{
            border: "1px solid rgba(176,138,54,.4)",
            borderLeft: "4px solid #9e6bb5",
            padding: "18px 26px",
          }}
        >
          <span className="font-serif italic text-[24px] text-ink">
            View our registry
          </span>
        </a>
      </div>
    </div>
  );
}
