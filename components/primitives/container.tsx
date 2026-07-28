// components/primitives/container.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const containerVariants = cva('w-full mx-auto', {
  variants: {
    size: {
      prose: 'max-w-[58ch] px-6',
      grid:  'max-w-[1440px] px-6 sm:px-8 lg:px-12',
      bleed: 'max-w-none px-0',
    },
  },
  defaultVariants: { size: 'grid' },
})

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PolyContainer = React.forwardRef<any, any>(
  ({ as: Tag = 'div', size, className, children, ...props }, ref) => (
    <Tag ref={ref} className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </Tag>
  )
)
PolyContainer.displayName = 'Container'
export const Container = PolyContainer as React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>
