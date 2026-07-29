'use client'

import * as React from 'react'
import { IVAN } from './content'
import { ChamberCopy } from './chamber-copy'
import { PortalStagger } from '@/components/site/portal-arrive'
import { HighlightMark } from '@/components/ui/highlight-mark'
import { usePortal } from '@/lib/portal'
import { cue } from '@/lib/cuelume'
import type { AsciiWorldApi } from './gl/ascii-world'

/**
 * Home surface content only — cosmos + wheel live in PortalProvider shell.
 * Open spoke opens a local chamber over the shared field.
 */
export function PortalHome() {
  const { apiRef, registerOpenLocal, state } = usePortal()
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const busyRef = React.useRef(false)

  const openChamber = React.useCallback(() => {
    if (busyRef.current || state === 'traveling') return
    const api = (apiRef as React.MutableRefObject<AsciiWorldApi | null>).current
    busyRef.current = true
    cue('loading')
    setOpen(false)
    if (!api) {
      setOpen(true)
      busyRef.current = false
      cue('bloom')
      return
    }
    api.cancelTravel()
    api.startTravel({
      duration: 700,
      fromCharge: api.getTravel().charge,
      landMood: 0.9,
      returning: false,
      onDone: () => {
        busyRef.current = false
        setOpen(true)
        cue('bloom')
      },
    })
  }, [apiRef, state])

  const closeChamber = React.useCallback(() => {
    if (busyRef.current) return
    const api = (apiRef as React.MutableRefObject<AsciiWorldApi | null>).current
    busyRef.current = true
    cue('droplet')
    setOpen(false)
    if (!api) {
      busyRef.current = false
      return
    }
    api.cancelTravel()
    api.startTravel({
      duration: 700,
      fromCharge: 0,
      landMood: 0,
      returning: true,
      onDone: () => {
        busyRef.current = false
        cue('ready')
      },
    })
  }, [apiRef])

  React.useEffect(() => {
    registerOpenLocal(openChamber)
    return () => registerOpenLocal(null)
  }, [openChamber, registerOpenLocal])

  const showHero = !open && state !== 'traveling'

  return (
    <>
      {showHero && (
        <div className="absolute left-[6%] top-[min(22vh,9rem)] z-20 md:left-[8%] md:top-[min(24vh,11rem)]">
          <PortalStagger className="portal-float">
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
              <HighlightMark>{IVAN.tagline}</HighlightMark>
            </h1>
            <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed">{IVAN.blurb}</p>
            <p className="portal-mono mt-6" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              Hold the arc · tunnel between pages
            </p>
          </PortalStagger>
        </div>
      )}

      <div className="portal-chamber" data-open={open ? 'true' : 'false'}>
        {open && (
          <>
            <button
              type="button"
              className="portal-back"
              data-cuelume-press
              data-cuelume-release
              onClick={closeChamber}
            >
              ← home
            </button>
            <ChamberCopy
              id="open"
              copied={copied}
              onCopy={async () => {
                await navigator.clipboard.writeText(IVAN.agentPrompt)
                cue('success')
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1400)
              }}
            />
          </>
        )}
      </div>
    </>
  )
}
