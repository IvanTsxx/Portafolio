// components/primitives/heading.tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { HighlightMark, HIGHLIGHT_MARK, type HighlightMarkProps } from '@/components/ui/highlight-mark'
import { cn } from '@/lib/utils'

const headingVariants = cva('font-sans text-ax-bright', {
  variants: {
    size: {
      lg:    'text-[2.125rem] font-medium  leading-[0.98] tracking-[-0.035em]',
      xl:    'text-[3.25rem]  font-semibold leading-[0.95] tracking-[-0.035em]',
      '2xl': 'text-[5.5rem]  font-semibold leading-[0.92] tracking-[-0.04em]',
    },
    balance: {
      true:  'text-balance',
      false: '',
    },
    responsive: {
      true:  '',
      false: '',
    },
  },
  compoundVariants: [
    { size: '2xl', responsive: true, className: 'text-[2.125rem] sm:text-[3.25rem] lg:text-[5.5rem]' },
    { size: 'xl',  responsive: true, className: 'text-[2.125rem] sm:text-[3.25rem]' },
    { size: 'lg',  responsive: true, className: 'text-[1.5rem]  sm:text-[2.125rem]' },
  ],
  defaultVariants: { size: 'xl', balance: true, responsive: true },
})

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3
  /** Magic UI Highlighter — on by default (signal marker on enter). */
  highlight?: boolean | Omit<HighlightMarkProps, 'children'>
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, size, balance, responsive, className, children, highlight = true, ...props }, ref) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
    const config =
      highlight === true
        ? HIGHLIGHT_MARK
        : highlight
          ? { ...HIGHLIGHT_MARK, ...highlight }
          : null

    return (
      <Tag ref={ref} className={cn(headingVariants({ size, balance, responsive }), className)} {...props}>
        {config ? <HighlightMark {...config}>{children}</HighlightMark> : children}
      </Tag>
    )
  }
)

Heading.displayName = 'Heading'
