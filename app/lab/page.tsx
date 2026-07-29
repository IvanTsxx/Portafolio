// app/lab/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { LabStudies } from './lab-studies'

export const metadata: Metadata = {
  title: 'Lab',
}

export default function LabPage() {
  return (
    <PortalPage label="Craft · image → ASCII">
      <PageHeading>ASCII studies</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        Stills converted from images — not live fields. Drop{' '}
        <code className="font-mono" style={{ color: 'var(--p-bright)' }}>
          .txt
        </code>{' '}
        from the convert tool into{' '}
        <code className="font-mono" style={{ color: 'var(--p-bright)' }}>
          public/lab/
        </code>{' '}
        and point{' '}
        <code className="font-mono" style={{ color: 'var(--p-bright)' }}>
          asciiSrc
        </code>{' '}
        in{' '}
        <code className="font-mono" style={{ color: 'var(--p-bright)' }}>
          content/lab.ts
        </code>
        .
      </p>
      <LabStudies />
    </PortalPage>
  )
}
