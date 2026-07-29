'use client'

import * as React from 'react'
import { HighlightMark, HIGHLIGHT_MARK, type HighlightMarkProps } from '@/components/ui/highlight-mark'
import { cn } from '@/lib/utils'

const pageHeadingStyle: React.CSSProperties = {
  fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
  letterSpacing: '-0.035em',
  lineHeight: 0.95,
}

export interface PageHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3
  /** Rough-notation highlight — defaults to signal marker on enter. */
  annotate?: boolean | Omit<HighlightMarkProps, 'children'>
}

/** Shared portal/page title with Magic UI Highlighter. */
export function PageHeading({
  level = 1,
  annotate = true,
  className,
  style,
  children,
  ...props
}: PageHeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const config =
    annotate === true
      ? HIGHLIGHT_MARK
      : annotate === false
        ? null
        : { ...HIGHLIGHT_MARK, ...annotate }

  return (
    <Tag
      className={cn('mb-4 font-semibold', className)}
      style={{ ...pageHeadingStyle, ...style }}
      {...props}
    >
      {config ? <HighlightMark {...config}>{children}</HighlightMark> : children}
    </Tag>
  )
}
