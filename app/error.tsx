// app/error.tsx
'use client'

import * as React from 'react'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PortalPage label="error · signal lost">
      <PageHeading>Something broke in the tunnel.</PageHeading>
      <p className={`${portal.body} mb-10`}>
        The portal hit turbulence mid-transit. Try again, or head back to solid ground.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <button type="button" onClick={reset} className={cn(portal.link, 'mt-0')}>
          Try again →
        </button>
        <PortalLink href="/" label="HOME" className={cn(portal.link, 'mt-0')}>
          ← Back to home
        </PortalLink>
      </div>
    </PortalPage>
  )
}
