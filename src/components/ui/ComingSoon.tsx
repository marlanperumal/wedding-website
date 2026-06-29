import { AccentBar } from "./AccentBar";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <AccentBar />
      <div className="paisley-watermark" />

      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl italic text-near-black mb-6">
          {title}
        </h1>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-orange-soft" />
          <span className="text-orange-soft text-sm">✦</span>
          <div className="h-px w-10 bg-orange-soft" />
        </div>

        <p className="font-sans text-sm text-near-black/60 leading-relaxed">
          Coming soon...
        </p>
      </div>

      <AccentBar />
    </div>
  );
}
