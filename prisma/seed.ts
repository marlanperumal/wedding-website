import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Clear existing data in order (respects FK constraints)
  await prisma.rsvp.deleteMany()
  await prisma.inviteEvent.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.event.deleteMany()

  // Seed the 4 events
  const mehndi = await prisma.event.create({
    data: {
      name: 'Mehndi',
      date: new Date('2026-11-26T10:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 1,
    },
  })

  const nelengu = await prisma.event.create({
    data: {
      name: 'Nelengu',
      date: new Date('2026-11-26T10:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 2,
    },
  })

  const sangeet = await prisma.event.create({
    data: {
      name: 'Sangeet',
      date: new Date('2026-11-26T17:00:00+02:00'),
      venue: '11 Orient Road',
      address: '11 Orient Road, Wynberg, Cape Town, 7800',
      sortOrder: 3,
    },
  })

  const wedding = await prisma.event.create({
    data: {
      name: 'Wedding & Reception',
      // Arrive by 15:00 SAST (ceremony 15:30); reception runs on to ~23:30 (see calendar duration)
      date: new Date('2026-11-27T15:00:00+02:00'),
      venue: 'Goedgeleven',
      address: 'Goedgeleven, Durbanville, Cape Town, 7550',
      sortOrder: 4,
    },
  })

  // Seed a test invite with 2 guests invited to all events
  const testInvite = await prisma.invite.create({
    data: {
      slug: 'test-invite-dev1',
      label: 'Test Family',
      guests: {
        create: [
          { name: 'Test Guest One' },
          { name: 'Test Guest Two' },
        ],
      },
      events: {
        create: [
          { eventId: mehndi.id },
          { eventId: nelengu.id },
          { eventId: sangeet.id },
          { eventId: wedding.id },
        ],
      },
    },
  })

  console.log('✓ Seeded 4 events')
  console.log(`✓ Test invite: http://localhost:3000/${testInvite.slug}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
