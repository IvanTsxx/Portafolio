// components/primitives/label.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  index?: string
  tone?: 'bright' | 'mid' | 'dim' | 'signal'
  as?: 'span' | 'div' | 'p' | 'dt' | 'dd' | 'label'
  htmlFor?: string
}

const toneClasses = { bright:'text-ax-bright', mid:'text-ax-mid', dim:'text-ax-dim', signal:'text-ax-signal' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyLabel = React.forwardRef<any, any>(
  ({ index, tone = 'mid', as: Tag = 'span', className, children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        'font-mono text-[0.8125rem] uppercase tracking-[0.12em] leading-none',
        toneClasses[tone as keyof typeof toneClasses],
        className
      )}
      {...props}
    >
      {index != null && (
        <span className="mr-3 text-ax-dim" aria-hidden="true">{index} /</span>
      )}
      {children}
    </Tag>
  )
)
PolyLabel.displayName = 'Label'
export const Label = PolyLabel as React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLSpanElement>>
