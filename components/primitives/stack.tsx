// components/primitives/stack.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gapMap = { 1:'gap-1', 2:'gap-2', 3:'gap-3', 4:'gap-4', 6:'gap-6', 8:'gap-8', 12:'gap-12', 16:'gap-16' } as const
type GapKey = keyof typeof gapMap

// ─── Stack ────────────────────────────────────────────────────────────────────
const stackVariants = cva('flex flex-col', {
  variants: {
    align:   { start:'items-start', center:'items-center', end:'items-end', stretch:'items-stretch' },
    justify: { start:'justify-start', center:'justify-center', end:'justify-end', between:'justify-between' },
  },
  defaultVariants: { align:'start', justify:'start' },
})

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
  gap?: GapKey
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'article'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyStack = React.forwardRef<any, any>(
  ({ gap = 4, align, justify, as: Tag = 'div', className, children, ...props }, ref) => (
    <Tag ref={ref} className={cn(stackVariants({ align, justify }), gapMap[gap as GapKey], className)} {...props}>
      {children}
    </Tag>
  )
)
PolyStack.displayName = 'Stack'
export const Stack = PolyStack as React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>

// ─── Row ──────────────────────────────────────────────────────────────────────
const rowVariants = cva('flex flex-row', {
  variants: {
    align:   { start:'items-start', center:'items-center', end:'items-end', baseline:'items-baseline', stretch:'items-stretch' },
    justify: { start:'justify-start', center:'justify-center', end:'justify-end', between:'justify-between' },
    wrap:    { true:'flex-wrap', false:'flex-nowrap' },
  },
  defaultVariants: { align:'center', justify:'start', wrap: false },
})

export interface RowProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof rowVariants> {
  gap?: GapKey
  as?: 'div' | 'ul' | 'ol' | 'nav' | 'header' | 'footer'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyRow = React.forwardRef<any, any>(
  ({ gap = 4, align, justify, wrap, as: Tag = 'div', className, children, ...props }, ref) => (
    <Tag ref={ref} className={cn(rowVariants({ align, justify, wrap }), gapMap[gap as GapKey], className)} {...props}>
      {children}
    </Tag>
  )
)
PolyRow.displayName = 'Row'
export const Row = PolyRow as React.ForwardRefExoticComponent<RowProps & React.RefAttributes<HTMLDivElement>>
