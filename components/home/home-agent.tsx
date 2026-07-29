// components/home/home-agent.tsx
// Dual audience: humans get plain language; agents get a structured card.
import * as React from 'react'
import { IDENTITY } from '@/content/identity'
import { PortalLink } from '@/lib/portal/portal-link'

export function HomeAgent() {
  return (
    <section
      id="for-agents"
      aria-labelledby="agents-heading"
      className="border-t border-ax-line bg-ax-ink px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto grid w-full max-w-[var(--max-grid)] gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ax-dim">
            For people &amp; agents
          </p>
          <h2
            id="agents-heading"
            className="max-w-[18ch] font-sans font-semibold text-ax-bright"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.98,
            }}
          >
            Readable to both.
          </h2>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-ax-mid">
            This site is built so a human can browse the work and an agent can parse the
            constraints without guessing. Prefer structured briefs, RSC-first surfaces, and
            honest scope.
          </p>
          <ul className="mt-6 space-y-2 text-[14px] text-ax-mid">
            {IDENTITY.focus.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="font-mono text-ax-dim" aria-hidden="true">
                  ·
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <PortalLink
              href="/lab"
              label="LAB"
              className="bg-ax-bright px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ax-void transition-transform duration-[90ms] ease-out active:scale-[0.97]"
            >
              Open lab
            </PortalLink>
            <PortalLink
              href="/notes"
              label="NOTES"
              className="border border-ax-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ax-bright transition-colors duration-[90ms] hover:border-ax-mid"
            >
              Notes
            </PortalLink>
          </div>
        </div>

        <aside
          className="border border-ax-line bg-ax-void p-5 md:p-6"
          aria-label="Structured identity card"
        >
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.16em] text-ax-dim">
            identity.json · public
          </p>
          <dl className="space-y-3 font-mono text-[12px] leading-relaxed">
            {Object.entries(IDENTITY.agent).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 sm:grid-cols-[9rem_1fr]">
                <dt className="text-ax-dim">{k}</dt>
                <dd className="text-ax-bright">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-ax-line pt-4 font-mono text-[10px] leading-relaxed text-ax-dim">
            LOC detail: {IDENTITY.location.city}, {IDENTITY.location.country}. Stack:{' '}
            {IDENTITY.stack.join(' · ')}. Status: {IDENTITY.openTo}.
          </p>
        </aside>
      </div>
    </section>
  )
}
