// app/work/work-list.tsx — RSC; PortalLink is the only client leaf
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import type { WorkProject } from '@/content/work'

export function WorkList({ items }: { items: WorkProject[] }) {
  return (
    <ul className="flex flex-col gap-8" role="list">
      {items.map((item) => (
        <li key={item.slug}>
          <PortalLink href={`/work/${item.slug}`} label={item.title.toUpperCase()} className="block group">
            <span className="portal-mono block mb-1" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              {item.index} · {item.year}
            </span>
            <span
              className="block font-semibold"
              style={{
                color: 'var(--p-bright)',
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
              }}
            >
              {item.title}
            </span>
            <span className="block mt-1 text-[14px]" style={{ color: 'var(--p-mid)' }}>
              {item.summary}
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
