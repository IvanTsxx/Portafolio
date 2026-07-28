// components/transitions/clip-reveal-heading.tsx
// Clip-path reveal for multi-line headings.
// Each line enters with clip-path: inset(0 0 100% 0) → inset(0 0 0% 0).
// Duration: --dur-state (180ms), stagger 60ms per line, --ease-out.
// For LCP text: renders server-side content immediately; animation is additive.
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'

export interface ClipRevealHeadingProps {
  lines:     string[]       // each entry = one revealed line
  as?:       'h1' | 'h2' | 'h3'
  className?: string
  lineClassName?: string
  delay?:    number          // initial delay in ms before first line reveals
  stagger?:  number          // ms between each line; default 60
}

export function ClipRevealHeading({
  lines,
  as: Tag = 'h1',
  className,
  lineClassName,
  delay = 80,
  stagger = 60,
}: ClipRevealHeadingProps) {
  const rm      = useReducedMotion()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // Micro delay to ensure the browser has painted the initial state
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <Tag className={cn('overflow-hidden', className)}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden"
          aria-hidden={i > 0 ? 'true' : undefined}
        >
          <span
            className={cn('block', lineClassName)}
            style={
              rm
                ? undefined
                : {
                    clipPath:         ready ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
                    transition:       `clip-path var(--dur-state, 180ms) var(--ease-out, cubic-bezier(0.16,1,0.3,1))`,
                    transitionDelay:  ready ? `${delay + i * stagger}ms` : '0ms',
                    willChange:       'clip-path',
                  }
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
