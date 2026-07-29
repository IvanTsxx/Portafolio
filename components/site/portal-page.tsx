import * as React from 'react'
import type { ChamberSide } from '@/components/home/portal/content'
import { PortalScrollFade } from '@/components/site/portal-scroll-fade'
import { portal } from '@/lib/portal/styles'

/** Floating chamber layout for routes inside the cosmos shell. */
export function PortalPage({
  children,
  label,
  side = 'left',
  wide = false,
}: {
  children: React.ReactNode
  label?: string
  /** Alternate left/right across wheel destinations */
  side?: ChamberSide
  /** Wider measure for grids (Lab cards) */
  wide?: boolean
}) {
  return (
    <div className={portal.page} data-side={side}>
      <div className={portal.pageScroll} data-wide={wide ? '' : undefined}>
        {label && <p className={`${portal.label} mb-3`}>{label}</p>}
        {children}
        <PortalScrollFade />
      </div>
    </div>
  )
}
