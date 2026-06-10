import { NextRequest } from 'next/server'
import { createEvent } from 'ics'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return new Response('Not found', { status: 404 })

  const d = event.date
  // ics expects local time array: [year, month, day, hour, minute]
  const start: [number, number, number, number, number] = [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ]

  const { error, value } = createEvent({
    title: `${event.name} — Marlan & Tramaine`,
    start,
    startInputType: 'utc',
    duration: { hours: 4 },
    location: event.address,
    description: `You are invited to the ${event.name} celebration of Marlan Perumal and Tramaine Liedeman.`,
    organizer: { name: 'Marlan & Tramaine', email: 'wedding@liedeman.perumal.co.za' },
  })

  if (error || !value) {
    return new Response('Could not generate calendar file', { status: 500 })
  }

  return new Response(value, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.name.toLowerCase()}.ics"`,
    },
  })
}
