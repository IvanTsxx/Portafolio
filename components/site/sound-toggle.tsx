// components/site/sound-toggle.tsx
// Bottom-left mute control — persists via localStorage.
'use client'

import * as React from 'react'
import { cue, isCuelumeMuted, setCuelumeMuted } from '@/lib/cuelume'

export function SoundToggle() {
  const [muted, setMuted] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setMuted(isCuelumeMuted())
    setReady(true)
  }, [])

  if (!ready) return null

  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-[51] font-mono uppercase tracking-[0.12em] text-ax-dim hover:text-ax-bright transition-colors duration-[90ms] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal"
      style={{ fontSize: 'var(--text-2xs)', marginBottom: '1.75rem' }}
      data-cuelume-press
      data-cuelume-release
      aria-pressed={muted}
      aria-label={muted ? 'Unmute interaction sounds' : 'Mute interaction sounds'}
      onClick={() => {
        const next = !muted
        setCuelumeMuted(next)
        setMuted(next)
        if (!next) cue('tick')
      }}
    >
      {muted ? 'SND OFF' : 'SND'}
    </button>
  )
}
