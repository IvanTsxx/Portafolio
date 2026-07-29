// components/site/debug-panel.tsx
// Dev HUD toggled with `~`. Shows grid/rAF/portal state for ASCII debugging.
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { usePortal } from '@/lib/portal/portal-provider'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'

interface DebugStats {
  fps: number
  width: number
  height: number
}

export function DebugPanel() {
  const [open, setOpen] = React.useState(false)
  const [stats, setStats] = React.useState<DebugStats>({ fps: 0, width: 0, height: 0 })
  const pathname = usePathname()
  const portal = usePortal()
  const rm = useReducedMotion()
  const framesRef = React.useRef(0)
  const lastTsRef = React.useRef(0)

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '`' && e.key !== '~') return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      e.preventDefault()
      setOpen((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  React.useEffect(() => {
    if (!open) return

    function tick(now: number) {
      framesRef.current += 1
      if (now - lastTsRef.current >= 500) {
        const fps = Math.round((framesRef.current * 1000) / (now - lastTsRef.current))
        framesRef.current = 0
        lastTsRef.current = now
        setStats({
          fps,
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
      raf = requestAnimationFrame(tick)
    }

    let raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open])

  if (!open) return null

  const cellsEstimate = Math.min(
    9000,
    Math.floor((stats.width * stats.height) / (7 * 14)),
  )

  return (
    <aside
      className="fixed bottom-4 left-4 z-[200] border border-ax-line bg-ax-ink/95 backdrop-blur-sm p-3 min-w-[220px] pointer-events-none"
      aria-label="Debug panel"
    >
      <p
        className="font-mono text-ax-signal mb-2"
        style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
      >
        DEBUG · ~
      </p>
      <dl className="font-mono text-ax-mid space-y-1" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.06em' }}>
        <div className="flex justify-between gap-4">
          <dt>ROUTE</dt>
          <dd className="text-ax-bright">{pathname}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>FPS</dt>
          <dd className="text-ax-bright">{stats.fps || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>VIEWPORT</dt>
          <dd className="text-ax-bright">{stats.width}×{stats.height}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>CELLS≈</dt>
          <dd className="text-ax-bright">{cellsEstimate} / 9000</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>PORTAL</dt>
          <dd className="text-ax-bright">{portal.state}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>REDUCED</dt>
          <dd className="text-ax-bright">{rm ? 'ON' : 'OFF'}</dd>
        </div>
      </dl>
    </aside>
  )
}
