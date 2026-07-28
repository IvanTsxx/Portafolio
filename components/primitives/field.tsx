// components/primitives/field.tsx
// Field: 1px border action element — the brutalista 1px-box CTA.
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const fieldVariants = cva(
  [
    'inline-flex items-center justify-center',
    'border border-ax-line',
    'font-mono uppercase tracking-[0.12em]',
    'cursor-pointer select-none',
    'transition-colors duration-[90ms]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal focus-visible:ring-offset-0',
    'active:bg-ax-bright active:text-ax-void active:border-ax-bright',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        sm: 'px-2 py-1 text-[0.6875rem]',
        md: 'px-3 py-1.5 text-[0.8125rem]',
      },
      tone: {
        default: 'bg-transparent text-ax-mid hover:text-ax-bright hover:border-ax-mid',
        active:  'bg-ax-bright text-ax-void border-ax-bright',
        signal:  'bg-transparent text-ax-signal border-ax-signal hover:bg-ax-signal hover:text-ax-void',
      },
    },
    defaultVariants: { size: 'sm', tone: 'default' },
  }
)

export type FieldElement = 'button' | 'kbd' | 'a' | 'span' | 'div'

export interface FieldProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fieldVariants> {
  as?: FieldElement
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyField = React.forwardRef<any, any>(
  ({ as: Tag = 'button', size, tone, className, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(fieldVariants({ size, tone }), className)}
        {...(Tag === 'button' ? { type: 'button' } : {})}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)

PolyField.displayName = 'Field'

export const Field = PolyField as React.ForwardRefExoticComponent<FieldProps & React.RefAttributes<HTMLButtonElement>>
