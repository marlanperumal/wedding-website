// Ready-styled building blocks for emails. Styles are inline because most
// email clients strip <style> blocks. Palette and fonts match the website
// (src/app/globals.css) and the shared frame in src/lib/email.ts.
import type { ReactNode } from 'react'
import { label, serif } from '@/lib/email'

const text = { fontFamily: serif, fontSize: 17, color: '#5c4e2e', lineHeight: 1.6 }
const italicGold = { fontFamily: serif, fontStyle: 'italic', color: '#7c5c14' } as const

/** A section heading, with a thin gold line above it. */
export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: label,
        fontSize: 11,
        fontWeight: 'normal',
        letterSpacing: 2.5,
        color: '#2e7d7a',
        textTransform: 'uppercase',
        margin: '22px 0 0',
        paddingTop: 18,
        borderTop: '1px solid rgba(176,138,54,.28)',
      }}
    >
      {children}
    </h2>
  )
}

/** The italic date and time line under a heading. */
export function When({ children }: { children: ReactNode }) {
  return <p style={{ ...italicGold, fontSize: 16, margin: '2px 0 10px' }}>{children}</p>
}

/** An ordinary paragraph. */
export function P({ children }: { children: ReactNode }) {
  return <p style={{ ...text, margin: '0 0 10px' }}>{children}</p>
}

/** A link. */
export function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} style={{ color: '#9e6bb5', textDecoration: 'underline' }}>
      {children}
    </a>
  )
}

/** The "Dear …" line. */
export function Greeting({ children }: { children: ReactNode }) {
  return <p style={{ ...italicGold, fontSize: 22, textAlign: 'center', margin: '30px 0 0' }}>{children}</p>
}

/** The centred opening paragraph. */
export function Intro({ children }: { children: ReactNode }) {
  return <p style={{ ...text, textAlign: 'center', margin: '12px 0 30px' }}>{children}</p>
}

/** The centred closing paragraph. */
export function Closing({ children }: { children: ReactNode }) {
  return <p style={{ ...text, textAlign: 'center', margin: '30px 0 14px' }}>{children}</p>
}

/** "With love, …" */
export function SignOff({ children }: { children: ReactNode }) {
  return <p style={{ ...italicGold, fontSize: 20, textAlign: 'center', margin: '0 0 26px' }}>{children}</p>
}

/** The big gold button. */
export function Button({ href, children }: { href: string; children: ReactNode }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} align="center" style={{ margin: '0 auto' }}>
      <tbody>
        <tr>
          <td style={{ background: '#7c5c14', borderRadius: 2 }}>
            <a
              href={href}
              style={{
                display: 'inline-block',
                fontFamily: label,
                fontSize: 12,
                letterSpacing: 3,
                color: '#f6efdf',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '14px 40px',
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
