// app/work/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
import { WORK } from '@/content/work'
import { WorkList } from './work-list'

export const metadata: Metadata = {
  title: 'Work',
}

export default function WorkPage() {
  return (
    <PortalPage label="Work · experience" side={chamberSide('work')}>
      <PageHeading>Where I&apos;ve shipped</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        Professional experience — roles, teams, and delivery. Personal projects live in Lab.
      </p>
      <WorkList items={WORK} />
    </PortalPage>
  )
}
