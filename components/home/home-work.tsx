// components/home/home-work.tsx
// Selected work — RSC list for humans; index + tags for agents.
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import { WORK } from '@/content/work'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
import { HighlightMark } from '@/components/ui/highlight-mark'

export function HomeWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-t border-ax-line bg-ax-void px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto w-full max-w-[var(--max-grid)]">
        <header className="mb-10 max-w-[48ch]">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ax-dim">
            Selected work
          </p>
          <h2
            id="work-heading"
            className="font-sans font-semibold text-ax-bright"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.98,
            }}
          >
            <HighlightMark>Projects that stay in the buffer.</HighlightMark>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ax-mid">
            Engine demos, agent surfaces, and edge UI — each entry is a real ship, not a mood board.
          </p>
        </header>

        <div className="mb-6 opacity-30">
          <AsciiRule />
        </div>

        <ul className="flex flex-col" role="list">
          {WORK.map((entry) => (
            <li key={entry.slug}>
              <PortalLink
                href={`/work/${entry.slug}`}
                label={entry.title.toUpperCase()}
                className="group flex flex-col gap-2 border-t border-ax-line py-5 transition-colors hover:border-ax-mid sm:flex-row sm:items-baseline sm:gap-6"
                style={{ transitionDuration: 'var(--dur-micro)' }}
              >
                <span
                  className="shrink-0 font-mono text-ax-dim group-hover:text-ax-mid"
                  style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
                  aria-hidden="true"
                >
                  {entry.index}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className="font-sans text-ax-bright transition-colors group-hover:text-ax-signal"
                    style={{ fontSize: 'var(--text-sm)', transitionDuration: 'var(--dur-micro)' }}
                  >
                    {entry.title}
                  </span>
                  <p className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-ax-dim">
                    {entry.summary}
                  </p>
                </div>
                <span
                  className="shrink-0 font-mono text-ax-dim"
                  style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
                >
                  {entry.year}
                </span>
              </PortalLink>
            </li>
          ))}
        </ul>

        <PortalLink
          href="/work"
          label="WORK"
          className="mt-6 inline-flex items-center gap-2 font-mono text-ax-dim transition-colors hover:text-ax-mid"
          style={{
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.12em',
            transitionDuration: 'var(--dur-micro)',
          }}
        >
          <span aria-hidden="true">→</span>
          <span>All work</span>
        </PortalLink>
      </div>
    </section>
  )
}
