// app/not-found.tsx
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'

export const metadata: Metadata = {
  title: '404',
}

export default function NotFound() {
  return (
    <PortalPage label="404 · no signal">
      <PageHeading>This chamber doesn&apos;t exist.</PageHeading>
      <p className={`${portal.body} mb-10`}>
        The wormhole doesn&apos;t resolve here — whatever you were looking for isn&apos;t part of
        this cosmos.
      </p>
      <PortalLink href="/" label="HOME" className={portal.link}>
        ← Back to home
      </PortalLink>
    </PortalPage>
  )
}
