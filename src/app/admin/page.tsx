import { adminLogin } from './actions'
import { AccentBar } from '@/components/ui'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center">
      <AccentBar />
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-3">
            Admin
          </p>
          <h1 className="font-serif text-3xl italic text-near-black">
            Marlan &amp; Tramaine
          </h1>
        </div>

        {error && (
          <p className="text-center text-sm font-sans text-red-600 mb-4">
            Incorrect passphrase. Please try again.
          </p>
        )}

        <form action={adminLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[3px] text-near-black/60 uppercase font-sans mb-2">
              Passphrase
            </label>
            <input
              type="password"
              name="passphrase"
              required
              autoFocus
              className="w-full border border-near-black/20 px-3.5 py-2.5 text-sm font-sans bg-white outline-none focus:border-orange-soft"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-soft text-white py-3 text-xs tracking-[3px] uppercase font-sans"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
