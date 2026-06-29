import { Diamond } from "./Diamond";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] max-w-xl mx-auto px-6 py-20 text-center">
      <h1
        className="font-serif italic text-ink mb-4"
        style={{ fontSize: "clamp(38px,7vw,52px)" }}
      >
        {title}
      </h1>
      <Diamond className="mb-6" />
      <p className="font-serif text-[18px] text-ink-muted leading-relaxed">
        Coming soon…
      </p>
    </div>
  );
}
