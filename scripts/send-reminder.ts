/**
 * Sends the one-week reminder email to every household that said yes to at
 * least one event and has an email address.
 *
 *   just reminder                 # dry run: list who would get it, send nothing
 *   just reminder --confirm       # actually send
 *
 * Uses whatever DATABASE_URL and email transport the env file provides (see
 * deliver() in src/lib/email.ts). Preview and test-send from /admin/reminder.
 */
import { getReminderRecipients, renderReminder, sendReminder } from '@/lib/reminder'
import { prisma } from '@/lib/prisma'

// Resend's default limit is 2 requests a second.
const DELAY_MS = 600

async function main() {
  const confirm = process.argv.includes('--confirm')
  const recipients = await getReminderRecipients()
  const sendable = recipients.filter((r) => r.email)
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
    try {
      await sendReminder(r, r.email!)
      sent++
      console.log(`✓ ${r.label}`)
    } catch (err) {
      failed.push(r.label)
      console.error(`✗ ${r.label}:`, err)
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  }
  console.log(`\nSent ${sent} of ${sendable.length}.${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`)
}

main().finally(() => prisma.$disconnect())
