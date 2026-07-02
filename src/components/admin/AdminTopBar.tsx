'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLogout } from '@/app/admin/actions'

const TABS = [
  { href: '/admin/dashboard', label: 'OVERVIEW' },
  { href: '/admin/guests', label: 'GUESTS' },
]

export function AdminTopBar() {
  const pathname = usePathname()

  return (
    <div
      className="sticky top-0 z-40 bg-paper-raised"
      style={{
        borderBottom: '1px solid rgba(176,138,54,.4)',
        boxShadow: '0 4px 18px -12px rgba(120,90,30,.4)',
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5"
        style={{ maxWidth: 1080, padding: '12px clamp(18px,4vw,36px)' }}
      >
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="font-label text-[13px] tracking-[.22em] text-gold-deep transition-colors group-hover:text-acc-rust">
            LIEDEMAN · PERUMAL
          </span>
          <span className="font-label text-[9px] tracking-[.28em] text-gold-soft">
            ADMIN
          </span>
        </Link>
        <div className="flex items-center gap-x-[22px] gap-y-2">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href) ?? false
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`relative font-label text-[11px] tracking-[.14em] pb-[3px] transition-colors hover:text-acc-rust ${
                  active ? 'text-acc-rust' : 'text-gold-mid'
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-acc-rust" />
                )}
              </Link>
            )
          })}
          <form action={adminLogout}>
            <button
              type="submit"
              className="font-label text-[10px] tracking-[.14em] text-ink-muted whitespace-nowrap transition-colors hover:text-acc-rust"
              style={{ border: '1px solid rgba(176,138,54,.5)', padding: '7px 14px' }}
            >
              SIGN OUT
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
