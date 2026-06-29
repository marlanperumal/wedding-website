interface InviteHeroProps {
  guestNames: string[]
}

export function InviteHero({ guestNames }: InviteHeroProps) {
  const greeting =
    guestNames.length === 1
      ? guestNames[0]
      : guestNames.slice(0, -1).join(', ') + ' & ' + guestNames.at(-1)

  return (
    <div className="text-center py-16 px-6 relative">
      <div className="paisley-watermark" />
      <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-4">
        You are invited
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl italic text-near-black mb-3">
        Marlan &amp; Tramaine
      </h1>
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-10 bg-orange-soft" />
        <span className="text-orange-soft text-sm">✦</span>
        <div className="h-px w-10 bg-orange-soft" />
      </div>
      <p className="font-serif text-2xl italic text-near-black/80 mb-2">Dear</p>
      <p className="font-serif text-3xl italic text-near-black mb-6">{greeting}</p>
      <p className="font-sans text-sm text-near-black/60 max-w-sm mx-auto leading-relaxed">
        We joyfully invite you to celebrate our wedding with us in Cape Town, South Africa.
      </p>
    </div>
  )
}
