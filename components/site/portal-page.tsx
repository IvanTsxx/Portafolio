import * as React from 'react'
import type { ChamberSide } from '@/components/home/portal/content'

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
    <div className="portal-page" data-side={side}>
      <div
        className="portal-page-scroll portal-float portal-emerge"
        data-wide={wide ? '' : undefined}
      >
        {label && (
          <p className="portal-mono mb-3" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            {label}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
