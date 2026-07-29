'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { usePortal } from '@/lib/portal'
import './portal-arrive.css'

/** Ease-out that settles hard — content spat from the wormhole. */
const ease = [0.16, 1, 0.3, 1] as const

/**
 * After the wormhole exits, route content rushes forward from depth —
 * as if spat out of the tunnel toward the viewer.
 * Wrapper stays soft; headings/copy get the 3D spit via CSS + PortalStagger.
 * First load (landId 0) skips motion.
 */
export function PortalArrive({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { landId, state } = usePortal()
  const prefersReduced = useReducedMotion()
  const first = landId === 0
  const fresh = landId > 0
  const skip = first || prefersReduced

  return (
    <motion.div
      key={`${pathname}-${landId}`}
      className="portal-arrive"
      data-fresh={fresh && !prefersReduced ? '' : undefined}
      data-arriving={state === 'arriving' ? '' : undefined}
      style={{ transformPerspective: 1400, transformStyle: 'preserve-3d' }}
      initial={skip ? false : { opacity: 0, scale: 0.94, z: -80, y: 8 }}
      animate={{ opacity: 1, scale: 1, z: 0, y: 0 }}
      transition={{
        duration: skip ? 0 : 0.64,
        ease,
        delay: skip ? 0 : 0.03,
        opacity: { duration: skip ? 0 : 0.48, ease },
      }}
    >
      {children}
    </motion.div>
  )
}

export function PortalStagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { landId } = usePortal()
  const prefersReduced = useReducedMotion()
  const first = landId === 0
  const skip = first || prefersReduced

  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
      initial={skip ? false : 'hidden'}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.09, delayChildren: 0.08 },
        },
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return (
          <motion.div
            style={{ transformStyle: 'preserve-3d' }}
            variants={{
              hidden: {
                opacity: 0,
                scale: 0.88,
                z: -160,
                y: 14,
              },
              show: {
                opacity: 1,
                scale: 1,
                z: 0,
                y: 0,
                transition: {
                  duration: 0.58,
                  ease,
                  opacity: { duration: 0.42, ease },
                },
              },
            }}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
