// components/primitives/heading.tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
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
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, size, balance, responsive, className, children, ...props }, ref) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
    return (
      <Tag ref={ref} className={cn(headingVariants({ size, balance, responsive }), className)} {...props}>
        {children}
      </Tag>
    )
  }
)

Heading.displayName = 'Heading'
