'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { IVAN, type PortalTheme } from './content'
import { HalfWheel } from './half-wheel'
import { ChamberCopy } from './chamber-copy'
import { useWormNav } from './use-worm-nav'
import type { AsciiWorldApi } from './gl/ascii-world'
import './portal-home.css'

const AsciiWorld = dynamic(
  () => import('./gl/ascii-world').then((m) => m.AsciiWorld),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: 'absolute', inset: 0, background: '#0c0b0a' }} />
    ),
  },
)

export function PortalHome() {
  const [theme, setTheme] = React.useState<PortalTheme>('dark')
  const apiRef = React.useRef<AsciiWorldApi | null>(null)
  const w = useWormNav(apiRef)
  const [copied, setCopied] = React.useState(false)

  const showHero = w.phase === 'surface'
  const showLanded = w.phase === 'landed' && w.inside && w.inside !== 'home'

  return (
    <div className="portal-home" data-theme={theme}>
      <button
        type="button"
        className="portal-theme-btn"
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>

      <AsciiWorld theme={theme} apiRef={apiRef} className="absolute inset-0" cell={16} />

      {showHero && (
        <div className="absolute left-[6%] top-[11%] z-20 md:left-[8%] md:top-[13%]">
          <div className="portal-float">
            <p className="portal-mono mb-3" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              {IVAN.name} · {IVAN.studio}
            </p>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                fontWeight: 600,
                maxWidth: '14ch',
              }}
            >
              {IVAN.tagline}
            </h1>
            <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed">{IVAN.blurb}</p>
            <p className="portal-mono mt-6" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              Hold the arc · portal to a section
            </p>
          </div>
        </div>
      )}

      <div className="portal-chamber" data-open={showLanded ? 'true' : 'false'}>
        {showLanded && w.inside && (
          <>
            <button type="button" className="portal-back" onClick={w.surface} disabled={w.busy}>
              ← home
            </button>
            <ChamberCopy
              id={w.inside}
              copied={copied}
              onCopy={async () => {
                await navigator.clipboard.writeText(IVAN.agentPrompt)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1400)
              }}
            />
          </>
        )}
      </div>

      <HalfWheel
        active={w.active}
        hover={w.hover}
        chargeRef={w.chargeRef}
        disabled={w.busy}
        onHover={w.onHover}
        onHoldStart={w.holdStart}
        onHoldEnd={w.holdEnd}
      />
    </div>
  )
}
