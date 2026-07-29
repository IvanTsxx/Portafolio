'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { IVAN, chamberSide } from './content'
import { ChamberCopy } from './chamber-copy'
import { PortalStagger } from '@/components/site/portal-arrive'
import { SocialLinks } from '@/components/site/social-links'
import { HighlightMark } from '@/components/ui/highlight-mark'
import { IDENTITY } from '@/content/identity'
import { usePortal } from '@/lib/portal'
import { portal } from '@/lib/portal/styles'
import { cue } from '@/lib/cuelume'
import type { AsciiWorldApi } from './gl/ascii-world'
import { HomeConstellation } from './home-constellation'

const ease = [0.16, 1, 0.3, 1] as const

/** Small geometric mark — entrance only; color from theme. */
function EyebrowMark() {
  const prefersReduced = useReducedMotion()

  return (
    <motion.span
      className={portal.eyebrowMark}
      aria-hidden
      initial={prefersReduced ? false : { opacity: 0, scale: 0.5, rotate: -24 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.48, ease, delay: prefersReduced ? 0 : 0.06 }}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </motion.span>
  )
}

/**
 * Home surface content only — cosmos + wheel live in PortalProvider shell.
 * Open spoke opens a local chamber over the shared field.
 */
export function PortalHome() {
  const { apiRef, registerOpenLocal, state } = usePortal()
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const busyRef = React.useRef(false)
  const heroRef = React.useRef<HTMLDivElement>(null)

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
  const openSide = chamberSide('open')
  const statusLabel = IDENTITY.available ? 'Working' : 'Unavailable'

  return (
    <>
      {showHero && (
        <>
          <HomeConstellation apiRef={apiRef} heroRef={heroRef} />
          <div
            ref={heroRef}
            className={portal.hero}
            data-side={chamberSide('home')}
          >
            <PortalStagger className="portal-float">
              <p className={`${portal.label} ${portal.eyebrow} mb-4`}>
                <EyebrowMark />
                <span>{IDENTITY.role}</span>
              </p>

              <h1
                className="max-w-[12ch] font-semibold tracking-[-0.04em] text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.92]"
              >
                <HighlightMark>{IDENTITY.name}</HighlightMark>
              </h1>

              <p className={`${portal.label} mt-4`}>
                Currently at {IDENTITY.studio}
              </p>

              <p
                className={`${portal.status} mt-4`}
                data-available={IDENTITY.available ? 'true' : 'false'}
                aria-label={`Status: ${statusLabel}`}
              >
                <span className={portal.statusDot} aria-hidden />
                <span className={`${portal.mono} text-[10px]`}>{statusLabel}</span>
              </p>

              <SocialLinks className="mt-2" />
            </PortalStagger>
          </div>
        </>
      )}

      <div className={portal.chamber} data-open={open ? 'true' : 'false'} data-side={openSide}>
        {open && (
          <>
            <button
              type="button"
              className={portal.back}
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
