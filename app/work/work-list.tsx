// app/work/work-list.tsx — experience timeline (RSC)
import * as React from 'react'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import type { WorkExperience } from '@/content/work'

export function WorkList({ items }: { items: WorkExperience[] }) {
  return (
    <ul className="flex flex-col gap-8" role="list">
      {items.map((item) => (
        <li key={item.slug}>
          <PortalLink
            href={`/work/${item.slug}`}
            label={item.company.toUpperCase()}
            className="group block"
          >
            <span className={`${portal.label} mb-1 block`}>
              {item.index} · {item.when}
              {item.current ? ' · Now' : ''}
            </span>
            <span className={portal.titleLg}>{item.company}</span>
            <span className={`${portal.bodySm} mt-1 block`}>
              {item.role} — {item.summary}
            </span>
            <span className={`${portal.meta} mt-2 block`}>
              {item.tags.join(' · ')}
            </span>
          </PortalLink>
        </li>
      ))}
    </ul>
  )
}
