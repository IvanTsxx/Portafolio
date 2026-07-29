// lib/portal/portal-link.tsx
// Drop-in <a> replacement that intercepts clicks and fires the portal.
// Falls back to a normal anchor on middle-click, Ctrl/Cmd+click, and external URLs.
'use client'

import * as React from 'react'
import { usePortal } from './portal-provider'

export interface PortalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  label?: string  // override the default route label shown during scramble
}

export function PortalLink({
  href,
  label,
  onClick,
  children,
  ...rest
}: PortalLinkProps) {
  const { trigger } = usePortal()

  const isExternal =
    href.startsWith('http') ||
    href.startsWith('mailto') ||
    href.startsWith('tel')

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Pass-through: external links, modifier keys, non-left-clicks
    if (isExternal || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      onClick?.(e)
      return
    }

    e.preventDefault()
    trigger(href, label)
    onClick?.(e)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      data-cuelume-hover="tick"
      data-cuelume-press
      data-cuelume-release
      {...rest}
    >
      {children}
    </a>
  )
}
