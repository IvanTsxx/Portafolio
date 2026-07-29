// app/work/work-list.tsx — experience timeline (RSC)
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import type { WorkExperience } from '@/content/work'

export function WorkList({ items }: { items: WorkExperience[] }) {
  return (
    <ul className="flex flex-col gap-8" role="list">
      {items.map((item) => (
        <li key={item.slug}>
          <PortalLink
            href={`/work/${item.slug}`}
            label={item.company.toUpperCase()}
            className="block group"
          >
            <span className="portal-mono block mb-1" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              {item.index} · {item.when}
              {item.current ? ' · Now' : ''}
            </span>
            <span
              className="block font-semibold"
              style={{
                color: 'var(--p-bright)',
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
              }}
            >
              {item.company}
            </span>
            <span className="block mt-1 text-[14px]" style={{ color: 'var(--p-mid)' }}>
              {item.role} — {item.summary}
            </span>
            <span className="portal-mono mt-2 block" style={{ fontSize: 9, color: 'var(--p-dim)' }}>
              {item.tags.join(' · ')}
            </span>
          </PortalLink>
        </li>
      ))}
    </ul>
  )
}
