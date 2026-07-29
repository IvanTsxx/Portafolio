// components/home/home-close.tsx
import * as React from 'react'
import { IDENTITY } from '@/content/identity'
import { PortalLink } from '@/lib/portal/portal-link'
import { HighlightMark } from '@/components/ui/highlight-mark'

export function HomeClose() {
  return (
    <section
      id="open"
      aria-labelledby="open-heading"
      className="border-t border-ax-line bg-ax-void px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-[var(--max-grid)]">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ax-dim">
          Status · {IDENTITY.openTo.toUpperCase()}
        </p>
        <h2
          id="open-heading"
          className="max-w-[18ch] font-sans font-semibold text-ax-bright"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            letterSpacing: '-0.03em',
            lineHeight: 0.98,
          }}
        >
          <HighlightMark>
            Say hello from anywhere — I&apos;m in {IDENTITY.location.region}.
          </HighlightMark>
        </h2>
        <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-ax-mid">
          Use the + panel for contact. Bring a brief, a constraint, or a weird ASCII idea.
        </p>
        <PortalLink
          href="/about"
          label="ABOUT"
          className="mt-8 inline-block border border-ax-bright bg-ax-bright px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ax-void transition-transform duration-[90ms] ease-out active:scale-[0.97]"
        >
          About {IDENTITY.short}
        </PortalLink>
      </div>
    </section>
  )
}
