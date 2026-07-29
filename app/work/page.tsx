// app/work/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { WORK } from '@/content/work'
import { WorkList } from './work-list'

export const metadata: Metadata = {
  title: 'Work',
}

export default function WorkPage() {
  return (
    <PortalPage label="Work · selected shipping">
      <PageHeading>Projects that ship systems</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        Generative interfaces, agent tooling, and edge UI — indexed, not marketed.
      </p>
      <WorkList items={WORK} />
    </PortalPage>
  )
}
