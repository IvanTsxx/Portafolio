// components/site/home-nav.tsx
// Bottom strip on the home page — selected work index.
// RSC: no interactivity, just a list of links.
import * as React from 'react'

interface WorkEntry {
  index: string
  title: string
  tags:  string[]
  href:  string
  year:  string
}

const WORK: WorkEntry[] = [
  {
    index: '001',
    title: 'Generative Field System',
    tags:  ['Next.js', 'ASCII', 'Math'],
    href:  '/work/generative-fields',
    year:  '2026',
  },
  {
    index: '002',
    title: 'Agent Orchestration Dashboard',
    tags:  ['eve', 'AI SDK', 'TypeScript'],
    href:  '/work/agent-dashboard',
    year:  '2025',
  },
  {
    index: '003',
    title: 'Edge-computed UI Toolkit',
    tags:  ['Next.js', 'Vercel', 'Performance'],
    href:  '/work/edge-toolkit',
    year:  '2025',
  },
]

export function HomeNav() {
  return (
    <nav aria-label="Selected work">
      <ul className="flex flex-col" role="list">
        {WORK.map((entry, i) => (
          <li key={entry.index}>
            <a
              href={entry.href}
              className="group flex items-baseline gap-4 py-3 border-t border-ax-line hover:border-ax-mid transition-colors"
              style={{ transitionDuration: 'var(--dur-micro)' }}
            >
              {/* Index */}
              <span
                className="font-mono text-ax-dim group-hover:text-ax-mid transition-colors shrink-0"
                style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
                aria-hidden="true"
              >
                {entry.index}
              </span>

              {/* Title */}
              <span
                className="font-sans text-ax-bright group-hover:text-ax-signal transition-colors flex-1 min-w-0 truncate"
                style={{ fontSize: 'var(--text-sm)', transitionDuration: 'var(--dur-micro)' }}
              >
                {entry.title}
              </span>

              {/* Tags — hidden on small screens */}
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

              {/* Year */}
              <span
                className="font-mono text-ax-dim shrink-0"
                style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
              >
                {entry.year}
              </span>
            </a>
          </li>
        ))}

        {/* View all */}
        <li>
          <a
            href="/work"
            className="flex items-center gap-2 pt-3 pb-1 font-mono text-ax-dim hover:text-ax-mid transition-colors"
            style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
          >
            <span aria-hidden="true">→</span>
            <span>All work</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
