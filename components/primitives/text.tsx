// components/primitives/text.tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textVariants = cva('', {
  variants: {
    variant: {
      body:  'font-sans leading-[1.55]',
      mono:  'font-mono uppercase tracking-[0.12em]',
      label: 'font-mono uppercase tracking-[0.12em]',
      code:  'font-mono tracking-[0] leading-[1.4]',
    },
    size: {
      '2xs': 'text-[0.6875rem]',
      xs:    'text-[0.8125rem]',
      sm:    'text-[0.9375rem]',
      base:  'text-[1rem]',
      lg:    'text-[1.125rem]',
    },
    tone: {
      bright:      'text-ax-bright',
      mid:         'text-ax-mid',
      dim:         'text-ax-dim',
      signal:      'text-ax-signal',
      'paper-ink': 'text-ax-ink',
    },
    balance: { true: 'text-balance', false: '' },
  },
  defaultVariants: { variant: 'body', size: 'sm', tone: 'bright', balance: false },
})

type TextElement = 'p' | 'span' | 'div' | 'li' | 'dd' | 'dt' | 'figcaption' | 'blockquote'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  as?: TextElement
  maxWidth?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyText = React.forwardRef<any, any>(
  ({ as: Tag = 'p', variant, size, tone, balance, maxWidth = false, className, children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(textVariants({ variant, size, tone, balance }), maxWidth && 'max-w-[58ch]', className)}
      {...props}
    >
      {children}
    </Tag>
  )
)
PolyText.displayName = 'Text'
export const Text = PolyText as React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLParagraphElement>>
