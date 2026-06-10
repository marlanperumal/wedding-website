const EVENT_COLORS: Record<string, string> = {
  Mehndi: '#7A4C8C',
  Nelengu: '#E07A29',
  Sangeeth: '#9E6BB5',
  Wedding: '#3DA4A1',
  Reception: '#5FAE7E',
}

interface EventPillProps {
  name: string
}

export function EventPill({ name }: EventPillProps) {
  const color = EVENT_COLORS[name] ?? '#9E6BB5'
  return (
    <span
      style={{ backgroundColor: color }}
      className="inline-block px-[10px] py-[3px] text-white text-[10px] tracking-[1px] uppercase font-sans leading-none"
    >
      {name}
    </span>
  )
}
