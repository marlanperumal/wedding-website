'use client'
import { useActionState } from 'react'
import { enterInviteCode, type EnterCodeState } from '@/app/rsvp/actions'
import { Diamond } from '@/components/ui'

const initialState: EnterCodeState = {}

export function RsvpEntry() {
  const [state, formAction, pending] = useActionState(enterInviteCode, initialState)

  return (
    <div
      className="mx-auto text-center"
      style={{ maxWidth: 440, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,40px)' }}
    >
      <div className="font-label text-[12px] tracking-[.3em] text-gold-deep">
        RSVP
      </div>
      <h1
        className="font-serif italic text-ink mt-2"
        style={{ fontSize: 'clamp(34px,6vw,46px)' }}
      >
        Find your invitation
      </h1>
      <Diamond className="mt-3.5 mb-6" />
      <p className="font-serif text-[18px] text-ink-soft leading-[1.55] mb-8">
        Enter the invitation code from your invite link or card to view and
        confirm your RSVP.
      </p>

      <form action={formAction} className="text-left">
        <label
          htmlFor="rsvp-code"
          className="block font-label text-[10px] tracking-[.12em] text-gold-soft mb-2"
        >
          INVITATION CODE
        </label>
        <input
          id="rsvp-code"
          name="code"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. smith-family-ab12"
          className="w-full font-serif text-[16px] text-ink outline-none"
          style={{
            background: '#fffdf7',
            border: '1px solid rgba(176,138,54,.45)',
            padding: '11px 14px',
          }}
        />

        {state.error && (
          <p className="mt-3 font-serif text-[16px] text-acc-rust" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full font-label text-[13px] tracking-[.2em] text-paper-raised bg-gold-deep disabled:opacity-60 transition-colors hover:bg-[#6a4e10]"
          style={{ padding: 16, border: 'none' }}
        >
          {pending ? 'LOOKING…' : 'CONTINUE'}
        </button>
      </form>
    </div>
  )
}
