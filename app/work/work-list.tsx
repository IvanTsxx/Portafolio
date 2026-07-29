'use client'

// app/work/work-list.tsx — experience timeline; logo ASCII dissolves on row hover
import * as React from 'react'
import { AsciiImage } from '@/components/ui/ascii-image'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import type { WorkExperience } from '@/content/work'

function WorkRow({ item }: { item: WorkExperience }) {
  const [hot, setHot] = React.useState(false)

  return (
    <li
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
    >
      <PortalLink
        href={`/work/${item.slug}`}
        label={item.company.toUpperCase()}
        className="group flex items-start gap-4"
      >
        {item.logo && (
          <AsciiImage
            src={item.logo}
            alt=""
            aspect="1 / 1"
            grain="mark"
            reveal={hot}
            passive
            className={portal.workLogo}
          />
        )}
        <span className="min-w-0 flex-1">
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
        </span>
      </PortalLink>
    </li>
  )
}

export function WorkList({ items }: { items: WorkExperience[] }) {
  return (
    <ul className="flex flex-col gap-8" role="list">
      {items.map((item) => (
        <WorkRow key={item.slug} item={item} />
      ))}
    </ul>
  )
}
