import * as React from 'react'

/** Floating chamber layout for routes inside the cosmos shell. */
export function PortalPage({
  children,
  label,
}: {
  children: React.ReactNode
  label?: string
}) {
  return (
    <div className="portal-page">
      <div className="portal-page-scroll portal-float portal-emerge">
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
