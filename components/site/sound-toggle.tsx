// components/site/sound-toggle.tsx
// Mute control — persists via localStorage. Theme uses next-themes.
'use client'

import * as React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cue, isCuelumeMuted, setCuelumeMuted } from '@/lib/cuelume'
import { cn } from '@/lib/utils'

export function SoundToggle({ className }: { className?: string }) {
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
      className={cn(className)}
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
      {muted ? (
        <VolumeX aria-hidden strokeWidth={1.5} />
      ) : (
        <Volume2 aria-hidden strokeWidth={1.5} />
      )}
    </button>
  )
}
