/**
 * Sends the one-week reminder email to every household that said yes to at
 * least one event, has an email address, and hasn't already been sent it
 * (from here or from the Send button on /admin/guests).
 *
 *   just reminder                 # dry run: list who would get it, send nothing
 *   just reminder --confirm       # actually send
 *
 * Uses whatever DATABASE_URL and email transport the env file provides (see
 * deliver() in src/lib/email.ts). Preview and test-send from /admin/reminder.
 */
import { getReminderRecipients, renderReminder, sendReminderToInvite } from '@/lib/reminder'
import { prisma } from '@/lib/prisma'

// Resend's default limit is 2 requests a second.
const DELAY_MS = 600

async function main() {
  const confirm = process.argv.includes('--confirm')
  const recipients = await getReminderRecipients()
  const alreadySent = recipients.filter((r) => r.reminderSentAt)
  const sendable = recipients.filter((r) => r.email && !r.reminderSentAt)
  const skipped = recipients.filter((r) => !r.email)

  const transport = process.env.SMTP_HOST
    ? `SMTP ${process.env.SMTP_HOST}`
    : process.env.RESEND_API_KEY
      ? 'Resend (real email)'
      : 'none — nothing will be delivered'
  const dbHost = new URL(process.env.DATABASE_URL ?? 'postgres://unset').hostname

  console.log(`Database: ${dbHost}`)
  console.log(`Transport: ${transport}`)
  console.log(`Subject: ${renderReminder(sendable[0] ?? { label: '', events: [] }).subject}\n`)

  for (const r of sendable) {
    console.log(`  ${r.label} <${r.email}> — ${r.events.map((e) => e.name).join(', ')}`)
  }
  if (alreadySent.length) {
    console.log(`\nAlready sent (skipped): ${alreadySent.map((r) => r.label).join(', ')}`)
  }
  if (skipped.length) {
    console.log(`\nNo email address (skipped): ${skipped.map((r) => r.label).join(', ')}`)
  }

  if (!confirm) {
    console.log(`\nDry run: ${sendable.length} would be sent. Re-run with --confirm to send.`)
    return
  }

  let sent = 0
  const failed: string[] = []
  for (const r of sendable) {
    const { status } = await sendReminderToInvite(r.inviteId)
    if (status === 'sent') {
      sent++
      console.log(`✓ ${r.label}`)
    } else {
      failed.push(r.label)
      console.error(`✗ ${r.label}: ${status}`)
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  }
  console.log(`\nSent ${sent} of ${sendable.length}.${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`)
}

main().finally(() => prisma.$disconnect())
