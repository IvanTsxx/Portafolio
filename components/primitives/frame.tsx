// components/primitives/frame.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const frameVariants = cva('border border-ax-line relative', {
  variants: {
    variant: {
      solid: 'bg-ax-ink',
      ghost: 'bg-transparent',
    },
    dither: {
      true:  'dither-bg',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'solid',
    dither: false,
  },
})

const contentPaddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-4 sm:p-6',
  lg:   'p-6 sm:p-8',
}

export interface FrameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof frameVariants> {
  header?: React.ReactNode
  footer?: React.ReactNode
  contentPadding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Frame = React.forwardRef<HTMLDivElement, FrameProps>(
  ({ variant, dither, header, footer, contentPadding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(frameVariants({ variant, dither }), 'flex flex-col', className)}
        {...props}
      >
        {header != null && (
          <div className="border-b border-ax-line px-4 py-2 flex items-center gap-3">
            {header}
          </div>
        )}
        <div className={cn('flex-1', contentPaddingMap[contentPadding])}>
          {children}
        </div>
        {footer != null && (
          <div className="border-t border-ax-line px-4 py-2 flex items-center gap-3">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

Frame.displayName = 'Frame'
