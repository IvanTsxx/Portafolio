// app/lab/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
import { LabStudies } from './lab-studies'

export const metadata: Metadata = {
  title: 'Lab',
}

export default function LabPage() {
  return (
    <PortalPage label="Lab · projects & explorations" side={chamberSide('lab')} wide>
      <PageHeading>Personal projects</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        Explorations, engines, and side builds. Add an image to unlock the ASCII → photo
        hover; entries without media stay text-only. Experience lives in Work.
      </p>
      <LabStudies />
    </PortalPage>
  )
}
