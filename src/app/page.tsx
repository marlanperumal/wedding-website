import { AccentBar } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        {/* Eyebrow */}
        <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-4">
          You are invited
        </p>

        {/* Names */}
        <h1 className="font-serif text-4xl sm:text-5xl italic text-near-black mb-3">
          Marlan &amp; Tramaine
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-orange-soft" />
          <span className="text-orange-soft text-sm">✦</span>
          <div className="h-px w-10 bg-orange-soft" />
        </div>

        {/* Date & venue teaser */}
        <p className="font-sans text-sm text-near-black/70 tracking-wide mb-1">
          26 &amp; 27 November 2026
        </p>
        <p className="font-sans text-sm text-near-black/70 tracking-wide mb-12">
          Cape Town, South Africa
        </p>

        {/* CTA */}
        <p className="font-sans text-sm text-near-black/60 leading-relaxed">
          Please use your personal invite link to view your invitation and RSVP.
          <br />
          Check your message or email for your unique link.
        </p>
      </div>

      <AccentBar />
    </div>
  );
}
