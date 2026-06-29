'use client'
import { useActionState } from 'react'
import { enterInviteCode, type EnterCodeState } from '@/app/rsvp/actions'
import { AccentBar } from '@/components/ui'

const initialState: EnterCodeState = {}

export function RsvpEntry() {
  const [state, formAction, pending] = useActionState(enterInviteCode, initialState)

  return (
    <div className="relative">
      <AccentBar />
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-xs tracking-[5px] text-purple-orchid uppercase font-sans mb-3">
          RSVP
        </p>
        <h1 className="font-serif text-3xl italic text-near-black mb-3">
          Find your invitation
        </h1>
        <p className="font-sans text-sm text-near-black/60 leading-relaxed mb-8">
          Enter the invitation code from your invite link or card to view and
          confirm your RSVP.
        </p>

        <form action={formAction} className="text-left">
          <label
            htmlFor="rsvp-code"
            className="block text-[10px] tracking-[3px] text-teal-deep uppercase font-sans mb-2"
          >
            Invitation code
          </label>
          <input
            id="rsvp-code"
            name="code"
            type="text"
            required
            autoComplete="off"
            placeholder="e.g. smith-family-ab12"
            className="w-full border border-near-black/20 px-3.5 py-2.5 text-sm font-sans bg-white outline-none focus:border-orange-soft"
          />

          {state.error && (
            <p className="mt-3 text-sm font-sans text-red-700" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full bg-orange-soft text-white py-4 text-xs tracking-[3px] uppercase font-sans disabled:opacity-60"
          >
            {pending ? 'Looking…' : 'Continue'}
          </button>
        </form>
      </div>
      <AccentBar />
    </div>
  )
}
