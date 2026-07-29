'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { usePortal } from '@/lib/portal'
import './portal-arrive.css'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * After the wormhole exits, the new route rises into place.
 * First load (landId 0) skips motion. Fresh lands get CSS line stagger too.
 */
export function PortalArrive({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { landId, state } = usePortal()
  const first = landId === 0
  const fresh = landId > 0

  return (
    <motion.div
      key={`${pathname}-${landId}`}
      className="portal-arrive"
      data-fresh={fresh ? '' : undefined}
      data-arriving={state === 'arriving' ? '' : undefined}
      initial={first ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease, delay: first ? 0 : 0.02 }}
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
  const first = landId === 0

  return (
    <motion.div
      className={className}
      initial={first ? false : 'hidden'}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.075, delayChildren: 0.05 },
        },
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.44, ease },
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
