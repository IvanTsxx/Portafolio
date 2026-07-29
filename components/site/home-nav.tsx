// components/site/home-nav.tsx
// Bottom strip on the home page — selected work index.
// RSC: PortalLink is the only client leaf.
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import { WORK } from '@/content/work'

export function HomeNav() {
  return (
    <nav aria-label="Selected work">
      <ul className="flex flex-col" role="list">
        {WORK.map((entry) => (
          <li key={entry.index}>
            <PortalLink
              href={`/work/${entry.slug}`}
              label={entry.title.toUpperCase()}
              className="group flex items-baseline gap-4 py-3 border-t border-ax-line hover:border-ax-mid transition-colors"
              style={{ transitionDuration: 'var(--dur-micro)' }}
            >
              <span
                className="font-mono text-ax-dim group-hover:text-ax-mid transition-colors shrink-0"
                style={{
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: '0.12em',
                  transitionDuration: 'var(--dur-micro)',
                }}
                aria-hidden="true"
              >
                {entry.index}
              </span>

              <span
                className="font-sans text-ax-bright group-hover:text-ax-signal transition-colors flex-1 min-w-0 truncate"
                style={{ fontSize: 'var(--text-sm)', transitionDuration: 'var(--dur-micro)' }}
              >
                {entry.title}
              </span>

              <span className="hidden sm:flex items-center gap-2" aria-hidden="true">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-ax-dim"
                    style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.1em' }}
                  >
                    {tag}
                  </span>
                ))}
              </span>

              <span
                className="font-mono text-ax-dim shrink-0"
                style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
              >
                {entry.year}
              </span>
            </PortalLink>
          </li>
        ))}

        <li>
          <PortalLink
            href="/work"
            label="WORK"
            className="flex items-center gap-2 pt-3 pb-1 font-mono text-ax-dim hover:text-ax-mid transition-colors"
            style={{
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.12em',
              transitionDuration: 'var(--dur-micro)',
            }}
          >
            <span aria-hidden="true">→</span>
            <span>All work</span>
          </PortalLink>
        </li>
      </ul>
    </nav>
  )
}
