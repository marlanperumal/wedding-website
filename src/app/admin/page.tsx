import { adminLogin } from './actions'
import { Diamond } from '@/components/ui'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="min-h-[80vh] flex items-center justify-center" style={{ padding: 24 }}>
      <div className="w-full text-center" style={{ maxWidth: 380 }}>
        <div className="font-label text-[11px] tracking-[.3em] text-gold-soft mb-2.5">
          ADMIN
        </div>
        <div className="font-serif italic text-[34px] text-ink">
          Marlan &amp; Tramaine
        </div>
        <Diamond width={50} className="mt-[18px] mb-7" />

        {error && (
          <p className="font-serif text-[16px] text-acc-rust mb-4">
            Incorrect passphrase. Please try again.
          </p>
        )}

        <div
          className="bg-paper-card text-left"
          style={{ border: '1px solid rgba(176,138,54,.5)', padding: '28px 26px' }}
        >
          <form action={adminLogin}>
            <label className="block font-label text-[10px] tracking-[.2em] text-gold-soft mb-2">
              PASSPHRASE
            </label>
            <input
              type="password"
              name="passphrase"
              required
              autoFocus
              className="w-full font-serif text-[16px] text-ink outline-none mb-[18px]"
              style={{
                background: '#fffdf7',
                border: '1px solid rgba(176,138,54,.45)',
                padding: '11px 14px',
              }}
            />
            <button
              type="submit"
              className="w-full font-label text-[12px] tracking-[.2em] text-paper-raised bg-gold-deep transition-colors hover:bg-[#6a4e10]"
              style={{ padding: 14, border: 'none' }}
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
