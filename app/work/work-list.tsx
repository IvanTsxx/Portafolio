// app/work/work-list.tsx — RSC; PortalLink is the only client leaf
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import type { WorkProject } from '@/content/work'

export function WorkList({ items }: { items: WorkProject[] }) {
  return (
    <ul className="flex flex-col" role="list">
      {items.map((item) => (
        <li key={item.slug}>
          <PortalLink
            href={`/work/${item.slug}`}
            label={item.title.toUpperCase()}
            className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5 border-t border-ax-line hover:border-ax-mid transition-colors"
            style={{ transitionDuration: 'var(--dur-micro)' }}
          >
            <span
              className="font-mono text-ax-dim group-hover:text-ax-mid shrink-0"
              style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
            >
              {item.index}
            </span>
            <span className="flex-1 min-w-0">
              <span
                className="block font-sans text-ax-bright group-hover:text-ax-signal transition-colors"
                style={{
                  fontSize: 'var(--text-lg)',
                  letterSpacing: '-0.02em',
                  transitionDuration: 'var(--dur-micro)',
                }}
              >
                {item.title}
              </span>
              <span
                className="block font-sans text-ax-mid mt-1"
                style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}
              >
                {item.summary}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-2 shrink-0" aria-hidden="true">
              {item.tags.map((tag) => (
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
              {item.year}
            </span>
          </PortalLink>
        </li>
      ))}
    </ul>
  )
}
